/* script.js

Standard Notes Generator
Developed & Designed by: QA Ryan */

// FIRST LOAD CHECK
document.addEventListener("DOMContentLoaded", async () => {
    const hasPrompted = sessionStorage.getItem("hasCheckedNotes");

    if (!hasPrompted) {
        const savedData = JSON.parse(localStorage.getItem("tempDatabase") || "{}");

        if (Object.keys(savedData).length > 0) {
            const shouldClear = await showConfirm1(
                "Saved notes already exist on this workstation.\n\nWhat would you like to do?"
            );

            if (shouldClear) {
                localStorage.removeItem("tempDatabase");
                showAlert("Previously saved notes (old records) have been deleted.");
            }
        }

        sessionStorage.setItem("hasCheckedNotes", "true");
    }
});

// Channel, Concern Type, and VOC Options
const LOB_OPTIONS = [
    { value: "", text: "" },
    { value: "TECH", text: "TECH" },
    { value: "NON-TECH", text: "NON-TECH" }
];

const TECH_VOC_ALLOWED = [
    "COMPLAINT", 
    "FOLLOW-UP", 
    "REQUEST", 
    "OTHERS"
];

const TECH_COMPLAINT_GROUPS = [
    "Always On",
    "No Dial Tone and No Internet Connection",
    "No Internet Connection",
    "Slow Internet/Intermittent Connection",
    "No Dial Tone",
    "Poor Call Quality/Noisy Telephone Line",
    "Cannot Make a Call",
    "Cannot Receive a Call",
    "Selective Browsing Complaints",
    "No Audio/Video Output",
    "Poor Audio/Video Quality",
    "Missing Set-Top-Box Functions",
    "Streaming Apps Issues",
    "formCompMyHomeWeb",
    "formCompPersonnelIssue"
];

const NON_TECH_GROUP_MAP = {
    "INQUIRY": "inquiry",
    "COMPLAINT": "complaint",
    "FOLLOW-UP": "follow-up",
    "REQUEST": "request",
    "OTHERS": "others"
};

// Global variables
let lobSelect, vocSelect, intentSelect;
let serviceIDRow, option82Row, intentWocasRow, wocasRow;
let allLobOptions, allVocOptions, allIntentChildren, placeholderClone;

function initializeFormElements() {
    lobSelect = document.getElementById("lob");
    vocSelect = document.getElementById("voc");
    intentSelect = document.getElementById("selectIntent");
    serviceIDRow = document.getElementById("service-id-row");
    option82Row = document.getElementById("option82-row");
    intentWocasRow = document.getElementById("intent-wocas-row");
    wocasRow = document.getElementById("wocas-row");

    if (!lobSelect || !vocSelect || !intentSelect) {
        console.error("Required form elements not found");
        return;
    }

    allVocOptions = Array.from(vocSelect.options).map(opt => opt.cloneNode(true));
    vocSelect.innerHTML = "";

    const placeholder = allVocOptions.find(opt => opt.value === "");
    if (placeholder) {
        vocSelect.appendChild(placeholder);
    }

    allIntentChildren = Array.from(intentSelect.children).map(el => el.cloneNode(true));

    const placeholderOption = allIntentChildren.find(el => el.tagName === "OPTION" && el.value === "");
    placeholderClone = placeholderOption ? placeholderOption.cloneNode(true) : null;

    allLobOptions = LOB_OPTIONS;

    // Start LOB with only blank option
    lobSelect.innerHTML = "";
    const blankOption = document.createElement("option");
    blankOption.value = "";
    blankOption.textContent = "";
    blankOption.disabled = true;
    blankOption.selected = true;
    lobSelect.appendChild(blankOption);
}

function showRowAndScroll(rowElement) {
    if (rowElement) {
        rowElement.style.display = "";
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function hideRow(rowElement) {
    if (rowElement) {
        rowElement.style.display = "none";
    }
}

const channelField = document.getElementById("channel");

if (channelField) {
    channelField.addEventListener("change", () => {
        lobSelect.innerHTML = "";

        // Always show the non-selectable blank option first
        const blankOption = document.createElement("option");
        blankOption.value = "";
        blankOption.textContent = "";
        blankOption.disabled = true;
        blankOption.selected = true;
        lobSelect.appendChild(blankOption);

        if (channelField.value !== "") {
            // Show only valid LOBs when channel is selected
            allLobOptions.forEach(optData => {
                if (optData.value !== "") { // skip the blank
                    const opt = document.createElement("option");
                    opt.value = optData.value;
                    opt.textContent = optData.text;
                    lobSelect.appendChild(opt);
                }
            });
        }

        vocSelect.innerHTML = "";  // Reset VOC
    });
}

function handleLobChange() {
    const lobSelectedValue = lobSelect.value;

    vocSelect.innerHTML = "";

    const placeholder = allVocOptions.find(opt => opt.value === "");
    if (placeholder) {
        vocSelect.appendChild(placeholder);
    }

    allVocOptions.forEach(option => {
        if (
            (lobSelectedValue === "TECH" && TECH_VOC_ALLOWED.includes(option.value)) ||
            (lobSelectedValue === "NON-TECH" && option.value !== "")
        ) {
            vocSelect.appendChild(option);
        }
    });

    vocSelect.selectedIndex = 0;

    handleVocChange();
}

function handleVocChange() {
    resetForm2ContainerAndRebuildButtons();

    const lobValue = lobSelect.value;
    const vocValue = vocSelect.value;

    hideRow(serviceIDRow);
    hideRow(option82Row);
    hideRow(intentWocasRow);
    hideRow(wocasRow);

    if (vocValue === "") {
        intentSelect.innerHTML = "";
        if (placeholderClone) {
            intentSelect.appendChild(placeholderClone.cloneNode(true));
        }
        return;
    }

    // Show-Hide Rows
    updateRowsVisibility(lobValue, vocValue);

    // Show only blank option
    intentSelect.innerHTML = "";
    if (placeholderClone) {
        intentSelect.appendChild(placeholderClone.cloneNode(true));
    }

    // Populate Intent/WOCAS Options
    populateIntentSelect(lobValue, vocValue);

    intentSelect.selectedIndex = 0;
}

function updateRowsVisibility(lobValue, vocValue) {
    if (lobValue === "TECH") {
        if (vocValue === "FOLLOW-UP") {
            showRowAndScroll(wocasRow);
            hideRow(serviceIDRow);
            hideRow(option82Row);
            showRowAndScroll(intentWocasRow);
        } else if (vocValue === "COMPLAINT" || vocValue === "REQUEST") {
            showRowAndScroll(serviceIDRow);
            showRowAndScroll(option82Row);
            showRowAndScroll(intentWocasRow);
            showRowAndScroll(wocasRow);
        } else { // INQUIRY & OTHERS
            hideRow(wocasRow);
            hideRow(serviceIDRow);
            hideRow(option82Row);
            showRowAndScroll(intentWocasRow);
        }
    } else if (lobValue === "NON-TECH") {
        hideRow(wocasRow);
        hideRow(serviceIDRow);
        hideRow(option82Row);
        showRowAndScroll(intentWocasRow);
    }
}

function populateIntentSelect(lobValue, vocValue) {
    if (lobValue === "TECH") {
        if (vocValue === "COMPLAINT") {
            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTGROUP" && TECH_COMPLAINT_GROUPS.includes(el.label)) {
                    intentSelect.appendChild(el.cloneNode(true));
                } else if (el.tagName === "OPTION" && TECH_COMPLAINT_GROUPS.includes(el.value)) {
                    intentSelect.appendChild(el.cloneNode(true));
                }
            });
        } else if (vocValue === "FOLLOW-UP") {
            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTION" && el.value === "formFfupRepair") {
                    intentSelect.appendChild(el.cloneNode(true));
                }
            });
        } else if (vocValue === "REQUEST") {
            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTGROUP" && el.label === "Change Configuration - Data") {
                    intentSelect.appendChild(el.cloneNode(true));
                }
            });
        } else {
            const group = "others";
            populateByGroup(group);
        }
    } else if (lobValue === "NON-TECH") {
        const group = NON_TECH_GROUP_MAP[vocValue];
        populateByGroup(group, vocValue, lobValue);
    }
}

function populateByGroup(group, vocValue = null, lobValue = null) {
    allIntentChildren.forEach(el => {

        // Block ONLY for NON-TECH
        if (
            lobValue === "NON-TECH" &&
            el.tagName === "OPTGROUP" &&
            el.label === "Change Configuration - Data"
        ) {
            return;
        }

        if (el.tagName === "OPTION" && el.dataset.group === group) {
            intentSelect.appendChild(el.cloneNode(true));
        } 
        else if (el.tagName === "OPTGROUP") {

            const matchingOptions = Array.from(el.children).filter(
                opt => opt.dataset.group === group
            );

            if (matchingOptions.length > 0) {
                const newGroup = el.cloneNode(false);
                matchingOptions.forEach(opt => newGroup.appendChild(opt.cloneNode(true)));
                intentSelect.appendChild(newGroup);
            }
        }
    });
}

function registerEventHandlers() {
    if (lobSelect && vocSelect) {
        lobSelect.addEventListener("change", handleLobChange);
        vocSelect.addEventListener("change", handleVocChange);
    }
}

// Typewriter Effect
let typingInterval;

function typeWriter(text, element, delay = 50) {
    let index = 0;
    element.innerHTML = "";

    if (typingInterval) {
        clearInterval(typingInterval);
    }

    typingInterval = setInterval(() => {
        if (index < text.length) {            
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(typingInterval);
        }
    }, delay);
}

// Auto-Expand Textarea field
function autoExpandTextarea(event) {
    if (event.target.tagName === 'TEXTAREA') {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 1}px`;
    }
}

document.addEventListener('input', autoExpandTextarea);

// Copy to Clipboard Command
function resolveCopyValue(rawValue = "", type = null) {
    if (typeof rawValue !== "string") {
        rawValue = String(rawValue || "");
    }

    let normalized = rawValue.trim();

    if (type === "node") {
        normalized = normalized.toUpperCase().split("_")[0];
    }

    return normalized;
}

function copyValue(button) {
    const input = button.previousElementSibling || document.getElementById("option82");
    if (!input) return;

    const type = input.dataset?.type || (input.id === "option82" ? "option82" : null);
    const rawValue = input.value || "";

    const valueToCopy = type === "option82"
        ? resolveCopyValue(rawValue, "opt82")?.split("_")[0]
        : resolveCopyValue(rawValue);

    copyToClipboard(valueToCopy);
}

// LOAD DATA & FORM 1 COPY FUNCTION
document.addEventListener("DOMContentLoaded", () => {
    const caseField = document.querySelector('[name="sfCaseNum"]');

    if (!caseField) return;

    caseField.addEventListener("change", loadFormData);

    document.addEventListener("click", (e) => {

        // DROPDOWN TOGGLE
        const btn = e.target.closest(".copy-btn");
        if (btn) {
            e.stopPropagation();

            const dropdown = btn.closest(".copy-dropdown");

            document.querySelectorAll(".copy-dropdown").forEach(d => {
                if (d !== dropdown) d.classList.remove("active");
            });

            dropdown.classList.toggle("active");
            return;
        }

        // DROPDOWN OPTIONS (Node / Option82)
        const option = e.target.closest(".copy-option");
        if (option) {
            e.preventDefault();
            e.stopPropagation();

            const type = option.dataset.type;
            const container = option.closest(".form1DivInput");
            const input = container.querySelector("input");

            if (!input) return;

            const resolved = resolveCopyValue(input.value, type);
            copyToClipboard(resolved);

            option.closest(".copy-dropdown").classList.remove("active");
            return;
        }

        // REGULAR COPY BUTTON (fallback)
        const regularCopyBtn = e.target.closest(
            "button.input-and-button:not(.copy-btn):not(.copy-option)"
        );

        if (regularCopyBtn) {
            const container = regularCopyBtn.closest(".form1DivInput");
            const input = container?.querySelector("input");

            if (!input) return;

            const resolved = resolveCopyValue(input.value);
            copyToClipboard(resolved);
            return;
        }

        // CLICK OUTSIDE → close dropdowns
        document.querySelectorAll(".copy-dropdown").forEach(d => {
            d.classList.remove("active");
        });

    });

});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => console.log("Copied:", text))
        .catch(err => console.error("Copy failed:", err));
}

// Show/Hide rows based on channel selection & Timers
document.addEventListener('DOMContentLoaded', function() { 
    // ================================
    // SHOW/HIDE ROWS BASED ON CHANNEL
    // ================================
    const channelSelect = document.getElementById("channel");

    const rows = {
        caseAccountHeader: document.getElementById("case-and-account-header-row"),
        custName: document.getElementById("cust-name-row"),
        caseNum: document.getElementById("case-num-row"),
        accNum: document.getElementById("acc-num-row"),
        phoneNum: document.getElementById("phone-num-row"),
        lobVoc: document.getElementById("lob-and-voc-row"),
        buttonsRow: document.getElementById("buttons-row"),
        caseOrigin: document.getElementById("case-origin-row")
    };

    function updateChannelRows() {
        if (!channelSelect.value) return;

        const isSocMed = channelSelect.value === "CDT-SOCMED";
        const isCCBO = channelSelect.value === "CDT-CCBO";

        rows.caseAccountHeader.style.display = "";
        rows.custName.style.display = "";
        rows.accNum.style.display = "";
        rows.phoneNum.style.display = "";
        rows.lobVoc.style.display = "";
        rows.caseNum.style.display = (isSocMed || isCCBO) ? "" : "none";
        rows.buttonsRow.style.display = "";
    }

    channelSelect?.addEventListener("change", updateChannelRows);

    // Run once on load
    updateChannelRows();

    if (typeof initializeFormElements === "function") initializeFormElements();
    if (typeof registerEventHandlers === "function") registerEventHandlers();

    // ================================
    // MAIN TIMER
    // ================================
    let timerInterval;
    let startTime;
    let elapsedTime = 0;
    let isRunning = false;

    const timerDisplay = document.getElementById('timerDisplay');
    const timerToggleButton = document.getElementById('timerToggleButton');
    const timerResetButton = document.getElementById('timerResetButton');

    if (timerDisplay) timerDisplay.textContent = formatTime(0);

    function formatTime(seconds) {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    function updateDisplay() {
        const now = Date.now();
        const totalElapsedSeconds = Math.floor((now - startTime + elapsedTime) / 1000);
        timerDisplay.textContent = formatTime(totalElapsedSeconds);
    }

    function handleTimer(action) {
        if (action === 'start' && !isRunning) {
            startTime = Date.now();
            timerInterval = setInterval(updateDisplay, 1000);
            isRunning = true;
            timerToggleButton.textContent = 'Pause';
        } else if (action === 'pause' && isRunning) {
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
            isRunning = false;
            timerToggleButton.textContent = 'Resume';
        } else if (action === 'reset') {
            showConfirm2("Are you sure you want to reset the timer?")
            .then((confirmReset) => {
                if (!confirmReset) return;

                clearInterval(timerInterval);
                elapsedTime = 0;
                timerDisplay.textContent = formatTime(0);
                isRunning = false;
                timerToggleButton.textContent = 'Start';
            });
        }
    }

    timerToggleButton?.addEventListener('click', function() {
        if (isRunning) {
            handleTimer('pause');
        } else {
            handleTimer('start');
        }
    });

    timerResetButton?.addEventListener('click', function() {
        handleTimer('reset');
    });
});

// Reset Dropdown options to default
function resetAllFields(excludeFields = []) {
    const selects = document.querySelectorAll("#form2Container select");
    selects.forEach(select => {
        if (!excludeFields.includes(select.name)) { 
            select.selectedIndex = 0; 
        }
    });
}

// Hide specific fields
function hideSpecificFields(fieldNames) {
    const allRows = document.querySelectorAll("tr");
    fieldNames.forEach(name => {
        allRows.forEach(row => {
            const field = row.querySelector(`[name="${name}"]`);
            if (field) {
                row.style.display = "none";
            }
        });
    });
}

// Show specific fields
function showFields(fieldNames) {
    const allRows = document.querySelectorAll("tr");
    fieldNames.forEach(name => {
        allRows.forEach(row => {
            const field = row.querySelector(`[name="${name}"]`);
            if (field) {
                row.style.display = "table-row";
            }
        });
    });
}

// Check if field is visible
function isFieldVisible(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return false;

    const fieldRow = field.closest("tr");
    const fieldStyle = window.getComputedStyle(field);

    return field.offsetParent !== null &&  
        !(fieldRow?.style.display === "none" ||
            fieldStyle.display === "none" ||
            fieldStyle.visibility === "hidden" ||
            fieldStyle.opacity === "0");
}

// Get Field value only if it is visible
function getFieldValueIfVisible(fieldName) {
    if (!isFieldVisible(fieldName)) return "";

    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return "";

    let value = field.value.trim();

    if (field.tagName.toLowerCase() === "textarea") {
        value = value.replace(/\r?\n|\|/g, "/ ");
    }

    return value;
}

// Declare global variables
function initializeVariables() {
    const q = (selector) => {
        const field = document.querySelector(selector);
        return field && isFieldVisible(field.name) ? field.value.trim() : "";
    };

    const selectIntentElement = document.querySelector("#selectIntent");
    const selectedIntentText = selectIntentElement 
        ? selectIntentElement.selectedOptions[0].textContent.trim() 
        : "";
    
    let selectedOptGroupLabel = "";
    if (selectIntentElement && selectIntentElement.selectedOptions.length > 0) {
        const selectedOption = selectIntentElement.selectedOptions[0];
        if (selectedOption.parentElement.tagName.toLowerCase() === "optgroup") {
            selectedOptGroupLabel = selectedOption.parentElement.label;
        }
    }

    return {
        selectedIntent: q("#selectIntent"),
        selectedIntentText,
        selectedOptGroupLabel,
        channel: q("#channel"),
        custName: q('[name="custName"]'),
        sfCaseNum: q('[name="sfCaseNum"]'),
        WOCAS: q('[name="WOCAS"]'),
        projRed: q('[name="projRed"]'),
        outageStatus: q('[name="outageStatus"]'),
        Option82: q('[name="Option82"]'),
        rptCount: q('[name="rptCount"]'),
        investigation1: q('[name="investigation1"]'),
        investigation2: q('[name="investigation2"]'),
        investigation3: q('[name="investigation3"]'),
        investigation4: q('[name="investigation4"]'),
        accountStatus: q('[name="accountStatus"]'),
        facility: q('[name="facility"]'),
        resType: q('[name="resType"]'),
        pcNumber: q('[name="pcNumber"]'),
        issueResolved: q('[name="issueResolved"]'),
        pldtUser: q('[name="pldtUser"]'),
        ticketStatus: q('[name="ticketStatus"]'),
        offerALS: q('[name="offerALS"]'),
        accountNum: q('[name="accountNum"]'),
        landlineNum: q('[name="landlineNum"]'),
        remarks: q('[name="remarks"]'),
        cepCaseNumber: q('[name="cepCaseNumber"]'),
        specialInstruct: q('[name="specialInstruct"]'),
        meshtype: q('[name="meshtype"]'),
        accountType: q('[name="accountType"]'),
        custAuth: q('[name="custAuth"]'),
        custConcern: q('[name="custConcern"]'),
        srNum: q('[name="srNum"]'),
        contactName: q('[name="contactName"]'),
        cbr: q('[name="cbr"]'),
        availability: q('[name="availability"]'),
        address: q('[name="address"]'),
        landmarks: q('[name="landmarks"]'),
        subject1: q('[name="subject1"]'),
        resolution: q('[name="resolution"]'),
        paymentChannel: q('[name="paymentChannel"]'),
        personnelType: q('[name="personnelType"]'),
        planDetails: q('[name="planDetails"]'),
        ffupStatus: q('[name="ffupStatus"]'),
        queue: q('[name="queue"]'),
        ffupCount: q('[name="ffupCount"]'),
        ticketAge: q('[name="ticketAge"]'),
        findings: q('[name="findings"]'),
        disputeType: q('[name="disputeType"]'),
        approver: q('[name="approver"]'),
        subType: q('[name="subType"]'),
        onuSerialNum: q('[name="onuSerialNum"]'),
        rxPower: q('[name="rxPower"]'),
        affectedTool: q('[name="affectedTool"]'),
        requestType: q('[name="requestType"]'),
        vasProduct: q('[name="vasProduct"]'),
    };
}

// Create the dynamic forms based on the selected intent/WOCAS
function createIntentBasedForm() {
    const selectIntent = document.getElementById("selectIntent");
    const form2Container = document.getElementById("form2Container");

    form2Container.innerHTML = "";

    const selectedValue = selectIntent.value;
    const channelField = document.getElementById("channel");

    var form = document.createElement("form");
    form.setAttribute("id", "Form2");

    const selectedOption = selectIntent.options[selectIntent.selectedIndex];
    const lobValue = document.getElementById("lob").value;

    let introText = selectedOption.textContent;

    if (lobValue === "NON-TECH") {
        const optgroupElement = selectedOption.parentElement;

        if (optgroupElement && optgroupElement.tagName === "OPTGROUP") {
            const optgroupLabel = optgroupElement.label;
            introText = `${optgroupLabel} - ${introText}`;
        }
    }

    if (fabMessage) {
        fabMessage.classList.remove("hide");
        stopTyping = false;

        typeWriter(introText, fabMessage, 35);
    }

    const voiceAndDataForms = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7"
    ]

    const voiceForms = [
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4",
        "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5"
    ];

    const nicForms = [
        "form500_1", "form500_2", "form500_3", "form500_4"
    ];

    const sicForms = [
        "form501_1", "form501_2", "form501_3", "form501_4"
    ];

    const selectiveBrowseForms = [
        "form502_1", "form502_2"
    ];

    const iptvForms = [
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3"
    ]

    const mrtForms = [
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7", "form300_8"
    ];

    const streamAppsForms = [
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ]

    const inquiryForms = [
        "formInqAccSrvcStatus", "formInqLockIn", "formInqCopyOfBill", "formInqMyHomeAcc", "formInqPlanDetails", "formInqAda", "formInqRebCredAdj", "formInqBalTransfer", "formInqBrokenPromise", "formInqCreditAdj", "formInqCredLimit", "formInqNSR", "formInqDdate", "formInqBillDdateExt", "formInqEcaPip", "formInqNewBill", "formInqOneTimeCharges", "formInqOverpay", "formInqPayChannel", "formInqPayPosting", "formInqPayRefund", "formInqPayUnreflected", "formInqDdateMod", "formInqBillRefund", "formInqSmsEmailBill", "formInqTollUsage", "formInqCoRetain", "formInqCoChange", "formInqTempDisc", "formInqD1299", "formInqD1399", "formInqD1799", "formInqDOthers", "formInqDdateExt", "formInqEntertainment", "formInqInmove", "formInqMigration", "formInqProdAndPromo", "formInqHomeRefNC", "formInqHomeDisCredit", "formInqReloc", "formInqRewards", "formInqDirectDial", "formInqBundle", "formInqSfOthers", "formInqSAO500", "formInqUfcEnroll", "formInqUfcPromoMech", "formInqUpg1399", "formInqUpg1599", "formInqUpg1799", "formInqUpg2099", "formInqUpg2499", "formInqUpg2699", "formInqUpgOthers", "formInqVasAO", "formInqVasIptv", "formInqVasMOW", "formInqVasSAO", "formInqVasWMesh", "formInqVasOthers", "formInqWireReRoute"
    ]

    const othersForms = [
        "othersWebForm", "othersEntAcc", "othersHomeBro", "othersSmart", "othersSME177", "othersAO", "othersRepair", "othersBillAndAcc", "othersUT"
    ]

    const ffupForms = [
        "formFfupChangeOwnership", "formFfupChangeTelNum", "formFfupChangeTelUnit", "formFfupDiscoVas", "formFfupDispute", "formFfupDowngrade", "formFfupDDE", "formFfupInmove", "formFfupMigration", "formFfupMisappPay", "formFfupNewApp", "formFfupOcular", "formFfupOverpay", "formFfupPermaDisco", "formFfupRenew", "formFfupResume", "formFfupUnbar", "formFfupCustDependency", "formFfupAMSF", "formFfupFinalAcc", "formFfupOverpayment", "formFfupWrongBiller", "formFfupReloc", "formFfupRelocCid", "formFfupSpecialFeat", "formFfupSAO", "formFfupTempDisco", "formFfupUP", "formFfupUpgrade", "formFfupVasAct", "formFfupVasDel", "formFfupReroute", "formFfupWT"
    ]

    const alwaysOnForms = [
        "form500_5", "form501_7", "form101_5", "form510_9", "form500_6"
    ]

    const requestForms = [
        "formReqTaxAdj", "formReqChgTelUnit", "formReqOcular", "formReqProofOfSub"
    ]

    const UPSELL_OPTIONS = {
        upsell: [
            "", 
            "Yes - Accepted",
            "No - Declined",
            "No - Ignored",
            "No - Undecided",
            "NA - Not Eligible"
        ],
        productsOffered: [
            "", 
            "Always On",
            "Mesh",
            "Plan Upgrade",
        ],
        declineReason: [
            "", 
            "Budget constraint", 
            "No need / satisfied with current plan", 
            "Time constraint", 
            "No reason stated", 
            "Poor service experience", 
            "Not decision-maker"
        ],
        notEligibleReason: [
            "", 
            "Account has pending issues", 
            "Account is barred", 
            "Account is inhibited", 
            "Account is not yet active", 
            "Account is restricted",
            "Customer already availed the product", 
            "Customer already availed the service", 
            "Customer already upgraded their plan", 
            "Customer is in a hurry", 
            "Customer is irate", 
            "Customer is requesting a supervisor", 
            "Customer is requesting a manager", 
            "Customer is requesting to downgrade", 
            "Disconnection concerns", 
            "LOB is not applicable", 
            "Microbusiness Account", 
            "Plan not eligible for upsell", 
            "Poor LTE signal strength in the area", 
            "Poor payment history", 
            "Potential crisis", 
            "Prepaid Fiber",
            "Technical incompatibility", 
            "Temporary Disconnection concerns",
            "Time is limited",
            "Unresolved AFTERSALES complaints", 
            "Unresolved AFTERSALES concerns", 
            "VTD concerns"
        ]
    };

    function handleUpsellChange(upsell) {
        showFields(["productsOffered"]);

        if (upsell.selectedIndex === 1 || upsell.selectedIndex === 3 || upsell.selectedIndex === 4) {
            hideSpecificFields(["declineReason", "notEligibleReason"]);

        } else if (upsell.selectedIndex === 2) {
            showFields(["declineReason"]);
            hideSpecificFields(["notEligibleReason"]);

        } else if (upsell.selectedIndex === 5) {
            showFields(["notEligibleReason"]);
            hideSpecificFields(["productsOffered", "declineReason"]);
        } else {
            hideSpecificFields(["productsOffered", "declineReason", "notEligibleReason"]);
        }
    }

    // Tech Follow-Up
    if (selectedValue === "formFfupRepair") { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "Parent Case", type: "number", name: "pcNumber", placeholder: "Leave blank if not applicable" },
            { label: "Status Reason", type: "select", name: "statusReason", options: [
                "", 
                "Awaiting Cignal Resolution", 
                "Dispatched to Field Technician",
                "Dispatched to Field Technician - Re-Open",
                "Escalated to 3rd Party Vendor",
                "Escalated to CCARE CIGNAL SUPPORT",
                "Escalated to CCBO", 
                "Escalated to L2", 
                "Escalated to Network", 
                "Escalated to Network - Re-Open", 
                "TOK No Answer", 
                "TOK Under Observation" ]},
            { label: "Sub Status", type: "select", name: "subStatus", options: [
                "", 
                "Associated with the Parent Case",
                "Disassociated from the Parent Case",
                "Extracted to OFSC",
                "Extracted to SDM",
                "Extracted to SDM - Re-Open",
                "Extraction to OFSC Failed - Fallout",
                "Extraction to OFSC Failed - Retry Limit Exceeded",
                "Extraction to SDM Failed - Fallout",
                "Extraction to SDM Failed - Retry Limit Exceeded",
                "Last Mile Resolved - Confirmed in OFSC",
                "Network Resolved - Awaiting Customer Confirmation",
                "Network Resolved - Last Mile",
                "Non Tech Escalation - Return Ticket",
                "Non Tech Escalation - Return Ticket Last Mile",
                "Not Done - Return Ticket",
                "Not Done - Return Ticket Network Outage" ]},
            { label: "Subject 1", type: "select", name: "subject1", options: [
                "", 
                "Data", 
                "IPTV",
                "Voice",
                "Voice and Data" ]},
            { label: "Queue", type: "select", name: "queue", options: [
                "", 
                "FM POLL", 
                "CCARE OFFBOARD",
                "SDM CHILD",
                "SDM", 
                "FSMG", 
                "OFSC", 
                "PMA", 
                "SYSTEM SUPPORT", 
                "VAS SUPPORT", 
                "CCARE CIGNAL", 
                "L2 RESOLUTION", 
                "Default Entity Queue" ]}, 
            { label: "Auto Ticket (Red Tagging)", type: "select", name: "projRed", options: [
                "", 
                "Yes", 
                "No" ]},
            { label: "Case Status", type: "select", name: "ticketStatus", options: [
                "", 
                "Beyond SLA", 
                "Within SLA" ]},
            // Offer Alternative Services
            { label: "Offer ALS", type: "select", name: "offerALS", options: [
                "", 
                "Offered ALS/Accepted", 
                "Offered ALS/Declined", 
                "Offered ALS/No Confirmation", 
                "Previous Agent Already Offered ALS",
                "Not Applicable" // Tickets beyond 24 hrs but still within the 36 hrs threshold for offering ALS.
            ]},
            { label: "Alternative Services Package Offered", type: "textarea", name: "alsPackOffered", placeholder: "(i.e. 10GB Open Access data, 5GB/day for Youtube, NBA, Cignal and iWantTFC, Unlimited call to Smart/TNT/SUN, Unlimited text to all network and 500MB of data for Viber, Messenger, WhatsApp and Telegram valid for 7 days)" },
            { label: "Effectivity Date", type: "date", name: "effectiveDate" },
            { label: "Nominated Mobile Number", type: "number", name: "nomiMobileNum" },
            { label: "No. of Follow-Up(s)", type: "select", name: "ffupCount", options: ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Multiple" ]},
            { label: "Case Age (HH:MM)", type: "text", name: "ticketAge" },
            { label: "Notes to Tech/ Actions Taken/ Decline Reason for ALS", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No"
            ]},

            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Normal Status",
                "Blinking/No PON/FIBR/ADSL light",
                "No Internet Light",
                "No LAN light",
                "No Power Light",
                "No VoIP/Tel/Phone Light",
                "No WLAN light",
                "Not Applicable-Copper",
                "Not Applicable-Defective CPE",
                "Red LOS",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Skin Result", 
                "Correct profile at Voice NMS",
                "Correct SG7K profile",
                "Failed RX",
                "Idle Status – FEOL",
                "LOS/Down",
                "No acquired IP address - Native",
                "No or incomplete profile at Voice NMS",
                "No SG7K profile",
                "Not Applicable – InterOp",
                "Not Applicable – NCE/InterOp",
                "Not Applicable – NMS GUI",
                "Not Applicable – Voice only – Fiber",
                "Null Value",
                "Passed RX",
                "Power is Off/Down",
                "Register – Failed Status – FEOL",
                "Up/Active",
                "VLAN configuration issue"                    
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Defective/Faulty ONU",
                "Failed to collect line card information",
                "Fiber cut LCP to NAP",
                "Fiber cut NAP to ONU",
                "Fiber cut OLT to LCP",
                "Fix bad splices",
                "Missing Micro-Filter",
                "Not applicable - Voice issue",
                "No recommended action",
                "Others/Error code",
                "Rogue ONU",
                "Severely Degraded",
                "The ONU appears to be disconnected",
                "The ONU is off",
                "The ONU is out of service",
                "The ONU performance is degraded",
                "Unbalanced Pair",
                "Without line problem detected",
                "Without line problem detected – Link quality degraded",
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Aligned Record",
                "Broken/Damaged Modem/ONU",
                "Broken/Damaged STB/SC",
                "Broken/Damaged telset",
                "Cannot Browse",
                "Cannot Browse via Mesh",
                "Cannot Browse via LAN",
                "Cannot Browse via WiFi",
                "Cannot Make Call",
                "Cannot Make/Receive Call",
                "Cannot Reach Specific Website",
                "Cannot Read Smart Card",
                "Cannot Receive Call",
                "Change Set Up Route to Bridge and vice-versa",
                "Change Set Up Route to Bridge and vice-versa – InterOp",
                "Cignal IRN Created – Missing Channel",
                "Cignal IRN Created – No Audio/Video Output",
                "Cignal IRN Created – Poor Audio/Video Quality",
                "Content",
                "Data Bind Port",
                "Defective STB/SC/Accessories/Physical Set Up",
                "Defective Wifi Mesh/Physical Set Up",
                "Fast Busy/ With Recording",
                "Freeze",
                "High Latency",
                "Individual Trouble",
                "IPTV Trouble",
                "Loopback",
                "Misaligned Record",
                "Missing Channel/s",
                "Network Trouble – Cannot Browse",
                "Network Trouble – Cannot Browse via Mesh",
                "Network Trouble – High Latency",
                "Network Trouble – Selective Browsing",
                "Network Trouble – Slow Internet Connection",
                "Network Trouble – Slow/Intermittent Browsing",
                "No Audio/Video Output with Test Channel",
                "No Audio/Video Output without Test Channel",
                "No Ring Back Tone",
                "Node Down",
                "Noisy Line",
                "Out of Sync",
                "Pixelated",
                "Primary Trouble",
                "Recording Error",
                "Redirected to PLDT Sites",
                "Remote Control Issues",
                "Request Modem/ONU GUI Access",
                "Request Modem/ONU GUI Access – InterOp",
                "Secondary Trouble",
                "Slow/Intermittent Browsing",
                "STB not Synched",
                "Too Long to Boot Up",
                "With Historical Alarms",
                "With Ring Back Tone",
                "Without Historical Alarms"
            ] },
            { label: "SLA / ETR", type: "text", name: "sla", placeholder: "Leave blank if not applicable" },
            
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount" },
            { label: "Re-Open Status Reason", type: "textarea", name: "reOpenStatsReason", placeholder: "Indicate the reason for re-opening the ticket (Dispatched to Field Technician - Re-Open or Escalated to Network - Re-Open)." },
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Product/Services Offered", type: "select", name: "productsOffered", options: UPSELL_OPTIONS.productsOffered },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link = document.createElement("a");

            let url = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url = "https://pldt365.sharepoint.com/sites/LIT365/PLDT_INTERACTIVE_TROUBLESHOOTING_GUIDE/Pages/FOLLOW_UP_REPAIR.aspx?csf=1&web=1&e=NDfTRV";
            } else if (channelField.value === "CDT-SOCMED") {
                url = "https://pldt365.sharepoint.com/sites/LIT365/files/2023Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2023Advisories%2F07JULY%2FPLDT%5FWI%2FSOCMED%5FGENUINE%5FREPAIR%5FFFUP%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2023Advisories%2F07JULY%2FPLDT%5FWI";
            }

            link.textContent = "Handling of Repair Follow-up";
            link.style.color = "lightblue";
            link.href = "#";

            link.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link);
            li5.appendChild(document.createTextNode(" for detailed work instructions."));
            ul.appendChild(li5);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertNoteRow(fields, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName) + 1,
                0,
                {
                    type: "noteRow",
                    name: "defaultEntityQueue",
                    relatedTo: relatedFieldName
                }
            );
        }      

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName
                }
            );
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "cepCaseNumber");
        insertNoteRow(enhancedFields, "queue");
        insertToolLabel(enhancedFields, "Alternative Services", "offerALS");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");

        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = (field.name === "cepCaseNumber" || field.name === "pcNumber" || field.name === "subject1" || field.name === "subject2" || field.name === "queue" || field.name === "statusReason" || field.name === "subStatus") ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}:`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "noteRow") {
                const row = document.createElement("tr");
                row.classList.add("note-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const req = document.createElement("p");
                req.textContent = "Note:";
                req.className = "note-header";
                checklistDiv.appendChild(req);

                const ulReq = document.createElement("ul");
                ulReq.className = "note";

                const li1 = document.createElement("li");
                li1.textContent = "Delete investigation 1 to 4 value and click Save.";
                ulReq.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "Utilize the appropriate tools. Handle customer concern based on What Our Customers Are Saying (WOCAS) and update details of Investigation 1-4.";
                ulReq.appendChild(li2);

                checklistDiv.appendChild(ulReq);
                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach(optionText => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : (field.name === "alsPackOffered" ? 4 : 2);
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;

                if (field.type === "date" && input.showPicker) {
                    input.addEventListener("focus", () => input.showPicker());
                    input.addEventListener("click", () => input.showPicker());
                }
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field)));

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row, .esca-checklist-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
        
        const queue = document.querySelector("[name='queue']");
        queue.addEventListener("change", () => {
            resetAllFields(["subject1", "statusReason","subStatus", "queue"]);
            if (queue.value === "FM POLL" || queue.value === "CCARE OFFBOARD") {
                showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "issueResolved", "upsell" ]);
                hideSpecificFields(["projRed", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason", "productsOffered", "declineReason", "notEligibleReason" ]);

                updateToolLabelVisibility();

            }else if (queue.value === "Default Entity Queue") {
                showFields(["ffupCount", "ticketAge", "remarks", "issueResolved", "upsell"]);
                hideSpecificFields(["projRed", "ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason", "productsOffered", "declineReason", "notEligibleReason" ]);

                updateToolLabelVisibility();

            } else {
                showFields(["projRed" ]);
                hideSpecificFields(["ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "ffupCount", "ticketAge", "remarks", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason", "upsell", "productsOffered", "declineReason", "notEligibleReason" ]);

                updateToolLabelVisibility();
            }

            updateToolLabelVisibility();

            const noteRow = document.querySelector(".note-row[data-related-to='queue']");
            if (queue.value === "Default Entity Queue") {
                if (noteRow) noteRow.style.display = "table-row";
            } else {
                if (noteRow) noteRow.style.display = "none";
            }
        });

        const projRed = document.querySelector("[name='projRed']");
        projRed.addEventListener("change", () => {
            resetAllFields(["subject1", "statusReason","subStatus", "queue", "projRed"]);
            if (projRed.value === "Yes") {
                if (queue.value === "SDM CHILD" || queue.value ==="SDM" || queue.value ==="FSMG" || queue.value ==="L2 RESOLUTION" ) {
                    showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "contactName", "cbr", "rptCount", "upsell" ]);
                    hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "availability", "address", "landmarks", "reOpenStatsReason", "productsOffered", "declineReason", "notEligibleReason" ]);
                } else {
                    showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell" ]);
                    hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "reOpenStatsReason", "productsOffered", "declineReason", "notEligibleReason" ]);
                }

                updateToolLabelVisibility();

            } else if (projRed.value === "No"){
                showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "upsell" ]);
                hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason", "productsOffered", "declineReason", "notEligibleReason" ]);

                updateToolLabelVisibility();

            } else {
                hideSpecificFields(["ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "ffupCount", "ticketAge", "remarks", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason", "upsell", "productsOffered", "declineReason", "notEligibleReason" ]);

                updateToolLabelVisibility();
            }
            updateToolLabelVisibility();
        });

        const ticketStatus = document.querySelector("[name='ticketStatus']");
        ticketStatus.addEventListener("change", () => {
            if (ticketStatus.value === "Beyond SLA") {
                showFields(["offerALS" ]);
                updateToolLabelVisibility();
            } else {
                hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum" ]);
                updateToolLabelVisibility();
            }
            updateToolLabelVisibility();
        });

        const offerALS = document.querySelector("[name='offerALS']");
        offerALS.addEventListener("change", () => {
            if (offerALS.value === "Offered ALS/Accepted") {
                showFields(["alsPackOffered", "effectiveDate", "nomiMobileNum" ]);
            } else if (offerALS.value === "Offered ALS/Declined") {
                showFields(["alsPackOffered" ]);
                hideSpecificFields(["effectiveDate", "nomiMobileNum" ]);
            } else {
                hideSpecificFields(["alsPackOffered", "effectiveDate", "nomiMobileNum" ]);
            }
        });

        const issueResolved = document.querySelector("[name='issueResolved']");
        issueResolved.addEventListener("change", () => {
            if (issueResolved.value === "No") {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason" ]);
                updateToolLabelVisibility();
            } else {
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "reOpenStatsReason" ]);
                updateToolLabelVisibility();
            }
            updateToolLabelVisibility();
        });

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

        updateToolLabelVisibility();

    } 
    
    // Tech Complaints
    else if (voiceAndDataForms.includes(selectedValue)) { 
        
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account/Facility Type", type: "select", name: "facility", options: [
                "", 
                "Fiber", 
                "Fiber - Radius", 
                "Copper VDSL", 
                "Copper HDSL/NGN" 
            ]},
            { label: "Res. Vertical Address", type: "select", name: "resType", options: [
                "Bldg., Condo, etc.", 
                "Yes", 
                "No"
            ]},
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"] },
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case" },
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Available in FUSE/CV/DMS."},
            { label: "Modem Lights Status", type: "select", name: "modemLights", options: [
                "", 
                "Red Power Light", 
                "No Power Light",
                "PON Light Blinking",
                "Red LOS",
                "NO LOS light / Power and PON Lights Steady Green"
            ]},
            // BSMP/Clearview
            { label: "SMP/Clearview Reading", type: "textarea", name: "cvReading", placeholder: "e.g. Line Problem Detected - OLT to LCP, LCP to NAP, NAP to ONU" },
            { label: "Latest RTA Request (L2)", type: "text", name: "rtaRequest"},
            // NMS Skin
            { label: "ONU Status/RUNSTAT", type: "select", name: "onuRunStats", options: [
                "", 
                "UP",
                "Active",
                "LOS",
                "Down",
                "Power is Off",
                "Power is Down",
                "/N/A"
            ]},
            { label: "RX Power", type: "number", name: "rxPower", step: "any"},
            { label: "VLAN (L2)", type: "text", name: "vlan"},
            { label: "Option82 Config", type: "select", name: "option82Config", options: [
                "", 
                "Aligned", 
                "Misaligned"
            ]},
            { label: "Actions Taken in NMS Skin", type: "textarea", name: "nmsSkinRemarks", placeholder: "Include the RA and DC action results here. If no action was taken, leave this field blank." },
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer's actual experience in detail.\ne.g. “NDT-NIC with red LOS” DO NOT input the WOCAS!"},
            { label: "Other Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Defective Modem / Missing Modem",
                "Defective Splitter / Defective Microfilter",
                "LOS",
                "Manual Troubleshooting",
                "NMS Refresh / Configuration",
                "No Configuration / Wrong Configuration",
                "No PON Light",
                "Self-Restored",
                "Network / Outage",
                "Zone"
            ]},
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Red LOS",
                "Blinking/No PON/FIBR/ADSL",
                "Normal Status",
                "No Power Light",
                "Not Applicable [Copper]",
                "Not Applicable [Defective CPE]",
                "Not Applicable [via Store]",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS: ONU Status/RUNSTAT —", 
                "UP/Active", 
                "LOS/Down", 
                "Power is Off/Down", 
                "Null Value",
                "Not Applicable [via Store]",
                "Not Applicable [NMS GUI]",
                "Passed RX",
                "Failed RX"
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Defective/Faulty ONU",
                "Failed to collect line card information", 
                "Fibercut LCP to NAP", 
                "Fibercut NAP to ONU", 
                "Fibercut OLT to LCP", 
                "Fix bad splices",
                "No recommended action", 
                "Not Applicable",
                "Others/Error Code", 
                "The ONU appears to be disconnected", 
                "The ONU is OFF", 
                "The ONU is out of service", 
                "The ONU performance is degraded",
                "Without Line Problem Detected", 
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Aligned Record", 
                "Awaiting Parent Case", 
                "Broken/Damaged Modem/ONU", 
                "Cannot Browse",
                "Cannot Browse via Mesh",
                "Cannot Connect via LAN",
                "Cannot Connect via WiFi",
		        "Data Bind Port",
                "FCR - Cannot Browse", 
                "FCR - Cannot Connect via LAN", 
                "FCR - Cannot Connect via WiFi", 
                "FCR - Device - Advised Physical Set-Up",
                "FCR - Low BW profile",
                "FCR - Slow/Intermittent Browsing",
                "Individual Trouble", 
                "Misaligned Record",
                "Network Trouble - Cannot Browse",
                "Network Trouble - Cannot Browse via Mesh",
                "Node Down",
                "Not Applicable [via Store]",
                "Redirected to PLDT Sites",
                "Node Down", 
                "Not Applicable [via Store]", 
                "Primary Trouble", 
                "Secondary Trouble"
            ] },
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount" },
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Product/Services Offered", type: "select", name: "productsOffered", options: UPSELL_OPTIONS.productsOffered },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }
                    
        function insertNoteRow(fields, toolLabelName) {
            const index = fields.findIndex(f => f.name === toolLabelName);
            if (index !== -1) {
                fields.splice(index + 1, 0, {
                    type: "noteRow",
                    name: "onuStatChecklist",
                    relatedTo: "onuRunStats"
                });
            }
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName
                }
            );
        }

        function insertEscaChecklistRow(fields, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "escaChecklistRow",
                    name: "escaChecklist",
                    relatedTo: relatedFieldName
                });
            }
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertEscaChecklistRow(enhancedFields, "outageStatus");
        insertToolLabel(enhancedFields, "NMS Skin", "onuRunStats");
        insertNoteRow(enhancedFields, "toolLabel-nms-skin");      
        insertToolLabel(enhancedFields, "BSMP/Clearview", "cvReading");
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "actualExp");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        

        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "facility" ? "table-row" : "none"; 

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "noteRow") {
                const row = document.createElement("tr");
                row.classList.add("note-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const noteDiv = document.createElement("div");
                noteDiv.className = "form2DivPrompt";

                const note = document.createElement("p");
                note.textContent = "Note:";
                note.className = "note-header";
                noteDiv.appendChild(note);

                const ulNote = document.createElement("ul");
                ulNote.className = "note";

                const li1 = document.createElement("li");
                li1.textContent = "Check Option82 configuration in NMS Skin (BMSP, SAAA and EAAA), Clearview, CEP, and FUSE.";
                ulNote.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "If NMS Skin result (ONU Status/RunStat) is “-/N/A” (null value), select “LOS/Down” for Investigation 2.";
                ulNote.appendChild(li2);

                const li3 = document.createElement("li");
                li3.textContent = "If NMS Skin result (ONU Status/RunStat) is unavailable, use DMS (Device status > Online status) section.";
                const nestedUl = document.createElement("ul");
                ["Check Mark = Up/Active", "X Mark = LOS/Down"].forEach(text => {
                    const li = document.createElement("li");
                    li.textContent = text;
                    nestedUl.appendChild(li);
                });
                li3.appendChild(nestedUl);
                ulNote.appendChild(li3);

                const li4 = document.createElement("li");
                li4.textContent = "If NMS Skin and DMS is unavailable, select “LOS/Down” for Investigation 2 and notate “NMS Skin and DMS result unavailable” at Case Notes in Timeline.";
                ulNote.appendChild(li4);

                const li5 = document.createElement("li");
                li5.textContent = "Any misalignment observed in Clearview, NMS Skin (BSMP, EAAA, or SAAA), or CEP MUST be documented in the “Remarks” field to avoid misdiagnosis.";
                ulNote.appendChild(li5);

                noteDiv.appendChild(ulNote);
                td.appendChild(noteDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "L2/Zone/Network Escalation Checklist:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li6 = document.createElement("li");
                li6.textContent = "Network Downtime Checking";
                ulChecklist.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Power Light Checking";
                ulChecklist.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "PON Light Checking";
                ulChecklist.appendChild(li8);

                const li9 = document.createElement("li");
                li9.textContent = "LOS Light Checking";
                ulChecklist.appendChild(li9);

                const li10 = document.createElement("li");
                li10.textContent = "NMS Skin Result";
                ulChecklist.appendChild(li10);

                const li11 = document.createElement("li");
                li11.textContent = "Clear View Result";
                ulChecklist.appendChild(li11);

                const li12 = document.createElement("li");
                li12.textContent = "Option 82 Alignment Checking";
                ulChecklist.appendChild(li12);

                const li13 = document.createElement("li");
                li13.textContent = "Fiber Optic Cable / Patchcord Checking";
                ulChecklist.appendChild(li13);

                checklistDiv.appendChild(ulChecklist);

                const checklistInstruction = document.createElement("p");
                checklistInstruction.textContent = "Note: It is not necessary to complete every item in this escalation checklist. Refer to the LIT365 work instructions for proper guidance.\n\nMaintain clear and detailed documentation to prevent potential misdiagnosis.";
                checklistInstruction.className = "esca-checklist-instruction";
                checklistDiv.appendChild(checklistInstruction);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "onuRunStats") {
                    input.id = field.name;
                }
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row, .note-row, .esca-checklist-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "option82Config", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["onuSerialNum", "modemLights", "actualExp", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "option82Config", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "issueResolved", "productsOffered", "declineReason", "notEligibleReason"]);

                    if (channelField.value === "CDT-SOCMED") {
                        showFields(["resolution"]);
                    } else {
                        hideSpecificFields(["resolution"]);
                    }
                } else {
                    showFields(["onuSerialNum", "modemLights", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "option82Config", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                }
            } else if (facility.value === "Fiber - Radius") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "cvReading", "rtaRequest", "actualExp", "issueResolved", "productsOffered", "declineReason", "notEligibleReason"]);

                    if (channelField.value === "CDT-SOCMED") {
                        showFields(["resolution"]);
                    } else {
                        hideSpecificFields(["resolution"]);
                    }
                } else {
                    showAlert("This form is currently unavailable for customers with Fiber - Radius service.");
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);

                    const facilityField = document.querySelector('[name="facility"]');
                    if (facilityField) facilityField.value = "";
                    return;
                }
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "issueResolved", "resolution", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            }
            updateToolLabelVisibility();
        });
    
        const resType = document.querySelector("[name='resType']");
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else {
                    showAlert("This form is currently unavailable for customers with Fiber - DSL service.");
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);

                    const resTypeField = document.querySelector('[name="resType"]');
                    if (resTypeField) resTypeField.value = "";
                    return;
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            }
            updateToolLabelVisibility();
        });
    
        const outageStatus = document.querySelector("[name='outageStatus']");
        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "issueResolved", "availability", "address", "landmarks", "productsOffered", "declineReason", "notEligibleReason"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else {
                if (facility.value === "Fiber") {
                    showFields(["onuSerialNum", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "option82Config", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else {
                    showFields(["onuSerialNum", "modemLights", "cvReading", "rtaRequest", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "option82Config", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                }
                
            }
            updateToolLabelVisibility();
        });

        const onuRunStats = document.querySelector("[name='onuRunStats']");
        onuRunStats.addEventListener("change", () => {
            if (onuRunStats.value === "UP" || onuRunStats.value === "Active") {
                showFields(["option82Config"]);
            } else {
                hideSpecificFields(["option82Config"]);
            }
            updateToolLabelVisibility();
        });
    
        const issueResolved = document.querySelector("[name='issueResolved']");
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            if (channelField.value === "CDT-SOCMED") {
                showFields(["resolution"]);
            } else {
                hideSpecificFields(["resolution"]);
            }
            updateToolLabelVisibility();
        });

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

        updateToolLabelVisibility();

    } else if (voiceForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account/Facility Type", type: "select", name: "facility", options: [
                "", 
                "Fiber", 
                "Fiber - Radius", 
                "Copper VDSL", 
                "Copper HDSL/NGN" 
            ]},
            { label: "Res. Vertical Address", type: "select", name: "resType", options: [
                "Bldg., Condo, etc.", 
                "Yes", 
                "No"
            ]},
            { label: "Service Status", type: "select", name: "serviceStatus", options: [
                "", 
                "Active", 
                "Barred", 
            ]},
            { label: "Services", type: "select", name: "services", options: [
                "", 
                "Bundled", 
                "Voice Only", 
            ]},
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"] },
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case" },
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Available in FUSE/CV/DMS."},
            { label: "Modem Lights Status", type: "select", name: "modemLights", options: [
                "", 
                "Red Power Light", 
                "No Power Light",
                "PON Light Blinking",
                "Red LOS",
                "No VoIP Light",
                "No Tel Light",
                "No Phone1 Light",
                "NO LOS light / Power and PON Lights Steady Green / VoIP/Tel/Phone1 Steady Green",
                "NO LOS light / Power and PON Lights Steady Green / VoIP/Tel/Phone1 Blinking Green"
            ]},
            { label: "Call Type", type: "select", name: "callType", options: [
                "", 
                "Local", 
                "Domestic",
                "International"
            ]},
            // NMS Skin
            { label: "OLT & ONU Conn. Type", type: "select", name: "oltAndOnuConnectionType", options: [
                "", 
                "FEOL - InterOp", 
                "FEOL - Non-interOp", 
                "HUOL - InterOp",
                "HUOL - Non-interOp"
            ]},
            { label: "FXS1 Status", type: "text", name: "fsx1Status" },
            { label: "Routing Index", type: "text", name: "routingIndex" },
            { label: "Call Source", type: "text", name: "callSource" },
            { label: "LDN Set", type: "text", name: "ldnSet" },
            { label: "Actions Taken in NMS Skin", type: "textarea", name: "nmsSkinRemarks", placeholder: "Include the RA and DC action results here. If no action was taken, leave this field blank." },
            // DMS
            { label: "Voice Status", type: "text", name: "dmsVoipServiceStatus" },
            { label: "Actions Taken in DMS", type: "textarea", name: "dmsRemarks", placeholder: "Leave this field blank if no action was taken." },
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer's actual experience in detail.\ne.g. “Busy tone when dialing”. DO NOT input the WOCAS!"},
            { label: "Other Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Defective Cable / Cord",
                "Defective Telset / Missing Telset",
                "Manual Troubleshooting",
                "No Configuration / Wrong Configuration",
                "Self-Restored",
                "Network / Outage",
                "Zone",
                "Defective Telset",
                "Defective Modem / Missing Modem",
                "NMS Configuration" 
            ]},
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Blinking/No PON/FIBR/ADSL",
                "No VoIP/Phone/Tel Light",
                "Normal Status",
                "Not Applicable [Copper]",
                "Not Applicable [Defective CPE]",
                "Not Applicable [via Store]",
                "RED LOS",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "Correct profile at VOICE NMS",
                "Correct SG7K profile",
                "Idle Status [FEOL]",
                "Misaligned Routing Index",
                "No or incomplete profile at VOICE NMS",
                "Not Applicable [Copper]",
                "Not Applicable [NCE/InterOP]",
                "Not Applicable [NMS GUI]",
                "Not Applicable [via Store]",
                "Not Applicable [Voice Only - Fiber]",
                "Register- failed Status [FEOL]"                    
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Not Applicable",
                "Not Applicable [Voice Issue]",
                "The ONU performance is degraded"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Awaiting Parent Case",
                "Primary Trouble",
                "Secondary Trouble",
                "Broken/Damaged Modem/ONU",
                "Broken/Damaged Telset",
                "Cannot Make Call",
                "Cannot Make/Receive Call",
                "Fast Busy/With Recording",
                "FCR - Cannot Receive Call",
                "FCR - With Ring Back Tone",
                "No Ring Back tone",
                "Noisy Line",
                "Not Applicable [via Store]",
                "With Ring Back Tone"
            ] },
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount" },
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertToolLabel(fields, label, relatedFieldNames) {
            const names = Array.isArray(relatedFieldNames)
                ? relatedFieldNames
                : [relatedFieldNames];

            const indices = names
                .map(name => fields.findIndex(f => f.name === name))
                .filter(i => i >= 0);

            if (indices.length === 0) return;

            const insertAt = Math.min(...indices);

            fields.splice(insertAt, 0, {
                label: `// ${label}`,
                type: "toolLabel",
                name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                relatedTo: names.join(",")
            });
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertToolLabel(enhancedFields, "NMS Skin", ["oltAndOnuConnectionType", "routingIndex"]);
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "actualExp");
        insertToolLabel(enhancedFields, "DMS", "dmsVoipServiceStatus");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "facility" ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;

            if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";

                let optionsToUse = field.options;

                if (field.name === "resolution") {
                    if (["form101_1", "form101_2", "form101_3", "form101_4"].includes(selectedValue)) {
                        optionsToUse = field.options.filter((opt, idx) => idx === 0 || (idx >= 1 && idx <= 7));
                    } else if (["form102_1", "form102_2", "form102_3", "form102_4"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[3], field.options[8]];
                    } else if (["form103_1", "form103_2", "form103_3", "form103_4", "form103_5"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[2], field.options[3], field.options[4], field.options[9], field.options[10]];
                    }
                }

                optionsToUse.forEach((optionText, index) => {
                const option = document.createElement("option");
                option.value = optionText;
                option.textContent = optionText;

                if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                }

                input.appendChild(option);
                });

            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row");
            allToolLabels.forEach(labelRow => {
                const relatedNamesRaw = labelRow.dataset.relatedTo || "";
                const relatedNames = relatedNamesRaw.split(",").map(s => s.trim()).filter(Boolean);

                const shouldShow = relatedNames.some(name => {
                const relatedInput = document.querySelector(`[name="${name}"]`);
                if (!relatedInput) return false;
                const relatedRow = relatedInput.closest("tr");
                return relatedRow && relatedRow.style.display !== "none";
                });

                labelRow.style.display = shouldShow ? "table-row" : "none";
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
        
        const facility = document.querySelector("[name='facility']");
        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form101_1" || selectedValue === "form101_2" || selectedValue === "form101_3" || selectedValue === "form102_1" || selectedValue === "form102_2" || selectedValue === "form102_3") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["resType", "serviceStatus", "services", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form103_1" || selectedValue === "form103_2") {
                    showFields(["serviceStatus", "onuSerialNum", "callType", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "services", "outageStatus", "outageReference", "pcNumber", "modemLights", "fsx1Status", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }  else if (selectedValue === "form103_4" || selectedValue === "form103_5") {
                    showFields(["onuSerialNum", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "services", "outageStatus", "outageReference", "pcNumber", "modemLights", "callType", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "dmsVoipServiceStatus", "dmsRemarks", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
            } else if (facility.value === "Fiber - Radius") {
                showFields(["remarks", "issueResolved"]);
                hideSpecificFields(["resType", "serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "investigation1", "investigation2", "investigation3", "investigation4", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }

            updateToolLabelVisibility();
        });
    
        const resType = document.querySelector("[name='resType']");
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue === "form101_1" || selectedValue === "form101_2") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["serviceStatus", "services", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "oltAndOnuConnectionType", "dmsVoipServiceStatus", "dmsRemarks", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form101_3") {
                    showFields(["services", "outageStatus"]);
                    hideSpecificFields(["serviceStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }
            updateToolLabelVisibility();
        });

        const outageStatus = document.querySelector("[name='outageStatus']");
        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "services", "serviceStatus", "outageStatus"]);
            if (outageStatus.value === "No" && facility.value === "Fiber") {
                if (selectedValue === "form101_1" || selectedValue === "form101_2" || selectedValue === "form101_3") {
                    showFields(["onuSerialNum", "modemLights", "oltAndOnuConnectionType", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "callType", "dmsVoipServiceStatus", "dmsRemarks", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                updateToolLabelVisibility();
            } else if (outageStatus.value === "No" && facility.value === "Copper VDSL") {
                if (selectedValue === "form101_1" || selectedValue === "form101_2" || selectedValue === "form101_3") {
                    showFields(["onuSerialNum", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "modemLights", "callType", "oltAndOnuConnectionType", "dmsVoipServiceStatus", "dmsRemarks", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                updateToolLabelVisibility();
            } else if (resType.value === "Yes" && services.value === "Voice Only" && outageStatus.value === "No") {
                if (selectedValue === "form101_3") {
                    showFields(["onuSerialNum", "dmsVoipServiceStatus", "dmsRemarks", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "modemLights", "callType", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                updateToolLabelVisibility();
            } else if (resType.value === "Yes" && services.value === "Bundled" && outageStatus.value === "No") {
                showFields(["onuSerialNum", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "modemLights", "callType", "dmsVoipServiceStatus", "dmsRemarks", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                updateToolLabelVisibility();
            } else {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["onuSerialNum", "modemLights", "callType", "oltAndOnuConnectionType", "dmsVoipServiceStatus", "dmsRemarks", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "actualExp", "issueResolved", "availability", "address", "landmarks"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
                updateToolLabelVisibility();
            }

            updateToolLabelVisibility();
        });

        const services = document.querySelector("[name='services']");
        services.addEventListener("change", () => {
            if (services.value === "Voice Only") {
                if (outageStatus.value === "No") {
                    showFields(["dmsVoipServiceStatus"])
                }
            } else {
                hideSpecificFields(["dmsVoipServiceStatus"])
            }
        });

        const oltAndOnuConnectionType = document.querySelector("[name='oltAndOnuConnectionType']");
        oltAndOnuConnectionType.addEventListener("change", () => {
            if (oltAndOnuConnectionType.value === "FEOL - Non-interOp") {
                showFields(["fsx1Status"]);
            } else {
                hideSpecificFields(["fsx1Status"]);
            }
        });
    
        const issueResolved = document.querySelector("[name='issueResolved']");
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
            
            if (channelField.value === "CDT-SOCMED") {
                showFields(["resolution"]);
            } else {
                hideSpecificFields(["resolution"]);
            }

            updateToolLabelVisibility();
        });

        updateToolLabelVisibility();

    } else if (nicForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account/Facility Type", type: "select", name: "facility", options: [
                "", 
                "Fiber", 
                "Fiber - Radius", 
                "Copper VDSL", 
                "Copper HDSL/NGN" 
            ]},
            { label: "Res. Vertical Address", type: "select", name: "resType", options: [
                "Bldg., Condo, etc.", 
                "Yes", 
                "No"
            ]},
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"]},
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            { label: "Equipment Brand", type: "select", name: "equipmentBrand", options: [
                "", 
                "FEOL", 
                "HUOL"
            ]},
            { label: "Modem Brand", type: "select", name: "modemBrand", options: [
                "", 
                "FHTT", 
                "HWTC", 
                "ZTEG",
                "AZRD",
                "PRLN",
                "Other Brands"
            ]},
            { label: "ONU Connection Type", type: "select", name: "onuConnectionType", options: [
                "", 
                "InterOp", 
                "Non-interOp"
            ]},
            { label: "ONU Model (L2)", type: "text", name: "onuModel", placeholder: "Available in DMS."},
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Available in FUSE/CV/DMS."},
            { label: "Internet Light Status", type: "select", name: "intLightStatus", options: [
                "", 
                "Steady Green", 
                "Blinking Green",
                "No Light",
                "No Internet Light Indicator"
            ]},
            { label: "WAN Light Status", type: "select", name: "wanLightStatus", options: [
                "", 
                "Steady Green", 
                "Blinking Green",
                "No Light"
            ]},
            // Clearview
            { label: "SMP/Clearview Reading", type: "textarea", name: "cvReading", placeholder: "e.g. Line Problem Detected - OLT to LCP, LCP to NAP, NAP to ONU" },
            { label: "Latest RTA Request (L2)", type: "text", name: "rtaRequest"},
            // NMS Skin
            { label: "ONU Status/RUNSTAT", type: "select", name: "onuRunStats", options: [
                "", 
                "UP",
                "Active",
                "LOS",
                "Down",
                "Power is Off",
                "Power is Down",
                "/N/A"
            ]},
            { label: "RX Power", type: "number", name: "rxPower", step: "any", placeholder: "Also available in DMS"},
            { label: "VLAN (L2)", type: "text", name: "vlan", placeholder: "Also available in DMS"},
            { label: "IP Address (L2)", type: "text", name: "ipAddress", placeholder: "Also available in DMS"},
            { label: "No. of Conn. Devices (L2)", type: "text", name: "connectedDevices", placeholder: "Also available in DMS"},
            { label: "Option82 Config (L2)", type: "select", name: "option82Config", options: [
                "", 
                "Aligned", 
                "Misaligned"
            ]},
            { label: "Actions Taken in NMS Skin", type: "textarea", name: "nmsSkinRemarks", placeholder: "Include the RA and DC action results here. If no action was taken, leave this field blank." },
            // DMS
            { label: "Internet/Data Status(L2)", type: "select", name: "dmsInternetStatus", options: ["", "Online", "Offline" ]},
            { label: "Performed Self Heal?", type: "select", name: "dmsSelfHeal", options: [
                "", 
                "Yes/Resolved", 
                "Yes/Unresolved", 
                "No"
            ]},
            { label: "Other Actions Taken in DMS", type: "textarea", name: "dmsRemarks", placeholder: "Leave this field blank if no action was taken." },
            // Probing
            { label: "Connection Method", type: "select", name: "connectionMethod", options: [
                "", 
                "WiFi", 
                "LAN"
            ]},
            { label: "WiFi State (DMS)", type: "select", name: "dmsWifiState", options: [
                "", 
                "On", 
                "Off"
            ]},
            { label: "LAN Port Status (DMS)", type: "select", name: "dmsLanPortStatus", options: [
                "", 
                "Disabled", 
                "Enabled"
            ]},
            { label: "Mesh Type", type: "select", name: "meshtype", options: [
                "", 
                "TP-LINK", 
                "Tenda"
            ]},
            { label: "Mesh Ownership", type: "select", name: "meshOwnership", options: [
                "", 
                "PLDT-owned", 
                "Subs-owned"
            ]},
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer's actual experience in detail.\ne.g. “NIC using WiFi”. DO NOT input the WOCAS!"},
            { label: "Other Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Tested Ok",
                "Cannot Browse",
                "Defective Mesh",
                "Defective Modem / Missing Modem",
                "Manual Troubleshooting",
                "Mesh Configuration",
                "Mismatch Option 82 / Service ID",
                "NMS Refresh / Configuration",
                "No Configuration / Wrong Configuration",
                "No or Blinking DSL Light",
                "Self-Restored",
                "Zone",
                "Network / Outage"
            ]},
            { label: "Tested Ok? (Y/N)", type: "select", name: "testedOk", options: [
                "", 
                "Yes", 
                "No"
            ] },
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "No Internet Light",
                "No LAN light",
                "No WLAN light",
                "Normal Status",
                "Not Applicable [Copper]",
                "Not Applicable [via Store]",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "VLAN Configuration issue",
                "Up/Active",
                "Null Value",
                "Not Applicable [NMS GUI]",
                "Not Applicable [InterOP]",
                "Not Applicable [via Store]",
                "No acquired IP address [Native]",
                "Failed RX",
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Failed to collect line card information",
                "Fix bad splices",
                "Missing Micro-Filter",
                "Others/Error Code",
                "Rogue ONU",
                "Severely Degraded",
                "The ONU performance is degraded",
                "Unbalanced Pair",
                "Without Line Problem Detected"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Awaiting Parent Case",
                "Cannot Browse",
                "Cannot Browse via Mesh",
                "Cannot Connect via LAN",
                "Cannot Connect via WiFi",
                "Data Bind Port",
                "FCR - Cannot Browse",
                "FCR - Cannot Connect via LAN",
                "FCR - Cannot Connect via Mesh",
                "FCR - Cannot Connect via WiFi",
                "FCR - Device - Advised Physical Set-Up",
                "FCR - Device for Replacement in Store",
                "FCR - Redirected to PLDT Sites",
                "Individual Trouble",
                "Network Trouble - Cannot Browse",
                "Network Trouble - Cannot Browse via Mesh",
                "Node Down",
                "Not Applicable [via Store]",
                "Redirected to PLDT Sites",
                "Secondary Trouble"
            ]},
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Product/Services Offered", type: "select", name: "productsOffered", options: UPSELL_OPTIONS.productsOffered },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertNoteRow(fields, toolLabelName) {
            const index = fields.findIndex(f => f.name === toolLabelName);
            if (index !== -1) {
                fields.splice(index + 1, 0, {
                    type: "noteRow",
                    name: "onuStatChecklist",
                    relatedTo: "onuRunStats"
                });
            }
        }

        function insertToolLabel(fields, label, relatedFieldNames) {
            const names = Array.isArray(relatedFieldNames)
                ? relatedFieldNames
                : [relatedFieldNames];

            const indices = names
                .map(name => fields.findIndex(f => f.name === name))
                .filter(i => i >= 0);

            if (indices.length === 0) return;

            const insertAt = Math.min(...indices);

            fields.splice(insertAt, 0, {
                label: `// ${label}`,
                type: "toolLabel",
                name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                relatedTo: names.join(",")
            });
        }

        function insertEscaChecklistRow(fields, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "escaChecklistRow",
                    name: "escaChecklist",
                    relatedTo: relatedFieldName
                });
            }
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertEscaChecklistRow(enhancedFields, "outageStatus");
        insertToolLabel(enhancedFields, "NMS Skin", ["onuRunStats", "nmsSkinRemarks"]);
        insertNoteRow(enhancedFields, "toolLabel-nms-skin");
        insertToolLabel(enhancedFields, "BSMP/Clearview", "cvReading");
        insertToolLabel(enhancedFields, "DMS", "dmsInternetStatus");
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", ["connectionMethod", "meshtype"]);
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "facility" ? "table-row" : "none"; 

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "noteRow") {
                const row = document.createElement("tr");
                row.classList.add("note-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const noteHeader = document.createElement("p");
                noteHeader.textContent = "Note:";
                noteHeader.className = "note-header";
                checklistDiv.appendChild(noteHeader);

                const ulNote = document.createElement("ul");
                ulNote.className = "note";

                const li1 = document.createElement("li");
                li1.textContent = "For the InterOp ONU connection type, only the Running ONU Statuses and RX parameters have values on the NMS Skin while VLAN, IP Address and Connected Users/Online Devices normally have no values. However, these parameters can be checked using DMS.";
                ulNote.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "If the ONU Status/RUNSTAT is not “Up” or “Active,” proceed with the No Dial Tone and No Internet Connection intent and follow the corresponding work instructions.";
                ulNote.appendChild(li2);

                const li3 = document.createElement("li");
                li3.textContent = "Check Option82 configuration in NMS Skin (BMSP, SAAA and EAAA), Clearview, CEP, and FUSE.";
                ulNote.appendChild(li3);

                checklistDiv.appendChild(ulNote);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "L2/Zone/Network Escalation Checklist:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li4 = document.createElement("li");
                li4.textContent = "Complaint Coverage Checking";
                ulChecklist.appendChild(li4);

                const li5 = document.createElement("li");
                li5.textContent = "Option 82 Checking";
                ulChecklist.appendChild(li5);

                const li6 = document.createElement("li");
                li6.textContent = "Network Downtime Checking";
                ulChecklist.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Internet/Fiber/ADSL Light Checking";
                ulChecklist.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "VLAN Result";
                ulChecklist.appendChild(li8);

                const li9 = document.createElement("li");
                li9.textContent = "DMS Online Status and IP Address Result";
                ulChecklist.appendChild(li9);

                const li10 = document.createElement("li");
                li10.textContent = "Connected Devices Result";
                ulChecklist.appendChild(li10);

                const li11 = document.createElement("li");
                li11.textContent = "Unbar S.O. Checking";
                ulChecklist.appendChild(li11);

                const li12 = document.createElement("li");
                li12.textContent = "SPS-UI SAAA Checking";
                ulChecklist.appendChild(li12);

                const li13 = document.createElement("li");
                li13.textContent = "Performed RA/Restart/Self-Heal";
                ulChecklist.appendChild(li13);

                const li14 = document.createElement("li");
                li14.textContent = "LAN/Wi-Fi or Mesh Troubleshooting";
                ulChecklist.appendChild(li14);

                const li15 = document.createElement("li");
                li15.textContent = "LAN side or Wi-Fi Status End Result";
                ulChecklist.appendChild(li15);

                const li16 = document.createElement("li");
                li16.textContent = "RX Parameter Result";
                ulChecklist.appendChild(li16);

                const li17 = document.createElement("li");
                li17.textContent = "Rogue ONU Checking";
                ulChecklist.appendChild(li17);

                const li18 = document.createElement("li");
                li18.textContent = "NMS Skin Result";
                ulChecklist.appendChild(li18);

                const li19 = document.createElement("li");
                li19.textContent = "Clear View Result";
                ulChecklist.appendChild(li19);

                checklistDiv.appendChild(ulChecklist);

                const checklistInstruction = document.createElement("p");
                checklistInstruction.textContent = "Note: It is not necessary to complete every item in this escalation checklist. Refer to the LIT365 work instructions for proper guidance.\n\nMaintain clear and detailed documentation to prevent potential misdiagnosis.";
                checklistInstruction.className = "esca-checklist-instruction";
                checklistDiv.appendChild(checklistInstruction);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const updateVisibility = (selector) => {
                document.querySelectorAll(selector).forEach(row => {
                    const relatedNamesRaw = row.dataset.relatedTo || "";
                    const relatedNames = relatedNamesRaw.split(",").map(s => s.trim()).filter(Boolean);

                    const shouldShow = relatedNames.some(name => {
                        const relatedInput = document.querySelector(`[name="${name}"]`);
                        if (!relatedInput) return false;
                        const relatedRow = relatedInput.closest("tr");
                        return relatedRow && relatedRow.style.display !== "none";
                    });

                    row.style.display = shouldShow ? "table-row" : "none";
                });
            };

            updateVisibility(".tool-label-row");
            updateVisibility(".note-row");
            updateVisibility(".esca-checklist-row");
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form500_1") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else if (selectedValue === "form500_2") {
                    showFields(["nmsSkinRemarks", "dmsRemarks", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "connectionMethod", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else {
                    showFields(["meshtype", "meshOwnership", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }

                updateToolLabelVisibility();
            } else if (facility.value === "Fiber - Radius") {
                if (selectedValue === "form500_1") {
                    showFields(["connectionMethod", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "meshtype", "meshOwnership", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else if (selectedValue === "form500_3" || selectedValue === "form500_4") {
                    showFields(["meshtype", "meshOwnership", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else {
                    showAlert("This form is currently unavailable for customers with Fiber - Radius service.");
                    resetAllFields([]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);

                    const facilityField = document.querySelector('[name="facility"]');
                    if (facilityField) facilityField.value = "";
                    return;
                }
                
                updateToolLabelVisibility();
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            }

            updateToolLabelVisibility();
        });
    
        const resType = document.querySelector("[name='resType']");
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue=== "form500_1") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else if (selectedValue === "form500_2") {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                } else {
                    showFields(["meshtype", "meshOwnership", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                }
                
                updateToolLabelVisibility();
            } else {
                showFields(["remarks", "issueResolved"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            }

            updateToolLabelVisibility();
        });

        const outageStatus = document.querySelector("[name='outageStatus']");
        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (selectedValue === "form500_1" && facility.value === "Fiber" && outageStatus.value === "No") {
                showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "option82Config", "dmsWifiState", "dmsLanPortStatus", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            } else if (selectedValue === "form500_1" && facility.value === "Copper VDSL" && outageStatus.value === "No") {
                showFields(["onuSerialNum", "intLightStatus", "wanLightStatus", "connectionMethod", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            } else {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "onuRunStats", "option82Config", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "issueResolved", "testedOk", "availability", "address", "landmarks", "productsOffered", "declineReason", "notEligibleReason"]);
                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }
            updateToolLabelVisibility();
        });

        const onuRunStats = document.querySelector("[name='onuRunStats']");
        onuRunStats.addEventListener("change", () => {
            if (onuRunStats.value === "UP" || onuRunStats.value === "Active") {
                showFields(["option82Config"]);
            } else {
                hideSpecificFields(["option82Config"]);
            }
            updateToolLabelVisibility();
        });

        const equipmentBrand = document.querySelector("[name='equipmentBrand']");
        const modemBrand = document.querySelector("[name='modemBrand']");
        const onuConnectionType = document.querySelector("[name='onuConnectionType']");

        function updateONUConnectionType() {
            if (!equipmentBrand.value || !modemBrand.value) {
                onuConnectionType.value = ""; 
                onuConnectionType.dispatchEvent(new Event("change")); 
                return;
            }

            const newValue =
                (equipmentBrand.value === "FEOL" && modemBrand.value === "FHTT") ||
                (equipmentBrand.value === "HUOL" && modemBrand.value === "HWTC")
                    ? "Non-interOp"
                    : "InterOp";

            if (onuConnectionType.value !== newValue) {
                onuConnectionType.value = ""; 
                onuConnectionType.dispatchEvent(new Event("change")); 

                setTimeout(() => {
                    onuConnectionType.value = newValue; 
                    onuConnectionType.dispatchEvent(new Event("change")); 
                }, 0);
            }
        }

        onuConnectionType.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        equipmentBrand.addEventListener("change", updateONUConnectionType);
        modemBrand.addEventListener("change", updateONUConnectionType);

        updateONUConnectionType();

        onuConnectionType.addEventListener("change", () => {
            if (onuConnectionType.value === "Non-interOp") {
                showFields(["vlan", "ipAddress", "connectedDevices"]);
            } else {
                hideSpecificFields(["vlan", "ipAddress", "connectedDevices"]);
            }
            updateToolLabelVisibility();
        });
    
        const connectionMethod = document.querySelector("[name='connectionMethod']");
        connectionMethod.addEventListener("change", () => {
            if (connectionMethod.value === "WiFi") {
                showFields(["dmsWifiState"]);
                hideSpecificFields(["dmsLanPortStatus"]);
            } else if (connectionMethod.value === "LAN") {
                showFields(["dmsLanPortStatus"]);
                hideSpecificFields(["dmsWifiState"]);
            } else {
                hideSpecificFields(["dmsWifiState", "dmsLanPortStatus"]);
            }
        });
        
        const issueResolved = document.querySelector("[name='issueResolved']");
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                    hideSpecificFields(["testedOk"]);
                } else {
                    showFields(["testedOk"]);
                    hideSpecificFields(["resolution"]);
                }
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }
            updateToolLabelVisibility();
        });

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

        const resolution = document.querySelector("[name='resolution']");
        const testedOk = document.querySelector("[name='testedOk']");

        function testedOkReso() {
            if (resolution.value === "Tested Ok" || testedOk.value === "Yes") {
                hideSpecificFields(["availability", "address", "landmarks"]);
            } else {
                showFields(["availability", "address", "landmarks"]);
            }
            updateToolLabelVisibility();
        }

        resolution.addEventListener("change", testedOkReso);
        testedOk.addEventListener("change", testedOkReso);

        updateToolLabelVisibility();
    } else if (sicForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account/Facility Type", type: "select", name: "facility", options: [
                "", 
                "Fiber", 
                "Fiber - Radius", 
                "Copper VDSL", 
                "Copper HDSL/NGN" 
            ]},
            { label: "Res. Vertical Address", type: "select", name: "resType", options: [
                "Bldg., Condo, etc.", 
                "Yes", 
                "No"
            ]},
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"]},
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            { label: "Plan Details (L2)", type: "textarea", name: "planDetails", placeholder: "Please specify the plan details as indicated in FUSE.\ne.g. “Plan 2699 at 1GBPS”" },
            { label: "ONU Model (L2)", type: "text", name: "onuModel", placeholder: "Available in DMS."},
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Available in FUSE/CV/DMS."},
            // NMS Skin
            { label: "RX Power", type: "number", name: "rxPower", step: "any", placeholder: "Also available in Clearview."},
            { label: "Option82 Config", type: "select", name: "option82Config", options: [
                "", 
                "Aligned", 
                "Misaligned"
            ]},
            { label: "SAAA BW Code (L2)", type: "text", name: "saaaBandwidthCode"},
            { label: "Connected Devices (L2)", type: "text", name: "connectedDevices", placeholder: "e.g. 2 on 2.4G, 3 on 5G, 2 LAN(Desktop/Laptop and Mesh)"},
            { label: "Actions Taken in NMS Skin", type: "textarea", name: "nmsSkinRemarks", placeholder: "Include the RA and DC action results here. If no action was taken, leave this field blank." },
            // DMS
            { label: "Internet/Data Status(L2)", type: "select", name: "dmsInternetStatus", options: ["", "Online", "Offline" ]},
            { label: "Device's WiFi Band (L2)", type: "select", name: "deviceWifiBand", options: [
                "", 
                "Device Found in 2.4G Wi-Fi", 
                "Device Found in 5G Wi-Fi" 
            ]},
            { label: "Bandsteering (L2)", type: "select", name: "bandsteering", options: ["", "Enabled", "Disabled"]},
            { label: "Actions Taken in DMS", type: "textarea", name: "dmsRemarks", placeholder: "Leave this field blank if no action was taken." },
            // BSMP/Clearview
            { label: "SMP/Clearview Reading", type: "textarea", name: "cvReading", placeholder: "e.g. Line Problem Detected - OLT to LCP, LCP to NAP, NAP to ONU" },
            { label: "Latest RTA Request (L2)", type: "text", name: "rtaRequest"},
            // Probing
            { label: "Connection Method", type: "select", name: "connectionMethod", options: [
                "", 
                "WiFi", 
                "LAN"
            ]},
            { label: "Device Brand & Model", type: "text", name: "deviceBrandAndModel", placeholder: "Galaxy S25, Dell Latitude 3420"},
            { label: "Ping Test Result", type: "number", name: "pingTestResult", step: "any"},
            { label: "Speedtest Result", type: "number", name: "speedTestResult", step: "any"},
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer's actual experience in detail.\ne.g. “Only Acquiring 180MBPS.” DO NOT input the WOCAS!"},
            { label: "Other Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Tested Ok",
                "Failed RX",
                "High Latency / Ping",
                "Manual Troubleshooting",
                "Mismatch Option 82 / Service ID",
                "NMS Refresh / Configuration",
                "Slow Browsing",
                "Zone",
                "Network / Outage"
            ]},
            { label: "Tested Ok? (Y/N)", type: "select", name: "testedOk", options: [
                "", 
                "Yes", 
                "No"
            ] },
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Normal Status",
                "Not Applicable [Copper]",
                "Not Applicable [via Store]",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "Passed RX",
                "Failed RX",
                "Up/Active",
                "Not Applicable [NMS GUI]",
                "Not Applicable [via Store]",
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Fix bad splices",
                "Missing Micro-Filter",
                "Others/Error Code",
                "Rogue ONU",
                "Severely Degraded",
                "The ONU performance is degraded",
                "Unbalanced Pair",
                "Without Line Problem Detected",
                "Without Line Problem Detected - Link Quality Degraded"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "FCR - Low BW profile",
                "FCR - Slow/Intermittent Browsing",
                "High Latency",
                "High Utilization OLT/PON Port",
                "Individual Trouble",
                "Misaligned Record",
                "Network Trouble - High Latency",
                "Network Trouble - Slow Internet Connection",
                "Network Trouble - Slow/Intermittent Browsing",
                "Not Applicable [via Store]",
                "ONU Replacement to Latest Model",
                "Slow/Intermittent Browsing",
                "With historical alarms",
                "Without historical alarms"
            ]},
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Product/Services Offered", type: "select", name: "productsOffered", options: UPSELL_OPTIONS.productsOffered },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertNoteRow(fields, toolLabelName) {
            const index = fields.findIndex(f => f.name === toolLabelName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "noteRow",
                    name: "probingChecklist",
                    relatedTo: "rxPower"
                });
            }
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName 
                }
            );
        }

        function insertEscaChecklistRow(fields, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "escaChecklistRow",
                    name: "escaChecklist",
                    relatedTo: relatedFieldName
                });
            }
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertEscaChecklistRow(enhancedFields, "outageStatus");
        insertToolLabel(enhancedFields, "NMS Skin", "rxPower");
        insertNoteRow(enhancedFields, "toolLabel-nms-skin");
        insertToolLabel(enhancedFields, "BSMP/Clearview", "cvReading");
        insertToolLabel(enhancedFields, "DMS", "dmsInternetStatus");
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "connectionMethod");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "facility" ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "noteRow") {
                const row = document.createElement("tr");
                row.classList.add("note-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const noteHeader = document.createElement("p");
                noteHeader.textContent = "Note:";
                noteHeader.className = "note-header";
                checklistDiv.appendChild(noteHeader);

                const ulNote = document.createElement("ul");
                ulNote.className = "note";

                const li1 = document.createElement("li");
                li1.textContent = "Between NMS Skin and SMP/Clearview, always prioritize the RX parameter with lower value and ignore the zero value. If both have zero value, check RX parameter via DMS.";
                ulNote.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "All Wi-Fi 5 and Wi-Fi 6 modems have Band Steering enabled by default.";
                ulNote.appendChild(li2);

                const li3 = document.createElement("li");
                li3.textContent = "If using laptop or desktop, advise customer to type “netsh wlan show driver” at command prompt and check Radio types supported IEEE Standard.";
                ulNote.appendChild(li3);

                const li4 = document.createElement("li");
                li4.textContent = "If using mobile, check the reference table in the work instruction for common devices.";
                ulNote.appendChild(li4);

                const li5 = document.createElement("li");
                li5.textContent = "If not listed in the reference table, advise customer to search via internet for the Device Specs or go to www.gsmarena.com (type the device name and model > select the device > scroll down at Comms > then see WLAN section for the Wi-Fi standard).";
                ulNote.appendChild(li5);

                const li6 = document.createElement("li");
                li6.textContent = "Before running a speed test, ensure the device is connected to the 5 GHz Wi-Fi frequency and positioned close to the modem. Make sure no other applications or activities are running on the device during the test.";
                ulNote.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Speed Test can also be done via DMS if customer can't follow or refused the instruction.";
                ulNote.appendChild(li7);

                checklistDiv.appendChild(ulNote);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "L2/Zone/Network Escalation Checklist:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li6 = document.createElement("li");
                li6.textContent = "Complaint Coverage Checking";
                ulChecklist.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Option 82 Checking";
                ulChecklist.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "RX Parameter Result";
                ulChecklist.appendChild(li8);

                const li9 = document.createElement("li");
                li9.textContent = "Network Downtime Checking";
                ulChecklist.appendChild(li9);

                const li10 = document.createElement("li");
                li10.textContent = "Slowdown during Peak Hour Checking";
                ulChecklist.appendChild(li10);

                const li11 = document.createElement("li");
                li11.textContent = "Rogue/Degraded ONU/Degraded Link Checking";
                ulChecklist.appendChild(li11);

                const li12 = document.createElement("li");
                li12.textContent = "Bandwidth Code Checking";
                ulChecklist.appendChild(li12);

                const li13 = document.createElement("li");
                li13.textContent = "Performed RA/Restart/Self-Heal";
                ulChecklist.appendChild(li13);

                const li14 = document.createElement("li");
                li14.textContent = "ONU and Device Brand and Model";
                ulChecklist.appendChild(li14);

                const li15 = document.createElement("li");
                li15.textContent = "ONU and Device Max WiFi Speed Checking";
                ulChecklist.appendChild(li15);

                const li16 = document.createElement("li");
                li16.textContent = "5G WiFi Frequency Checking";
                ulChecklist.appendChild(li16);

                const li17 = document.createElement("li");
                li17.textContent = "Activities Performed Checking";
                ulChecklist.appendChild(li17);

                const li18 = document.createElement("li");
                li18.textContent = "Connected Devices Result";
                ulChecklist.appendChild(li18);

                const li19 = document.createElement("li");
                li19.textContent = "Ping Test Result";
                ulChecklist.appendChild(li19);

                const li20 = document.createElement("li");
                li20.textContent = "NMS Skin Result";
                ulChecklist.appendChild(li20);

                const li21 = document.createElement("li");
                li21.textContent = "Clear View Result";
                ulChecklist.appendChild(li21);

                checklistDiv.appendChild(ulChecklist);

                const checklistInstruction = document.createElement("p");
                checklistInstruction.textContent = "Note: It is not necessary to complete every item in this escalation checklist. Refer to the LIT365 work instructions for proper guidance.\n\nMaintain clear and detailed documentation to prevent potential misdiagnosis.";
                checklistInstruction.className = "esca-checklist-instruction";
                checklistDiv.appendChild(checklistInstruction);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const updateVisibility = (selector) => {
                document.querySelectorAll(selector).forEach(row => {
                    const relatedNamesRaw = row.dataset.relatedTo || "";
                    const relatedNames = relatedNamesRaw.split(",").map(s => s.trim()).filter(Boolean);

                    const shouldShow = relatedNames.some(name => {
                        const relatedInput = document.querySelector(`[name="${name}"]`);
                        if (!relatedInput) return false;
                        const relatedRow = relatedInput.closest("tr");
                        return relatedRow && relatedRow.style.display !== "none";
                    });

                    row.style.display = shouldShow ? "table-row" : "none";
                });
            };

            updateVisibility(".tool-label-row");
            updateVisibility(".note-row");
            updateVisibility(".esca-checklist-row");
        }

        updateToolLabelVisibility();

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                showFields(["outageStatus"]);
                hideSpecificFields(["resType", "planDetails", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
                updateToolLabelVisibility(); 
            } else if (facility.value === "Fiber - Radius") {
                showFields(["planDetails", "connectionMethod", "pingTestResult", "speedTestResult", "remarks", "issueResolved"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "remarks","issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "resolution", "testedOk" ,"issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            }
            updateToolLabelVisibility(); 
        });
    
        const resType = document.querySelector("[name='resType']");
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                showFields(["outageStatus"]);
                hideSpecificFields(["planDetails", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);
            }
            updateToolLabelVisibility(); 
        });

        const outageStatus = document.querySelector("[name='outageStatus']");
        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["planDetails", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "issueResolved", "testedOk", "availability", "address", "landmarks", "productsOffered", "declineReason", "notEligibleReason"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else {
                if (facility.value === "Fiber") {
                    showFields(["planDetails", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "pingTestResult", "speedTestResult", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "outageReference", "pcNumber", "deviceBrandAndModel", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);

                } else {
                    showFields(["planDetails", "connectionMethod", "pingTestResult", "speedTestResult", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "deviceBrandAndModel", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell", "productsOffered", "declineReason", "notEligibleReason"]);   
                }
                updateToolLabelVisibility(); 
            }

            updateToolLabelVisibility(); 
        });

        const connectionMethod = document.querySelector("[name='connectionMethod']");
        connectionMethod.addEventListener("change", () => {
            if (connectionMethod.value === "WiFi") {
                showFields(["deviceBrandAndModel"]);
            } else {
                hideSpecificFields(["deviceBrandAndModel"]);
            }
        });

        const issueResolved = document.querySelector("[name='issueResolved']");
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                    hideSpecificFields(["testedOk"]);
                } else {
                    showFields(["testedOk"]);
                    hideSpecificFields(["resolution"]);
                }
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }
            updateToolLabelVisibility();
        });

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

        const resolution = document.querySelector("[name='resolution']");
        const testedOk = document.querySelector("[name='testedOk']");
        function testedOkReso() {
            if (resolution.value === "Tested Ok" || testedOk.value === "Yes") {
                hideSpecificFields(["availability", "address", "landmarks"]);
            } else {
                showFields(["availability", "address", "landmarks"]);
            }
            updateToolLabelVisibility();
        }

        resolution.addEventListener("change", testedOkReso);
        testedOk.addEventListener("change", testedOkReso);

        updateToolLabelVisibility();
    } else if (selectedValue === "form501_5" || selectedValue === "form501_6") { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"]},
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Available in FUSE/CV/DMS."},
            // BSMP/Clearview
            { label: "SMP/Clearview Reading", type: "textarea", name: "cvReading", placeholder: "e.g. Line Problem Detected - OLT to LCP, LCP to NAP, NAP to ONU" },
            { label: "Latest RTA Request (L2)", type: "text", name: "rtaRequest"},
            // NMS Skin
            { label: "RX Power", type: "number", name: "rxPower", step: "any"},
            // Probing & Remote Troubleshooting
            { label: "Specific Timeframe", type: "text", name: "specificTimeframe", placeholder: "High latency/lag is being experienced."},
            { label: "Ping Test Result", type: "text", name: "pingTestResult", placeholder: "Speedtest"},
            { label: "Game Name and Server", type: "text", name: "gameNameAndServer", placeholder: "e.g. Dota2 - Singapore server"},
            { label: "Game Server IP Address", type: "text", name: "gameServerIP", placeholder: "e.g. 103.10.124.118"},
            { label: "Ping Test Result", type: "text", name: "pingTestResult2", placeholder: "Game Server IP Address"},
            { label: "Traceroute PLDT side (Game Server IP Address)", type: "textarea", name: "traceroutePLDT", placeholder: "Hops with static.pldt.net suffix results. e.g. Hop 3 = PASS, Hop 4 = FAIL(RTO), Hop 5 = FAIL (42 ms), etc." },
            { label: "Traceroute External side (Game Server IP Address)", type: "textarea", name: "tracerouteExt", placeholder: "Last Hop Result. e.g. Hop 10 = PASS" },
            { label: "Other Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Webpage Not Loading",
                "Failed RX",
                "High Latency / Ping",
                "Network / Outage",
                "Zone"
            ]},
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Normal Status",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "Failed RX",
                " Passed RX" ,
                "Up/Active"
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Severely Degraded",
                "The ONU performance is degraded",
                "Without Line Problem Detected",
                "Others/Error Code"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Individual Trouble",
                "Network Trouble - High Latency",
                "Network Trouble - Slow/Intermittent Browsing",
                "High Latency",
                "Cannot Reach Specific Website"
            ]},
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertNoteRow(fields, toolLabelName) {
            const index = fields.findIndex(f => f.name === toolLabelName);
            if (index !== -1) {
                fields.splice(index + 1, 0, {
                    type: "noteRow",
                    name: "probingChecklist",
                    relatedTo: "rxPower"
                });
            } else {
                console.warn(`insertNoteRow: Tool label "${toolLabelName}" not found.`);
            }
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName 
                }
            );
        }

        function insertEscaChecklistRow(fields, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "escaChecklistRow",
                    name: "escaChecklist",
                    relatedTo: relatedFieldName
                });
            }
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "outageStatus");
        insertEscaChecklistRow(enhancedFields, "outageStatus");
        insertToolLabel(enhancedFields, "NMS Skin", "rxPower");
        insertToolLabel(enhancedFields, "BSMP/Clearview Reading", "cvReading");
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "specificTimeframe");
        insertNoteRow(enhancedFields, "toolLabel-probing-&-troubleshooting");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            const showFields = ["outageStatus"];

            row.style.display = showFields.includes(field.name) ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "noteRow") {
                const row = document.createElement("tr");
                row.classList.add("note-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const noteHeader = document.createElement("p");
                noteHeader.textContent = "Note:";
                noteHeader.className = "note-header";
                checklistDiv.appendChild(noteHeader);

                const ulNote = document.createElement("ul");
                ulNote.className = "note";

                const li1 = document.createElement("li");
                li1.textContent = "Between NMS Skin and SMP/Clearview, always prioritize the RX parameter with lower value and ignore the zero value. If both have zero value, check RX parameter via DMS.";
                ulNote.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "Via Wi-Fi: Ensure that device is connected via 5G WiFi frequency and near the modem.";
                ulNote.appendChild(li2);

                const li3 = document.createElement("li");
                li3.textContent = "Via Wi-Fi or LAN: Make sure that there are no other activities performed in the device that will conduct speedtest.";
                ulNote.appendChild(li3);

                const li4 = document.createElement("li");
                li4.textContent = "Make sure that no other devices/user is connected in the modem";
                ulNote.appendChild(li4);

                const li5 = document.createElement("li");
                li5.textContent = "If with multiple devices are connected, advise customer to isolate connection before performing speedtest";
                ulNote.appendChild(li5);

                const li6 = document.createElement("li");
                li6.textContent = "If DMS is not available, advise the customer to open command prompt, type “ping <IP address of the game server>” for ping, press enter (to check for Packet Loss). Type “tracert <IP address of the game server>” for trace route, press enter (to check for hop with High Latency) and ask the results.";
                ulNote.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Indicate Game Name and Server, Game Server IP Address, Ping (Game Server IP Address) <%loss and average ms> Example: 0% loss (32ms), Traceroute PLDT side (Game Server IP Address), Traceroute External side (Game Server IP Address) parameters in Case Notes in Timeline: ";
                ulNote.appendChild(li7);

                checklistDiv.appendChild(ulNote);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "Network Escalation Checklist:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li6 = document.createElement("li");
                li6.textContent = "Network Downtime Checking";
                ulChecklist.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "RX Parameter Result";
                ulChecklist.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "Slowdown during Peak Hour Checking";
                ulChecklist.appendChild(li8);

                const li9 = document.createElement("li");
                li9.textContent = "5G WiFi Frequency Checking";
                ulChecklist.appendChild(li9);

                const li10 = document.createElement("li");
                li10.textContent = "Activities Performed Checking";
                ulChecklist.appendChild(li10);

                const li11 = document.createElement("li");
                li11.textContent = "Connected Devices Result";
                ulChecklist.appendChild(li11);

                const li12 = document.createElement("li");
                li12.textContent = "Speed Test Ping Result";
                ulChecklist.appendChild(li12);

                const li13 = document.createElement("li");
                li13.textContent = "NMS Skin Result";
                ulChecklist.appendChild(li13);

                const li14 = document.createElement("li");
                li14.textContent = "Clear View Result";
                ulChecklist.appendChild(li14);

                const li15 = document.createElement("li");
                li15.textContent = "Game Name and Server";
                ulChecklist.appendChild(li15);

                const li16 = document.createElement("li");
                li16.textContent = "Game Server IP Address";
                ulChecklist.appendChild(li16);

                const li17 = document.createElement("li");
                li17.textContent = "Ping (Game Server IP Address)";
                ulChecklist.appendChild(li17);

                const li18 = document.createElement("li");
                li18.textContent = "Traceroute PLDT side (Game Server IP Address)";
                ulChecklist.appendChild(li18);

                const li19 = document.createElement("li");
                li19.textContent = "Traceroute External side (Game Server IP Address)";
                ulChecklist.appendChild(li19);

                checklistDiv.appendChild(ulChecklist);

                const checklistInstruction = document.createElement("p");
                checklistInstruction.textContent = "Note: It is not necessary to complete every item in this escalation checklist. Refer to the LIT365 work instructions for proper guidance.\n\nMaintain clear and detailed documentation to prevent potential misdiagnosis.";
                checklistInstruction.className = "esca-checklist-instruction";
                checklistDiv.appendChild(checklistInstruction);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const updateVisibility = (selector) => {
                document.querySelectorAll(selector).forEach(row => {
                    const relatedNamesRaw = row.dataset.relatedTo || "";
                    const relatedNames = relatedNamesRaw.split(",").map(s => s.trim()).filter(Boolean);

                    const shouldShow = relatedNames.some(name => {
                        const relatedInput = document.querySelector(`[name="${name}"]`);
                        if (!relatedInput) return false;
                        const relatedRow = relatedInput.closest("tr");
                        return relatedRow && relatedRow.style.display !== "none";
                    });

                    row.style.display = shouldShow ? "table-row" : "none";
                });
            };

            updateVisibility(".tool-label-row");

            document.querySelectorAll(".note-row").forEach(row => {
                const outageStatusInput = document.querySelector('[name="outageStatus"]');
                const outageStatusValue = outageStatusInput ? outageStatusInput.value.trim().toLowerCase() : "";

                if (outageStatusValue === "no") {
                    row.style.display = "table-row";
                } else {
                    row.style.display = "none";
                }
            });

            document.querySelectorAll(".esca-checklist-row").forEach(row => {
                const outageStatusInput = document.querySelector('[name="outageStatus"]');
                const outageStatusValue = outageStatusInput ? outageStatusInput.value.trim().toLowerCase() : "";

                if (outageStatusValue === "yes") {
                    row.style.display = "none";
                } else {
                    const relatedNamesRaw = row.dataset.relatedTo || "";
                    const relatedNames = relatedNamesRaw.split(",").map(s => s.trim()).filter(Boolean);

                    const shouldShow = relatedNames.some(name => {
                        const relatedInput = document.querySelector(`[name="${name}"]`);
                        if (!relatedInput) return false;
                        const relatedRow = relatedInput.closest("tr");
                        return relatedRow && relatedRow.style.display !== "none";
                    });

                    row.style.display = shouldShow ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const outageStatus = document.querySelector("[name='outageStatus']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        outageStatus.addEventListener("change", () => {
            resetAllFields(["outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["onuSerialNum", "rxPower", "cvReading", "rtaRequest", "specificTimeframe", "pingTestResult", "gameNameAndServer", "gameServerIP", "pingTestResult2", "traceroutePLDT", "tracerouteExt", "issueResolved", "availability", "address", "landmarks"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else if (outageStatus.value === "No") {
                showFields(["onuSerialNum", "rxPower", "cvReading", "rtaRequest", "specificTimeframe", "pingTestResult", "gameNameAndServer", "gameServerIP", "pingTestResult2", "traceroutePLDT", "tracerouteExt", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            if (channelField.value === "CDT-SOCMED") {
                showFields(["resolution"]);
            } else {
                hideSpecificFields(["resolution"]);
            }
            updateToolLabelVisibility(); 
        });

        updateToolLabelVisibility();

    } else if (selectiveBrowseForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account/Facility Type", type: "select", name: "facility", options: [
                "", 
                "Fiber", 
                "Fiber - Radius", 
                "Copper VDSL", 
                "Copper HDSL/NGN" 
            ]},
            { label: "Res. Vertical Address", type: "select", name: "resType", options: [
                "Bldg., Condo, etc.", 
                "Yes", 
                "No"
            ]},
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"]},
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            // NMS Skin
            { label: "RX Power (L2)", type: "number", name: "rxPower", step: "any"},
            { label: "IP Address (L2)", type: "text", name: "ipAddress"},
            // DMS
            { label: "Internet/Data Status(L2)", type: "select", name: "dmsInternetStatus", options: ["", "Online", "Offline" ]},
            { label: "Connected Devices (L2)", type: "text", name: "connectedDevices"},
            // Probe & Troubleshoot
            { label: "Website/App/VPN Name", type: "textarea", name: "websiteURL", placeholder: "Complete site address or name of Application or VPN"}, 
            { label: "Error Message (L2)", type: "textarea", name: "errMsg", placeholder: "Error when accessing site, Application or VPN"},
            { label: "Other Device/Browser Test?", type: "select", name: "otherDevice", options: [
                "",
                "Yes - Working on Other Devices",
                "Yes - Working on Other Browsers",
                "Yes - Working on Other Devices and Browsers",
                "Yes - Not Working",
                "No Other Device or Browser Available"
            ] },
            { label: "VPN Blocking Issue? (L2)", type: "select", name: "vpnBlocking", options: [
                "", 
                "Yes", 
                "No"
            ] },
            { label: "Access Requires VPN? (L2)", type: "select", name: "vpnRequired", options: [
                "", 
                "Yes", 
                "No"
            ] },
            { label: "Result w/ Other ISP (L2)", type: "select", name: "otherISP", options: [
                "", 
                "Yes - Working", 
                "Yes - Not Working", 
                "No Other ISP"
            ] },
            { label: "Has IT Support? (L2)", type: "select", name: "itSupport", options: [
                "", 
                "Yes", 
                "None"
            ] },
            { label: "IT Support Remarks (L2)", type: "textarea", name: "itRemarks" },
            { label: "Other Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Tested Ok",
                "Manual Troubleshooting",
                "Request Timed Out",
                "Webpage Not Loading"
            ]},
            { label: "Tested Ok? (Y/N)", type: "select", name: "testedOk", options: [
                "", 
                "Yes", 
                "No"
            ] },
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Normal Status",
                "Not Applicable [via Store]",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "Up/Active",
                "Not Applicable [via Store]",
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "The ONU performance is degraded",
                "Without Line Problem Detected",
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Network Trouble - Selective Browsing",
                "Cannot Reach Specific Website",
                "FCR - Cannot Browse",
                "Not Applicable [via Store]",
            ]},
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName 
                }
            );
        }

        function insertEscaChecklistRow(fields, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "escaChecklistRow",
                    name: "escaChecklist",
                    relatedTo: relatedFieldName
                });
            }
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertEscaChecklistRow(enhancedFields, "outageStatus");
        insertToolLabel(enhancedFields, "NMS Skin", "rxPower");
        insertToolLabel(enhancedFields, "DMS", "dmsInternetStatus");
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "websiteURL");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "facility" ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "Network Escalation Checklist:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li6 = document.createElement("li");
                li6.textContent = "Network Downtime Checking";
                ulChecklist.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Possible VPN Blocking";
                ulChecklist.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "Complaint Coverage Checking";
                ulChecklist.appendChild(li8);

                const li9 = document.createElement("li");
                li9.textContent = "Possible PLDT Blocking";
                ulChecklist.appendChild(li9);

                const li10 = document.createElement("li");
                li10.textContent = "Ping/Tracert/NSlookup of Website Result";
                ulChecklist.appendChild(li10);

                const li11 = document.createElement("li");
                li11.textContent = "Performed Clear Cache";
                ulChecklist.appendChild(li11);

                const li12 = document.createElement("li");
                li12.textContent = "Other ISP Checking";
                ulChecklist.appendChild(li12);

                checklistDiv.appendChild(ulChecklist);

                const checklistInstruction = document.createElement("p");
                checklistInstruction.textContent = "Note: It is not necessary to complete every item in this escalation checklist. Refer to the LIT365 work instructions for proper guidance.\n\nMaintain clear and detailed documentation to prevent potential misdiagnosis.";
                checklistInstruction.className = "esca-checklist-instruction";
                checklistDiv.appendChild(checklistInstruction);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row, .esca-checklist-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        const resType = document.querySelector("[name='resType']");
        const outageStatus = document.querySelector("[name='outageStatus']");
        const itSupport = document.querySelector("[name='itSupport']");
        const issueResolved = document.querySelector("[name='issueResolved']");
        const resolution = document.querySelector("[name='resolution']");
        const testedOk = document.querySelector("[name='testedOk']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "itRemarks", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else if (facility.value === "Copper HDSL/NGN") {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "itRemarks", "issueResolved", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else {
                showFields(["outageStatus"]);
                hideSpecificFields(["resType", "outageReference", "pcNumber", "rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "itRemarks", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                showFields(["outageStatus"]);
                hideSpecificFields(["outageReference", "pcNumber", "rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "itRemarks", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "itRemarks", "issueResolved", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }

            updateToolLabelVisibility();
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "itRemarks", "issueResolved", "testedOk", "availability", "address", "landmarks"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else if (facility.value === "Fiber" && outageStatus.value === "No") {
                showFields(["rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "itRemarks", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else if ((facility.value === "Fiber - Radius" || facility.value === "Copper VDSL") && outageStatus.value === "No") {
                showFields(["websiteURL", "errMsg", "otherDevice", "vpnBlocking", "vpnRequired", "otherISP", "itSupport", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "rxPower", "ipAddress", "dmsInternetStatus", "connectedDevices", "itRemarks", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });

        itSupport.addEventListener("change", () => {
            if (itSupport.value === "Yes") {
                showFields(["itRemarks"]);
            } else {
                hideSpecificFields(["itRemarks"]);
            }
        });
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                    hideSpecificFields(["testedOk"]);
                } else {
                    showFields(["testedOk"]);
                    hideSpecificFields(["resolution"]);
                }
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }
            updateToolLabelVisibility();
        });

        function testedOkReso() {
            if (resolution.value === "Tested Ok" || testedOk.value === "Yes") {
                hideSpecificFields(["availability", "address", "landmarks"]);
            } else {
                showFields(["availability", "address", "landmarks"]);
            }
            updateToolLabelVisibility();
        }

        resolution.addEventListener("change", testedOkReso);
        testedOk.addEventListener("change", testedOkReso);

        updateToolLabelVisibility();
    } else if (iptvForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account Type", type: "select", name: "accountType", options: [
                "", 
                "PLDT", 
                "RADIUS"
            ]},
            { label: "Network Outage", type: "select", name: "outageStatus", options: ["", "Yes", "No"]},
            { label: "Source Reference", type: "select", name: "outageReference", options: [
                "— Network Outage Source —", 
                "FUSE Outage Tab", 
                "Lit365 Downtime Advisory",
                "Clearview",
                "CEP Affected Services Tab"
            ]},
            { label: "Parent Case", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            { label: "Equipment Brand", type: "select", name: "equipmentBrand", options: [
                "", 
                "FEOL", 
                "HUOL"
            ]},
            { label: "Modem Brand", type: "select", name: "modemBrand", options: [
                "", 
                "FHTT", 
                "HWTC", 
                "ZTEG",
                "AZRD",
                "PRLN",
                "Other Brands"
            ]},
            { label: "ONU Connection Type", type: "select", name: "onuConnectionType", options: [
                "", 
                "InterOp", 
                "Non-interOp"
            ]},
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Available in FUSE/CV/DMS."},
            // NMS Skin
            { label: "ONU Status/RUNSTAT", type: "select", name: "onuRunStats", options: [
                "", 
                "UP",
                "Active",
                "LOS",
                "Down",
                "Power is Off",
                "Power is Down",
                "/N/A"
            ]},
            { label: "RX Power", type: "number", name: "rxPower", step: "any"},
            { label: "WAN NAME_3", type: "text", name: "wanName_3"},
            { label: "SRVCTYPE_3", type: "text", name: "srvcType_3"},
            { label: "CONNTYPE_3", type: "text", name: "connType_3"},
            { label: "WANVLAN_3/LAN 4 Unicast", type: "text", name: "vlan_3"},
            { label: "Actions Taken in NMS Skin", type: "textarea", name: "nmsSkinRemarks", placeholder: "Include the RA and DC action results here. If no action was taken, leave this field blank." },
            // DMS
            { label: "LAN 4 Status", type: "text", name: "dmsLan4Status"},
            { label: "Actions Taken in DMS", type: "textarea", name: "dmsRemarks", placeholder: "Leave this field blank if no action was taken." }, 
            // Request for Retracking
            { label: "Request for Retracking?", type: "select", name: "req4retracking", options: ["", "Yes", "No"]},
            { label: "Set-Top-Box ID", type: "text", name: "stbID"},
            { label: "Smartcard ID", type: "text", name: "smartCardID"},
            { label: "Cignal Plan", type: "text", name: "cignalPlan"},
            { label: "Set-Top-Box IP Address", type: "text", name: "stbIpAddress"},
            { label: "Tuned Services Multicast Address", type: "textarea", name: "tsMulticastAddress"},
            { label: "Actual Experience", type: "textarea", name: "exactExp", placeholder: "Please input the customer's actual experience. e.g. “With IP but no tune service multicast” DO NOT input the WOCAS!"},
            { label: "Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Cignal Retracking",
                "Defective Cignal Accessories / Missing Cignal Accessories",
                "Defective Set Top Box / Missing Set Top Box",
                "Manual Troubleshooting",
                "Network Configuration",
                "Defective Remote Control"
            ]},
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Normal Status",
                "Not Applicable [Defective CPE]",
                "Not Applicable [via Store]",
                "Unable to provide information"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "Not Applicable [NMS GUI]",
                "Not Applicable [via Store]",
                "Up/Active"
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Not Applicable",
                "The ONU performance is degraded",
                "Without Line Problem Detected"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "IPTV Trouble",
                "Broken/Damaged STB/SC",
                "Cannot Read Smart Card",
                "Cignal IRN created - Missing Channels",
                "Cignal IRN created - No Audio/Video Output",
                "Cignal IRN created - Poor Audio/Video Quality",
                "Defective STB/SC/Accessories/Physical Set-up",
                "FCR - Cannot Read Smart Card",
                "FCR - Freeze",
                "FCR - Loop Back",
                "FCR - Missing Channels",
                "FCR - No Audio/Video Output w/ Test Channel",
                "FCR - Out-of-Sync",
                "FCR - Pixelated",
                "FCR - Too long to Boot Up",
                "Freeze",
                "Loop Back",
                "No Audio/Video Output w/ Test Channel",
                "No Audio/Video Output w/o Test Channel",
                "Not Applicable [via Store]",
                "Out-of-Sync",
                "Pixelated",
                "Recording Error",
                "Remote Control Issues",
                "STB Not Synched",
                "Too long to Boot Up"
            ]},
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertNoteRow(fields, toolLabelName) {
            const index = fields.findIndex(f => f.name === toolLabelName);
            if (index !== -1) {
                fields.splice(index + 1, 0, {
                    type: "noteRow",
                    name: "nmsSkinChecklist",
                    relatedTo: "onuRunStats"
                });
            }
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName
                }
            );
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "accountType");
        insertToolLabel(enhancedFields, "NMS Skin", "onuRunStats");
        insertNoteRow(enhancedFields, "toolLabel-nms-skin");  
        insertToolLabel(enhancedFields, "DMS", "dmsLan4Status");
        insertToolLabel(enhancedFields, "Request for Retracking", "req4retracking");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "accountType" ? "table-row" : "none"; 

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "noteRow") {
                const row = document.createElement("tr");
                row.classList.add("note-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const noteDiv = document.createElement("div");
                noteDiv.className = "form2DivPrompt";

                const note = document.createElement("p");
                note.textContent = "Note:";
                note.className = "note-header";
                noteDiv.appendChild(note);

                const ulNote = document.createElement("ul");
                ulNote.className = "note";

                const li1 = document.createElement("li");
                li1.textContent = "For the InterOp ONU connection type, only the Running ONU Statuses and RX parameters have values on the NMS Skin. VLAN normally have no value on the NMS Skin.";
                ulNote.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "Between NMS Skin and SMP/Clearview, always prioritize the RX parameter with lower value and ignore the zero value. If both have zero value, check RX parameter via DMS.";
                ulNote.appendChild(li2);

                noteDiv.appendChild(ulNote);
                td.appendChild(noteDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "L2/Zone/Network Escalation Checklist:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li6 = document.createElement("li");
                li6.textContent = "Network Downtime Checking";
                ulChecklist.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Power Light Checking";
                ulChecklist.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "PON Light Checking";
                ulChecklist.appendChild(li8);

                const li9 = document.createElement("li");
                li9.textContent = "LOS Light Checking";
                ulChecklist.appendChild(li9);

                const li10 = document.createElement("li");
                li10.textContent = "NMS Skin Result";
                ulChecklist.appendChild(li10);

                const li11 = document.createElement("li");
                li11.textContent = "Clear View Result";
                ulChecklist.appendChild(li11);

                const li12 = document.createElement("li");
                li12.textContent = "Option 82 Alignment Checking";
                ulChecklist.appendChild(li12);

                const li13 = document.createElement("li");
                li13.textContent = "Fiber Optic Cable / Patchcord Checking";
                ulChecklist.appendChild(li13);

                checklistDiv.appendChild(ulChecklist);

                const checklistInstruction = document.createElement("p");
                checklistInstruction.textContent = "Note: It is not necessary to complete every item in this escalation checklist. Refer to the LIT365 work instructions for proper guidance.\n\nMaintain clear and detailed documentation to prevent potential misdiagnosis.";
                checklistInstruction.className = "esca-checklist-instruction";
                checklistDiv.appendChild(checklistInstruction);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";

                let optionsToUse = field.options;

                if (field.name === "resolution") {
                    if (["form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8"].includes(selectedValue)) {
                        optionsToUse = field.options.filter((opt, idx) => idx === 0 || (idx >= 1 && idx <= 5));
                    } else if (["form511_1", "form511_2", "form511_3", "form511_4", "form511_5"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[4]];
                    } else if (["form512_1", "form512_2", "form512_3"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[4], field.options[6]];
                    }
                }

                optionsToUse.forEach((optionText, index) => {
                const option = document.createElement("option");
                option.value = optionText;
                option.textContent = optionText;

                if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                }

                input.appendChild(option);
                });

            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row, .note-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const accountType = document.querySelector("[name='accountType']");
        const outageStatus = document.querySelector("[name='outageStatus']");
        const equipmentBrand = document.querySelector("[name='equipmentBrand']");
        const modemBrand = document.querySelector("[name='modemBrand']");
        const onuConnectionType = document.querySelector("[name='onuConnectionType']");
        const req4retracking = document.querySelector("[name='req4retracking']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        accountType.addEventListener("change", () => {
            resetAllFields(["accountType"]);
            if (accountType.value === "PLDT") {
                if (selectedValue === "form510_1" || selectedValue === "form510_2") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "req4retracking", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form511_1" || selectedValue === "form511_2" || selectedValue === "form511_3" || selectedValue === "form511_4" || selectedValue === "form511_5") {
                    showFields(["rxPower", "req4retracking", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form512_1") {
                    showFields(["req4retracking", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form510_7") {
                    showFields(["stbID", "smartCardID", "stbIpAddress", "tsMulticastAddress", "exactExp", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "req4retracking", "cignalPlan", "issueResolved", "availability", "address", "landmarks"]);

                    if (channelField.value === "CDT-SOCMED") {
                        showFields(["resolution"]);
                    } else {
                        hideSpecificFields(["resolution"]);
                    }
                } else {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "req4retracking", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                updateToolLabelVisibility();
            } else if (accountType.value === "RADIUS") {
                if (selectedValue === "form510_1" || selectedValue === "form510_2" || selectedValue === "form511_1" || selectedValue === "form511_2" || selectedValue === "form511_3" || selectedValue === "form511_4" || selectedValue === "form511_5" || selectedValue === "form512_1") {
                    showFields(["req4retracking", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "req4retracking", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                updateToolLabelVisibility();
            }
        });
    
        outageStatus.addEventListener("change", () => {
            resetAllFields(["accountType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "req4retracking", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "exactExp", "issueResolved", "availability", "address", "landmarks"]);
                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else {
                showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "onuRunStats", "rxPower", "nmsSkinRemarks", "dmsLan4Status", "dmsRemarks", "req4retracking", "exactExp", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "stbID", "smartCardID", "cignalPlan", "stbIpAddress", "tsMulticastAddress", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });

        function updateONUConnectionType() {
            if (!equipmentBrand.value || !modemBrand.value) {
                onuConnectionType.value = ""; 
                onuConnectionType.dispatchEvent(new Event("change")); 
                return;
            }

            const newValue =
                (equipmentBrand.value === "FEOL" && modemBrand.value === "FHTT") ||
                (equipmentBrand.value === "HUOL" && modemBrand.value === "HWTC")
                    ? "Non-interOp"
                    : "InterOp";

            if (onuConnectionType.value !== newValue) {
                onuConnectionType.value = ""; 
                onuConnectionType.dispatchEvent(new Event("change")); 

                setTimeout(() => {
                    onuConnectionType.value = newValue; 
                    onuConnectionType.dispatchEvent(new Event("change")); 
                }, 0);
            }
        }

        onuConnectionType.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        equipmentBrand.addEventListener("change", updateONUConnectionType);
        modemBrand.addEventListener("change", updateONUConnectionType);

        updateONUConnectionType();

        onuConnectionType.addEventListener("change", () => {
            if (onuConnectionType.value === "Non-interOp" && equipmentBrand.value === "FEOL") {
                showFields(["vlan_3"]);
                hideSpecificFields(["wanName_3", "srvcType_3", "connType_3"]);                 
            } else if (onuConnectionType.value === "Non-interOp" && equipmentBrand.value === "HUOL") {
                showFields(["wanName_3", "srvcType_3", "connType_3", "vlan_3"]);
            } else {
                hideSpecificFields(["wanName_3", "srvcType_3", "connType_3", "vlan_3"]);
            }
        });
    
        req4retracking.addEventListener("change", () => {
            const isForm510 = selectedValue === "form510_1" || selectedValue === "form510_2";

            if (isForm510 && req4retracking.value === "Yes") {
                if (accountType.value === "PLDT") {
                    showFields(["stbID", "smartCardID", "cignalPlan"]);
                } else if (accountType.value === "RADIUS") {
                    showFields(["stbID", "smartCardID", "cignalPlan", "exactExp"]);
                }
            } else if (isForm510 && req4retracking.value === "No") {
                if (accountType.value === "PLDT") {
                    hideSpecificFields(["stbID", "smartCardID", "cignalPlan"]);
                } else if (accountType.value === "RADIUS") {
                    hideSpecificFields(["stbID", "smartCardID", "cignalPlan", "exactExp"]);
                }
            }
            updateToolLabelVisibility();
        });

        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            if (channelField.value === "CDT-SOCMED") {
                showFields(["resolution"]);
            } else {
                hideSpecificFields(["resolution"]);
            }
            updateToolLabelVisibility();
        });

        updateToolLabelVisibility();

    } else if (streamAppsForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            { label: "Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Select applicable Investigation 1 —",
                "Normal Status"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— Select applicable Investigation 2 —",
                "Up/Active"                  
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Select applicable Investigation 3 —",
                "Without Line Problem Detected"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Content",
                "FCR - Device - Advised Physical Set Up",
                "FCR - Device for Replacement in Store"
            ]},
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName 
                }
            );
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "remarks");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = (["remarks", "issueResolved"].includes(field.name)) ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const issueResolved = document.querySelector("[name='issueResolved']");
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["upsell"]);
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
            updateToolLabelVisibility();
        });

        updateToolLabelVisibility();
    } else if (alwaysOnForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "SIM Light Status", type: "select", name: "simLight", options: [
                "— Modem Light Status —", 
                "On", 
                "Off"
            ]},
            { label: "MIN #", type: "number", name: "minNumber", placeholder: "0999XXXXXXX"},
            { label: "Modem/ONU Serial #", type: "text", name: "onuSerialNum", placeholder: "Also available in DMS."},
            // Probe & Troubleshoot
            { label: "Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 

            ] },
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Not Applicable [Defective CPE]"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— NMS Parameters —",
                "Not Applicable [NMS GUI]"
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Clearview Reading —",
                "Not Applicable"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Broken/Damaged Modem/ONU"
            ]},
            // Ticket Details
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName
                });
            } else {
                console.warn(`insertToolLabel: related field "${relatedFieldName}" not found`);
            }
        }

        function insertEscaChecklistRow(fields, relatedFieldName) {
            const index = fields.findIndex(f => f.name === relatedFieldName);
            if (index !== -1) {
                fields.splice(index, 0, {
                    type: "escaChecklistRow",
                    name: "escaChecklist",
                    relatedTo: relatedFieldName
                });
            }
        }

        const enhancedFields = [...fields];

        insertEscaChecklistRow(enhancedFields, "simLight");
        insertToolLabel(enhancedFields, "Probe & Troubleshoot", "simLight");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Ticket Details", "cepCaseNumber");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        insertToolLabel(enhancedFields, "Cross-Sell/Upsell", "upsell");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            const showFields = ["simLight", "remarks", "issueResolved"];

            row.style.display = showFields.includes(field.name) ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;                
            if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "escaChecklistRow") {
                const row = document.createElement("tr");
                row.classList.add("esca-checklist-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivPrompt";

                const checklistHeader = document.createElement("p");
                checklistHeader.textContent = "Note:";
                checklistHeader.className = "esca-checklist-header";
                checklistDiv.appendChild(checklistHeader);

                const ulChecklist = document.createElement("ul");
                ulChecklist.className = "esca-checklist";

                const li1 = document.createElement("li");
                li1.textContent = "Always verify if the Fiber services are working before proceeding to ensure the correct resolution is provided.";
                ulChecklist.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "Verify if the customer is experiencing issues with their backup Wi-Fi (Always On).";
                ulChecklist.appendChild(li2);

                const li3 = document.createElement("li");
                li3.textContent = "For endorsements to the Prepaid Fiber Fixed Wireless Operations team, click the “Endorse” button to submit the escalation.";
                ulChecklist.appendChild(li3);

                checklistDiv.appendChild(ulChecklist);

                td.appendChild(checklistDiv);
                row.appendChild(td);

                return row;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row, .esca-checklist-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        function updateIssueResolvedOptions(selectedValue) {
            const issueResolved = document.querySelector("[name='issueResolved']");
            if (!issueResolved) return;

            issueResolved.innerHTML = "";

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            issueResolved.appendChild(defaultOption);

            const options =
                selectedValue === "form500_6" ||
                selectedValue === "form101_5" ||
                selectedValue === "form510_9"
                    ? [
                        "Yes",
                        "No - Customer is Unresponsive",
                        "No - Customer is Not At Home",
                        "No - Customer Declined Further Assistance",
                        "No - System Ended Chat"
                    ]
                    : [
                        "Yes",
                        "No - for Endorsement",
                        "No - Customer is Unresponsive",
                        "No - Customer is Not At Home",
                        "No - Customer Declined Further Assistance",
                        "No - System Ended Chat"
                    ];

            options.forEach(text => {
                const opt = document.createElement("option");
                opt.value = text;
                opt.textContent = text;
                issueResolved.appendChild(opt);
            });
        }


        const simLight = document.querySelector("[name='simLight']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        simLight.addEventListener("change", () => {
            resetAllFields(["simLight"]);
            if (simLight.value === "Off" && selectedValue === "form500_6") {
                showFields(["minNumber", "onuSerialNum", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                hideSpecificFields(["issueResolved"]);
            } else {
                showFields(["issueResolved"]);
                hideSpecificFields(["minNumber", "onuSerialNum", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.value !== "No - for Ticket Creation") {
                showFields(["upsell"]);
            }
            updateToolLabelVisibility(); 
        });

        updateIssueResolvedOptions(selectedValue);
        updateToolLabelVisibility();

    }

    // Tech Modem Request Transactions
    else if (mrtForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            // Visual Audit
            { label: "Account Type", type: "select", name: "accountType", options: [
                "", 
                "PLDT", 
                "RADIUS"
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
            ]},
            { label: "Equipment Brand", type: "select", name: "equipmentBrand", options: [
                "", 
                "FEOL", 
                "HUOL"
            ]},
            { label: "Modem Brand", type: "select", name: "modemBrand", options: [
                "", 
                "FHTT", 
                "HWTC", 
                "ZTEG",
                "AZRD",
                "PRLN",
                "Other Brands"
            ]},
            { label: "ONU Connection Type", type: "select", name: "onuConnectionType", options: [
                "", 
                "InterOp", 
                "Non-interOp"
            ]},
            { label: "LAN Port Number", type: "number", name: "lanPortNum" },
            // DMS
            { label: "DMS: LAN Port Status", type: "text", name: "dmsLanPortStatus"},
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Select applicable Investigation 1 —",
                "Normal Status",
                "Not Applicable [via Store]"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "— Select applicable Investigation 2 —",
                "Up/Active",
                "VLAN Configuration issue",
                "Not Applicable [via Store]"                    
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "— Select applicable Investigation 5 —",
                "Without Line Problem Detected",
                "The ONU performance is degraded"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Cannot Browse",
                "Change set-up Route to Bridge and Vice Versa",
                "Change set-up Route to Bridge and Vice Versa [InterOP]",
                "Data Bind Port",
                "Device and Website IP Configuration",
                "FCR - Change WiFi SSID UN/PW",
                "Not Applicable [via Store]",
                "Request Modem/ONU GUI Access",
                "Request Modem/ONU GUI Access [InterOP]"
            ]},
            { label: "Actions Taken/ Troubleshooting/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings / Resolution", type: "select", name: "resolution", options: [
                "",
                "Defective Modem",
                "Manual Troubleshooting",
                "NMS Configuration",
            ]},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No - for Ticket Creation",
                "No - Customer is Unresponsive",
                "No - Customer is Not At Home",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "SLA / ETR", type: "text", name: "sla" },
            // Special Instructions
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Preferred Date & Time", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField.value === "CDT-SOCMED") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            }

            link1.textContent = "CEP: Troubleshooting Guide";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Main PLDT Repair Work Instruction"));
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "See ";

            const link2 = document.createElement("a");

            let url2 = "#";
            if (channelField.value === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField.value === "CDT-SOCMED") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FSOCMED%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            }

            link2.textContent = "Gamma: Troubleshooting Guide";
            link2.style.color = "lightblue";
            link2.href = "#";

            link2.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url2, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li6.appendChild(link2);
            li6.appendChild(document.createTextNode(" for Main Gamma Repair Work Instruction"));
            ul.appendChild(li6);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName 
                }
            );
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Visual Audit", "accountType");
        insertToolLabel(enhancedFields, "DMS", "dmsLanPortStatus");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Special Instructions", "contactName");
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = (field.name === "accountType" || field.name === "custAuth") ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;
                toolLabelRow.style.display = "none";

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                
                let optionsToUse = field.options;

                if (field.name === "resolution") {
                    if (["form300_1"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[2], field.options[3]];
                    } else if (["form300_2"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[2], field.options[3]];
                    } else if (["form300_3"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[3]];
                    } else if (["form300_4", "form300_5", "form300_7", "form300_8"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[3]];
                    } else if (["form300_6"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[3]];
                    }
                }

                optionsToUse.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });

            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => table.appendChild(createFieldRow(field))); 

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row");
            allToolLabels.forEach(labelRow => {
                const relatedName = labelRow.dataset.relatedTo;
                const relatedInput = document.querySelector(`[name="${relatedName}"]`);
                if (relatedInput) {
                    const relatedRow = relatedInput.closest("tr");
                    labelRow.style.display = (relatedRow && relatedRow.style.display !== "none") ? "table-row" : "none";
                }
            });
        }

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "SF/FUSE", "Endorse", "More"];
        const buttonHandlers = [
            ffupButtonHandler,
            techNotesButtonHandler,
            endorsementForm,
            sfTaggingButtonHandler
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const accountType = document.querySelector("[name='accountType']");
        const custAuth = document.querySelector("[name='custAuth']");
        const equipmentBrand = document.querySelector("[name='equipmentBrand']");
        const modemBrand = document.querySelector("[name='modemBrand']");
        const onuConnectionType = document.querySelector("[name='onuConnectionType']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        function handleCustAuthAndAccountTypeChange() {
            if (!custAuth.value || !accountType.value) {
                return;
            }
            resetAllFields(["accountType", "custAuth"]);

            if (custAuth.value === "Passed" && accountType.value === "PLDT") {
                if (selectedValue === "form300_1") {
                    showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved", "resolution"]);
                    hideSpecificFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks"]);

                    updateToolLabelVisibility();
                } else if (["form300_2", "form300_3", "form300_4", "form300_5"].includes(selectedValue)) {
                    showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "resolution"]);  

                    updateToolLabelVisibility();
                } else if (selectedValue === "form300_6") {
                    showFields(["lanPortNum", "dmsLanPortStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "resolution"]);    
                    
                    updateToolLabelVisibility();
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "resolution"]);

                    updateToolLabelVisibility();
                }

                updateToolLabelVisibility();
            } else if (custAuth.value === "Passed" && accountType.value === "RADIUS") {
                if (selectedValue === "form300_1") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved", "resolution"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks"]);

                    updateToolLabelVisibility();
                } else if (["form300_2", "form300_3", "form300_4", "form300_5"].includes(selectedValue)) {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "resolution"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType"]);

                    updateToolLabelVisibility();
                } else if (selectedValue === "form300_6") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "resolution"]);
                    hideSpecificFields(["lanPortNum", "dmsLanPortStatus"]);

                    updateToolLabelVisibility();
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "resolution"]);

                    updateToolLabelVisibility();
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields([
                    "equipmentBrand", "modemBrand", "onuConnectionType", "lanPortNum", "dmsLanPortStatus",
                    "investigation1", "investigation2", "investigation3", "investigation4", "issueResolved",
                    "cepCaseNumber", "sla", "resolution", "contactName", "cbr", "availability", "address", "landmarks"
                ]);

                updateToolLabelVisibility();
            }

            updateToolLabelVisibility();
        }

        custAuth.addEventListener("change", handleCustAuthAndAccountTypeChange);
        accountType.addEventListener("change", handleCustAuthAndAccountTypeChange);

        function updateONUConnectionType() {
            if (!equipmentBrand.value || !modemBrand.value) {
                onuConnectionType.value = ""; 
                onuConnectionType.dispatchEvent(new Event("change")); 
                return;
            }

            const newValue =
                (equipmentBrand.value === "FEOL" && modemBrand.value === "FHTT") ||
                (equipmentBrand.value === "HUOL" && modemBrand.value === "HWTC")
                    ? "Non-interOp"
                    : "InterOp";

            if (onuConnectionType.value !== newValue) {
                onuConnectionType.value = ""; 
                onuConnectionType.dispatchEvent(new Event("change")); 

                setTimeout(() => {
                    onuConnectionType.value = newValue; 
                    onuConnectionType.dispatchEvent(new Event("change")); 
                }, 0);
            }
        }

        onuConnectionType.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        equipmentBrand.addEventListener("change", updateONUConnectionType);
        modemBrand.addEventListener("change", updateONUConnectionType);

        updateONUConnectionType();
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks"]);

                updateToolLabelVisibility();
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks"]);

                updateToolLabelVisibility();
            }

            updateToolLabelVisibility();
        });

        updateToolLabelVisibility();

    }

    // Non-Tech Requests
     else if (selectedValue === "formReqAccMgt") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Go Green Registration",
                "Service Renewal",
                "Updating Contact Details"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO/SR", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to account management such as enrollment in programs, updating account contact details, and renewing existing services.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Requests for enrollment in the Go Green program";

            const li2 = document.createElement("li");
            li2.textContent = "Requests for renewal of a service (subscription, contract, or add-on)";

            const li3 = document.createElement("li");
            li3.textContent = "Requests to update the account's contact information (Primary or Secondary)";

            if (requestType === "Go Green Registration") {
                ul.appendChild(li1);
            } else if (requestType === "Service Renewal") {
                ul.appendChild(li2);
            } else {
                ul.appendChild(li3);
            }

            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (requestForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            descriptionDiv.appendChild(header);

            const definitions = {
                formReqTaxAdj: "Requests for a tax adjustment (typically for Microbusiness accounts)",
                formReqChgTelUnit: "Requests for change of telephone unit (SO creation)",
                formReqOcular: "Processing of SO for verification of the service area, address, and installed in actual. To check if the services installed are used for Personal or Business purposes.",
                formReqProofOfSub: "For aftersales request (i.e Downgrade, Upgrade, Change of Ownership, etc.)"    
            };

            const ul = document.createElement("ul");
            ul.className = "checklist";

            if (definitions[selectedValue]) {
                const li = document.createElement("li");
                li.textContent = definitions[selectedValue];
                ul.appendChild(li);
            }

            descriptionDiv.appendChild(ul);

            td.appendChild(descriptionDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt";

            const req = document.createElement("p");
            req.textContent = "Requirements:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Copy of BIR Forms 2307";

            const li2 = document.createElement("li");
            li2.textContent = "Clear copies of Proof of Payment";

            const li3 = document.createElement("li");
            li3.textContent = "List of accounts where the taxes withheld will be applied";

            const li4 = document.createElement("li");
            li4.textContent = "Active account or not in treatment";

            const li5 = document.createElement("li");
            li5.textContent = "No open Service Order (SO)";

            if (selectedValue === "formReqTaxAdj") {
                [li1, li2, li3].forEach(li => ulReq.appendChild(li));
            } else if (selectedValue === "formReqChgTelUnit" || selectedValue === "formReqOcular") {
                [li4, li5].forEach(li => ulReq.appendChild(li));
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let custAuthRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivPrompt")?.parentElement?.parentElement;
            if (existingChecklist) {
                existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (custAuthRow && custAuthRow.parentNode) {
                custAuthRow.parentNode.insertBefore(checklistRow, custAuthRow.nextSibling);
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach((field, index) => {
            if (field.name === "custConcern") {
                table.appendChild(createDefinitionRow());
            }

            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "custAuth") {
                custAuthRow = row;
            }
        });

        const checklistForms = [
            "formReqTaxAdj",
            "formReqChgTelUnit",
            "formReqOcular"
        ];

        if (checklistForms.includes(selectedValue)) {
            updateChecklist();
        }

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqAddressMod") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Billing Address",
                "Modify Service Address / AMEND SAM (Physical)"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to modification or updating of customer billing or service address.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Requests for modification of the billing address (without SO creation)";
            

            const li2 = document.createElement("li");
            li2.textContent = "Requests for modification of the service address with SO creation for AMEND SAM";

            if (requestType === "Billing Address") {
                ul.appendChild(li1);
            } else {
                ul.appendChild(li2);
            }

            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
        
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqSupRetAccNum" || selectedValue === "formReqSupChangeAccNum") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Straight or Plain Supersedure",
                "Supersedure with Clause"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            descriptionDiv.appendChild(header);

            const definitions = {
                formReqSupRetAccNum: "Requests for a change of ownership while retaining the existing account number",
                formReqSupChangeAccNum: "Requests for a change of ownership with a new account number",
            };

            const ul = document.createElement("ul");
            ul.className = "checklist";

            if (definitions[selectedValue]) {
                const li = document.createElement("li");
                li.textContent = definitions[selectedValue];
                ul.appendChild(li);
            }

            descriptionDiv.appendChild(ul);

            td.appendChild(descriptionDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Mandatory Information";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The Account is Active";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "No pending bill-related issues";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Zero balance MSF";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "No open dispute";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "Paid unbilled toll charges";
            ul.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "Paid Pre- Termination Fee if within lock-in (Supersedure with creation of New Account number) for the following:";

            const nestedUl = document.createElement("ul");
            [
                "Remaining months of gadget amortization", 
                "Remaining months of installation fee", 
                "Remaining months of activation fee"
            ].forEach(text => {
                const subLi1 = document.createElement("li");
                subLi1.textContent = text;
                nestedUl.appendChild(subLi1);
            });
            li6.appendChild(nestedUl);
            ul.appendChild(li6);

            const li7 = document.createElement("li");
            li7.textContent = "Supersedure with retention of account number and all account-related details shall only be allowed for the following  incoming customer:";

            const nestedOl = document.createElement("ol");
            nestedOl.type = "a";
            [
                "Spouse of the outgoing   customer must submit (PSA) Copy of Marriage Certificate",
                "Child of the outgoing customer must submit (PSA) Copy of Birth Certificate",
                "Sibling of the outgoing customer must submit (PSA) copies of Birth Certificate of both incoming ang outgoing customers"
            ].forEach(text => {
                const subLi2 = document.createElement("li");
                subLi2.textContent = text;
                nestedOl.appendChild(subLi2);
            });

            li7.appendChild(nestedOl);
            ul.appendChild(li7);

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li8 = document.createElement("li");
            li8.textContent = "Valid ID of incoming and outgoing customers";

            const li9 = document.createElement("li");
            li9.textContent = "Signed Service Request Form (SRF) & Subs Declaration";

            const li10 = document.createElement("li");
            li10.textContent = "Signed Affidavit by the incoming customer";

            const li11 = document.createElement("li");
            li11.textContent = "LOA if application/request is through authorized representative";

            const li12 = document.createElement("li");
            li12.textContent = "Valid ID of authorized representative";

            const li13 = document.createElement("li");
            li13.textContent = "Death Certificate (if available)";

            const li14 = document.createElement("li");
            li14.textContent = "Deed of Sale (if the PLDT service is included in the sale of the house/property)";
            
            if (requestType === "Straight or Plain Supersedure") {
                [li8, li9, li11, li12, li13].forEach(li => reqTypeUl.appendChild(li));
            } else if (requestType === "Supersedure with Clause") {
                [li8, li9, li10, li11, li12, li13, li14].forEach(li => reqTypeUl.appendChild(li));
            }

            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqDisconnection") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Disconnection (VAS)",
                "Permanent Disconnection",
                "Temporary Disconnection (VTD/HTD)"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to account or VAS disconnection.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Requests for the disconnection of Value-Added Services (VAS) such as Mesh, Cignal Add-on, Always-On, etc.";
            

            const li2 = document.createElement("li");
            li2.textContent = "Requests for the permanent disconnection of the account.";

            const li3 = document.createElement("li");
            li3.textContent = "Requests for the temporary disconnection of the account.";

            if (requestType === "Disconnection (VAS)") {
                ul.appendChild(li1);
            } else if (requestType === "Permanent Disconnection") {
                ul.appendChild(li2);
            } else {
                ul.appendChild(li3);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li4 = document.createElement("li");
            li4.textContent = "If the account is still within the lock-in period, advise the customer to settle the Pre-Termination Fee (PTF) at the Smart/PLDT Sales and Service Center (SSC) and then proceed with the request for disconnection of the Value-Added Service (VAS)";

            const li5 = document.createElement("li");
            li5.textContent = "Paid Pre-Termination Fee (PTF) and any remaining gadget amortization (if applicable)";

            const li6 = document.createElement("li");
            li6.textContent = "Paid all unbilled toll charges";

            const li8 = document.createElement("li");
            li8.textContent = "No open disputes";

            const li9 = document.createElement("li");
            li9.textContent = "No pending bill-related concerns";

            const li10 = document.createElement("li");
            li10.textContent = "Zero balance on Monthly Service Fee (MSF)";

            const li11 = document.createElement("li");
            li11.textContent = "SOR:";

            const sorUl = document.createElement("ul");

            // SOR Requirements
            [
                "Picture of Valid ID",
                "Proof of Payment – Final Amount",
                "Duly signed Letter of Undertaking (LOU)"
            ].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                sorUl.appendChild(li);
            });

            li11.appendChild(sorUl);

            const li12 = document.createElement("li");
            li12.textContent = "Non-SOR:";

            const nonSorUl = document.createElement("ul");

            // Non-SOR Requirements
            [
                "LOA (Letter of Authorization signed by the SOR)",
                "One (1) valid ID of the representative",
                "For Deceased SOR: Death Certificate and Valid ID of requestor"
            ].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                nonSorUl.appendChild(li);
            });

            li12.appendChild(nonSorUl);

            const li13 = document.createElement("li");
            li13.textContent = "At least 1 year in tenure";

            const li14 = document.createElement("li");
            li14.textContent = "Paid maintenance fee";

            const li15 = document.createElement("li");
            li15.textContent = "Zero outstanding balance at the time of request";

            if (requestType === "Disconnection (VAS)") {
                reqTypeUl.appendChild(li4);
            } else if (requestType === "Permanent Disconnection"){
                [li5, li6, li8, li9, li10, li11, li12].forEach(li => reqTypeUl.appendChild(li));
            } else {
                [li13, li14, li15].forEach(li => reqTypeUl.appendChild(li));
            }

            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqDispute") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Rebate Non Service",
                "Rentals - MSF",
                "Rentals - Lionsgate play/Netflix",
                "Rentals - NRC- Cost of Unit/Gadgets",
                "Rentals- Service Connection Charge",
                "Usage - Tolls (UnliFam Call)",
                "Usage - Other Tolls"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO/SR", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason },
            // Ordertake prompt for Rebate Non Service
            { label: "Ordertake?", type: "select", name: "ordertake", options: [
                "", 
                "Yes", 
                "No"
            ]},
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to disputes or rebate processing for charges involving non-service periods, Monthly Service Fees (MSF), Value-Added Services (VAS), and toll usage.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Requests for bill adjustment related to rebate due to non-service";

            const li2 = document.createElement("li");
            li2.textContent = "Requests for dispute on rental adjustment for Monthly Service Fee (MSF)";

            const li3 = document.createElement("li");
            li3.textContent = "Requests for dispute on rental adjustment for Value-Added Services (VOD such as Netflix, LGP, VIU)";

            const li4 = document.createElement("li");
            li4.textContent = "Requests for dispute on rental adjustment for non-recurring charges and one-time device costs (e.g., remaining device balance)";

            const li5 = document.createElement("li");
            li5.textContent = "Requests for dispute on rental adjustment for service connection charges (e.g., relocation, reconnection, in-move fees)";

            const li6 = document.createElement("li");
            li6.textContent = "Processing of Dispute for account that has been billed for their Unli Fam Call";

            const li7 = document.createElement("li");
            li7.textContent = "Customer requested for adjustment of toll usages (IDD/NDD)";

            if (requestType === "Rebate Non Service") {
                ul.appendChild(li1);
            } else if (requestType === "Rentals - MSF") {
                ul.appendChild(li2);
            } else if (requestType === "Rentals - Lionsgate play/Netflix") {
                ul.appendChild(li3);
            } else if (requestType === "Rentals - NRC- Cost of Unit/Gadgets") {
                ul.appendChild(li4);
            } else if (requestType === "Rentals- Service Connection Charge") {
                ul.appendChild(li5);
            } else if (requestType === "Usage - Tolls (UnliFam Call)") {
                ul.appendChild(li6);
            } else {
                ul.appendChild(li7);
            }

            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "ordertake" ? "none" : "table-row";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const requestType = document.querySelector("[name='requestType']");

        requestType.addEventListener("change", () => {
            if (requestType.selectedIndex === 1) {
                showFields(["ordertake"]);
            } else {
                hideSpecificFields(["ordertake"]);
            }
        });

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formReqDowngrade") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Plan 1299",
                "Plan 1399",
                "Plan 1799",
                "Others"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Processing of service orders (SO) for subscription plan downgrades from a higher-tier plan to a lower-tier plan, including Fiber Unli and bundled plans with Cignal subscription.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Processing of SO for downgrade from a higher plan to Fiber Unli Plan 1299.";
            

            const li2 = document.createElement("li");
            li2.textContent = "Processing of SO for downgrade from a higher plan to Plan 1399 with Cignal subscription.";

            const li3 = document.createElement("li");
            li3.textContent = "Processing of SO for downgrade from a higher plan to Plan 1799 with Cignal subscription.";

            const li4 = document.createElement("li");
            li4.textContent = "Requests for downgrade to a lower subscription plan.";

            if (requestType === "Plan 1299") {
                ul.appendChild(li1);
            } else if (requestType === "Plan 1399") {
                ul.appendChild(li2);
            } else if (requestType === "Plan 1799") {
                ul.appendChild(li3);
            } else {
                ul.appendChild(li4);
            }

            checklistDiv.appendChild(ul);

            if (requestType === "Others") {
                const clHeader = document.createElement("p");
                clHeader.textContent = "Requirements";
                clHeader.className = "checklist-header";
                checklistDiv.appendChild(clHeader);

                const reqTypeUl = document.createElement("ul");
                reqTypeUl.className = "checklist";

                const li5 = document.createElement("li");
                li5.textContent = "A ₱500 downgrade fee applies. 36 months lock-in period will refresh.";

                const li6 = document.createElement("li");
                li6.textContent = "Signed Subscription Certificate";

                const li7 = document.createElement("li");
                li7.textContent = "Signed LOA of the customer with copy of Valid ID of requestor & SOR";

                [li5, li6, li7].forEach(li => reqTypeUl.appendChild(li));

                checklistDiv.appendChild(reqTypeUl);
            }

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
        
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formReqDDE") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Temporary Due Date Extension",
                "Permanent Due Date Extension"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to Payment due date extension.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customer inquire for a due date/payment  extension within 7 days";
            

            const li2 = document.createElement("li");
            li2.textContent = "Request for payment due date extension for (7) allowable period due to financial constraints to avoid account being restricted after the due date";

            if (requestType === "Temporary Due Date Extension") {
                ul.appendChild(li1);
            } else {
                ul.appendChild(li2);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li3 = document.createElement("li");
            li3.textContent = "Account is active and current";
            reqTypeUl.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Due Date is within 10 days from the due date stated in SOA";
            reqTypeUl.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "No Open SO";
            reqTypeUl.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "Not Enrolled to extended credit Adjustment (ECA) or Promise to Pay";
            reqTypeUl.appendChild(li6);

            const li7 = document.createElement("li");
            li7.textContent = "No Account Treatment";
            reqTypeUl.appendChild(li7);

            const li8 = document.createElement("li");
            li8.textContent = "Bill not yet paid or settled before the due date";
            reqTypeUl.appendChild(li8);

            const li9 = document.createElement("li");
            li9.textContent = "Not tagged as Failed Promise to Pay or Bounced Check";
            reqTypeUl.appendChild(li9);
            
            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
                
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqInmove") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            // Definition header
            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Request to relocate or move the customer’s devices to another location within the same physical address.";
            ul.appendChild(li);

            // Requirements header
            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li2 = document.createElement("li");
            li2.textContent = "No Open SO";
            reqTypeUl.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "No Account Treatment";
            reqTypeUl.appendChild(li3);

            // Append everything
            div.appendChild(header);
            div.appendChild(ul);
            div.appendChild(clHeader);
            div.appendChild(reqTypeUl);

            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
                
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqMigration") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            // Definition header
            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Processing of request for Change of facility, from DSL to Fiber​.";
            ul.appendChild(li);

            // Requirements header
            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li2 = document.createElement("li");
            li2.textContent = "Corresponding fees";
            reqTypeUl.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "No Account Treatment";
            reqTypeUl.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "No Open SO";
            reqTypeUl.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "Subscription Certificate";
            reqTypeUl.appendChild(li5);

            // Append everything
            div.appendChild(header);
            div.appendChild(ul);
            div.appendChild(clHeader);
            div.appendChild(reqTypeUl);

            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqMisappPay" || selectedValue === "formReqReflectPay") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            // Definition header
            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Requests related to Misapplied Payment (payment credited to wrong account number, payments intended for multiple accounts but credited to only one account)";
            

            const li2 = document.createElement("li");
            li2.textContent = "Requests related to Unreflected Payment (payment not reflected in the customer's account)";
            

            if (selectedValue === "formReqMisappPay") {
                ul.appendChild(li1);
            } else if (selectedValue === "formReqReflectPay") {
                ul.appendChild(li2);
            }

            // Requirements header
            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li3 = document.createElement("li");
            li3.textContent = "Proof of Payment";
            reqTypeUl.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Letter of Request if customer is not the Account holder with one Signature";
            reqTypeUl.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "No Open SO";
            reqTypeUl.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "Valid ID with three Specimen signatures";
            reqTypeUl.appendChild(li6);

            const li7 = document.createElement("li");
            li7.textContent = "For Non-SOR - Valid ID of SOR with three (3) specimen signatures and ID of the authorized representative";
            reqTypeUl.appendChild(li7);

            // Append everything
            div.appendChild(header);
            div.appendChild(ul);
            div.appendChild(clHeader);
            div.appendChild(reqTypeUl);

            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
                        
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqReconnect") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: ["", "Failed", "Passed", "NA"] },
            { label: "Request Type", type: "select", name: "requestType", options: [
                "",
                "Posted Payment",
                "Posted Payment (DTS)",
                "Promise To Pay",
                "Renew (PD/OP)",
                "Reported Payment",
                "Reported Payment (DTS)",
                "Resume (TD)",
                "Tactical"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”, “PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "",
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ]},
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        const reconSpecificDefinition = {
            "Posted Payment": "Processing of reconnection request from a restricted account with payment already posted.",
            "Posted Payment (DTS)": "Reconnection request processed via NMS Skin.",
            "Promise To Pay": "Processing of immediate reconnection request with subscriber’s verbal commitment to settle the outstanding balance from the date of request.",
            "Renew (PD/OP)": "Processing of reconnection request for a PD account upon full settlement of the remaining balance.",
            "Reported Payment": "Processing of reconnection request with reported payment or upon receipt of payment proof (e.g., screenshot).",
            "Reported Payment (DTS)": "Processing of reconnection request with reported payment requiring reconnection via NMS.",
            "Resume (TD)": "Processing of reconnection request for a TD account upon full settlement of the outstanding bill.",
            "Tactical": "Processing of reconnection request with an approved churn offer."
        };

        let requestTypeRow = null;
        let checklistRowRef = null;

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests for service reconnection.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createChecklistRow(requestType) {
            if (!requestType || !reconSpecificDefinition[requestType]) return null;

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivPrompt";

            const header = document.createElement("p");
            header.textContent = "Request Type Description:";
            header.className = "requirements-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = reconSpecificDefinition[requestType];

            ul.appendChild(li);
            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function updateChecklist() {
            const requestTypeSelect = document.getElementById("requestType");
            const value = requestTypeSelect ? requestTypeSelect.value : "";

            if (checklistRowRef) {
                checklistRowRef.remove();
                checklistRowRef = null;
            }

            const newRow = createChecklistRow(value);
            if (newRow && requestTypeRow) {
                requestTypeRow.parentNode.insertBefore(newRow, requestTypeRow.nextSibling);
                checklistRowRef = newRow;
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;

            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.id = field.name;
                input.className = "form2-input";

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });

                if (field.name === "requestType") {
                    input.addEventListener("change", updateChecklist);
                }

            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.id = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;

            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.id = field.name;
                input.className = "form2-input";
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            div.appendChild(label);
            div.appendChild(input);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        fields.forEach((field) => {
            if (field.name === "custConcern") {
                table.appendChild(createDefinitionRow());
            }

            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqRefund") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Proactive AMSF (New Connect)",
                "Reactive Final Account",
                "Reactive Overpayment",
                "Reactive Wrong Biller"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Refund-Related Concerns";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Processing of refund request related to advance payment for a cancelled new application.";
            

            const li2 = document.createElement("li");
            li2.textContent = "Processing of refund request related to overpayment in a final account.";

            const li3 = document.createElement("li");
            li3.textContent = "Processing of refund request related to account overpayment, provided that the excess amount is at least equivalent to one (1) Monthly Service Fee (MSF).";

            const li4 = document.createElement("li");
            li4.textContent = "Processing of refund request related to payment erroneously made to PLDT Inc.";

            if (requestType === "Proactive AMSF (New Connect)") {
                ul.appendChild(li1);
            } else if (requestType === "Reactive Final Account") {
                ul.appendChild(li2);
            } else if (requestType === "Reactive Overpayment") {
                ul.appendChild(li3);
            } else {
                ul.appendChild(li4);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li5 = document.createElement("li");
            li5.textContent = "Closed SO for new application";

            const li6 = document.createElement("li");
            li6.textContent = "With reflected payment of 1AMSF on the account";

            const li7 = document.createElement("li");
            li7.textContent = "Letter of Request (LOR for SOR)/Letter of Authorization (LOA for Non-SOR) with three (3) specimen signatures by the subscriber on record (SOR)";

            const li8 = document.createElement("li");
            li8.textContent = "Proof of Payment ";

            const li9 = document.createElement("li");
            li9.textContent = "Valid ID with specimen signature";

            const li10 = document.createElement("li");
            li10.textContent = "For Non-SOR - Valid ID of SOR and ID of the authorized representative";
            
            if (requestType === "Proactive AMSF (New Connect)") {
                [li5, li6].forEach(li => reqTypeUl.appendChild(li));
            } else {
                [li7, li8, li9, li10].forEach(li => reqTypeUl.appendChild(li));
            }

            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
                    
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqRelocation") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Cancelled SO - Bypass SO",
                "CID Creation",
                "Relocation - SO Creation"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason },
            { label: "Ordertake?", type: "select", name: "ordertake", options: [
                "", 
                "Yes", 
                "No"
            ]},
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to service relocation.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Request for reprocessing of relocation due to cancelled SO related to Bypass SO";
            

            const li2 = document.createElement("li");
            li2.textContent = "Request for the CID creation process through Geocoder";

            const li3 = document.createElement("li");
            li3.textContent = "Request for the process of relocation SO (Non-Simultaneous & Simultaneous)";

            if (requestType === "Cancelled SO - Bypass SO") {
                ul.appendChild(li1);
            } else if (requestType === "CID Creation") {
                ul.appendChild(li2);
            } else {
                ul.appendChild(li3);
            }

            checklistDiv.appendChild(ul);

            if (requestType === "Relocation - SO Creation") {
                const clHeader = document.createElement("p");
                clHeader.textContent = "Requirements";
                clHeader.className = "checklist-header";
                checklistDiv.appendChild(clHeader);

                const reqTypeUl = document.createElement("ul");
                reqTypeUl.className = "checklist";

                const li4 = document.createElement("li");
                li4.textContent = "Service Request form and Subscert for Non-SOR";
                reqTypeUl.appendChild(li4);

                checklistDiv.appendChild(reqTypeUl);
            }

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = field.name === "ordertake" ? "none" : "table-row";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const requestType = document.querySelector("[name='requestType']");
        requestType.addEventListener("change", () => {
            if (requestType.selectedIndex === 2) {
                showFields(["ordertake"]);
            } else {
                hideSpecificFields(["ordertake"]);
            }
        });

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    } else if (selectedValue === "formReqSpecFeat") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "DDD Pin Resetting",
                "NDD / IDD / DDD (Security Lock)",
                "Super Bundle / Caller ID Bundle",
                "Others"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO/SR", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to landline features, including PIN reset, security code retrieval, activation of bundled features, and addition of other special features.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customer requesting for PIN resetting";
            

            const li2 = document.createElement("li");
            li2.textContent = "Customer requesting for the security code of the telephone related to special features (IDD, NDD, or DDD)";

            const li3 = document.createElement("li");
            li3.textContent = "Customer requested to process super bundle/caller ID bundle feature on the account";

            const li4 = document.createElement("li");
            li4.textContent = "Other special features request such as adding special feature on the telephone";

            if (requestType === "DDD Pin Resetting") {
                ul.appendChild(li1);
            } else if (requestType === "NDD / IDD / DDD (Security Lock)") {
                ul.appendChild(li2);
            } else if (requestType === "Super Bundle / Caller ID Bundle") {
                ul.appendChild(li3);
            } else {
                ul.appendChild(li4);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            if (requestType === "DDD Pin Resetting") {
                const li5 = document.createElement("li");
                li5.textContent = "No Account Treatment";
                reqTypeUl.appendChild(li5);

                const li6 = document.createElement("li");
                li6.textContent = "No open SO";
                reqTypeUl.appendChild(li6);
            } else {
                const li5 = document.createElement("li");
                li5.textContent = "No outstanding balance";
                reqTypeUl.appendChild(li5);

                const li6 = document.createElement("li");
                li6.textContent = "No Account Treatment";
                reqTypeUl.appendChild(li6);

                const li7 = document.createElement("li");
                li7.textContent = "Subscription Certificate (For New Customer)";
                reqTypeUl.appendChild(li7);

                const li8 = document.createElement("li");
                li8.textContent = "Customer Application Form (For New Customer)";
                reqTypeUl.appendChild(li8);
            }

            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formReqSpeedAddOn") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Create SO - Disconnect",
                "Create SO - Modify Speed",
                "Interested (File MsForm)"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to the enrollment, removal, or documented interest in the Speed Add-On 500.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customer requested for the disconnection of the speed add-on 500 on the account";
            

            const li2 = document.createElement("li");
            li2.textContent = "Customer requested for the speed add-on to be added on the account";

            const li3 = document.createElement("li");
            li3.textContent = "Customer was asking for the speed add-on 500, was just interested and the agent logged the request in the MS Form";

            if (requestType === "Create SO - Disconnect") {
                ul.appendChild(li1);
            } else if (requestType === "Create SO - Modify Speed") {
                ul.appendChild(li2);
            } else {
                ul.appendChild(li3);
            }

            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
        
    } else if (selectedValue === "formReqUfc") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Activation",
                "Deactivation"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to the Unli Fam Call feature on the account.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Requirement";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Ensure that the plan originally includes the UFC";
            ul.appendChild(li1);

            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formReqUpgrade") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Plan 1399",
                "Plan 1599",
                "Plan 1799",
                "Plan 2099",
                "Plan 2699",
                "Others"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to service plan upgrades, including changes to Plan 1399, 1599, 1799, 2099, 2699, or other eligible plans.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customer was requesting for the upgrade of service into plan 1399.";
            
            const li2 = document.createElement("li");
            li2.textContent = "Customer was requesting for the upgrade of service into plan 1599.";

            const li3 = document.createElement("li");
            li3.textContent = "Customer was requesting for the upgrade of service into plan 1799.";

            const li4 = document.createElement("li");
            li4.textContent = "Customer was requesting for the upgrade of service into plan 2099.";

            const li5 = document.createElement("li");
            li5.textContent = "Customer was requesting for the upgrade of service into plan 2699.";

            const li6 = document.createElement("li");
            li6.textContent = "Customer was requesting for the upgrade of service into other plans aside from 1399, 1599, 1799, 2099, and 2699.";

            if (requestType === "Plan 1399") {
                ul.appendChild(li1);
            } else if (requestType === "Plan 1599") {
                ul.appendChild(li2);
            } else if (requestType === "Plan 1799") {
                ul.appendChild(li3);
            } else if (requestType === "Plan 2099") {
                ul.appendChild(li4);
            } else if (requestType === "Plan 2699") {
                ul.appendChild(li5);
            } else {
                ul.appendChild(li6);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li7 = document.createElement("li");
            li7.textContent = "Letter of Authorization (Non-SOR)";

            const li8 = document.createElement("li");
            li8.textContent = "Signed Subscription Certificate (Non-SOR and Social Media agent)";

            [li7, li8].forEach(li => reqTypeUl.appendChild(li));

            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formReqVAS") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "",
                "Always On",
                "Cignal/IPTV",
                "MyOwnWifi",
                "Speed Add On",
                "Speed Alignment",
                "Wifi Mesh",
                "Others"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Requests related to the activation, adjustment, or processing of add-ons and value-added services (VAS) on the account.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customer requesting for the Always On add-on on the account";

            const li2 = document.createElement("li");
            li2.textContent = "Customer requesting for the Cignal add-on on the account";

            const li3 = document.createElement("li");
            li3.textContent = "Customer requesting for the MyOwn Wifi add-on on the account";

            const li4 = document.createElement("li");
            li4.textContent = "Customer requesting for the speed add-on";

            const li5 = document.createElement("li");
            li5.textContent = "Customer requesting for the speed alignment on the account";

            const li6 = document.createElement("li");
            li6.textContent = "Customer requesting for the Wifi Mesh add-on in the account";

            const li7 = document.createElement("li");
            li7.textContent = "Customer requesting for the other VAS add-on on the account";
            
            if (requestType === "Always On") {
                ul.appendChild(li1);
            } else if (requestType === "Cignal/IPTV") {
                ul.appendChild(li2);
            } else if (requestType === "MyOwnWifi") {
                ul.appendChild(li3);
            } else if (requestType === "Speed Add On") {
                ul.appendChild(li4);
            } else if (requestType === "Speed Alignment") {
                ul.appendChild(li5);
            } else if (requestType === "Wifi Mesh") {
                ul.appendChild(li6);
            } else if (requestType === "Others") {
                ul.appendChild(li7);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li8 = document.createElement("li");
            li8.textContent = "ID";

            const li9 = document.createElement("li");
            li9.textContent = "Cignal Privacy Policy";

            const li10 = document.createElement("li");
            li10.textContent = "Letter of Authorization (Non-SOR)";

            const li11 = document.createElement("li");
            li11.textContent = "Signed Subscription Certificate (Non-SOR and Social Media agent)";

            let hasItems = false;

            if (requestType === "Always On" || requestType === "Wifi Mesh") {
                [li10, li11].forEach(li => reqTypeUl.appendChild(li));
                hasItems = true;

            } else if (requestType === "Cignal/IPTV") {
                [li9, li10, li11].forEach(li => reqTypeUl.appendChild(li));
                hasItems = true;

            } else if (requestType === "MyOwnWifi") {
                [li8, li11].forEach(li => reqTypeUl.appendChild(li));
                hasItems = true;
            }

            if (hasItems) {
                checklistDiv.appendChild(clHeader);
                checklistDiv.appendChild(reqTypeUl);
            }

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formReqWireReroute") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Re-Routing Inside Wire",
                "Re-Routing Outside Wire"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.className = "form2DivDefinition";

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li = document.createElement("li");
            li.textContent = "Request related to rerouting or relocation of wiring.";
            ul.appendChild(li);

            div.appendChild(header);
            div.appendChild(ul);
            td.appendChild(div);
            row.appendChild(td);

            return row;
        }

        function createPromptRow(requestType) {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const reqHeader = document.createElement("p");
            reqHeader.textContent = "Request Type Description";
            reqHeader.className = "requirements-header";
            checklistDiv.appendChild(reqHeader);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customer request for rerouting or relocation of inside wiring.";
            

            const li2 = document.createElement("li");
            li2.textContent = "Customer request for rerouting or relocation of outside wiring.";

            if (requestType === "Re-Routing Inside Wire") {
                ul.appendChild(li1);
            } else {
                ul.appendChild(li2);
            }

            checklistDiv.appendChild(ul);

            const clHeader = document.createElement("p");
            clHeader.textContent = "Requirements";
            clHeader.className = "checklist-header";
            checklistDiv.appendChild(clHeader);

            const reqTypeUl = document.createElement("ul");
            reqTypeUl.className = "checklist";

            const li5 = document.createElement("li");
            li5.textContent = "No Open SO";
            reqTypeUl.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "No Account Restriction";
            reqTypeUl.appendChild(li6);

            checklistDiv.appendChild(reqTypeUl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }
        
        table.appendChild(createDefinitionRow());
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "requestType") {
                requestTypeRow = row;
                const select = row.querySelector("select");

                select.addEventListener("change", (e) => {
                    const selected = e.target.value;

                    const existingPrompt = table.querySelector(".form2DivPrompt")?.closest("tr");
                    if (existingPrompt) existingPrompt.remove();

                    if (selected) {
                        const promptRow = createPromptRow(selected);
                        requestTypeRow.parentNode.insertBefore(promptRow, requestTypeRow.nextSibling);
                    }
                });
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    }

    // Non-Tech Complaints
    else if (selectedValue === "formCompMyHomeWeb") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custConcern", "remarks", "upsell", "issueResolved"];
            row.style.display = primaryFields.includes(field.name) ? "table-row" : "none";


            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    } else if (selectedValue === "formCompMisappliedPayment") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Ownership", type: "select", name: "ownership", options: ["", "SOR", "Non-SOR"] },
            { label: "Misapplied Payment due to", type: "select", name: "findings", options: ["", "Wrong Account Number", "Wrong Biller"] },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="ownership"]');
            const findingsEl = document.querySelector('[name="findings"]');

            const ownership = ownershipEl ? ownershipEl.value : "";
            const findings = findingsEl ? findingsEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt";

            const req = document.createElement("p");
            req.textContent = "Requirements:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Valid ID with three (3) specimen signatures";

            const li2 = document.createElement("li");
            li2.textContent = "Proof of payment:";

            const nestedUl = document.createElement("ul");
            ["CFSI - collection receipt provided by the CFSI tellers, machine-validated", "Banks - A payment slip with machine validation", "Online - A payment confirmation email", "ATM - A copy of the ATM payment slip"].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            nestedUl.appendChild(li);
            });
            li2.appendChild(nestedUl);

            const li3 = document.createElement("li");
            li3.textContent = "Signed Letter of Request (LOR)";

            const li4 = document.createElement("li");
            li4.textContent = "Signed Letter of Request (LOR) must contain the following information:";

            const nestedUl2 = document.createElement("ul");
            ["Account Number or SO Number", "E-wallet (MAYA or GCASH)", "E-wallet No.", "E-wallet Name"].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            nestedUl2.appendChild(li);
            });
            li4.appendChild(nestedUl2);

            const li5 = document.createElement("li");
            li5.textContent = "Valid ID with three (3) specimen signatures and ID of the authorized representative.";

            const li6 = document.createElement("li");
            li6.textContent = "Letter of Authorization (LOA) for Non-SOR with one (1) signature";

            if (findings === "Wrong Account Number") {
                if (ownership === "SOR") {
                    [li1, li2, li3].forEach(li => ulReq.appendChild(li));
                } else if (ownership === "Non-SOR") {
                    [li5, li6].forEach(li => ulReq.appendChild(li));
                }
            } else if (findings === "Wrong Biller") {
                if (ownership === "SOR") {
                    [li1, li2, li4].forEach(li => ulReq.appendChild(li));
                } else if (ownership === "Non-SOR") {
                    [li5, li6].forEach(li => ulReq.appendChild(li));
                }
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let ownershipRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivPrompt")?.parentElement?.parentElement;
            if (existingChecklist) {
            existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (ownershipRow && ownershipRow.parentNode) {
            ownershipRow.parentNode.insertBefore(checklistRow, ownershipRow.nextSibling);
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "ownership" || field.name === "findings") {
                    input.id = field.name;
                }

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "ownership" || field.name === "findings") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "findings") {
            ownershipRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
        
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    } else if (selectedValue === "formCompUnreflectedPayment") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Ownership", type: "select", name: "ownership", options: ["", "SOR", "Non-SOR"] },
            { label: "Payment Channel", type: "select", name: "paymentChannel", options: ["", "BDO", "GCash", "Paymaya", "Others"] },
            { label: "Other Payment Channel", type: "text", name: "otherPaymentChannel" },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="ownership"]');
            const paymentChannelEl = document.querySelector('[name="paymentChannel"]');

            const ownership = ownershipEl ? ownershipEl.value : "";
            const paymentChannel = paymentChannelEl ? paymentChannelEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt";

            const req = document.createElement("p");
            req.textContent = "Requirements:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Valid ID with three (3) specimen signatures";

            const li2 = document.createElement("li");
            li2.textContent = "Proof of payment:";

            const nestedUl = document.createElement("ul");
            ["Make sure copy is clear and readable indicating account number, payment amount and date of payment", "If POP is invalid (no account number, no payment amount & date reflected), refrain from creating payment dispute. Please advise customer to raise concern to GCash as well."].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            nestedUl.appendChild(li);
            });
            li2.appendChild(nestedUl);

            const li3 = document.createElement("li");
            li3.textContent = "Proof of payment:";

            const nestedUl2 = document.createElement("ul");
            ["Make sure copy is clear and readable indicating account number, payment amount and date of payment"].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            nestedUl2.appendChild(li);
            });
            li3.appendChild(nestedUl2);

            const li4 = document.createElement("li");
            li4.textContent = "Signed Letter of Request (LOR)";

            const li5 = document.createElement("li");
            li5.textContent = "Valid ID with three (3) specimen signatures and ID of the authorized representative.";

            const li6 = document.createElement("li");
            li6.textContent = "Letter of Authorization (LOA) for Non-SOR with one (1) signature";

            if (paymentChannel === "GCash") {
                if (ownership === "SOR") {
                    [li1, li2, li4].forEach(li => ulReq.appendChild(li));
                } else if (ownership === "Non-SOR") {
                    [li5, li6].forEach(li => ulReq.appendChild(li));
                }
            } else if (paymentChannel === "BDO" || paymentChannel === "Paymaya" || paymentChannel === "Others") {
                if (ownership === "SOR") {
                    [li1, li3, li4].forEach(li => ulReq.appendChild(li));
                } else if (ownership === "Non-SOR") {
                    [li5, li6].forEach(li => ulReq.appendChild(li));
                }
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let ownershipRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivPrompt")?.parentElement?.parentElement;
            if (existingChecklist) {
            existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (ownershipRow && ownershipRow.parentNode) {
            ownershipRow.parentNode.insertBefore(checklistRow, ownershipRow.nextSibling);
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["otherPaymentChannel"];
            row.style.display = primaryFields.includes(field.name) ? "none" : "table-row";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "ownership" || field.name === "paymentChannel") {
                    input.id = field.name;
                }

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "ownership" || field.name === "paymentChannel") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else if (field.type === "text" || field.type === "number") {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "paymentChannel") {
            ownershipRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const paymentChannel = document.querySelector("[name='paymentChannel']");
        paymentChannel.addEventListener("change", () => {
            if (paymentChannel.selectedIndex === 4) {
                showFields(["otherPaymentChannel"]);
            } else {
                hideSpecificFields(["otherPaymentChannel"]);
            }
        });

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    
    } else if (selectedValue === "formCompPersonnelIssue") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Personnel Being Reported", type: "select", name: "personnelType", options: [
                "", 
                "Delivery Courier Service", 
                "Hotline Agent",
                "Sales Agent",
                "Social Media Agent",
                "SSC Personnel",
                "Technician",
                "Telesales"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="personnelType"]');
            const ownership = ownershipEl ? ownershipEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt";

            const req = document.createElement("p");
            req.textContent = "Instructions:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Acknowledge and empathize with the customer's experience";

            const li2 = document.createElement("li");
            li2.textContent = "Redirect the customer (existing or non-subscriber) to PLDT Care Web Forms";

            ulReq.appendChild(li1);
            ulReq.appendChild(li2);

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let personnelTypeRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivPrompt")?.parentElement?.parentElement;
            if (existingChecklist) {
                existingChecklist.remove();
            }

            const checklistRow = createPromptRow();
            if (personnelTypeRow && personnelTypeRow.parentNode) {
                personnelTypeRow.parentNode.insertBefore(checklistRow, personnelTypeRow.nextSibling);
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "personnelType") {
                    input.id = field.name;
                }

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "personnelType") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else if (field.type === "text" || field.type === "number") {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "personnelType") {
                personnelTypeRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
    
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    } 

    // Non-Tech Inquiry
    else if (inquiryForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            descriptionDiv.appendChild(header);

            const definitions = {
                formInqAccSrvcStatus: "Inquiries about account or service status",
                formInqLockIn: "Inquiries about lock-in contract start and end dates (within 36 months)",
                formInqCopyOfBill: "Inquiries about obtaining a copy of the monthly bill",
                formInqMyHomeAcc: "Inquiries on how to log in to My Home Account",
                formInqPlanDetails: "Inquiries about available plans",
                formInqAda: "Inquiries regarding Auto Debit Arrangement (ADA)",
                formInqRebCredAdj: "Inquiries about rebate or credit approval with no open service request",
                formInqBalTransfer: "Inquiries about transferring balance to another account",
                formInqBrokenPromise: "Inquiries about account eligibility for DDE or PTP involving prior broken promise",
                formInqCreditAdj: "Inquiries about credit adjustments or discounts",
                formInqCredLimit: "Inquiries about credit limit or data volume on prepaid accounts, including top-up process",
                formInqNSR: "Inquiries about the process for Non-Service Rebates for days without PLDT Service",
                formInqDdate: "Inquiries about due dates and billing dates for settlement",
                formInqBillDdateExt: "Inquiries about promised due date or 7-day payment extension",
                formInqEcaPip: "Inquiries about payment installment eligibility for accounts with ₱5,000 or more unpaid balance",
                formInqNewBill: "Inquiries about details of a newly generated bill",
                formInqOneTimeCharges: "Inquiries about PTF, remaining cost, and other service fees",
                formInqOverpay: "Inquiries about overpayments on the account",
                formInqPayChannel: "Inquiries about accredited payment channels",
                formInqPayPosting: "Inquiries about payment posting timelines for specific channels",
                formInqPayRefund: "Inquiries about refunds for uninstalled service",
                formInqPayUnreflected: "Inquiries about unposted payments",
                formInqDdateMod: "Inquiries about the process for permanent due date modification",
                formInqBillRefund: "Inquiries about the refund process",
                formInqSmsEmailBill: "Inquiries regarding bill delivery methods",
                formInqTollUsage: "Inquiries about toll usage for IDD or NDD calls",
                formInqCoRetain: "Inquiries about change of ownership with retention of account number",
                formInqCoChange: "Inquiries about change of ownership with a new account number",
                formInqTempDisc: "Inquiries about temporary disconnection due to migration, hospitalization, or vacation",
                formInqD1299: "Inquiries about downgrading to Fiber Unli Plan 1299",
                formInqD1399: "Inquiries about downgrading to Fiber Unli Plan 1399",
                formInqD1799: "Inquiries about downgrading to Fiber Unli Plan 1799",
                formInqDOthers: "Inquiries about the process for downgrading service",
                formInqDdateExt: "Inquiries about extension of due date, either temporary or permanent",
                formInqEntertainment: "Inquiries about availing entertainment add-ons",
                formInqInmove: "Inquiries about relocating telephone or modem within the same address",
                formInqMigration: "Inquiries about service migration initiated by PLDT or the customer",
                formInqProdAndPromo: "Inquiries on how to apply for PLDT services or available plan details",
                formInqHomeRefNC: "Inquiries about referral program process for new connections",
                formInqHomeDisCredit: "Inquiries about claiming discounts from the home referral program",
                formInqReloc: "Inquiries about the relocation process, fees, SLA, and other details",
                formInqRewards: "Inquiries about Home/MVP Rewards (crystals, vouchers, redeemables)",
                formInqDirectDial: "Inquiries about unlocking IDD, NDD, or DDD features with a security code",
                formInqBundle: "Inquiries about special feature inclusions for Super Bundle or Caller ID Bundle",
                formInqSfOthers: "Inquiries about special features such as callable numbers and related fees",
                formInqSAO500: "Inquiries about SAO 500 details",
                formInqUfcEnroll: "Inquiries about the enrollment process for UnliFamCall",
                formInqUfcPromoMech: "Inquiries about the UnliFamCall promo, including how to avail, inclusions, and details",
                formInqUpg1399: "Inquiries about service upgrades for Fiber Unli Plan 1399 (details, fees, SLA)",
                formInqUpg1599: "Inquiries about service upgrades for Fiber Unli Plan 1599 (details, fees, SLA)",
                formInqUpg1799: "Inquiries about service upgrades for Fiber Unli Plan 1799 (details, fees, SLA)",
                formInqUpg2099: "Inquiries about service upgrades for Fiber Unli Plan 2099 (details, fees, SLA)",
                formInqUpg2499: "Inquiries about service upgrades for Fiber Unli Plan 2499 (details, fees, SLA)",
                formInqUpg2699: "Inquiries about service upgrades for Fiber Unli Plan 2699 (details, fees, SLA)",
                formInqUpgOthers: "Inquiries about service upgrades, including details, fees, and plans not in tagging",
                formInqVasAO: "Inquiries about Always On, including fees, SLA, and eligibility",
                formInqVasIptv: "Inquiries about IPTV/Cignal, including inclusions, fees, contracts, and details",
                formInqVasMOW: "Inquiries about MyOwnWifi, including inclusions, fees, contracts, and details",
                formInqVasSAO: "Inquiries about Speed add-on, including inclusions, fees, contracts, and details",
                formInqVasWMesh: "Inquiries about Mesh add-on, including inclusions, fees, contracts, and details",
                formInqVasOthers: "Inquiries about value-added services not included in tagging",
                formInqWireReRoute: "Inquiries about re-routing of wires, including fees and SLA"
            };

            const ul = document.createElement("ul");
            ul.className = "checklist";

            if (definitions[selectedValue]) {
                const li = document.createElement("li");
                li.textContent = definitions[selectedValue];
                ul.appendChild(li);
            }

            descriptionDiv.appendChild(ul);

            td.appendChild(descriptionDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach((field, index) => {
            if (field.name === "custConcern") {
                table.appendChild(createDefinitionRow());
            }

            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formInqBillInterpret") {
        const table = document.createElement("table");

        const fields = [
            { label: "Bill Interpretation for", type: "select", name: "subType", options: [
                "", 
                "Add On Service", 
                "New Connect",
                "Relocation",
                "Upgrade",
                "Downgrade",
                "Migration"
            ]},
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            row.id = "definitionRow";
            row.style.display = "none";
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            instructionsDiv.appendChild(header);

            const billInterpretationDefinition = {
                1: "Inquiries about the bill breakdown due to an add-on service",
                2: "Inquiries about the breakdown of the first bill or prorated charges",
                3: "Inquiries about billing details related to relocation (fees and prorated charges after relocation)",
                4: "Inquiries about billing details related to an upgrade (fees and prorated charges after the process)",
                5: "Inquiries about billing details related to a downgrade (fees and prorated charges after the process)",
                6: "Inquiries about billing details related to a migration (fees and prorated charges after the process)"
            };

            const subTypeSelect = document.querySelector('select[name="subType"]');
            const selectedIndex = subTypeSelect ? subTypeSelect.selectedIndex : -1;

            const ul = document.createElement("ul");
            ul.className = "checklist";

            if (billInterpretationDefinition[selectedIndex]) {
                const li = document.createElement("li");
                li.textContent = billInterpretationDefinition[selectedIndex];
                ul.appendChild(li);
                row.style.display = "table-row";
            }

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function updateDescriptionRow() {
            const existingRow = document.getElementById("definitionRow");
            if (existingRow) {
                existingRow.replaceWith(createDefinitionRow());
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "subType") {
                    input.addEventListener("change", updateDescriptionRow);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "subType") {
                table.appendChild(createDefinitionRow());
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
    
        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    } else if (selectedValue === "formInqPermaDisc") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Ownership", type: "select", name: "ownership", options: ["", "SOR", "Non-SOR"] },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Inquiries about the process for permanent account disconnection";
            ul.appendChild(li1);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="ownership"]');
            const ownership = ownershipEl ? ownershipEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt";

            const req = document.createElement("p");
            req.textContent = "Requirements:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Picture of Valid ID ";

            const li2 = document.createElement("li");
            li2.textContent = "Proof of Payment-Final Amount ";

            const li3 = document.createElement("li");
            li3.textContent = "Duly signed Letter of Undertaking (LOU)​";

            const li4 = document.createElement("li");
            li4.textContent = "Letter of Authorization signed by the SOR";

            const li5 = document.createElement("li");
            li5.textContent = "One (1) valid ID of the representative ";

            const li6 = document.createElement("li");
            li6.textContent = "For Deceased SOR – Death Certificate and Valid ID of requestor";

            if (ownership === "SOR") {
                [li1, li2, li3].forEach(li => ulReq.appendChild(li));
            } else if (ownership === "Non-SOR") {
                [li4, li5, li6].forEach(li => ulReq.appendChild(li));
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let ownershipRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivPrompt")?.parentElement?.parentElement;
            if (existingChecklist) {
                existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (ownershipRow && ownershipRow.parentNode) {
                ownershipRow.parentNode.insertBefore(checklistRow, ownershipRow.nextSibling);
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "ownership") {
                    input.id = field.name;
                }

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "ownership") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            if (field.name === "custConcern") {
                table.appendChild(createDefinitionRow());
            }

            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "ownership") {
                ownershipRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    
    } else if (selectedValue === "formInqOutsBal") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Outstanding Balance for", type: "select", name: "subType", options: [
                "", 
                "Downgrade Fee", 
                "Existing Customer",
                "Modem & Installation Fee",
                "New Connect",
                "Payment Adjustment",
                "Rebate",
                "Refund",
                "SCC (Transfer fee, Reroute, Change Unit)",
                
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            row.id = "definitionRow";
            row.style.display = "none";
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";
            instructionsDiv.appendChild(header);

            const billInterpretationDefinition = {
                1: "Inquiries about outstanding balance due to downgrade fee",
                2: "Inquiries about an outstanding balance on the account. This applies in cases where the chat was disconnected and the customer intends to request reconnection, but the account shows an existing balance.",
                3: "Inquiries about installation and activation fees on bill or balance",
                4: "Inquiries about latest balance related to new connection charges",
                5: "Inquiries about balance after recent payment adjustments (misapplied or unreflected payments)",
                6: "Inquiries about balance after a rebate request",
                7: "Inquiries about balance after a refund has been processed",
                8: "Inquiries about balance before or after an aftersales process"
            };

            const subTypeSelect = document.querySelector('select[name="subType"]');
            const selectedIndex = subTypeSelect ? subTypeSelect.selectedIndex : -1;

            const ul = document.createElement("ul");
            ul.className = "definition";

            if (billInterpretationDefinition[selectedIndex]) {
                const li = document.createElement("li");
                li.textContent = billInterpretationDefinition[selectedIndex];
                ul.appendChild(li);
                row.style.display = "table-row";
            }

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function updateDescriptionRow() {
            const existingRow = document.getElementById("definitionRow");
            if (existingRow) {
                existingRow.replaceWith(createDefinitionRow());
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "subType") {
                    input.addEventListener("change", updateDescriptionRow);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "subType") {
                table.appendChild(createDefinitionRow());
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    
    } else if (selectedValue === "formInqRefund") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Refund Inquiry Type", type: "select", name: "subType", options: [
                "", 
                "Proactive AMSF (New Connect)", 
                "Reactive Final Account",
                "Reactive Overpayment",
                "Reactive Wrong Biller"
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            row.id = "definitionRow";
            row.style.display = "none";
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";
            instructionsDiv.appendChild(header);

            const billInterpretationDefinition = {
                1: "Inquiries about refunds for AMSF on cancelled new applications",
                2: "Inquiries about refunds for accounts tagged as Final Account",
                3: "Inquiries about refunds for overpayment equal to or greater than one monthly service fee",
                4: "Inquiries about refunds for payments made to the wrong biller"
            };

            const subTypeSelect = document.querySelector('select[name="subType"]');
            const selectedIndex = subTypeSelect ? subTypeSelect.selectedIndex : -1;

            const ul = document.createElement("ul");
            ul.className = "definition";

            if (billInterpretationDefinition[selectedIndex]) {
                const li = document.createElement("li");
                li.textContent = billInterpretationDefinition[selectedIndex];
                ul.appendChild(li);
                row.style.display = "table-row";
            }

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function updateDescriptionRow() {
            const existingRow = document.getElementById("definitionRow");
            if (existingRow) {
                existingRow.replaceWith(createDefinitionRow());
            }
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "subType") {
                    input.addEventListener("change", updateDescriptionRow);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "subType") {
                table.appendChild(createDefinitionRow());
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [nontechNotesButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));
    
    }

    // Non-Tech Follow-Up
    if (ffupForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            { label: "Type of Request", type: "select", name: "requestType", options: [
                ""
            ] },
            { label: "Dispute Type", type: "select", name: "disputeType", options: [
                "", 
                "Rebate Non Service", 
                "Rentals",
                "Usage",
                "Usage MSF"
            ]},
            { label: "Approver", type: "select", name: "approver", options: [
                ""
            ]},
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Ownership", type: "select", name: "ownership", options: [
                "", 
                "SOR", 
                "Non-SOR"
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Status", type: "select", name: "ffupStatus", options: [
                "", 
                "Beyond SLA", 
                "Within SLA"
            ]},
            { label: "Findings", type: "select", name: "findings", options: [
                ""
            ] },
            { label: "VAS Product", type: "text", name: "vasProduct" },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "SO/SR #", type: "text", name: "srNum"},
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            // Upsell
            { label: "Upsell", type: "select", name: "upsell", options: UPSELL_OPTIONS.upsell },
            { label: "Decline Reason", type: "select", name: "declineReason", options: UPSELL_OPTIONS.declineReason },
            { label: "Not Eligible Reason", type: "select", name: "notEligibleReason", options: UPSELL_OPTIONS.notEligibleReason }
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            descriptionDiv.appendChild(header);

            const definitions = {
                formFfupChangeOwnership: "Follow-up on Change of Ownership requests processed within 24-48 hours (within SLA) or after 48 hours (beyond SLA)",
                formFfupChangeTelNum: "Follow-up on Change of Telephone Number requests processed within 24-48 hours (within SLA) or after 48 hours (beyond SLA) from the SO creation date",
                formFfupChangeTelUnit: "Follow-up on Change of Telephone Unit requests processed within 24-48 hours (within SLA) or after 48 hours (beyond SLA) from the SO creation date",
                formFfupDiscoVas: "Follow-up on any VAS Disconnection requests processed within 7 calendar days (within SLA) or after (beyond SLA) from the SO creation date",
                formFfupDispute: "Follow-up on any Bill Adjustment requests, such as non-service rebate, rentals, or usage, processed within 24 hours (within SLA) or after 24 hours (beyond SLA) from the SO/SR creation date",
                formFfupDowngrade: "Follow-up on Downgrade requests processed within 24–48 hours (within SLA) or beyond 48 hours (beyond SLA) for regular downgrades, and within 3–5 working days (within SLA) or beyond 5 working days (beyond SLA) for downgrades with Cignal inclusion",
                formFfupDDE: "Follow-up on Due Date Extension requests processed within 24 hours (within SLA) or beyond 24 hours (beyond SLA) from the SO creation date",
                formFfupInmove: "Follow-up on Inmove requests processed within 5 calendar days from the SO creation date (within SLA) or after 5 calendar days (beyond SLA)",
                formFfupMigration: "Follow-up on Migration requests processed within 5 calendar days (within SLA) or after 5 calendar days (beyond SLA) from SO issuance",
                formFfupMisappPay: "Follow-up on disputes for Misapplied Payment requests, within SLA if processed within 5 days from the processed date, beyond SLA if processed after 5 days",
                formFfupNewApp: "Follow-up on New Application requests, within SLA if processed within 5 calendar days from the processed date, beyond SLA if processed after 5 calendar days",
                formFfupOcular: "Follow-up on Ocular Inspection/Visit requests, within SLA if processed within 1 day from the requested date, beyond SLA if processed after 1 day",
                formFfupOverpay: "Follow-up on disputes for Overpayment requests, within SLA if processed within 5 days from the processed date, beyond SLA if processed after 5 days",
                formFfupPermaDisco: "Follow-up on Permanent Disconnection requests processed within 7 calendar days (within SLA) or after (beyond SLA) from the SO issuance",
                formFfupRenew: "Follow-up on Reconnection from PD requests: considered within SLA if made within 5 calendar days from SO issuance, and beyond SLA if made after 5 calendar days",
                formFfupResume: "Follow-up on Reconnection from TD requests: considered within SLA if made within 24-48 hours for churn or within 2 hours for regular payment, and beyond SLA if made after 48 hours for churn or after 2 hours for regular payment",
                formFfupUnbar: "Follow-up on Reconnection from CK requests: considered within SLA if made within 2 hours upon SO issuance and beyond SLA if made after 2 hours",
                formFfupCustDependency: "Follow up on refund requests from customers who choose not to proceed with their application. Requests are considered within SLA if made within 15 days from the MS Form submission date; otherwise, tag as beyond SLA.",
                formFfupAMSF: "Follow up on refund requests for cancelled new applications. Requests are considered within SLA if made within 15 days from the MS Form submission date; otherwise, tag as beyond SLA.",
                formFfupFinalAcc: "Follow up on refund requests with visible disputes on the account (Final Account). Requests are considered within SLA if made within 15 days; otherwise, tag as beyond SLA.",
                formFfupOverpayment: "Follow up on refund requests where the account shows a payment equal to or greater than the MSF. Requests are considered within SLA if made within 15 days; otherwise, tag as beyond SLA.",
                formFfupWrongBiller: "Follow up on refund requests for payments made to PLDT Inc. by mistake under the wrong biller. Requests are considered within SLA if made within 15 days; otherwise, tag as beyond SLA.",
                formFfupReloc: {
                    main: "Follow-up on relocation requests.",
                    sub: [
                        "For activation cases, requests are considered within SLA if the service has been installed and is awaiting activation within 24 to 48 hours, and beyond SLA if over 5 calendar days.",
                        "For all other findings, requests are considered within SLA if made within 5 calendar days; otherwise, tag as beyond SLA."
                    ]
                },
                formFfupRelocCid: "Follow-up on relocation requests (CID Creation or address validation). Considered within SLA if made within 5 calendar days; otherwise, tag as beyond SLA.",
                formFfupSpecialFeat: "Follow-up on special features activation or deactivation requests. Considered within SLA if made within 24 to 48 hours; otherwise, tag as beyond SLA.",
                formFfupSAO: "Follow-up on SAO 500 activation requests.",
                formFfupTempDisco: "Follow-up on temporary disconnection (VTD/HTD) requests. Considered within SLA if made within 24 to 48 hours; otherwise, tag as beyond SLA.",
                formFfupUP: "Follow-up on unreflected or unposted payments on the account. Requests are considered within SLA if made within 5 calendar days, and beyond SLA if more than 15 business days have passed (for cases with a created payment dispute for unreflected payments).",
                formFfupUpgrade: "Follow-up on upgrade requests. Considered within SLA if made within 24 to 48 hours for regular upgrades or within 3 to 5 working days for upgrades with Cignal inclusion; otherwise, tag as beyond SLA.",
                formFfupVasAct: "Follow-up on VAS activation requests. Considered within SLA if made within 48 hours; otherwise, tag as beyond SLA.",
                formFfupVasDel: "Follow-up on VAS delivery requests. Refer to the applicable SLA for proper status tagging.",
                formFfupReroute: "Follow-up on wire re-routing requests already handled by a technician. Within SLA if made within 5 calendar days; otherwise, beyond SLA.",
                formFfupWT: "Follow-up on withholding tax adjustment requests on the account if already created. Tag as beyond SLA if over one billing cycle, with a processed dispute for tax adjustment."
            };

            const ul = document.createElement("ul");
            ul.className = "checklist";

            if (definitions[selectedValue]) {
                const definition = definitions[selectedValue];
                const li = document.createElement("li");

                if (typeof definition === "string") {
                    li.textContent = definition;
                } else if (typeof definition === "object" && definition.main && Array.isArray(definition.sub)) {
                    li.textContent = definition.main;

                    const subUl = document.createElement("ul");
                    subUl.className = "checklist-sub"; 

                    definition.sub.forEach(subItem => {
                        const subLi = document.createElement("li");
                        subLi.textContent = subItem;
                        subUl.appendChild(subLi);
                    });

                    li.appendChild(subUl);
                }

                ul.appendChild(li);
            }

            descriptionDiv.appendChild(ul);
            td.appendChild(descriptionDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            if (["requestType", "ownership", "custAuth", "findings", "disputeType", "approver", "vasProduct"].includes(field.name)) {
                row.style.display = "none";
            } else {
                row.style.display = "table-row";
            }
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "ownership" || field.name === "findings") {
                    input.id = field.name;
                }

                field.options.forEach((optionText, index) => {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;
                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }
                    input.appendChild(option);
                });

                if (field.name === "ownership" || field.name === "findings") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        table.appendChild(createDefinitionRow());
        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        // Hide/Show Fields
        const selectFieldsToShow = [
            "formFfupDiscoVas", "formFfupDowngrade", "formFfupInmove", "formFfupMigration", "formFfupNewApp", "formFfupPermaDisco", "formFfupRenew", "formFfupResume", "formFfupUnbar", "formFfupReloc", "formFfupTempDisco", "formFfupUpgrade"
        ];

        if (selectedValue === "formFfupChangeOwnership") {
            showFields(["requestType"]);
        } else if (selectedValue === "formFfupChangeTelNum") {
            showFields(["ownership", "custAuth", "findings"]);
        } else if (selectFieldsToShow.includes(selectedValue)) {
            showFields(["custAuth", "findings"]);
        } else if (selectedValue === "formFfupDispute") {
            showFields(["disputeType", "approver"]);
        } else if (selectedValue === "formFfupOcular") {
            showFields(["findings"]);
        } else if (selectedValue === "formFfupSpecialFeat") {
            showFields(["requestType", "custAuth"]);
        } else if (selectedValue === "formFfupSAO") {
            showFields(["custAuth", "findings"]);
            hideSpecificFields(["ffupStatus"])
        } else if (selectedValue === "formFfupVasDel") {
            showFields(["vasProduct"]);
        }

        // Request Type options based on selectedValue
        const reqTypeSelect = document.querySelector('select[name="requestType"]');
        const reqTypeOptions = [
            "",
            "Activation", 
            "Deactivation", 
            "Supersedure retain Account number",
            "Supersedure with change account number"
        ];

        function updateReqTypeOptions() {
            while (reqTypeSelect.options.length > 0) {
                reqTypeSelect.remove(0);
            }

            let filteredReqType = [];

            const mapping = {
                "formFfupChangeOwnership": [
                    "Supersedure retain Account number",
                    "Supersedure with change account number"
                ],
                "formFfupSpecialFeat": [
                    "Activation",
                    "Deactivation"
                ],
            };

            if (mapping[selectedValue]) {
                filteredReqType = reqTypeOptions.filter(opt => mapping[selectedValue].includes(opt) || opt === "");
            } else {
                filteredReqType = [...reqTypeOptions];
            }

            filteredReqType.forEach((text, index) => {
                const option = document.createElement("option");
                option.value = text;
                option.textContent = text;
                if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                }
                reqTypeSelect.appendChild(option);
            });
        }

        updateReqTypeOptions(reqTypeSelect.value);

        // Approver options based on Dispute Type
        const disputeTypeSelect = document.querySelector('select[name="disputeType"]');
        const approverSelect = document.querySelector('select[name="approver"]');

        const allApproverOptions = [
            "", 
            "Account Admin", 
            "Agent (P0-P1,000)",
            "Cust TL (P1,001-P2,000)",
            "Cust Sup (P2,001 and Up)",
            "Cust Head (P5,001-P20,000)"
        ];

        function updateApproverOptions(disputeType) {
            while (approverSelect.options.length > 0) {
                approverSelect.remove(0);
            }

            let filtered = [];

            if (disputeType === "Rebate Non Service") {
                filtered = allApproverOptions.filter(opt => opt !== "Account Admin");
            } else if (disputeType === "Usage MSF") {
                filtered = allApproverOptions.filter(opt => opt === "" || opt === "Account Admin");
            } else {
                filtered = [...allApproverOptions];
            }

            filtered.forEach((text, index) => {
                const option = document.createElement("option");
                option.value = text;
                option.textContent = text;
                if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                }
                approverSelect.appendChild(option);
            });
        }

        disputeTypeSelect.addEventListener("change", () => {
            updateApproverOptions(disputeTypeSelect.value);
        });

        // Findings options based on selectedValue
        const findingsSelect = document.querySelector('select[name="findings"]');
        const allFindingsOptions = [
            "",
            "Activation", 
            "Activation Task", 
            "Activation Task (DTS)",
            "CCAM (Processing)",
            "DeActivation Task",
            "No SO Generated", 
            "No SO Generated (DTS)",
            "Opsim",
            "PMA", 
            "RSO Customer", 
            "RSO PLDT", 
            "System Task / Stuck SO",
            "System Task / Stuck SO (DTS)",
            "Tech Repair - Data"
        ];

        function updateFindingsOptions() {
            while (findingsSelect.options.length > 0) {
                findingsSelect.remove(0);
            }

            let filteredFindings = [];

            const mapping = {
                "formFfupChangeTelNum": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupDiscoVas": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupDowngrade": [
                    "Activation",
                    "No SO Generated",
                    "Opsim",
                    "RSO Customer",
                    "RSO PLDT",
                    "System Task / Stuck SO"
                ],
                "formFfupInmove": [
                    "No SO Generated",
                    "Opsim",
                    "RSO Customer",
                    "RSO PLDT",
                    "System Task / Stuck SO"
                ],
                "formFfupMigration": [
                    "Activation",
                    "No SO Generated",
                    "Opsim",
                    "PMA",
                    "RSO Customer",
                    "RSO PLDT",
                    "System Task / Stuck SO"
                ],
                "formFfupNewApp": [
                    "Activation",
                    "No SO Generated",
                    "Opsim",
                    "PMA",
                    "RSO Customer",
                    "RSO PLDT",
                    "System Task / Stuck SO"
                ],
                "formFfupOcular": [
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupPermaDisco": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupRenew": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupResume": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupUnbar": [
                    "Activation Task (DTS)",
                    "No SO Generated (DTS)",
                    "System Task / Stuck SO (DTS)"
                ],
                "formFfupReloc": [
                    "Activation",
                    "No SO Generated",
                    "Opsim",
                    "PMA",
                    "RSO Customer",
                    "RSO PLDT",
                    "System Task / Stuck SO"
                ],
                "formFfupSAO": [
                    "Activation",
                    "System Task / Stuck SO",
                    "Tech Repair - Data"
                ],
                "formFfupTempDisco": [
                    "CCAM (Processing)",
                    "DeActivation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "formFfupUpgrade": [
                    "Activation",
                    "No SO Generated",
                    "Opsim",
                    "RSO Customer",
                    "RSO PLDT",
                    "System Task / Stuck SO"
                ],
            };

            if (mapping[selectedValue]) {
                filteredFindings = allFindingsOptions.filter(opt => mapping[selectedValue].includes(opt) || opt === "");
            } else {
                filteredFindings = [...allFindingsOptions];
            }

            filteredFindings.forEach((text, index) => {
                const option = document.createElement("option");
                option.value = text;
                option.textContent = text;
                if (index === 0) {
                    option.disabled = true;
                    option.selected = true;
                    option.style.fontStyle = "italic";
                }
                findingsSelect.appendChild(option);
            });
        }

        updateFindingsOptions(findingsSelect.value);

        hideSpecificFields(["declineReason", "notEligibleReason"]);

        const upsell = document.querySelector("[name='upsell']");
        upsell.addEventListener("change", () => handleUpsellChange(upsell));

    }

    // Others
    else if (othersForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            descriptionDiv.appendChild(header);

            const definitions = {
                othersWebForm: "Refer customer to Self Care Channel/PLDT Care Web Forms",
                othersEntAcc: "Concern or account is Enterprise",
                othersHomeBro: "Customer concern is about Home Bro",
                othersSmart: "For SMART related concerns",
                othersSME177: "Customer concern is about Enterprise",
                othersAO: "Add on service for Home Fiber Broadband subscribers that will provide alternative LTE connection for possible outages",
                othersRepair: "Complaint about technical issue that will be transfer to the technical team",
                othersBillAndAcc: "Request regarding aftersales services such as relocation, upgrade, downgrade, etc.",
                othersUT: "Customer failed to provide correct account authentication (failed to provide primary and secondary authentication) or incomplete transaction (Casual Mention)"
            };

            const ul = document.createElement("ul");
            ul.className = "checklist";

            if (definitions[selectedValue]) {
                const li = document.createElement("li");
                li.textContent = definitions[selectedValue];
                ul.appendChild(li);
            }

            descriptionDiv.appendChild(ul);

            td.appendChild(descriptionDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        fields.forEach((field, index) => {
            if (field.name === "custConcern") {
                table.appendChild(createDefinitionRow());
            }

            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    } else if (selectedValue === "othersToolsDown") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Affected Tool", type: "select", name: "affectedTool", options: [
                "", 
                "Clarity/CEP", 
                "CSP",
                "FUSE",
                "Kenan",
                "Other PLDT tools"
            ]},
            { label: "Specify Other PLDT Tool", type: "text", name: "otherTool"},
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "E-Solve/Snow Ticket #", type: "text", name: "eSnowTicketNum"},
        ];

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Unsuccessful transaction due to tools-related issue";
            ul.appendChild(li1);

            instructionsDiv.appendChild(ul);

            const requirementsHeader = document.createElement("p");
            requirementsHeader.textContent = "Requirements";
            requirementsHeader.className = "checklist-header";
            instructionsDiv.appendChild(requirementsHeader);

            const reqList = document.createElement("ul");
            reqList.className = "checklist";

            const req1 = document.createElement("li");
            req1.textContent = "Snow Ticket for Tool Downtime Issue";
            reqList.appendChild(req1);

            instructionsDiv.appendChild(reqList);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            if (field.name === "otherTool") {
                row.style.display = "none";
            }

            return row;
        }
        
        table.appendChild(createDefinitionRow()); 
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            nontechNotesButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const affectedTool = document.querySelector("[name='affectedTool']");

        affectedTool.addEventListener("change", () => {
            if (affectedTool.value === "Other PLDT tools") {
                showFields(["otherTool"]);
            } else {
                hideSpecificFields(["otherTool"]);
            }
        });

    } else if (selectedValue === "others164") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            // Endorsement  to TL or SME using this template
            { label: "Telephone Number", type: "text", name: "telNum164" },
            { label: "Customer/Caller Name", type: "text", name: "callerName" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Active Email Address", type: "text", name: "emailAdd" },
            { label: "Address/Landmarks", type: "textarea", name: "address" },
            { label: "Concern", type: "select", name: "concern164", options: [
                "", 
                "Broken Manhole Cover", 
                "Broken Pole", 
                "Cut Cable", 
                "Cut Pole", 
                "Damaged Conduit Pipe", 
                "Dangling Wire", 
                "Detached Alley Arm", 
                "Detached Protector Box", 
                "Detached Terminal Box/DP Box", 
                "Down Cable", 
                "Down Pole", 
                "Down Wire", 
                "Hanging Alley Arm", 
                "Hanging Pole Attachment", 
                "Leaning Pole", 
                "Missing Manhole Cover", 
                "Open Cabinet Box", 
                "Open Manhole", 
                "Open Protector Box", 
                "Open Terminal Box/DP Box", 
                "Relocation of Cabinet Box", 
                "Relocation of Guywire", 
                "Relocation of Pole", 
                "Removal of Cabinet Box", 
                "Removal of Guywire", 
                "Removal of Idle Wires", 
                "Removal of Pole", 
                "Rotten Pole", 
                "Sagging Cable", 
                "Sagging Wire", 
                "Stolen Cable", 
                "Stolen Electric Meter", 
                "Transferring of Pole Attachment"
            ] },
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInstructions"; 

            const header = document.createElement("p");
            header.textContent = "Reference Link";
            header.className = "instructions-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            url1 = "https://pldt365.sharepoint.com/sites/LIT365/Advisories/Pages/PLDT_ENDORSEMENT_PROCESS_FROM_171_HOTLINE_TO_HOTLINE_164.aspx";

            link1.textContent = "Customer Care Handling Process for substandard PLDT Outside Plant Facilities (Update 01)";
            link1.style.color = "lightblue";
            link1.href = "#";

            link1.addEventListener("click", (event) => {
                event.preventDefault();
                window.open(url1, "_blank", "width=1500,height=800,scrollbars=yes,resizable=yes");
            });

            li5.appendChild(link1);
            li5.appendChild(document.createTextNode(" for Work Instruction"));
            ul.appendChild(li5);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createDefinitionRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivDefinition"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "definition-header";
            instructionsDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Customers report substandard PLDT Outside Plant Facilities (e.g., dangling wires, leaning posts, sagging cables)";
            ul.appendChild(li1);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function insertToolLabel(fields, label, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName),
                0,
                {
                    label: `// ${label}`,
                    type: "toolLabel",
                    name: `toolLabel-${label.toLowerCase().replace(/\s/g, "-")}`,
                    relatedTo: relatedFieldName
                }
            );
        }

        const enhancedFields = [...fields];

        insertToolLabel(enhancedFields, "Endorse to TL or SME using this template", "telNum164")

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "toolLabel") {
                const toolLabelRow = document.createElement("tr");
                toolLabelRow.classList.add("tool-label-row");
                toolLabelRow.dataset.relatedTo = field.relatedTo;

                const td = document.createElement("td");
                const div = document.createElement("div");
                div.className = "formToolLabel";
                div.textContent = field.label.replace(/^\/\/\s*/, "");

                td.appendChild(div);
                toolLabelRow.appendChild(td);
                return toolLabelRow;
            } else if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                if (field.name === "onuRunStats") {
                    input.id = field.name;
                }
                field.options.forEach((optionText, index)=> {
                    const option = document.createElement("option");
                    option.value = optionText;
                    option.textContent = optionText;

                    if (index === 0) {
                        option.disabled = true;
                        option.selected = true;
                        option.style.fontStyle = "italic";
                    }

                    input.appendChild(option);
                });
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = (field.name === "remarks") ? 5 : 2;
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
            }

            divInput.appendChild(label);
            divInput.appendChild(input);
            td.appendChild(divInput);
            row.appendChild(td);

            return row;
        }

        table.appendChild(createInstructionsRow()); 
        table.appendChild(createDefinitionRow());
        enhancedFields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            bantayKableButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        function copyFrm1Values() {
            const custName = document.querySelector("#cust-name").value;
            const landlineNum = document.querySelector("#landline-num").value;

            const telNum164Field = form2Container.querySelector("input[name='telNum164']");
            const callerNameField = form2Container.querySelector("input[name='callerName']");

            if (telNum164Field) telNum164Field.value = landlineNum;
            if (callerNameField) callerNameField.value = custName;
        }

        copyFrm1Values();

        document.querySelector("#cust-name").addEventListener("input", copyFrm1Values);
        document.querySelector("#landline-num").addEventListener("input", copyFrm1Values);
    }
}

document.getElementById("selectIntent").addEventListener("change", createIntentBasedForm);

// Create Buttons helper
function createButtons(buttonLabels, buttonHandlers) {
    const vars = initializeVariables();

    const channelField = document.getElementById("channel").value;
    const lobField = document.getElementById("lob").value;

    const isHotline = channelField === "CDT-HOTLINE";
    const isTech = lobField === "TECH";

    const buttonTable = document.createElement("table");
    let buttonIndex = 0;

    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const row = document.createElement("tr");
        let hasButton = false;

        for (let colIndex = 0; colIndex < 4; colIndex++) {
            const cell = document.createElement("td");

            while (buttonIndex < buttonLabels.length) {
                let label = buttonLabels[buttonIndex];

                // =============================
                // 🔹 HOTLINE RULES
                // =============================
                if (isHotline) {
                    if (label === "SF/FUSE") {
                        label = "FUSE";
                    }

                    if (label === "SF Tagging") {
                        label = "Tagging";
                    }
                }

                if (!isTech) {
                    if (label === "SF Tagging") {
                        label = "Tagging";
                    }
                }

                // =============================
                // 🔹 Intent-based label tweak
                // =============================
                if (vars.selectedIntent === "formFfupRepair" && label === "SF/FUSE") {
                    label = "SF & FUSE";
                }

                // =============================
                // 🔹 Tech + Hotline rule
                // =============================
                if (isHotline && isTech && label === "Tagging") {
                    buttonIndex++;
                    continue;
                }

                // =============================
                // 🔹 CEP / MORE DROPDOWNS
                // =============================
                if (
                    (label === "CEP" && vars.selectedIntent !== "formFfupRepair") ||
                    (label === "More")
                ) {
                    const dropdown = document.createElement("div");
                    dropdown.classList.add("dropdown");

                    if (label === "More") {
                        dropdown.classList.add("align-right");
                    }

                    const mainButton = document.createElement("button");
                    mainButton.textContent = `${label} ⮝`;
                    mainButton.classList.add("form2-button", "dropdown-toggle");

                    const dropdownContent = document.createElement("div");
                    dropdownContent.classList.add("dropdown-content");

                    let subOptions = [];

                    // CEP OPTIONS
                    if (label === "CEP") {
                        subOptions = [
                            { label: "Title", action: () => cepButtonHandler(true, ["Title"]) },
                            { label: "Description", action: () => cepButtonHandler(true, ["Description"]) },
                            { label: "Case Notes", action: () => cepButtonHandler(true, ["Case Notes in Timeline"]) },
                            { label: "Special Inst.", action: () => cepButtonHandler(true, ["Special Instructions"]) }
                        ];
                    }

                    // MORE OPTIONS (NON-HOTLINE ONLY)
                    else if (label === "More") {
                        subOptions = [];

                        subOptions.push(
                            { label: "🔄 Reset", action: () => resetButtonHandler() }
                        );

                        // Hotline: NO SF Tagging
                        if (!isHotline) {
                            // Only show SF Tagging for TECH (if that's your rule)
                            if (isTech) {
                                subOptions.push({
                                    label: "🗂️ SF Tagging",
                                    action: () => sfTaggingButtonHandler()
                                });
                            }
                        }

                        subOptions.push(
                            { label: "💾 Save", action: () => saveFormData() }
                        );
                    }

                    subOptions.forEach(option => {
                        const subBtn = document.createElement("button");
                        subBtn.textContent = option.label;
                        subBtn.onclick = option.action;
                        dropdownContent.appendChild(subBtn);
                    });

                    dropdown.appendChild(mainButton);
                    dropdown.appendChild(dropdownContent);
                    cell.appendChild(dropdown);
                    row.appendChild(cell);

                    mainButton.addEventListener("click", function (e) {
                        e.stopPropagation();
                        dropdownContent.classList.toggle("show");
                        mainButton.classList.toggle("active");
                    });

                    dropdown.addEventListener("mouseleave", function () {
                        dropdownContent.classList.remove("show");
                        mainButton.classList.remove("active");
                    });

                    document.addEventListener("click", function (e) {
                        if (!dropdown.contains(e.target)) {
                            dropdownContent.classList.remove("show");
                            mainButton.classList.remove("active");
                        }
                    });

                    buttonIndex++;
                    hasButton = true;
                    break;
                }

                // =============================
                // 🔹 DEFAULT BUTTON
                // =============================
                const button = document.createElement("button");
                button.textContent = label;
                button.onclick = buttonHandlers[buttonIndex];
                button.classList.add("form2-button");

                cell.appendChild(button);
                row.appendChild(cell);

                buttonIndex++;
                hasButton = true;
                break;
            }

            if (!cell.hasChildNodes()) {
                row.appendChild(document.createElement("td"));
            }
        }

        if (hasButton) {
            buttonTable.appendChild(row);
        }
    }

    return buttonTable;
}

// Notes Generation helper
function optionNotAvailable() {
    const vars = initializeVariables();

    if (isFieldVisible("facility")) {
        if (vars.facility === "") {
            showAlert("Please complete the form.");
            return true;
        }
    }

    if (isFieldVisible("issueResolved")) {
        if (vars.issueResolved === "") {
            alert('Please indicate whether the issue is resolved or not.');
            return true;
        } else if (vars.issueResolved !=="Yes" && vars.issueResolved !=="No - for Ticket Creation") {
            alert('This option is not available. Please use Salesforce or FUSE button.');
            return true;
        }
    }

    return false;
}

// Generating Follow-up Notes
function ffupButtonHandler(showFloating = true, enableValidation = true, includeSpecialInst = true, showSpecialInstSection = true) {
    const vars = initializeVariables();

    const missingFields = [];
    if (!vars.channel) missingFields.push("Channel");
    if (!vars.pldtUser) missingFields.push("PLDT Username");

    if (enableValidation && missingFields.length > 0) {
        showAlert(
            `Please fill out the following fields:\n\n${missingFields.join("\n")}*`
        );
        return;
    }

    function constructOutputFFUP(fields) {
        const seenFields = new Set();
        let output = "";

        const channel = getFieldValueIfVisible("selectChannel");
        const pldtUser = getFieldValueIfVisible("pldtUser");
        if (channel && pldtUser) {
            output += `${channel}_${pldtUser}\n`;
            seenFields.add("selectChannel");
            seenFields.add("pldtUser");
        } else if (channel) {
            output += `Channel: ${channel}\n`;
            seenFields.add("selectChannel");
        }

        let remarks = "";
        let offerALS = "";
        let sla = "";

        fields.forEach(field => {
            const fieldElement = document.querySelector(`[name="${field.name}"]`);
            let value = getFieldValueIfVisible(field.name);

            if (!value || seenFields.has(field.name)) return;

            seenFields.add(field.name);

            if (fieldElement && fieldElement.tagName.toLowerCase() === "textarea") {
                value = value.replace(/\n/g, "/ ");
            }

            switch (field.name) {
                case "remarks":
                    remarks = value;
                    break;
                
                case "alsPackOffered":
                    output += `${field.label?.toUpperCase() || field.name.toUpperCase()}: Offered ${value}\n`;
                    break;

                case "offerALS":
                    offerALS = value;

                    let alsStatusNotes = "";

                    if (value === "Offered ALS/Accepted") {
                        alsStatusNotes = "Offered ALS and Customer Accepted";
                    } else if (value === "Offered ALS/Declined") {
                        alsStatusNotes = "Offered ALS but Customer Declined";
                    } else if (value === "Offered ALS/No Confirmation") {
                        alsStatusNotes = "Offered ALS but No Confirmation";
                    } else if (value === "Previous Agent Already Offered ALS") {
                        alsStatusNotes = "Prev Agent Already Offered ALS";
                    }

                    if (alsStatusNotes) {
                        offerALS = alsStatusNotes;
                    }
                    break;

                case "sla":
                    sla = value;
                    break;

                default:
                    output += `${field.label?.toUpperCase() || field.name.toUpperCase()}: ${value}\n`;
            }
        });

        const issueResolvedValue = document.querySelector('[name="issueResolved"]')?.value || "";

        const filteredRemarks = [remarks, sla, offerALS].filter(field => field?.trim());

        if (issueResolvedValue === "Yes") {
            filteredRemarks.push("Resolved");
        }

        const finalRemarks = filteredRemarks.join(" / ");

        if (finalRemarks) {
        output += `REMARKS: ${finalRemarks}`;
        }

        return output;
    }

    const fields = [
        { name: "selectChannel" },
        { name: "pldtUser" },
        { name: "sfCaseNum", label: "SF#" },
        { name: "cepCaseNumber", label: "Case #" },
        { name: "pcNumber", label: "Parent Case" },
        { name: "ticketStatus", label: "Case Status" },
        { name: "ffupCount", label: "No. of Follow-Up(s)" },
        { name: "statusReason", label: "STATUS REASON" },
        { name: "subStatus", label: "SUB STATUS" },
        { name: "queue", label: "QUEUE" },
        { name: "ticketAge", label: "Ticket Age" },
        { name: "investigation1", label: "Investigation 1" },
        { name: "investigation2", label: "Investigation 2" },
        { name: "investigation3", label: "Investigation 3" },
        { name: "investigation4", label: "Investigation 4" },
        { name: "remarks", label: "Remarks" },
        { name: "sla", label: "SLA" },
    ];

    const ffupCopiedText = constructOutputFFUP(fields).toUpperCase();
    const specialInstCopiedText1 = (specialInstButtonHandler(false) || "").toUpperCase();
    const specialInstCopiedText2 = (specialInstButtonHandler(true) || "").toUpperCase();

    let combinedFollowUpText = ffupCopiedText;

    if (includeSpecialInst && specialInstCopiedText1.trim()) {
        combinedFollowUpText += `\n\n${specialInstCopiedText1}`;
    }

    const sections = [combinedFollowUpText];
    const sectionLabels = ["Follow-Up Case Notes"];

    if (showSpecialInstSection && specialInstCopiedText2.trim()) {
        sections.push(specialInstCopiedText2);
        sectionLabels.push("Special Instructions");
    }

    if (showFloating) {
        showFfupFloatingDiv(sections, sectionLabels);
    }

    return sections.join("\n\n");

}

function showFfupFloatingDiv(sections, sectionLabels) {
    const floatingDiv = document.getElementById("floatingDiv");
    const overlay = document.getElementById("overlay");
    const copiedValues = document.getElementById("copiedValues");

    if (!floatingDiv || !overlay || !copiedValues) {
        console.error("Required DOM elements are missing");
        return;
    }

    let floatingDivHeader = document.getElementById("floatingDivHeader");
    if (!floatingDivHeader) {
        floatingDivHeader = document.createElement("div");
        floatingDivHeader.id = "floatingDivHeader";
        floatingDiv.appendChild(floatingDivHeader);
    }

    floatingDivHeader.textContent = "CASE DOCUMENTATION: Click the text to copy!";

    copiedValues.innerHTML = "";

    sections.forEach((sectionText, index) => {
        const label = document.createElement("div");
        label.style.fontWeight = "bold";
        label.style.marginTop = index === 0 ? "0" : "10px";
        label.textContent = sectionLabels[index] || `SECTION ${index + 1}`;
        copiedValues.appendChild(label);

        const section = document.createElement("div");
        section.style.marginTop = "5px";
        section.style.padding = "10px";
        section.style.border = "1px solid #ccc";
        section.style.borderRadius = "4px";
        section.style.cursor = "pointer";
        section.style.whiteSpace = "pre-wrap";
        section.style.transition = "background-color 0.2s, transform 0.1s ease";
        section.classList.add("noselect");

        section.textContent = sectionText;

        section.addEventListener("mouseover", () => {
        section.style.backgroundColor = "#edf2f7";
        });
        section.addEventListener("mouseout", () => {
        section.style.backgroundColor = "";
        });

        section.onclick = () => {
        section.style.transform = "scale(0.99)";
        navigator.clipboard.writeText(sectionText).then(() => {
            section.style.backgroundColor = "#ddebfb";
            setTimeout(() => {
            section.style.transform = "scale(1)";
            section.style.backgroundColor = "";
            }, 150);
        }).catch(err => {
            console.error("Copy failed:", err);
        });
        };

        copiedValues.appendChild(section);
    });

    overlay.style.display = "block";
    floatingDiv.style.display = "block";

    setTimeout(() => {
        floatingDiv.classList.add("show");
    }, 10);

    const closeButton = document.getElementById("okButton");
    closeButton.textContent = "Close";

    closeButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
        floatingDiv.style.display = "none";
        overlay.style.display = "none";
        }, 300);
    };
}

// Generating CEP Notes
function cepCaseTitle() {
    const vars = initializeVariables();

    let caseTitle = "";

    const intentGroups = {
        group1: { intents: ["form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7"], title: "NO DIAL TONE AND NO INTERNET CONNECTION" },
        group2: { intents: ["form101_1", "form101_2", "form101_3", "form101_4"], title: "NO DIAL TONE" },
        group3: { intents: ["form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7"], title: "NOISY LINE" },
        group4: { intents: ["form103_1", "form103_2", "form103_3"], title: "CANNOT MAKE CALLS" },
        group5: { intents: ["form103_4", "form103_5"], title: "CANNOT RECEIVE CALLS" },
        group6: { intents: ["form500_1", "form500_2"], title: "NO INTERNET CONNECTION" },
        group7: { intents: ["form500_3", "form500_4"], title: () => vars.meshtype.toUpperCase() },
        group8: { intents: ["form501_1", "form501_2", "form501_3"], title: "SLOW INTERNET CONNECTION" },
        group9: { intents: ["form501_4"], title: "FREQUENT DISCONNECTION" },
        group10: { intents: ["form501_5"], title: "Gaming - High Latency" },
        group11: { intents: ["form501_5"], title: "Gaming - Lag" },
        group12: { intents: ["form502_1", "form502_2"], title: "SELECTIVE BROWSING" },
        group13: { intents: ["form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8"], title: "IPTV NO AUDIO VIDEO OUTPUT", useAccountType: true },
        group14: { intents: ["form511_1", "form511_2", "form511_3", "form511_4", "form511_5"], title: "IPTV POOR AUDIO VIDEO QUALITY", useAccountType: true },
        group15: { intents: ["form512_1", "form512_2", "form512_3"], title: "IPTV MISSING SET-TOP-BOX FUNCTIONS", useAccountType: true },
        group16: { intents: ["form300_1", "form300_2", "form300_3"], title: "REQUEST MODEM/ONU GUI ACCESS", useAccountType: true },
        group17: { intents: ["form300_4", "form300_5"], title: "REQUEST CHANGE MODEM ONU CONNECTION MODE", useAccountType: true },
        group18: { intents: ["form300_6"], title: "REQUEST DATA BIND PORT", useAccountType: true },
        group19: { intents: ["form300_7"], title: "REQUEST FOR PUBLIC IP", useAccountType: true },
        group20: { intents: ["form300_8"], title: "REQUEST FOR PRIVATE IP", useAccountType: true },
        group21: { intents: ["formStrmApps_1"], title: "EUFY", useGamma: false },
        group22: { intents: ["formStrmApps_2"], title: "STREAM TV", useGamma: false },
        group23: { intents: ["formStrmApps_3"], title: "NETFLIX", useGamma: false },
        group24: { intents: ["formStrmApps_4"], title: "VIU", useGamma: false },
        group25: { intents: ["formStrmApps_5"], title: "HBO MAX", useGamma: false },
        group26: { intents: ["form500_6"], title: "NO SIM LIGHT", alwaysOn: true },
    };

    for (const group of Object.values(intentGroups)) {
        if (group.intents.includes(vars.selectedIntent)) {
            const prefix = group.useAccountType
                ? (vars.accountType === "RADIUS " ? "GAMMA " : "")
                : (group.useGamma === false ? "" : (vars.facility === "Fiber - Radius" ? "GAMMA " : ""));

            let title;
            if (vars.selectedIntent === "form501_5" || vars.selectedIntent === "form501_6") {
                if ([
                    "Individual Trouble", 
                    "Network Trouble - High Latency", 
                    "Network Trouble - Slow/Intermittent Browsing", 
                    "High Latency"
                ].includes(vars.investigation4)) {
                    title = "SLOW INTERNET CONNECTION";
                } else if (vars.investigation4 === "Cannot Reach Specific Website") {
                    title = "HIGH LATENCY OR LAG GAMING";
                } else {
                    showAlert("Please fill out Investigation 4 to proceed.");
                    return "";
                }
            } else {
                title = typeof group.title === "function" ? group.title() : group.title;
            }

            if (group.alwaysOn) {
                caseTitle = `ALWAYS ON-${vars.channel} - ${title}`;
            } else {
                caseTitle = `${prefix}${vars.channel} - ${title}`;
            }

            break;
        }
    }

    return caseTitle;

}

function cepCaseDescription(showAddlDetails = true) {
    const vars = initializeVariables();

    const techIntents = [
        "form100_1","form100_2","form100_3","form100_4","form100_5","form100_6","form100_7",
        "form101_1","form101_2","form101_3","form101_4",
        "form102_1","form102_2","form102_3","form102_4","form102_5","form102_6","form102_7",
        "form103_1","form103_2","form103_3","form103_4","form103_5",
        "form500_1","form500_2","form500_3","form500_4","form500_6",
        "form501_1","form501_2","form501_3","form501_4","form501_5",
        "form502_1","form502_2",
        "form510_1","form510_2","form510_3","form510_4","form510_5","form510_6","form510_7","form510_8",
        "form511_1","form511_2","form511_3","form511_4","form511_5",
        "form512_1","form512_2","form512_3",
        "formStrmApps_1","formStrmApps_2","formStrmApps_3","formStrmApps_4","formStrmApps_5",
        "form300_1","form300_2","form300_3","form300_4","form300_5","form300_6","form300_7", "form300_8"
    ];

    let caseDescription = "";
    if (!techIntents.includes(vars.selectedIntent)) return caseDescription;

    const selectedValue = vars.selectedIntent;
    const selectedIntent = document.querySelector("#selectIntent")?.value.trim() || "";
    const reso = document.querySelector('[name="resolution"]')?.value.trim() || "";
    const testedOk = document.querySelector('[name="testedOk"]')?.value.trim() || "";
    const selectedOption = document.querySelector(`#selectIntent option[value="${selectedValue}"]`);
    const investigation3Index = document.querySelector('[name="investigation3"]');
    const visibleFields = [];

    const getValueIfVisible = (name) => {
        const el = document.querySelector(`[name="${name}"]`);
        if (!el || !isFieldVisible(name)) return "";
        const val = el.value?.trim();
        return val ? val : "";
    };

    if (selectedOption) {
        const optionText = selectedValue === "form500_6"
            ? "Back-up wi-Fi not working - No Sim light"
            : selectedOption.textContent.trim();

        visibleFields.push(reso === "Tested Ok" ? `${optionText} - ${reso}` : optionText);
    }

    if (isFieldVisible("cvReading") && vars.cvReading) {
        visibleFields.push(vars.cvReading);
    } else if (
        vars.facility !== "Fiber - Radius" &&
        vars.accountType !== "RADIUS" &&
        isFieldVisible("investigation3") &&
        investigation3Index &&
        investigation3Index.selectedIndex > 0 &&
        vars.investigation3 &&
        !vars.investigation3.startsWith("Not Applicable")
    ) {
        visibleFields.push(investigation3Index.options[investigation3Index.selectedIndex].textContent);
    }

    if (getValueIfVisible("Option82")) 
        visibleFields.push(getValueIfVisible("Option82"));

    if (getValueIfVisible("rxPower"))
        visibleFields.push(`RX: ${vars.rxPower}`);

    if (
        vars.investigation1 === "Blinking/No PON/FIBR/ADSL" &&
        (!vars.investigation2 || vars.investigation2 === "Null Value") &&
        ["Failed to collect line card information", "Without Line Problem Detected"].includes(vars.investigation3) &&
        vars.investigation4 === "Individual Trouble" &&
        vars.onuSerialNum
    ) visibleFields.push(vars.onuSerialNum);

    const pushFormFields = (fields) => {
        fields.forEach(f => {
            const val = getValueIfVisible(f.name);
            if (val) visibleFields.push(f.label ? `${f.label}: ${val}` : val);
        });
    };

    if (showAddlDetails) {
        if (reso === "Tested Ok" || testedOk === "Yes") {
            if (selectedIntent === "form500_1") {
                pushFormFields([
                    { name: "dmsInternetStatus", label: "DMS Internet/Data Status" },
                    { name: "connectedDevices", label: "No of devices connected" },
                    { name: "dmsSelfHeal", label: "Self Heal Result" },
                    { name: "onuModel", label: "ONU Model" },
                    { name: "onuSerialNum", label: "SN" },
                    { name: "dmsWifiState", label: "DMS Wifi Status" }
                ]);
            } else if (selectedIntent === "form501_1" || selectedIntent === "form501_2") {
                pushFormFields([
                    { name: "dmsInternetStatus", label: "DMS Internet/Data Status" },
                    { name: "connectedDevices", label: "No of devices connected" },
                    { name: "dmsSelfHeal", label: "Self Heal Result" },
                    { name: "onuModel", label: "ONU Model" },
                    { name: "onuSerialNum", label: "SN" },
                    { name: "speedTestResult", label: "Initial Speedtest Result" },
                    { name: "bandsteering", label: "Bandsteering" },
                    { name: "saaaBandwidthCode", label: "NMS Skin BW Code" }
                ]);
            } else if (selectedIntent === "form502_1") {
                pushFormFields([
                    { name: "ipAddress", label: "IP Address" },
                    { name: "dmsInternetStatus", label: "DMS Internet/Data Status" },
                    { name: "connectedDevices", label: "No of devices connected" },
                    { name: "websiteURL", label: "Affected Site, Application or VPN" },
                    { name: "errMsg", label: "Error" },
                    { name: "vpnBlocking", label: "Possible VPN Blocking issue" },
                    { name: "vpnRequired", label: "Using VPN in accessing site or app" },
                    { name: "otherISP", label: "Result using other ISP" },
                    { name: "itSupport", label: "Has IT support" },
                    { name: "itRemarks", label: "IT Support Remarks" }
                ]);
            }
        }
    }

    if (getValueIfVisible("contactName"))
        visibleFields.push("CONTACT PERSON: " + vars.contactName);

    if (getValueIfVisible("cbr"))
        visibleFields.push("CBR: " + vars.cbr);

    if ((showAddlDetails && reso !== "Tested Ok") || testedOk === "No") {
        pushFormFields([
            { name: "availability", label: "PREFERRED DATE AND TIME" },
            { name: "address" },
            { name: "landmarks", label: "LANDMARK" },
            { name: "rptCount", label: "REPEATER" }
        ]);
    }

    if (getValueIfVisible("WOCAS"))
        visibleFields.push("WOCAS: " + vars.WOCAS);

    caseDescription = visibleFields.join("/ ");
    return caseDescription;
}

function cepCaseNotes() {
    const vars = initializeVariables();

    const techIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7", "form300_8",
        "form500_1", "form500_2", "form500_3", "form500_4", "form500_6",
        "form501_1", "form501_2", "form501_3", "form501_4", "form501_5",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ];

    if (!techIntents.includes(vars.selectedIntent)) {
        return "";
    }

    function constructCaseNotes() {
        const fields = [
            // CEP Investigation Tagging
            { name: "investigation1", label: "Investigation 1" },
            { name: "investigation2", label: "Investigation 2" },
            { name: "investigation3", label: "Investigation 3" },
            { name: "investigation4", label: "Investigation 4" },

            // Other Details
            { name: "sfCaseNum", label: "SF" },
            { name: "outageStatus", label: "Outage" },
            { name: "outageReference", label: "Source Reference" },
            { name: "custAuth", label: "Cust Auth" },
            { name: "simLight", label: "Sim Light Status" },
            { name: "minNumber", label: "MIN" },
            { name: "onuModel", label: "ONU Model" },
            { name: "onuSerialNum", label: "ONU SN" },
            { name: "Option82" },
            { name: "modemLights"},
            { name: "intLightStatus", label: "Internet Light" },
            { name: "wanLightStatus", label: "WAN Light" },
            { name: "onuConnectionType" },

            // Clearview
            { name: "cvReading", label: "CV" },
            { name: "rtaRequest", label: "Real-time Request" },

            //NMS Skin
            { name: "onuRunStats", label: "NMS Skin ONU Status" },
            { name: "rxPower", label: "RX" },
            { name: "vlan", label: "VLAN" },
            { name: "ipAddress", label: "IP Address" },
            { name: "connectedDevices", label: "No. of Connected Devices" },
            { name: "fsx1Status", label: "FXS1" },
            { name: "wanName_3", label: "WAN NAME_3" },
            { name: "srvcType_3", label: "SRVCTYPE_3" },
            { name: "connType_3", label: "CONNTYPE_3" },
            { name: "vlan_3", label: "WANVLAN_3" },
            { name: "saaaBandwidthCode" },
            { name: "routingIndex", label: "Routing Index" },
            { name: "callSource", label: "Call Source" },
            { name: "ldnSet", label: "LDN Set" },
            { name: "option82Config", label: "Option82 Config" },
            { name: "nmsSkinRemarks", label: "NMS" },
            
            // DMS
            { name: "dmsInternetStatus", label: "DMS Internet/Data Status" },
            { name: "deviceWifiBand"},
            { name: "bandsteering", label: "Bandsteering" },
            { name: "dmsVoipServiceStatus", label: "VoIP Status in DMS" },
            { name: "dmsLanPortStatus", label: "LAN Port Status in DMS" },
            { name: "dmsWifiState", label: "Wi-Fi State in DMS" },
            { name: "dmsLan4Status", label: "LAN Port Status in DMS" },
            { name: "dmsSelfHeal"},
            { name: "dmsRemarks", label: "DMS"  },

            // Probe & Troubleshoot
            { name: "callType", label: "Call Type" },
            { name: "lanPortNum", label: "LAN Port Number" },
            { name: "serviceStatus", label: "Voice Service Status" },
            { name: "services", label: "Service(s)" },
            { name: "connectionMethod", label: "Connected via" },
            { name: "deviceBrandAndModel", label: "Device Brand and Model" },
            { name: "specificTimeframe"},
            { name: "speedTestResult", label: "Initial Speedtest Result" },
            { name: "pingTestResult", label: "Ping" },
            { name: "gameNameAndServer"},
            { name: "gameServerIP", label: "Game Server IP Address" },
            { name: "pingTestResult2", label: "Game Server IP Address Ping Test Result" },
            { name: "traceroutePLDT", label: "Tracerout PLDT" },
            { name: "tracerouteExt", label: "Tracerout External" },
            { name: "meshtype" },
            { name: "meshOwnership", label: "Mesh" },
            { name: "websiteURL", label: "Website Address" },
            { name: "errMsg", label: "Error Message" },
            { name: "otherDevice", label: "Tested on Other Devices or Browsers" },
            { name: "vpnBlocking", label: "Possible VPN Blocking Issue" },
            { name: "vpnBlocking", label: "VPN Required When Accessing Website or App" },
            { name: "otherISP", label: "Result Using Other ISP" },
            { name: "itSupport", label: "Has IT Support" },
            { name: "itRemarks", label: "IT Support Remarks" },

            { name: "actualExp", label: "Actual Experience"},
            { name: "remarks", label: "Actions Taken" },

            // Ticket Details
            { name: "pcNumber", label: "Parent Case" },
            { name: "cepCaseNumber" },
            { name: "sla" },

            // For Retracking
            { name: "stbID", label: "STB Serial Number" },
            { name: "smartCardID", label: "Smartcard ID" },
            { name: "accountNum", label: "PLDT Account Number" },
            { name: "cignalPlan", label: "CIGNAL TV Plan" },
            { name: "stbIpAddress", label: "STB IP Address"}, 
            { name: "tsMulticastAddress", label: "Tuned Service Multicast Address"}, 
            { name: "exactExp", label: "Exact Experience"}, 
        ];

        const seenFields = new Set();
        let output = "";
        let retrackingOutput = "";
        let actionsTakenParts = [];

        const req4retrackingValue = document.querySelector('[name="req4retracking"]')?.value || "";
        const retrackingFields = ["stbID", "smartCardID", "accountNum", "cignalPlan", "exactExp"];

        fields.forEach(field => {
            // Skip retracking fields unless request is Yes or specific intent with stbID/smartCardID
            if (
                req4retrackingValue !== "Yes" &&
                retrackingFields.includes(field.name) &&
                !(vars.selectedIntent === "form510_7" && (field.name === "stbID" || field.name === "smartCardID"))
            ) return;

            const inputElement = document.querySelector(`[name="${field.name}"]`);
            let value = getFieldValueIfVisible(field.name);

            // Skip empty selects
            if (inputElement?.tagName === "SELECT" && inputElement.selectedIndex === 0) return;

            if (value && !seenFields.has(field.name)) {
                seenFields.add(field.name);

                // Add units if needed
                let displayValue = value;
                switch (field.name) {
                    case "pingTestResult":
                        displayValue += " MS";
                        break;
                    case "speedTestResult":
                        displayValue += " MBPS";
                        break;
                }

                // Handle field-specific logic
                switch (true) {
                    case field.name.startsWith("investigation"):
                        output += `${field.label}: ${displayValue}\n`;
                        break;

                    case field.name === "outageStatus":
                        if (displayValue === "Yes") {
                            actionsTakenParts.push("Affected by a network outage");
                        } else if (displayValue === "No") {
                            actionsTakenParts.push("Not part of network outage");
                        }

                        break;

                    case field.name === "dmsSelfHeal":
                        if (displayValue === "Yes/Resolved") {
                            actionsTakenParts.push("Performed Self Heal and the Issue was Resolved");
                        } else if (displayValue === "Yes/Unresolved") {
                            actionsTakenParts.push("Performed Self Heal but Issue was still Unresolved");
                        }

                        break;

                    default:
                        actionsTakenParts.push((field.label ? `${field.label}: ` : "") + displayValue);
                }
            }
        });

        if (req4retrackingValue === "Yes") {
            retrackingOutput = "REQUEST FOR RETRACKING\n";
            retrackingFields.forEach(field => {
                const fieldValue = getFieldValueIfVisible(field);
                if (fieldValue) {
                    const label = fields.find(f => f.name === field)?.label || field;
                    retrackingOutput += `${label}: ${fieldValue}\n`;
                }
            });
        }

        const issueResolvedValue = document.querySelector('[name="issueResolved"]')?.value || "";
        if (issueResolvedValue === "Yes") 
            actionsTakenParts.push("Resolved");
        else if (issueResolvedValue === "No - Customer is Unresponsive") 
            actionsTakenParts.push("Customer is Unresponsive");
        else if (issueResolvedValue === "No - Customer is Not At Home") 
            actionsTakenParts.push("Customer is Not At Home");
        else if (issueResolvedValue === "No - Customer Declined Further Assistance") 
            actionsTakenParts.push("Customer Declined Further Assistance");
        else if (issueResolvedValue === "No - System Ended Chat") 
            actionsTakenParts.push("System Ended Chat");

        const facilityValue = document.querySelector('[name="facility"]')?.value || "";
        if (facilityValue === "Copper VDSL") 
            actionsTakenParts.push("Copper");

        const actionsTaken = actionsTakenParts.join("/ ");

        const finalNotes = [output.trim(), retrackingOutput.trim(), actionsTaken.trim()]
            .filter(section => section)
            .join("\n\n");

        return finalNotes;
    }

    const notes = constructCaseNotes();
    return notes;

    // If Special Instructions is needed in the future
    // const specialInst = includeSpecialInst ? (specialInstButtonHandler(false) || "").toUpperCase() : "";

    // return [notes, specialInst].filter(Boolean).join("\n\n");

}

function specialInstButtonHandler(includeWocas = true) {
    const vars = initializeVariables();

    const allFields = [
        { name: "contactName", label: "Person to Contact" },
        { name: "cbr", label: "CBR" },
        { name: "availability", label: "Preferred Date & Time" },
        { name: "address", label: "Address" },
        { name: "landmarks", label: "Landmarks" },
        { name: "rptCount", label: "Repeater" },
        { name: "rxPower", label: "RX" },
        { name: "WOCAS", label: "WOCAS" },
        { name: "reOpenStatsReason", label: "Action Taken" },
    ];

    const fieldsToProcess = includeWocas
        ? allFields
        : allFields.filter(field => field.name !== "WOCAS" && field.name !== "rxPower");

    const contactName = getFieldValueIfVisible("contactName");
    const cbr = getFieldValueIfVisible("cbr");

    if (!contactName && !cbr) {
        return "";
    }

    const parts = fieldsToProcess.map(field => {
        if (!isFieldVisible(field.name)) return "";
        const value = getFieldValueIfVisible(field.name);
        if (!value) return "";
        const formattedValue = value.replace(/\n/g, "/ ");
        return `${field.label}: ${formattedValue}`;
    }).filter(Boolean);

    let specialInstCopiedText = parts.join("/ ");

    return specialInstCopiedText.toUpperCase();
}

function cepButtonHandler(showFloating = true, filter = []) {
    const vars = initializeVariables();

    if (!vars.selectedIntent) return;

    const techIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form500_1", "form500_2", "form500_3", "form500_4", "form500_6",
        "form501_1", "form501_2", "form501_3", "form501_4", "form501_5",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7", "form300_8"
    ];

    if (!techIntents.includes(vars.selectedIntent)) return;

    if (optionNotAvailable()) return "";

    if (vars.selectedIntent.startsWith("form300") && vars.custAuth === "Failed") {
        showAlert("This option is not available. Please use the Salesforce or FUSE button.");
        return;
    }

    const dataMap = {
        Title: (cepCaseTitle() || "").toUpperCase(),
        Description: (cepCaseDescription(true) || "").toUpperCase(),
        "Case Notes in Timeline": (cepCaseNotes() || "").toUpperCase(),
        "Special Instructions": (specialInstButtonHandler(true) || "").toUpperCase()
    };

    const filtered = filter.length ? filter : Object.keys(dataMap);
    const textToCopy = filtered.map(key => dataMap[key]).filter(Boolean);

    if (showFloating) {
        showCepFloatingDiv(filtered, textToCopy);
    }

    return textToCopy;
}

function showCepFloatingDiv(labels, textToCopy) {
    const floatingDiv = document.getElementById("floatingDiv");
    const overlay = document.getElementById("overlay");

    let floatingDivHeader = document.getElementById("floatingDivHeader");
    if (!floatingDivHeader) {
        floatingDivHeader = document.createElement("div");
        floatingDivHeader.id = "floatingDivHeader";
        floatingDiv.prepend(floatingDivHeader);
    }

    floatingDivHeader.textContent = "CASE DOCUMENTATION: Click the text to copy!";
    const copiedValues = document.getElementById("copiedValues");
    copiedValues.innerHTML = "";

    textToCopy.forEach((text, index) => {
        if (!text) return;

        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "10px";

        const label = document.createElement("strong");
        label.textContent = labels[index];
        label.style.marginLeft = "10px";
        wrapper.appendChild(label);

        const section = document.createElement("div");
        section.style.marginTop = "5px";
        section.style.padding = "10px";
        section.style.border = "1px solid #ccc";
        section.style.borderRadius = "4px";
        section.style.cursor = "pointer";
        section.style.whiteSpace = "pre-wrap";
        section.style.transition = "background-color 0.2s, transform 0.1s ease";
        section.classList.add("noselect");
        section.textContent = text;

        section.addEventListener("mouseover", () => section.style.backgroundColor = "#edf2f7");
        section.addEventListener("mouseout", () => section.style.backgroundColor = "");
        section.onclick = () => {
            section.style.transform = "scale(0.99)";
            navigator.clipboard.writeText(text).then(() => {
                section.style.backgroundColor = "#ddebfb";
                setTimeout(() => {
                    section.style.transform = "scale(1)";
                    section.style.backgroundColor = "";
                }, 150);
            });
        };

        wrapper.appendChild(section);
        copiedValues.appendChild(wrapper);
    });

    overlay.style.display = "block";
    floatingDiv.style.display = "block";

    setTimeout(() => floatingDiv.classList.add("show"), 10);

    const closeButton = document.getElementById("okButton");
    closeButton.textContent = "Close";
    closeButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

// Generate FUSE and SF notes for Tech Intents
function getSfFieldValueIfVisible(fieldName) {
    const vars = initializeVariables();
    
    if (!isFieldVisible(fieldName)) return "";

    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return "";

    let value = field.value.trim();

    if (field.tagName.toLowerCase() === "textarea") {
        value = value.replace(/\r?\n|\|/g, "/ ");
    }

    return value;
}

function techNotesButtonHandler(showFloating = true) {
    const vars = initializeVariables(); 

    let concernCopiedText = "";
    let actionsTakenCopiedText = "";
    let otherDetailsCopiedText = "";

    const optGroupIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form502_1", "form502_2",
    ];

    const optTextIntents = [
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form501_1", "form501_2", "form501_3", "form501_4", "form501_5",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7", "form300_8"
    ];

    const alwaysOnIntents = [
        "form500_5", "form501_7", "form101_5", "form510_9", "form500_6"
    ]

    function constTechCAOutput() {
        const fields = [
            // Remarks
            { name: "nmsSkinRemarks" },
            { name: "dmsRemarks" },
            { name: "remarks" },

            // Alternative Services
            { name: "offerALS"},
            { name: "alsPackOffered"},
            { name: "effectiveDate", label: "Effectivity Date" },
            { name: "nomiMobileNum", label: "MOBILE #" },

            // Upsell
            { name: "productsOffered", label: "OFFERED" },
            { name: "declineReason", label: "DECLINE REASON" },
            { name: "notEligibleReason", label: "NOT ELIGIBLE FOR UPSELL DUE TO" },
        ];

        const seenFields = new Set();
        let actionsTakenParts = [];

        const offerALS = document.querySelector('[name="offerALS"]')?.value || "";

        fields.forEach(field => {
            const inputElement = document.querySelector(`[name="${field.name}"]`);
            let value = getSfFieldValueIfVisible(field.name);

            if (inputElement && inputElement.tagName === "SELECT" && inputElement.selectedIndex === 0) {
                return;
            }

            const alsPackValue = getSfFieldValueIfVisible("alsPackOffered");

            if (value && !seenFields.has(field.name)) {
                seenFields.add(field.name);

                if (field.name === "offerALS") {
                    const alsMessages = {
                        "Offered ALS/Accepted": `Customer Accepted ${alsPackValue || "ALS"} Offer`,
                        "Offered ALS/Declined": "Offered ALS But Customer Declined",
                        "Offered ALS/No Confirmation": "Offered ALS But No Confirmation",
                        "Previous Agent Already Offered ALS": "Previous Agent Already Offered ALS"
                        // "Not Applicable" intentionally omitted to skip
                    };

                    const alsValue = alsMessages[offerALS];

                    if (alsValue) actionsTakenParts.push(alsValue);
                } else {
                    if (field.name === "productsOffered" || field.name === "notEligibleReason") {
                        actionsTakenParts.push((field.label ? `${field.label} ` : "") + value);
                    } else {
                        actionsTakenParts.push((field.label ? `${field.label}: ` : "") + value);
                    }
                }
            }
        });

        const issueResolvedValue = document.querySelector('[name="issueResolved"]')?.value || "";
        const issueResolvedMap = {
            "Yes": "Resolved",
            "No - Customer is Unresponsive": "Customer is Unresponsive",
            "No - Customer Declined Further Assistance": "Customer Declined Further Assistance",
            "No - System Ended Chat": "System Ended Chat"
        };

        if (issueResolvedMap[issueResolvedValue]) {
            actionsTakenParts.push(issueResolvedMap[issueResolvedValue]);
        }

        const upsellValue = document.querySelector('[name="upsell"]')?.value || "";
        const upsellMap = {
            "Yes - Accepted": "#UpsellAccepted",
            "No - Declined": "#UpsellDeclined",
            "No - Ignored": "#UpsellIgnored",
            "No - Undecided": "#UpsellUndecided",
            "NA - Not Eligible": "#UpsellNotEligible"
        };

        const upsellNote = upsellMap[upsellValue] || "";
        return {
            actions: "A: " + actionsTakenParts.join("/ "),
            upsellNote
        };
    }

    function formatActions(actions, upsellNote) {
        let result = actions.toUpperCase();
        if (upsellNote) result += "\n\n" + upsellNote;
        return result;
    }

    function constOtherDetails() {
        const fields = [
            { name: "investigation1", label: "INVESTIGATION 1" },
            { name: "investigation2", label: "INVESTIGATION 2" },
            { name: "investigation3", label: "INVESTIGATION 3" },
            { name: "investigation4", label: "INVESTIGATION 4" },

            // Other Details
            { name: "custAuth", label: "CUST AUTH" },
            { name: "simLight", label: "Sim Light Status" },
            { name: "minNumber", label: "MIN" },
            { name: "onuModel" },
            { name: "onuSerialNum", label: "ONU SN" },
            { name: "Option82" },
            
            // Network Outage Status
            { name: "outageStatus", label: "OUTAGE" },

            // ONU Lights Status and Connection Type
            { name: "modemLights"},
            { name: "intLightStatus", label: "Internet Light Status" },
            { name: "wanLightStatus", label: "WAN Light Status" },
            { name: "onuConnectionType" },

            // Clearview
            { name: "cvReading", label: "CV" },
            { name: "rtaRequest", label: "Real-time Request" },

            //NMS Skin
            { name: "onuRunStats", label: "NMS Skin ONU Status" },
            { name: "rxPower", label: "RX" },
            { name: "vlan", label: "VLAN" },
            { name: "ipAddress", label: "IP Address" },
            { name: "connectedDevices", label: "No. of Connected Devices" },
            { name: "fsx1Status", label: "FXS1" },
            { name: "wanName_3", label: "WAN NAME_3" },
            { name: "srvcType_3", label: "SRVCTYPE_3" },
            { name: "connType_3", label: "CONNTYPE_3" },
            { name: "vlan_3", label: "WANVLAN_3" },
            { name: "saaaBandwidthCode" },
            { name: "routingIndex", label: "Routing Index" },
            { name: "callSource", label: "Call Source" },
            { name: "ldnSet", label: "LDN Set" },
            { name: "option82Config", label: "Option82 Config" },
            { name: "nmsSkinRemarks", label: "NMS"  },
            
            // DMS
            { name: "dmsInternetStatus", label: "DMS Internet/Data Status" },
            { name: "deviceWifiBand", label: "Device used found in"},
            { name: "bandsteering", label: "Bandsteering" },
            { name: "dmsVoipServiceStatus", label: "VoIP Status in DMS" },
            { name: "dmsLanPortStatus", label: "LAN Port Status in DMS" },
            { name: "dmsWifiState", label: "Wi-Fi State in DMS" },
            { name: "dmsLan4Status", label: "LAN Port Status in DMS" },
            { name: "dmsSelfHeal", label: "Performed Self Heal" },
            { name: "dmsRemarks", label: "DMS" },

            // Probe & Troubleshoot
            { name: "callType", label: "Call Type" },
            { name: "lanPortNum", label: "LAN Port Number" },
            { name: "serviceStatus", label: "Voice Service Status" },
            { name: "services", label: "Service(s)" },
            { name: "outageStatus", label: "Outage" },
            { name: "outageReference", label: "Source Reference" },
            { name: "connectionMethod", label: "Connected via" },
            { name: "deviceBrandAndModel", label: "Device Brand and Model" },
            { name: "specificTimeframe"},
            { name: "speedTestResult", label: "Initial Speedtest Result" },
            { name: "pingTestResult", label: "Ping" },
            { name: "gameNameAndServer"},
            { name: "gameServerIP", label: "Game Server IP Address" },
            { name: "pingTestResult2", label: "Game Server IP Address Ping Test Result" },
            { name: "traceroutePLDT", label: "Tracerout PLDT" },
            { name: "tracerouteExt", label: "Tracerout External" },
            { name: "meshtype" },
            { name: "meshOwnership", label: "Mesh" },
            { name: "websiteURL", label: "Website Address" },
            { name: "errMsg", label: "Error Message" },
            { name: "otherDevice", label: "Tested on Other Devices or Browsers" },
            { name: "vpnBlocking", label: "Possible VPN Blocking Issue" },
            { name: "vpnBlocking", label: "VPN Required When Accessing Website or App" },
            { name: "otherISP", label: "Result Using Other ISP" },
            { name: "itSupport", label: "Has IT Support" },
            { name: "itRemarks", label: "IT Support Remarks" },
            { name: "actualExp", label: "Actual Experience"},

            // For Retracking
            { name: "stbID", label: "STB Serial Number" },
            { name: "smartCardID", label: "Smartcard ID" },
            { name: "accountNum", label: "PLDT Account Number" },
            { name: "cignalPlan", label: "CIGNAL TV Plan" },
            { name: "stbIpAddress", label: "STB IP Address"}, 
            { name: "tsMulticastAddress", label: "Tuned Service Multicast Address"}, 
            { name: "exactExp", label: "Exact Experience"},

            // Ticket Details
            { name: "cepCaseNumber" },
            { name: "pcNumber", label: "PARENT" },
            { name: "sla", label: "SLA" },

            // Special Instructions
            { name: "contactName", label: "CONTACT PERSON" },
            { name: "cbr", label: "CBR" },
            { name: "availability", label: "AVAILABILITY" },
            { name: "address"},
            { name: "landmarks", label: "NEAREST LANDMARK" },
            { name: "rptCount", label: "REPEATER" },
            { name: "WOCAS", label: "WOCAS" }
        ];

        const seenFields = new Set();
        let output = "";
        let retrackingOutput = "";
        let actionsTakenParts = [];

        const req4retrackingValue = document.querySelector('[name="req4retracking"]')?.value || "";
        const retrackingFields = ["stbID", "smartCardID", "accountNum", "cignalPlan", "exactExp"];

        fields.forEach(field => {
            // Skip retracking fields unless request is Yes or specific intent with stbID/smartCardID
            if (
                req4retrackingValue !== "Yes" &&
                retrackingFields.includes(field.name) &&
                !(vars.selectedIntent === "form510_7" && (field.name === "stbID" || field.name === "smartCardID"))
            ) return;

            const inputElement = document.querySelector(`[name="${field.name}"]`);
            const value = getFieldValueIfVisible(field.name);

            // Skip empty selects or custAuth = NA
            if ((inputElement?.tagName === "SELECT" && inputElement.selectedIndex === 0) || (field.name === "custAuth" && value === "NA")) return;

            if (value && !seenFields.has(field.name)) {
                seenFields.add(field.name);

                // Add units if needed
                let displayValue = value;
                if (field.name === "pingTestResult") displayValue += "MS";
                if (field.name === "speedTestResult") displayValue += " MBPS";

                // Determine action part
                let actionPart = (field.label ? `${field.label}: ` : "") + displayValue;

                // Special cases
                switch (field.name) {
                    case "outageStatus":
                        actionPart = value === "Yes"
                            ? "Affected by a network outage"
                            : "Not part of a network outage";
                        break;
                    case "dmsSelfHeal":
                        actionPart = value === "Yes/Resolved"
                            ? "Performed self-heal and the issue was resolved"
                            : value === "Yes/Unresolved"
                                ? "Performed self-heal but the issue was still unresolved"
                                : "Unable to perform self-heal";
                        break;
                }

                // Push action
                actionsTakenParts.push(req4retrackingValue === "Yes"
                    ? "Request for retracking submitted"
                    : actionPart
                );
            }
        });

        const facilityValue = document.querySelector('[name="facility"]')?.value || "";
        if (facilityValue === "Copper VDSL") actionsTakenParts.push("Copper");

        const actionsTaken = actionsTakenParts.join("/ ");

        const finalNotes = [output.trim(), retrackingOutput.trim(), actionsTaken.trim()]
            .filter(section => section)
            .join("\n\n");

        return finalNotes;
    }

    function formatField(label, name) {
        if (!isFieldVisible(name) || !vars[name]) return "";

        const labelPart = label ? `${label}: ` : "";
        return `${labelPart}${vars[name]}`;
    }

    const custName = formatField("CUST NAME", "custName");
    const sfCaseNum = formatField("SF", "sfCaseNum");
    const minNumber = formatField("/ AFFECTED MIN", "minNumber");

    const combinedInfo = [
        custName, sfCaseNum, minNumber
    ]
        .filter(Boolean)
        .join("/ "); 

    const selectedOptGroupLabel = vars.selectedOptGroupLabel ? `/ ${vars.selectedOptGroupLabel}` : "";
    const selectedIntentText = vars.selectedIntentText ? `/ ${vars.selectedIntentText}` : "";
    const queue = formatField("/ QUEUE", "queue");
    const ffupCount = formatField("/ FFUP COUNT", "ffupCount");
    const ticketAge = formatField("/ CASE AGE", "ticketAge");

    const { actions, upsellNote } = constTechCAOutput();

    if (vars.selectedIntent === "formFfupRepair") {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}_${vars.pldtUser}/ FOLLOW-UP REPAIR ${vars.ticketStatus}${queue}${ffupCount}${ticketAge}`;
        actionsTakenCopiedText = formatActions(actions, upsellNote);
    } else if (optGroupIntents.includes(vars.selectedIntent)) {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}${selectedOptGroupLabel}`;
        actionsTakenCopiedText = formatActions(actions, upsellNote);

        if (vars.channel === "CDT-HOTLINE") {
            otherDetailsCopiedText = constOtherDetails();
        }
    } else if (optTextIntents.includes(vars.selectedIntent)) {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}${selectedIntentText}`;
        actionsTakenCopiedText = formatActions(actions, upsellNote);

        if (vars.channel === "CDT-HOTLINE") {
            otherDetailsCopiedText = constOtherDetails();
        }
    } else if (alwaysOnIntents.includes(vars.selectedIntent)) {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}${selectedIntentText} (ALWAYS ON)`;
        actionsTakenCopiedText = formatActions(actions, upsellNote);
        
        if (vars.channel === "CDT-HOTLINE") {
            otherDetailsCopiedText = constOtherDetails();
        }
    }

    concernCopiedText = concernCopiedText.toUpperCase();
    otherDetailsCopiedText = otherDetailsCopiedText.toUpperCase();
    
    let otherDetailsSections = [];
    if (otherDetailsCopiedText) {
        otherDetailsSections = splitIntoSections(otherDetailsCopiedText, 250);
    }

    const notes_part1 = [
        concernCopiedText,
        actionsTakenCopiedText
    ].filter(Boolean)
    .join("\n");

    const textToCopy = [
        notes_part1,
        otherDetailsSections.join("\n\n")
    ].filter(Boolean).join("\n");

    if (showFloating) {
        showTechNotesFloatingDiv(notes_part1, otherDetailsSections);
    }

    return textToCopy;

}

// Split FUSE notes into sections for Hotline agents
function splitIntoSections(text, maxChars = 250) {
    const sections = [];
    let currentSection = "";

    text.split("/ ").forEach(part => {
        const nextPart = currentSection ? `/ ${part}` : part;
        if ((currentSection + nextPart).length > maxChars) {
            sections.push(currentSection.trim());
            currentSection = part;
        } else {
            currentSection += nextPart;
        }
    });

    if (currentSection.trim()) sections.push(currentSection.trim());
    return sections;
}

function showTechNotesFloatingDiv(notes_part1, notes_part2 = "") {

    const vars = initializeVariables();
    const floatingDiv = document.getElementById("floatingDiv");
    const overlay = document.getElementById("overlay");

    let floatingDivHeader = document.getElementById("floatingDivHeader");
    if (!floatingDivHeader) {
        floatingDivHeader = document.createElement("div");
        floatingDivHeader.id = "floatingDivHeader";
        floatingDiv.prepend(floatingDivHeader);
    }
    floatingDivHeader.textContent = "CASE DOCUMENTATION: Click any section to copy!";

    const copiedValues = document.getElementById("copiedValues");
    copiedValues.innerHTML = "";

    function createCopySection(title, text) {
        const sectionWrapper = document.createElement("div");
        sectionWrapper.style.marginTop = "10px";

        if (title) { 
            const sectionTitle = document.createElement("div");
            sectionTitle.textContent = title;
            sectionTitle.style.fontWeight = "bold";
            sectionTitle.style.marginBottom = "4px";
            sectionWrapper.appendChild(sectionTitle);
        }

        const sectionContent = document.createElement("div");
        sectionContent.textContent = text;
        sectionContent.style.padding = "10px";
        sectionContent.style.border = "1px solid #ccc";
        sectionContent.style.borderRadius = "4px";
        sectionContent.style.cursor = "pointer";
        sectionContent.style.whiteSpace = "pre-wrap";
        sectionContent.style.transition = "background-color 0.2s, transform 0.1s ease";
        sectionContent.classList.add("noselect");

        sectionContent.addEventListener("mouseover", () => {
            sectionContent.style.backgroundColor = "#edf2f7";
        });
        sectionContent.addEventListener("mouseout", () => {
            sectionContent.style.backgroundColor = "";
        });
        sectionContent.onclick = () => {
            sectionContent.style.transform = "scale(0.99)";
            navigator.clipboard.writeText(text).then(() => {
                sectionContent.style.backgroundColor = "#ddebfb";
                setTimeout(() => {
                    sectionContent.style.transform = "scale(1)";
                    sectionContent.style.backgroundColor = "";
                }, 150);
            }).catch(err => {
                console.error("Copy failed:", err);
            });
        };

        sectionWrapper.appendChild(sectionContent);
        return sectionWrapper;
    }

    const isHotline = vars.channel === "CDT-HOTLINE";
    const isFollowUpRepair = vars.selectedIntent === "formFfupRepair";

    if (isHotline && isFollowUpRepair) {
        if (notes_part1.trim()) {
            copiedValues.appendChild(createCopySection("", notes_part1));
        }
    } else if (isHotline) {
        if (notes_part1.trim()) {
            copiedValues.appendChild(createCopySection("Part 1", notes_part1));
        }

        if (Array.isArray(notes_part2) && notes_part2.length > 0) {
            notes_part2.forEach((section, i) => {
                copiedValues.appendChild(createCopySection(`Part ${i + 2}`, section));
            });
        } else if (typeof notes_part2 === "string" && notes_part2.trim()) {
            copiedValues.appendChild(createCopySection("Part 2", notes_part2));
        }
    } else {
        if (notes_part1.trim()) {
            copiedValues.appendChild(createCopySection("", notes_part1));
        }
    }
 
    overlay.style.display = "block";
    floatingDiv.style.display = "block";
    setTimeout(() => floatingDiv.classList.add("show"), 10);

    const closeButton = document.getElementById("okButton");
    closeButton.textContent = "Close";
    closeButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

// Generate FUSE notes for Non-Tech Intents
function getFuseFieldValueIfVisible(fieldName) {
    const vars = initializeVariables();
    
    if (!isFieldVisible(fieldName)) return "";

    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return "";

    let value = field.value.trim();

    if (field.tagName.toLowerCase() === "textarea") {
        if (
            vars.selectedIntent === "formFfupRepair" &&
            vars.ticketStatus === "Beyond SLA" &&
            (vars.offerALS !== "Offered ALS/Accepted" && vars.offerALS !== "Offered ALS/Declined")
        ) {
            value = value.replace(/\r?\n|\|/g, "/ ");
        } else {
            value = value.replace(/\r?\n|\|/g, "/ ");
        }
    }

    return value;
}

function nontechNotesButtonHandler(showFloating = true) {
    const vars = initializeVariables();

    let concernCopiedText = "";
    let actionsTakenCopiedText = "";

    function constructFuseOutput() {
        const fields = [
            { name: "offerALS" },
            { name: "alsPackOffered" },
            { name: "effectiveDate", label: "Effectivity Date" },
            { name: "nomiMobileNum" },
            { name: "cepCaseNumber" },
            { name: "ownership" },
            { name: "custAuth", label: "CUST AUTH" },
            { name: "paymentChannel", label: "PAYMENT CHANNEL" },
            { name: "otherPaymentChannel", label: "PAYMENT CHANNEL" },
            { name: "resolution" },
            { name: "remarks" },

            // Upsell
            { name: "productsOffered", label: "OFFERED" },
            { name: "declineReason", label: "DECLINE REASON" },
            { name: "notEligibleReason", label: "NOT ELIGIBLE FOR UPSELL DUE TO" }
        ];

        const seenFields = new Set();
        let actionsTakenParts = [];

        fields.forEach(field => {
            const inputElement = document.querySelector(`[name="${field.name}"]`);
            let value;

            if (field.name === "paymentChannel") {
                const paymentChannelValue = getFuseFieldValueIfVisible("paymentChannel");
                if (paymentChannelValue === "Others") {
                    const otherPaymentChannelValue = getFuseFieldValueIfVisible("otherPaymentChannel");
                    value = otherPaymentChannelValue || "Others";
                } else {
                    value = paymentChannelValue;
                }
            } else {
                value = getFuseFieldValueIfVisible(field.name);
            }

            if (inputElement && inputElement.tagName === "SELECT" && inputElement.selectedIndex === 0) {
                return;
            }

            if (field.name === "custAuth" && value === "NA") {
                return;
            }

            if (value && !seenFields.has(field.name)) {
                seenFields.add(field.name);
                if (field.name === "productsOffered" || field.name === "notEligibleReason") {
                    actionsTakenParts.push((field.label ? `${field.label} ` : "") + value);
                } else {
                    actionsTakenParts.push((field.label ? `${field.label}: ` : "") + value);
                }
            }
        });

        // Affected Tool
        const affectedTool = getFuseFieldValueIfVisible("affectedTool");
        const otherTool = getFuseFieldValueIfVisible("otherTool");

        if (affectedTool) {
            const toolName =
                affectedTool === "Other PLDT tools"
                    ? (otherTool || "").trim()
                    : affectedTool;

            if (toolName) {
                actionsTakenParts.push(`${toolName} Downtime`);
            }
        }

        // Issue Resolved mapping
        const issueResolvedValue =
            document.querySelector('[name="issueResolved"]')?.value || "";

        const issueResolvedMap = {
            "Yes": "Resolved",
            "No - Customer is Unresponsive": "Customer is Unresponsive",
            "No - Customer Declined Further Assistance": "Customer Declined Further Assistance",
            "No - System Ended Chat": "System Ended Chat"
        };

        if (issueResolvedMap[issueResolvedValue]) {
            actionsTakenParts.push(issueResolvedMap[issueResolvedValue]);
        }

        // Upsell mapping
        const upsellValue = document.querySelector('[name="upsell"]')?.value || "";

        const upsellMap = {
            "Yes - Accepted": "#UpsellAccepted",
            "No - Declined": "#UpsellDeclined",
            "No - Ignored": "#UpsellIgnored",
            "No - Undecided": "#UpsellUndecided",
            "NA - Not Eligible": "#UpsellNotEligible"
        };

        const upsellNote = upsellMap[upsellValue] || "";

        // Ordertake mapping
        const ordertakeValue =
            document.querySelector('[name="ordertake"]')?.value || "";

        let otNote = "";

        if (ordertakeValue === "Yes") {
            const requestTypeMap = {
                "Rebate Non Service": "#NSR",
                "CID Creation": "#CCBORELOCHANDLING"
            };

            otNote = requestTypeMap[vars.requestType] || "";
        }

        // Construct final Actions Taken
        const cleanedParts = actionsTakenParts.filter(Boolean);

        // Uppercase ONLY the main actions
        let actionsTaken = cleanedParts.length
            ? "A: " + cleanedParts.join("/ ").toUpperCase()
            : "";

        // Append upsell note (DO NOT uppercase)
        if (upsellNote) {
            actionsTaken += (actionsTaken ? "\n\n" : "") + upsellNote;
        }

        // Append ordertake note (decide if uppercase or not)
        if (otNote) {
            actionsTaken += (actionsTaken ? " " : "") + otNote;
        }

        // Append eSnow (usually keep as-is)
        const eSnowTicketNum = getFuseFieldValueIfVisible("eSnowTicketNum");
        if (eSnowTicketNum) {
            actionsTaken += (actionsTaken ? " " : "") + eSnowTicketNum;
        }

        return actionsTaken.trim();
    }

    function insertCustConcern(value) {
        return value && value.trim() !== "" ? `/ ${value}` : "";
    }

    function formatField(label, name, prefix = "/") {
        if (!isFieldVisible(name) || !vars[name]) return "";

        const prefixPart = prefix ? `${prefix} ` : "";
        const labelPart = label ? `${label}: ` : "";

        return `${prefixPart}${labelPart}${vars[name]}`;
    }

    const custName = formatField("CUST NAME", "custName", "");
    const sfCaseNum = formatField("", "sfCaseNum");
    const accountNum = formatField("", "accountNum");
    const landlineNum = formatField("", "landlineNum");
    const soSrNum = formatField("", "srNum");

    const inquiryForms = [
        "formInqAccSrvcStatus", "formInqLockIn", "formInqCopyOfBill", "formInqMyHomeAcc", "formInqPlanDetails", "formInqAda", "formInqRebCredAdj", "formInqBalTransfer", "formInqBrokenPromise", "formInqCreditAdj", "formInqCredLimit", "formInqNSR", "formInqDdate", "formInqBillDdateExt", "formInqEcaPip", "formInqNewBill", "formInqOneTimeCharges", "formInqOverpay", "formInqPayChannel", "formInqPayPosting", "formInqPayRefund", "formInqPayUnreflected", "formInqDdateMod", "formInqBillRefund", "formInqSmsEmailBill", "formInqTollUsage", "formInqCoRetain", "formInqCoChange", "formInqPermaDisc", "formInqTempDisc", "formInqD1299", "formInqD1399", "formInqD1799", "formInqDOthers", "formInqDdateExt", "formInqEntertainment", "formInqInmove", "formInqMigration", "formInqProdAndPromo", "formInqHomeRefNC", "formInqHomeDisCredit", "formInqReloc", "formInqRewards", "formInqDirectDial", "formInqBundle", "formInqSfOthers", "formInqSAO500", "formInqUfcEnroll", "formInqUfcPromoMech", "formInqUpg1399", "formInqUpg1599", "formInqUpg1799", "formInqUpg2099", "formInqUpg2499", "formInqUpg2699", "formInqUpgOthers", "formInqVasAO", "formInqVasIptv", "formInqVasMOW", "formInqVasSAO", "formInqVasWMesh", "formInqVasOthers", "formInqWireReRoute"
    ];

    const ffupForms = [
        "formFfupChangeOwnership", "formFfupChangeTelUnit", "formFfupDDE", "formFfupRelocCid", "formFfupReroute", "formFfupWT"
    ];

    const ffupFormsBasedOnFindings = [
        "formFfupChangeTelNum", "formFfupDowngrade", "formFfupInmove", "formFfupMigration", "formFfupNewApp", "formFfupOcular", "formFfupDiscoVas", "formFfupPermaDisco", "formFfupRenew", "formFfupResume", "formFfupUnbar", "formFfupReloc", "formFfupSAO", "formFfupUpgrade"
    ];

    const ffupFormsDisputes = [
        "formFfupMisappPay", "formFfupOverpay"
    ];

    const ffupFormsRefund = [
        "formFfupCustDependency", "formFfupAMSF", "formFfupFinalAcc", "formFfupOverpayment", "formFfupWrongBiller"
    ];

    const othersForms = [
        "othersWebForm", "othersEntAcc", "othersHomeBro", "othersSmart", "othersSME177", "othersToolsDown", "othersAO", "othersRepair", "othersBillAndAcc", "othersUT"
    ];

    const reqBasedIntent = [
        "formReqGoGreen", "formReqUpdateContact", "formReqSrvcRenewal", "formReqTaxAdj", "formReqChgTelUnit", "formReqRelocation", "formReqSpecFeat", "formReqSpeedAddOn", "formReqUfc", "formReqUpgrade", "formReqWireReroute", "formReqInmove", "formReqDDE", "formReqMigration", "formReqMisappPay", "formReqReflectPay", "formReqOcular", "formReqProofOfSub"
    ];

    const reqBasedReqType = [
        "formReqAccMgt", "formReqAddressMod", "formReqDisconnection", "formReqDispute", "formReqDowngrade", "formReqReconnect", "formReqRefund", "formReqVAS"
    ];
    
    // non-Tech Complaints
    if (vars.selectedIntent === "formCompMyHomeWeb") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formCompMisappliedPayment") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ ${vars.selectedIntentText} - ${vars.findings}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formCompUnreflectedPayment") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formCompPersonnelIssue") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ ${vars.personnelType} COMPLAINT${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }
    
    // non-Tech Inquiries
    else if (inquiryForms.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formInqBillInterpret") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ BILL INTERPRETATION - ${vars.subType}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formInqOutsBal") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ OUTSTANDING BALANCE - ${vars.subType}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formInqRefund") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ REFUND - ${vars.subType}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }
    
    // Non-Tech Follow-Ups
    else if (ffupForms.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupDispute") {

        let disputeNotes = "";

        if (vars.disputeType === "Rebate Non Service") {
            if (vars.approver === "Agent") {
                disputeNotes = `${vars.disputeType} WITH APPROVED ADJUSTMENT BY ${vars.approver}`;
            } else {
                disputeNotes = `${vars.disputeType} FOR ${vars.approver} APPROVAL`;
            }
        } else if (vars.disputeType === "Rentals") {
            if (vars.approver === "Account Admin") {
                disputeNotes = `REBATE FOR ${vars.disputeType} WITH OPEN DISPUTE FOR APPROVAL BY ${vars.approver}`;
            } else if (vars.approver === "Agent") {
                disputeNotes = `REBATE FOR ${vars.disputeType} WITH APPROVED ADJUSTMENT BY ${vars.approver}`;
            } else {
                disputeNotes = `REBATE FOR ${vars.disputeType} WITH OPEN DISPUTE UNDER APPROVAL`;
            }
        } else if (vars.disputeType === "Usage") {
            if (vars.approver === "Account Admin") {
                disputeNotes = `DISPUTE FOR TOLL ${vars.disputeType}S`;
            } else {
                disputeNotes = `DISPUTE FOR ${vars.disputeType}S UNDER APPROVAL`;
            }
        } else {
            disputeNotes = `DISPUTE FOR ${vars.disputeType}S`;
        }

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP ${disputeNotes}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();
    } else if (ffupFormsBasedOnFindings.includes(vars.selectedIntent)) {

        const findingsMap = {
            "Activation": "FOR ACTIVATION",
            "Activation Task": "FOR ACTIVATION",
            "Activation Task (DTS)": "FOR ACTIVATION",
            "No SO Generated": "- NO SO PROCESSED",
            "No SO Generated (DTS)": "/ NO SO PROCESSED",
            "Opsim": "UNDER OPSIM STATUS",
            "PMA": "UNDER PMA STATUS",
            "RSO Customer": "UNDER RSO CUSTOMER",
            "RSO PLDT": "UNDER RSO PLDT",
            "System Task / Stuck SO": "STUCK OR PROLONGED SO",
            "System Task / Stuck SO (DTS)": "/ STUCK OR PROLONGED SO"
        };

        if (vars.findings && findingsMap[vars.findings]) {
            concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText} ${findingsMap[vars.findings]}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        }
        actionsTakenCopiedText = constructFuseOutput();
    } else if (ffupFormsDisputes.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP DISPUTE FOR ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (ffupFormsRefund.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP REFUND - ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupSpecialFeat") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText} (${vars.requestType})${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupTempDisco") {

        const findingsMap = {
            "CCAM (Processing)": "FOR PROCESSING",
            "DeActivation Task": "DEACTIVATION",
            "No SO Generated": "- NO SO PROCESSED",
            "System Task / Stuck SO": "STUCK OR PROLONGED SO"
        };

        if (vars.findings && findingsMap[vars.findings]) {
            concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP TEMPORARY DISCONNECTION ${findingsMap[vars.findings]}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        }
        actionsTakenCopiedText = constructFuseOutput();
    } else if (vars.selectedIntent === "formFfupUP") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText} FOR VALIDATION${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupVasAct") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP VAS FOR ACTIVATION${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupVasDel") {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/ FOLLOW-UP VAS FOR ${vars.vasProduct} DELIVERY${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    }
    
    // Non-Tech Requests
    else if (reqBasedIntent.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/${vars.selectedIntentText}${soSrNum}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (reqBasedReqType.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}/${vars.requestType}${soSrNum}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }

    // Others
    else if (othersForms.includes(vars.selectedIntent)) {

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}${landlineNum}\nC: ${vars.channel}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }

    concernCopiedText = concernCopiedText.toUpperCase();

    const textToCopyGroups = [
        [concernCopiedText, actionsTakenCopiedText].filter(Boolean).join("\n"),
    ].filter(Boolean);

    if (showFloating) {
        showFuseFloatingDiv(concernCopiedText, actionsTakenCopiedText);
    }

    return textToCopyGroups;
}

function showFuseFloatingDiv(concernCopiedText, actionsTakenCopiedText) {
    const floatingDiv = document.getElementById("floatingDiv");
    const overlay = document.getElementById("overlay");

    let floatingDivHeader = document.getElementById("floatingDivHeader");
    if (!floatingDivHeader) {
        floatingDivHeader = document.createElement("div");
        floatingDivHeader.id = "floatingDivHeader";
        floatingDiv.prepend(floatingDivHeader);
    }
    floatingDivHeader.textContent = "CASE DOCUMENTATION: Click the text to copy!";

    const copiedValues = document.getElementById("copiedValues");
    copiedValues.innerHTML = "";

    const seenSections = new Set();

    function addUniqueText(text) {
        if (text && !seenSections.has(text)) {
            seenSections.add(text);
            return text;
        }
        return null;
    }

    const combinedSections = [
        [addUniqueText(concernCopiedText), addUniqueText(actionsTakenCopiedText)].filter(Boolean).join("\n"),
    ];

    combinedSections.forEach(text => {
        if (text.trim()) {
            const section = document.createElement("div");
            section.style.marginTop = "5px";
            section.style.padding = "10px";
            section.style.border = "1px solid #ccc";
            section.style.borderRadius = "4px";
            section.style.cursor = "pointer";
            section.style.whiteSpace = "pre-wrap";
            section.style.transition = "background-color 0.2s, transform 0.1s ease";

            section.textContent = text;

            section.addEventListener("mouseover", () => {
                section.style.backgroundColor = "#edf2f7";
            });
            section.addEventListener("mouseout", () => {
                section.style.backgroundColor = "";
            });

            section.onclick = () => {
                section.style.transform = "scale(0.99)";
                navigator.clipboard.writeText(text).then(() => {
                    section.style.backgroundColor = "#ddebfb";
                    setTimeout(() => {
                        section.style.transform = "scale(1)";
                        section.style.backgroundColor = "";
                    }, 150);
                }).catch(err => {
                    console.error("Copy failed:", err);
                });
            };

            copiedValues.appendChild(section);
        }
    });

    overlay.style.display = "block";
    floatingDiv.style.display = "block";

    setTimeout(() => {
        floatingDiv.classList.add("show");
    }, 10);

    const closeButton = document.getElementById("okButton");
    closeButton.textContent = "Close";

    closeButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

// Generate Bantay Kable notes
function bantayKableButtonHandler(showFloating = true) {
    const vars = initializeVariables();

    function insertCustConcern(value) {
        return value && value !== "" ? `/ ${value}` : "";
    }

    const sfCaseNum = (isFieldVisible("sfCaseNum") && vars.sfCaseNum) 
        ? `/ SF#: ${vars.sfCaseNum}` 
        : "";

    const accountNum = (isFieldVisible("accountNum") && vars.accountNum) 
        ? `/ ACC#: ${vars.accountNum}` 
        : "";

    function constructOutput(fields) {
        const seenFields = new Set();
        let section1 = "";
        let section2 = "";

        let custConcern = vars.custConcern || "";
        const custConcernElement = document.querySelector(`[name="custConcern"]`);
        if (custConcernElement && custConcernElement.tagName.toLowerCase() === "textarea") {
            custConcern = custConcern.replace(/\n/g, "/ ");
        }
        custConcern = custConcern.trim().toUpperCase();

        let remarks = vars.remarks || "";
        const remarksElement = document.querySelector(`[name="remarks"]`);
        if (remarksElement && remarksElement.tagName.toLowerCase() === "textarea") {
            remarks = remarks.replace(/\n/g, "/ ");
        }
        remarks = remarks.trim().toUpperCase();

        section1 += `C: ${vars.channel}${sfCaseNum}${accountNum}${insertCustConcern(custConcern)}\n`;
        section1 += `A: ${remarks}`;

        fields.forEach(field => {
            if (field.name === "custConcern" || field.name === "remarks") return;

            let value = getFieldValueIfVisible(field.name);
            if (!value || seenFields.has(field.name)) return;
            seenFields.add(field.name);

            const fieldElement = document.querySelector(`[name="${field.name}"]`);
            if (fieldElement && fieldElement.tagName.toLowerCase() === "textarea") {
                value = value.replace(/\n/g, " / ");
            }

            value = value.toUpperCase();

            section2 += `${field.label?.toUpperCase() || field.name.toUpperCase()}: ${value}\n`;
        });

        return { section1, section2 };
    }

    const fields = [
        { name: "custConcern", label: "Concern" },
        { name: "remarks", label: "Actions Taken/Remarks" },
        { name: "telNum164", label: "Telephone Number" },
        { name: "callerName", label: "Customer/Caller Name" },
        { name: "contactName", label: "Contact Person" },
        { name: "cbr", label: "Contact Number" },
        { name: "emailAdd", label: "Active Email Address" },
        { name: "address", label: "Address/Landmarks" },
        { name: "concern164", label: "Concern" },
    ];

    const { section1, section2 } = constructOutput(fields);

    const sections = [section1.trim(), section2.trim()];
    const sectionLabels = ["Case Notes", "Endorse to TL or SME (attach a photo of the concern)"];

    if (showFloating) {
        showBantayKableFloatingDiv(sections, sectionLabels);
    }

    return sections.join("\n\n");
}

function showBantayKableFloatingDiv(sections, sectionLabels) {
    const floatingDiv = document.getElementById("floatingDiv");
    const overlay = document.getElementById("overlay");
    const copiedValues = document.getElementById("copiedValues");

    if (!floatingDiv || !overlay || !copiedValues) {
        console.error("Required DOM elements are missing");
        return;
    }

    let floatingDivHeader = document.getElementById("floatingDivHeader");
    if (!floatingDivHeader) {
        floatingDivHeader = document.createElement("div");
        floatingDivHeader.id = "floatingDivHeader";
        floatingDiv.appendChild(floatingDivHeader);
    }

    floatingDivHeader.textContent = "CASE DOC & ENDORSEMENT: Click the text to copy!";
    copiedValues.innerHTML = "";

    sections.forEach((sectionText, index) => {
        const label = document.createElement("div");
        label.style.fontWeight = "bold";
        label.style.marginTop = index === 0 ? "0" : "10px";
        label.textContent = sectionLabels[index] || `SECTION ${index + 1}`;
        copiedValues.appendChild(label);

        const section = document.createElement("div");
        section.style.marginTop = "5px";
        section.style.padding = "10px";
        section.style.border = "1px solid #ccc";
        section.style.borderRadius = "4px";
        section.style.cursor = "pointer";
        section.style.whiteSpace = "pre-wrap";
        section.style.transition = "background-color 0.2s, transform 0.1s ease";
        section.classList.add("noselect");

        section.textContent = sectionText;

        section.onclick = () => {
            section.style.transform = "scale(0.99)";
            navigator.clipboard.writeText(sectionText).then(() => {
                section.style.backgroundColor = "#ddebfb";
                setTimeout(() => {
                    section.style.transform = "scale(1)";
                    section.style.backgroundColor = "";
                }, 150);
            }).catch(err => {
                console.error("Copy failed:", err);
            });
        };

        copiedValues.appendChild(section);
    });

    overlay.style.display = "block";
    floatingDiv.style.display = "block";

    setTimeout(() => {
        floatingDiv.classList.add("show");
    }, 10);

    const closeButton = document.getElementById("okButton");
    closeButton.textContent = "Close";
    closeButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

// Generate SF Tagging
function sfTaggingButtonHandler() {
    const vars = initializeVariables();

    // Tech
    let bauRows = [];
    let netOutageRows = [];
    let crisisRows = [];

    // Non-Tech
    let smntRows = [];
    let baaRows = [];

    const voiceAndDataForms = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7"
    ]

    const voiceForms = [
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4",
        "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5"
    ];

    const nicForms = [
        "form500_1", "form500_2", "form500_3", "form500_4"
    ];

    const sicForms = [
        "form501_1", "form501_2", "form501_3", "form501_4"
    ];

    const selectiveBrowseForms = [
        "form502_1", "form502_2"
    ];

    const iptvForms = [
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3"
    ]

    const mrtForms = [
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7", "form300_8"
    ];

    const streamAppsForms = [
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ];

    const inqAccounts = [
        "formInqAccSrvcStatus", "formInqLockIn", "formInqCopyOfBill", "formInqMyHomeAcc", "formInqPlanDetails"
    ];

    const inqBilling = [
        "formInqBalTransfer", "formInqBrokenPromise", "formInqCreditAdj", "formInqCredLimit", "formInqNSR", "formInqDdate", "formInqBillDdateExt", "formInqEcaPip", "formInqNewBill", "formInqOneTimeCharges", "formInqOverpay", "formInqPayChannel", "formInqPayPosting", "formInqPayRefund", "formInqPayUnreflected", "formInqDdateMod", "formInqBillRefund", "formInqSmsEmailBill", "formInqTollUsage"
    ];

    const inqChangeOwnership = ["formInqCoRetain", "formInqCoChange"];

    const inqDisco = ["formInqPermaDisc", "formInqTempDisc"];

    const inqDowngrade = ["formInqD1299", "formInqD1399", "formInqD1799", "formInqDOthers"];

    const inqRefProgram = ["formInqHomeRefNC", "formInqHomeDisCredit"];

    const inqSpecialFeat = ["formInqDirectDial", "formInqBundle", "formInqSfOthers"];

    const inqUfc = ["formInqUfcEnroll", "formInqUfcPromoMech"];

    const inqUpgrade = ["formInqUpg1399", "formInqUpg1599", "formInqUpg1799", "formInqUpg2099", "formInqUpg2499", "formInqUpg2699", "formInqUpgOthers"];

    const inqVAS = ["formInqVasAO", "formInqVasIptv", "formInqVasMOW", "formInqVasSAO", "formInqVasWMesh", "formInqVasOthers"];

    const othHotline = ["others164", "othersEntAcc", "othersHomeBro", "othersSmart", "othersSME177"];

    const othTransfer = ["othersAO", "othersRepair", "othersBillAndAcc"]

    const ffupBasedOnFindings = ["formFfupDowngrade", "formFfupInmove", "formFfupMigration", "formFfupReloc", "formFfupUpgrade"];

    const ffupDisputes = ["formFfupMisappPay", "formFfupOverpay"];

    const ffupDisco = ["formFfupDiscoVas", "formFfupPermaDisco"];

    const ffupRecon = ["formFfupRenew", "formFfupResume", "formFfupUnbar"];

    const ffupRefund = ["formFfupCustDependency", "formFfupAMSF", "formFfupFinalAcc", "formFfupOverpayment", "formFfupWrongBiller"];

    const ffupVAS =["formFfupVasAct", "formFfupVasDel"];

    const alwaysOn = ["form500_5", "form501_7", "form101_5", "form510_9", "form500_6"];

    const reqFormat1 = ["formReqSupRetAccNum", "formReqSupChangeAccNum"];

    const reqFormat2 = ["formReqAddressMod", "formReqDisconnection", "formReqDispute", "formReqDowngrade", "formReqSpecFeat", "formReqSpeedAddOn", "formReqUpgrade", "formReqVAS", "formReqDDE"];

    const reqFormat3 = ["formReqReconnect", "formReqRefund", "formReqRelocation"];

    // Tech
    if (vars.selectedIntent === 'formFfupRepair') {
        bauRows = [
            ['VOC:', `Follow up - ${vars.ticketStatus}`],
            ['Case Type:', `Tech Repair - ${vars.subject1}`],
            ['Case Sub-Type:', 'Zone']
        ];

        netOutageRows = [
            ['VOC:', `Follow up - ${vars.ticketStatus}`],
            ['Case Type:', `Tech Repair - ${vars.subject1}`],
            ['Case Sub-Type:', 'Network / Outage']
        ];

    } else if (voiceAndDataForms.includes(vars.selectedIntent)) {
        const caseSubType =
            (vars.resolution === 'Network / Outage' || vars.resolution === 'Zone')
            ? `No Dial Tone and No Internet Connection - ${vars.resolution}`
            : `NDT NIC - ${vars.resolution}`;

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Voice and Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (voiceForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (['form101_1', 'form101_2', 'form101_3', 'form101_4'].includes(vars.selectedIntent)) {
            if (vars.resolution === 'Zone' || vars.resolution === 'Network / Outage') {
            caseSubType = `No Dial Tone - ${vars.resolution}`;
            } else {
            caseSubType = `Dial Tone Problem - ${vars.resolution}`;
            }
        } else if (['form102_1', 'form102_2', 'form102_3', 'form102_4', 'form102_5', 'form102_6', 'form102_7'].includes(vars.selectedIntent)) {
            caseSubType = `Poor Call Quality - ${vars.resolution}`;
        } else if (['form103_1', 'form103_2', 'form103_3', 'form103_4', 'form103_5'].includes(vars.selectedIntent)) {
            caseSubType = `Cannot Make / Receive Calls - ${vars.resolution}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Voice'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (nicForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (vars.resolution === 'Defective Mesh' || vars.resolution === 'Mesh Configuration') {
            caseSubType = `NIC - ${vars.resolution} (#VAS type - indicate in remarks)`;
        } else if (vars.resolution === 'Network / Outage' || vars.resolution === 'Zone') {
            caseSubType = `No Internet Connection - ${vars.resolution}`;
        } else if (vars.resolution === 'Tested Ok') {
            caseSubType = 'NIC - Cannot Browse';
        } else {
            caseSubType = `NIC - ${vars.resolution}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (sicForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (vars.resolution === 'Network / Outage' || vars.resolution === 'Zone') {
            caseSubType = `Slow Internet Connection - ${vars.resolution}`;
        } else if (vars.resolution === 'Tested Ok') {
            caseSubType = 'SIC - Slow Browsing';
        } else {
            caseSubType = `SIC - ${vars.resolution}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (vars.selectedIntent === 'form501_5' || vars.selectedIntent === 'form501_6') {
        const caseSubType =
        (vars.resolution === 'Webpage Not Loading')
            ? 'Selective Browsing - Webpage Not Loading'
            : (vars.resolution === 'Network / Outage' || vars.resolution === 'Zone')
                ? `Slow Internet Connection - ${vars.resolution}`
                : `SIC - ${vars.resolution}`;

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (selectiveBrowseForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (vars.resolution === 'Tested Ok') {
            caseSubType = 'Selective Browsing - Webpage Not Loading';
        } else {
            caseSubType = `Selective Browsing - ${vars.resolution}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (iptvForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (['form510_1', 'form510_2', 'form510_3', 'form510_4', 'form510_5', 'form510_6', 'form510_7', 'form510_8'].includes(vars.selectedIntent)) {
            caseSubType = `No A/V Output - ${vars.resolution}`;
        } else if (['form511_1', 'form511_2', 'form511_3', 'form511_4', 'form511_5'].includes(vars.selectedIntent)) {
            caseSubType = `Poor A/V Quality - ${vars.resolution}`;
        } else if (['form512_1', 'form512_2', 'form512_3'].includes(vars.selectedIntent)) {
            caseSubType = `STB Functions - ${vars.resolution}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - IPTV'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (mrtForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (['form300_1'].includes(vars.selectedIntent)) {
            caseSubType = `Change Wifi UN/PW - ${vars.resolution}`;
        } else if (['form300_2'].includes(vars.selectedIntent)) {
            if (vars.resolution === "Defective Modem") {
                caseSubType = `GUI Access - ${vars.resolution}`;   
            } else {
                caseSubType = `GUI Reset (Local User) - ${vars.resolution}`;
            } 
        } else if (['form300_3'].includes(vars.selectedIntent)) {
            caseSubType = `GUI Access (Super Admin) - ${vars.resolution}`;
        } else if (['form300_4', 'form300_5', 'form300_7', 'form300_8'].includes(vars.selectedIntent)) {
            if (vars.resolution === "NMS Configuration") {
                caseSubType = `Mode Set-Up - ${vars.resolution} (Route to Bridge or Bridge to Route - indicate in remarks)`;  
            } else {
                caseSubType = `Mode Set-Up - ${vars.resolution}`;
            }
        } else if (['form300_6'].includes(vars.selectedIntent)) {
            caseSubType = `LAN Port Activation - ${vars.resolution}`;
        }

        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Change Configuration - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (streamAppsForms.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - VAS'],
            ['Case Sub-Type:', 'Content Issue (indicate in remarks if FOX iFlix Netflix or w/c Apps)']
        ];
    } else if (alwaysOn.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'VAS'],
            ['Case Sub-Type:', 'Always On']
        ];
    }

    // Non-Tech Complaint
    else if (vars.selectedIntent === 'formCompMyHomeWeb') {
        smntRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'PLDT Web'],
            ['Case Sub-Type:', 'PLDT Web Inaccessibility']
        ];

        baaRows = [
            ['WrapUp:', 'Complaint'],
            ['Sub_WrapUp:', 'PLDT Web'],
            ['Sub_SetCategory:', 'PLDT Web Inaccessibility']
        ];
    } else if (vars.selectedIntent === 'formCompMisappliedPayment') {
        smntRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', 'Complaint'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formCompUnreflectedPayment') {
        smntRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.paymentChannel}`]
        ];

        baaRows = [
            ['WrapUp:', 'Complaint'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - ${vars.paymentChannel}`]
        ];
    } else if (vars.selectedIntent === 'formCompPersonnelIssue') {
        smntRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Personnel'],
            ['Case Sub-Type:', `${vars.personnelType}`]
        ];

        baaRows = [
            ['WrapUp:', 'Complaint'],
            ['Sub_WrapUp:', 'Personnel'],
            ['Sub_SetCategory:', `${vars.personnelType}`]
        ];
    }
    
    // Non-Tech Inquiry
    else if (inqAccounts.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Account'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqAda') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', 'ADA']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', 'ADA']
        ];
    } else if (vars.selectedIntent === 'formInqBillInterpret') {
        let subType = '';

        const subTypeSelect = document.querySelector('[name="subType"]');
        const selectedIndex = subTypeSelect ? subTypeSelect.selectedIndex : -1;

        if (selectedIndex >= 4 && selectedIndex <= 6) {
            subType = `${vars.selectedIntentText} (Prorate / Breakdown) - Upgrade/Downgrade/Migration`;
        } else {
            subType = `${vars.selectedIntentText} (Prorate / Breakdown) - ${vars.subType}`;
        }

        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', subType]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', subType]
        ];
    } else if (inqBilling.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqOutsBal') {
        let subType = '';
        
        subType = `${vars.selectedIntentText} - ${vars.subType}`;

        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', subType]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', subType]
        ];
    } else if (inqChangeOwnership.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Change Ownership'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Change Ownership'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (inqDisco.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Disconnection'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Disconnection'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (inqDowngrade.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Downgrade'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Downgrade'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqDdateExt') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Due Date Extension'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Due Date Extension'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqEntertainment') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Entertainment'],
            ['Case Sub-Type:', 'Lions Gate/HBO Go/Viu/Others']
        ];
        
        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Entertainment'],
            ['Sub_SetCategory:', 'Lions Gate/HBO Go/Viu/Others']
        ];
    } else if (vars.selectedIntent === 'formInqInmove') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Inmove'],
            ['Case Sub-Type:', 'Inmove (Same Address)']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Inmove'],
            ['Sub_SetCategory:', 'Inmove (Same Address)']
        ];
    } else if (vars.selectedIntent === 'formInqMigration') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Migration'],
            ['Case Sub-Type:', 'Migration - Customer Initiated / PLDT Initiated']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Migration'],
            ['Sub_SetCategory:', 'Migration - Customer Initiated / PLDT Initiated']
        ];
    } else if (vars.selectedIntent === 'formInqProdAndPromo') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Product & Promos'],
            ['Case Sub-Type:', 'New Application / PLDT Plans']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Product & Promos'],
            ['Sub_SetCategory:', 'New Application / PLDT Plans']
        ];
    } else if (inqRefProgram.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Referral Program'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Referral Program'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqRefund') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Refund'],
            ['Case Sub-Type:', '`Refund - ${vars.subType}`']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Refund'],
            ['Sub_SetCategory:', `Refund - ${vars.subType}`]
        ];
    } else if (vars.selectedIntent === 'formInqReloc') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Relocation'],
            ['Case Sub-Type:', 'Relocation - Facility Availability / Transfer Fees / SLA']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Relocation'],
            ['Sub_SetCategory:', 'Relocation - Facility Availability / Transfer Fees / SLA']
        ];
    } else if (vars.selectedIntent === 'formInqRewards') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Rewards Program'],
            ['Case Sub-Type:', 'MVP/HOME Rewards']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Rewards Program'],
            ['Sub_SetCategory:', 'MVP/HOME Rewards']
        ];
    } else if (inqSpecialFeat.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Special Features'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Special Features'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqSAO500') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Speed Add On 500'],
            ['Case Sub-Type:', 'Product Info']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Speed Add On 500'],
            ['Sub_SetCategory:', 'Product Info']
        ];
    } else if (inqUfc.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'UNLI FAM CALL'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'UNLI FAM CALL'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (inqUpgrade.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Upgrade'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Upgrade'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (inqVAS.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'VAS'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'VAS'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqWireReRoute') {
        smntRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Wire Re-Route'],
            ['Case Sub-Type:', 'Processing Fees / SLA']
        ];

        baaRows = [
            ['WrapUp:', 'Inquiry'],
            ['Sub_WrapUp:', 'Wire Re-Route'],
            ['Sub_SetCategory:', 'Processing Fees / SLA']
        ];
    }
    
    // Non-Tech Follow-up
    else if (vars.selectedIntent === 'formFfupChangeOwnership') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.requestType}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.requestType}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeTelNum') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', 'Change of Telephone Number'],
            ['Case Sub-Type:', `Change TelNum - ${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', 'Change of Telephone Number'],
            ['Sub_SetCategory:', `Change TelNum - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeTelUnit') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', 'Change Telephone Unit'],
            ['Case Sub-Type:', 'Change Tel Unit - Opsim']
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', 'Change Telephone Unit'],
            ['Sub_SetCategory:', 'Change Tel Unit - Opsim']
        ];
    } else if (ffupDisco.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `Disconnect -  ${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `Disconnect -  ${vars.findings}`],
        ];
    } else if (vars.selectedIntent === 'formFfupDispute') {

        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.disputeType}`],
            ['Status:', 'Closed-Escalated']
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.disputeType}`],
            ['WrapUp_Status:', 'Closed-Escalated']
        ];
    } else if (ffupBasedOnFindings.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupDDE') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Due Date Ext (CCAM)']
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Due Date Ext (CCAM)']
        ];
    } else if (ffupDisputes.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - Payman`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - Payman`]
        ];

    } else if (vars.selectedIntent === 'formFfupOcular') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}/AMEND SAM`],
            ['Case Sub-Type:', `Ocular/Amend - ${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `Ocular/Amend - ${vars.findings}`]
        ];
    } else if (ffupRecon.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `Reconnection - ${vars.findings}`]
        ];
        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `Reconnection - ${vars.findings}`]
        ];
    } else if (ffupRefund.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `Refund - ${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `Refund - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupRelocCid') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Relocation - PMA']
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Relocation - PMA']
        ];
    } else if (vars.selectedIntent === 'formFfupSpecialFeat') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Special Features - Activation/Deactivation	']
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Special Features - Activation/Deactivation']
        ];
    } else if (vars.selectedIntent === 'formFfupSAO') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.findings}`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupTempDisco') {
        let caseSubType = "";

        if (vars.findings === "CCAM (Processing)") {
            caseSubType = `Temp Disconnect - ${vars.findings}`;
        } else {
            caseSubType = `VTD - ${vars.findings}`;
        }

        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', caseSubType]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', caseSubType]
        ];
    } else if (vars.selectedIntent === 'formFfupUP') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - Payman`]
        ];

        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - Payman`]
        ];
    } else if (ffupVAS.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', 'VAS'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', 'VAS'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formFfupReroute') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Re-Route/OW - Opsim']
        ];
        
        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Re-Route/OW - Opsim']
        ];
    }  else if (vars.selectedIntent === 'formFfupWT') {
        smntRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Withholding Tax (CCAM)']
        ];
        
        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Withholding Tax (CCAM)']
        ];
    } 
    
    // For validation
    else if (vars.selectedIntent === 'formFfupRepairRecon') {
        smntRows = [
            ['VOC:', 'Follow-up'],
            ['Case Type:', 'Follow-up Aftersales'],
            ['Case Sub-Type:', 'Reconnection']
        ];
        baaRows = [
            ['WrapUp:', `Follow-up - ${vars.ffupStatus}`],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Reconnection']
        ];
    } 

    // Non-Tech Request
    else if (reqFormat1.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', vars.selectedOptGroupLabel],
            ['Case Sub-Type:', vars.selectedIntentText]
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', vars.selectedOptGroupLabel],
            ['Sub_SetCategory:', vars.selectedIntentText]
        ];
    } else if (reqFormat2.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', vars.selectedIntentText],
            ['Case Sub-Type:', vars.requestType]
        ];
        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', vars.selectedIntentText],
            ['Sub_SetCategory:', vars.requestType]
        ];
    } else if (reqFormat3.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.requestType}`]
        ];
        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - ${vars.requestType}`]
        ];
    } else if (vars.selectedIntent === 'formReqAccMgt') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', vars.requestType]
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', 'Account'],
            ['Sub_SetCategory:', vars.requestType]
        ];
    } else if (vars.selectedIntent === 'formReqTaxAdj') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', vars.selectedIntentText]
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', 'Billing'],
            ['Sub_SetCategory:', vars.selectedIntentText]
        ];
    } else if (vars.selectedIntent === 'formReqChgTelUnit') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Customer Initiated']
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Customer Initiated']
        ];
    } else if (vars.selectedIntent === 'formReqUfc') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'UNLI FAM CALL'],
            ['Case Sub-Type:', 'UFC Activation/Deactivation']
        ];
        
        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', 'UNLI FAM CALL'],
            ['Sub_SetCategory:', 'UFC Activation/Deactivation']
        ];
    } else if (vars.selectedIntent === 'formReqWireReroute') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Wire Re-Route'],
            ['Case Sub-Type:', 'Re-Routing Inside / Outside Wire']
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', 'Wire Re-Route'],
            ['Sub_SetCategory:', 'Re-Routing Inside / Outside Wire']
        ];
    } else if (vars.selectedIntent === 'formReqMigration') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', vars.selectedIntentText],
            ['Case Sub-Type:', `${vars.selectedIntentText} - Customer Initiated / PLDT Initiated`]
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', vars.selectedIntentText],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - Customer Initiated / PLDT Initiated`]
        ];
    } else if (vars.selectedIntent === 'formReqMisappPay' || vars.selectedIntent === 'formReqReflectPay') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', vars.selectedIntentText],
            ['Case Sub-Type:', `${vars.selectedIntentText} - Payman`]
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', vars.selectedIntentText],
            ['Sub_SetCategory:', `${vars.selectedIntentText} - Payman`]
        ];

    } else if (vars.selectedIntent === 'formReqProofOfSub') {
        smntRows = [
            ['VOC:', 'Request'],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Sending Subscription Certificate/Declaration']
        ];

        baaRows = [
            ['WrapUp:', 'Request'],
            ['Sub_WrapUp:', `${vars.selectedIntentText}`],
            ['Sub_SetCategory:', 'Sending Subscription Certificate/Declaration']
        ];
    }

    // Others
    else if (vars.selectedIntent === 'othersToolsDown') {
        smntRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Tools Downtime'],
            ['Case Sub-Type:', `${vars.affectedTool}`]
        ];

        baaRows = [
            ['WrapUp:', 'Others'],
            ['Sub_WrapUp:', 'Tools Downtime'],
            ['Sub_SetCategory:', `${vars.affectedTool}`]
        ];
    } else if (vars.selectedIntent === 'othersWebForm') {
        smntRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Refer to Hero Channel'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];

        baaRows = [
            ['WrapUp:', 'Others'],
            ['Sub_WrapUp:', 'Refer to Hero Channel'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (othHotline.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Refer to other hotline'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
        
        baaRows = [
            ['WrapUp:', 'Others'],
            ['Sub_WrapUp:', 'Refer to other hotline'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (othTransfer.includes(vars.selectedIntent)) {
        smntRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Transfer'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
        
        baaRows = [
            ['WrapUp:', 'Others'],
            ['Sub_WrapUp:', 'Transfer'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'othersUT') {
        smntRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Unsuccessful Transaction'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
        
        baaRows = [
            ['WrapUp:', 'Others'],
            ['Sub_WrapUp:', 'Unsuccessful Transaction'],
            ['Sub_SetCategory:', `${vars.selectedIntentText}`]
        ];
    }

    const floating1Div = document.getElementById("floating1Div");
    const overlay = document.getElementById("overlay");

    let floating1DivHeader = document.getElementById("floating1DivHeader");
    if (!floating1DivHeader) {
        floating1DivHeader = document.createElement("div");
        floating1DivHeader.id = "floating1DivHeader";
        floating1Div.appendChild(floating1DivHeader);
    }
    floating1DivHeader.textContent = "CASE TAGGING";

    const sfTaggingValues = document.getElementById("sfTaggingValues");
    sfTaggingValues.innerHTML = '';  

    function createTable(title, rows) {
        const table = document.createElement('table');
        table.style.marginBottom = '20px';
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.border = '1px solid #2C3E50';

        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.colSpan = 2;
        headerCell.textContent = title;
        headerCell.style.backgroundColor = '#2C3E50';
        headerCell.style.color = 'white';
        headerCell.style.textAlign = 'center';
        headerCell.style.padding = '5px';
        headerRow.appendChild(headerCell);
        table.appendChild(headerRow);

        const colgroup = document.createElement('colgroup');
        const col1 = document.createElement('col');
        col1.style.width = '30%';
        const col2 = document.createElement('col');
        col2.style.width = '70%';
        colgroup.appendChild(col1);
        colgroup.appendChild(col2);
        table.appendChild(colgroup);

        rows.forEach(row => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.textContent = row[0];
            td1.style.padding = '5px';
            td1.style.border = '1px solid #2C3E50';
            td1.style.whiteSpace = 'nowrap';

            const td2 = document.createElement('td');
            td2.textContent = row[1];
            td2.style.padding = '5px';
            td2.style.border = '1px solid #2C3E50';

            tr.appendChild(td1);
            tr.appendChild(td2);
            table.appendChild(tr);
        });

        return table;
    }

    if (bauRows.length > 0) {
        const bauTable = createTable('Regular Tagging', bauRows);
        sfTaggingValues.appendChild(bauTable);
    }

    if (netOutageRows.length > 0) {
        const netOutageTable = createTable('Network Outage', netOutageRows);
        sfTaggingValues.appendChild(netOutageTable);
    }

    if (crisisRows.length > 0) {
        const crisisTable = createTable('Potential Crisis', crisisRows);
        sfTaggingValues.appendChild(crisisTable);
    }

    if (smntRows.length > 0) {
        const smntTable = createTable('Salesforce Tagging', smntRows);
        sfTaggingValues.appendChild(smntTable);
    }

    if (baaRows.length > 0) {
        const baaTable = createTable('ESA Tagging', baaRows);
        sfTaggingValues.appendChild(baaTable);
    }

    sfTaggingValues.style.textAlign = "left";
    sfTaggingValues.style.paddingLeft = "10px";

    overlay.style.display = "block";
    floating1Div.style.display = "block";

    setTimeout(() => {
        floating1Div.classList.add("show");
    }, 10);

    const okButton = document.getElementById("okButton1");
    okButton.onclick = function () {
        floating1Div.classList.remove("show");
        setTimeout(() => {
            floating1Div.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

// Generate Endorsement form and notes
function endorsementForm() {
    const vars = initializeVariables();

    if (vars.selectedIntent === "form500_5" || vars.selectedIntent === "form501_7") {
        window.open(
            "https://forms.office.com/pages/responsepage.aspx?id=UzSk3GO58U-fTXXA3_2oOdfxlbG-2mJDqefhFxYwjdNUNVpIMTVMU0VLWU1OVFg2Q04wSEhGQjc0Ry4u&route=shorturl",
            "_blank"
        );
        return;
    }
    
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block"; 

    const floating2Div = document.createElement("div");
    floating2Div.id = "floating2Div"; 

    const header = document.createElement("div");
    header.id = "floating2DivHeader";
    header.innerText = "Endorsement Details";
    floating2Div.appendChild(header);

    const form3Container = document.createElement("div");
    form3Container.id = "form3Container";

    floating2Div.appendChild(form3Container);

    const table = document.createElement("table");
    table.id = "form2Table";

    const formFields = [
        { label: "Endorsement Type", type: "select", name: "endorsementType", options: ["", "Zone", "Network", "Potential Crisis", "Sup Call"]},
        { label: "WOCAS", type: "textarea", name: "WOCAS2" },
        { label: "SF Case #", type: "number", name: "sfCaseNum2" },
        { label: "Account Name", type: "text", name: "accOwnerName" },
        { label: "Account #", type: "number", name: "accountNum2" },
        { label: "Telephone #", type: "number", name: "landlineNum2" },
        { label: "Contact Person", type: "text", name: "contactName2" },
        { label: "Mobile #/CBR", type: "number", name: "cbr2" },
        { label: "Preferred Date & Time", type: "text", name: "availability2" },
        { label: "Address", type: "textarea", name: "address2" },
        { label: "Landmarks", type: "textarea", name: "landmarks2" },
        { label: "CEP Case #", type: "number", name: "cepCaseNumber2" },
        { label: "Queue", type: "text", name: "queue2" },
        { label: "Ticket Status", type: "text", name: "ticketStatus2" },
        { label: "Agent Name", type: "text", name: "agentName2" },
        { label: "Team Leader", type: "text", name: "teamLead2" },
        { label: "Reference #", type: "", name: "refNumber2"},
        { label: "Payment Channel", type: "", name: "paymentChannel2"},
        { label: "Amount Paid", type: "", name: "amountPaid2"},
        { label: "Date", type: "date", name: "date" },
        { label: "Escalation Remarks", type: "textarea", name: "remarks2", placeholder: "Please indicate the specific reason for escalation. Do NOT include actions taken in this field." },
    ];

    formFields.forEach(field => {
        const row = document.createElement("tr");
        row.style.display = field.name === "endorsementType" ? "table-row" : "none"; 

        const td = document.createElement("td");
        td.colSpan = 2;

        const divInput = document.createElement("div");
        divInput.className = field.type === "textarea" ? "form3DivTextarea" : "form3DivInput";

        const label = document.createElement("label");
        label.textContent = field.label;
        label.className = field.type === "textarea" ? "form3-label-textarea" : "form3-label";
        label.setAttribute("for", field.name);

        let input;

        if (field.type === "select") {
            input = document.createElement("select");
            input.name = field.name;
            input.className = "form3-input";
            
            field.options.forEach(optionValue => {
                const option = document.createElement("option");
                option.value = optionValue;
                option.textContent = optionValue;
                input.appendChild(option);
            });
        } else if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.name = field.name;
            input.className = "form3-textarea";
            input.rows = field.name === "remarks2" ? 4 : 2;

            if (field.placeholder) {
                input.placeholder = field.placeholder;
            }
        } else {
            input = document.createElement("input");
            input.type = field.type;
            input.name = field.name;
            input.className = "form3-input";

            if (field.type === "date" && input.showPicker) {
                input.addEventListener("focus", () => input.showPicker());
                input.addEventListener("click", () => input.showPicker());
            }
        }

        divInput.appendChild(label);
        divInput.appendChild(input);
        td.appendChild(divInput);
        row.appendChild(td);
        table.appendChild(row);
    });

    form3Container.appendChild(table);

    const autofillMappings = [
        { source: "WOCAS", target: "WOCAS2" },
        { source: "sfCaseNum", target: "sfCaseNum2" },
        { source: "accountNum", target: "accountNum2" },
        { source: "landlineNum", target: "landlineNum2" },
        { source: "contactName", target: "contactName2" },
        { source: "cbr", target: "cbr2" },
        { source: "availability", target: "availability2" },
        { source: "address", target: "address2" },
        { source: "landmarks", target: "landmarks2" },
        { source: "cepCaseNumber", target: "cepCaseNumber2" },
        { source: "queue", target: "queue2" },
        { source: "ticketStatus", target: "ticketStatus2" },
        { source: "agentName", target: "agentName2" },
        { source: "teamLead", target: "teamLead2" },
    ];

    autofillMappings.forEach(({ source, target }) => {
        const sourceElement = document.querySelector(`#form1Container [name='${source}']`) ||
                              document.querySelector(`#form2Container [name='${source}']`);
        const targetElement = table.querySelector(`[name='${target}']`);

        if (sourceElement && targetElement) {
            let value = sourceElement.value;
            targetElement.value = value.toUpperCase();
        }
    });

    const buttonsRow = document.createElement("tr");

    const buttonsTd = document.createElement("td");
    buttonsTd.colSpan = 2;
    buttonsTd.style.padding = "10px";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.gap = "10px";

    // Generate Button
    const generateButton = document.createElement("button");
    generateButton.className = "form3-button";
    generateButton.innerText = "Generate Notes";

    generateButton.onclick = () => {

    floating2Div.classList.remove("show");

    setTimeout(() => {
        floating2Div.style.display = "none";
    }, 300);

        const textParts = [];

        const endorsementTypeInput = table.querySelector('select[name="endorsementType"]');
        const endorsementTypeLabel = table.querySelector('label[for="endorsementType"]');

        if (endorsementTypeInput && endorsementTypeLabel) {
            const labelText = endorsementTypeLabel.textContent.trim().toUpperCase();
            const valueText = (endorsementTypeInput.value || "NOT PROVIDED").toUpperCase();
            textParts.push(`${labelText}: ${valueText}`);
        }

        const visibleFields = Array.from(table.querySelectorAll("textarea, input"))
            .filter(input => input.offsetParent !== null);

        visibleFields.forEach(input => {
            const label = table.querySelector(`label[for="${input.name}"]`);
            if (!label) return;

            const labelText = label.textContent.trim().toUpperCase();
            const valueText = (input.value || "").toUpperCase();
            if (!valueText) return;

            textParts.push(`${labelText}: ${valueText}`);
        });

        const finalText = textParts.join("\n");
        showFloating3Div(finalText, floating2Div);
    };

    // Close Button
    const closeButton = document.createElement("button");
    closeButton.className = "form3-button";
    closeButton.innerText = "Close";

    closeButton.onclick = function () {
        floating2Div.classList.remove("show");
        setTimeout(() => {
            floating2Div.style.display = "none";
            overlay.style.display = "none";
            document.body.removeChild(floating2Div);
        }, 300);
    };

    buttonContainer.appendChild(generateButton);
    buttonContainer.appendChild(closeButton);
    buttonsTd.appendChild(buttonContainer);
    buttonsRow.appendChild(buttonsTd);

    table.appendChild(buttonsRow);

    document.body.appendChild(floating2Div);
    floating2Div.style.display = "block";
    setTimeout(() => {
        floating2Div.classList.add("show");
    }, 10);

    const endorsementType = table.querySelector("[name='endorsementType']");

    // ALWAYS visible fields
    const alwaysVisibleFields = [
        "WOCAS2",
        "accOwnerName",
        "accountNum2",
        "landlineNum2",
        "contactName2",
        "cbr2",
        "availability2",
        "agentName2",
        "teamLead2",
        "date",
        "remarks2"
    ];

    // CONDITIONAL fields (mirror previous form visibility)
    const visibilityMap = {
        sfCaseNum2: "sfCaseNum",
        address2: "address",
        landmarks2: "landmarks",
        cepCaseNumber2: "cepCaseNumber",
        queue2: "queue",
        ticketStatus2: "ticketStatus",
        refNumber2: "refNumber",
        paymentChannel2: "paymentChannel",
        amountPaid2: "amountPaid",
    };

    function syncFieldVisibility() {

        // ALWAYS visible fields
        alwaysVisibleFields.forEach(fieldName => {

            const input = table.querySelector(`[name="${fieldName}"]`);
            if (!input) return;

            const row = input.closest("tr");
            if (row) row.style.display = "table-row";

        });

        // CONDITIONAL fields
        Object.entries(visibilityMap).forEach(([targetName, sourceName]) => {

            const sourceElement =
                document.querySelector(`#form1Container [name="${sourceName}"]`) ||
                document.querySelector(`#form2Container [name="${sourceName}"]`);

            const targetElement =
                table.querySelector(`[name="${targetName}"]`);

            if (!targetElement) return;

            const row = targetElement.closest("tr");
            if (!row) return;

            if (sourceElement && sourceElement.offsetParent !== null) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }

        });

    }

    endorsementType.addEventListener("change", function () {

        if (!this.value) return;

        requestAnimationFrame(syncFieldVisibility);

    });
}

function showFloating3Div(finalText, floating2Div) {

    const overlay = document.getElementById("overlay");
    if (overlay) overlay.style.display = "block";

    const existing = document.getElementById("floating3Div");
    if (existing) existing.remove();

    const floating3Div = document.createElement("div");
    floating3Div.id = "floating3Div";

    const header = document.createElement("div");
    header.id = "floating3DivHeader";
    header.innerText = "ENDORSEMENT SUMMARY: Click the text to copy!";
    floating3Div.appendChild(header);

    const contentWrapper = document.createElement("div");
    contentWrapper.style.padding = "15px 15px 5px 15px";
    contentWrapper.style.display = "flex";
    contentWrapper.style.flexDirection = "column";
    contentWrapper.style.gap = "12px";

    const copiedValues = document.createElement("div");

    const section = document.createElement("div");
    section.style.padding = "10px";
    section.style.border = "1px solid #ccc";
    section.style.borderRadius = "4px";
    section.style.cursor = "pointer";
    section.style.whiteSpace = "pre-wrap";
    section.style.transition = "background-color 0.2s ease, transform 0.1s ease";
    section.classList.add("noselect");

    // normalize line endings (important)
    finalText = finalText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    section.textContent = finalText;

    section.addEventListener("mouseover", () => {
        section.style.backgroundColor = "#edf2f7";
    });

    section.addEventListener("mouseout", () => {
        section.style.backgroundColor = "";
    });

    section.onclick = () => {
        section.style.transform = "scale(0.99)";

        navigator.clipboard.writeText(finalText)
            .then(() => {
                section.style.backgroundColor = "#ddebfb";

                setTimeout(() => {
                    section.style.transform = "scale(1)";
                    section.style.backgroundColor = "";
                }, 150);
            });
    };

    copiedValues.appendChild(section);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.className = "form3-button";
    closeButton.innerText = "Close";

    closeButton.style.width = "auto";
    closeButton.style.textTransform = "none";
    closeButton.style.padding = "0 16px";

    closeButton.onclick = () => {
        floating3Div.classList.remove("show");

        setTimeout(() => {
            floating3Div.remove();

            // Restore floating2Div smoothly
            floating2Div.style.display = "block";
            setTimeout(() => {
                floating2Div.classList.add("show");
            }, 10);

        }, 300);
    };

    contentWrapper.appendChild(copiedValues);
    contentWrapper.appendChild(closeButton);
    floating3Div.appendChild(contentWrapper);

    document.body.appendChild(floating3Div);

    // Trigger animation
    setTimeout(() => {
        floating3Div.classList.add("show");
    }, 10);
}

// Reset form and rebuild buttons and show Export and Dellete All buttons
function resetForm2ContainerAndRebuildButtons() {
    const form2Container = document.getElementById("form2Container");
    form2Container.innerHTML = "";

    const buttonTable = document.createElement("table");
    buttonTable.id = "form2ButtonTable";

    const row = document.createElement("tr");

    const buttonData = [
        { label: "💾 Save", handler: saveFormData },
        { label: "🔄 Reset", handler: resetButtonHandler },
    ];

    buttonData.forEach(({ label, handler }) => {
        const td = document.createElement("td");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "form1-button";
        btn.tabIndex = -1;
        btn.innerHTML = label;
        btn.addEventListener("click", handler);
        td.appendChild(btn);
        row.appendChild(td);
    });

    buttonTable.appendChild(row);
    form2Container.appendChild(buttonTable);
}

// Reset forms
function resetButtonHandler() {
    showConfirm2("Are you sure you want to reset the form?")
    .then((userChoice) => {
        if (!userChoice) return;

        const agentName = document.getElementsByName("agentName")[0]; 
        const teamLead = document.getElementsByName("teamLead")[0]; 
        const pldtUser = document.getElementsByName("pldtUser")[0]; 
        const Channel = document.getElementsByName("selectChannel")[0];

        const agentNameValue = agentName.value;
        const teamLeadValue = teamLead.value;
        const pldtUserValue = pldtUser.value;
        const ChannelValue = Channel.value;

        document.getElementById("frm1").reset();

        agentName.value = agentNameValue;
        teamLead.value = teamLeadValue;
        pldtUser.value = pldtUserValue;
        Channel.value = ChannelValue;

        resetForm2ContainerAndRebuildButtons();

        // Reset + hide saved notes row
        const savedNotesRow = document.getElementById("saved-notes-row");

        if (savedNotesRow) {
            savedNotesRow.style.display = "none";
        }

        const rowsToHide = [
            "landline-num-row",
            "service-id-row",
            "option82-row",
            "intent-wocas-row",
            "wocas-row"
        ];

        rowsToHide.forEach(id => {
            const row = document.getElementById(id);
            if (row) row.style.display = "none";
        });

        
        // --- RESET LOB ---
        lobSelect.innerHTML = "";
        const blankLobOption = document.createElement("option");
        blankLobOption.value = "";
        blankLobOption.textContent = "";
        blankLobOption.disabled = true;
        blankLobOption.selected = true;
        lobSelect.appendChild(blankLobOption);

        // Only repopulate LOB if channel already has a value
        if (Channel.value !== "") {
            allLobOptions.forEach(optData => {
                if (optData.value !== "") {
                    const opt = document.createElement("option");
                    opt.value = optData.value;
                    opt.textContent = optData.text;
                    lobSelect.appendChild(opt);
                }
            });
        }

        // Reset VOC
        vocSelect.innerHTML = "";
        const placeholder = allVocOptions.find(opt => opt.value === "");
        if (placeholder) {
            vocSelect.appendChild(placeholder.cloneNode(true));
        }

        allVocOptions.forEach(option => {
            if (option.value !== "") {
                vocSelect.appendChild(option.cloneNode(true));
            }
        });
    });
}

// Save generated notes to localStorage
function saveFormData() {
    const selectedChannel = document.getElementById("channel")?.value?.trim();
    const sfCaseNumberElement = document.querySelector('[name="sfCaseNum"]');
    const sfCaseNumber = (sfCaseNumberElement?.value || "").trim();

    const customerNameElement = document.querySelector('[name="custName"]');
    const customerName = customerNameElement?.value.trim();

    const accountNumberElement = document.querySelector('[name="accountNum"]');
    const accountNumber = accountNumberElement?.value.trim();

    const missingFields = [];

    if (!sfCaseNumberElement) {
        showAlert("Case number field is missing on the form.");
        return;
    }

    if (!customerName) missingFields.push("Customer Name*");
    if (!accountNumber) missingFields.push("Account Number*");

    if (selectedChannel !== "CDT-HOTLINE") {
        if (!sfCaseNumber) missingFields.push("SF Case Number*");
    }

    if (missingFields.length > 0) {
        showAlert(`We couldn’t save your notes. Please fill out the following fields:\n\n${missingFields.join("\n")}`);
        return;
    }

    const inquiryForms = [
        "formInqAccSrvcStatus", "formInqLockIn", "formInqCopyOfBill", "formInqMyHomeAcc", "formInqPlanDetails", "formInqAda", "formInqRebCredAdj", "formInqBalTransfer", "formInqBrokenPromise", "formInqCreditAdj", "formInqCredLimit", "formInqNSR", "formInqDdate", "formInqBillDdateExt", "formInqEcaPip", "formInqNewBill", "formInqOneTimeCharges", "formInqOverpay", "formInqPayChannel", "formInqPayPosting", "formInqPayRefund", "formInqPayUnreflected", "formInqDdateMod", "formInqBillRefund", "formInqSmsEmailBill", "formInqTollUsage", "formInqCoRetain", "formInqCoChange", "formInqPermaDisc", "formInqTempDisc", "formInqD1299", "formInqD1399", "formInqD1799", "formInqDOthers", "formInqDdateExt", "formInqEntertainment", "formInqInmove", "formInqMigration", "formInqProdAndPromo", "formInqHomeRefNC", "formInqHomeDisCredit", "formInqReloc", "formInqRewards", "formInqDirectDial", "formInqBundle", "formInqSfOthers", "formInqSAO500", "formInqUfcEnroll", "formInqUfcPromoMech", "formInqUpg1399", "formInqUpg1599", "formInqUpg1799", "formInqUpg2099", "formInqUpg2499", "formInqUpg2699", "formInqUpgOthers", "formInqVasAO", "formInqVasIptv", "formInqVasMOW", "formInqVasSAO", "formInqVasWMesh", "formInqVasOthers", "formInqWireReRoute"
    ]

    const vars = initializeVariables();
    const ffupNotes = ffupButtonHandler(false, false, false, false);
    
    const newTicketNotes = [
        cepCaseTitle(),
        cepCaseDescription(false),
        cepCaseNotes(),
        specialInstButtonHandler(false)
    ].filter(Boolean);

    const techNotes = techNotesButtonHandler(false);
    const nontechNotes = nontechNotesButtonHandler(false);

    const fuseNotes = Array.isArray(techNotes)
        ? `SF/FUSE NOTES:\n${techNotes.join("\n")}`
        : techNotes
            ? `SF/FUSE NOTES:\n${techNotes}`
            : "";

    const cepNotes = newTicketNotes.length
        ? `CEP NOTES:\n${newTicketNotes.join("\n")}`
        : "";

    const bantayKableNotes = bantayKableButtonHandler(false);
    const nonTechIntents = [
        // Complaint
        "formReqNonServiceRebate", "formReqReconnection", "formCompMyHomeWeb", "formCompMisappliedPayment", "formCompUnreflectedPayment", "formCompPersonnelIssue",

        // Inquiry
        ...inquiryForms,
        "formInqBillInterpret",
        "formInqOutsBal",
        "formInqRefund",

        // Follow-up
        "formFfupChangeOwnership",
        "formFfupChangeTelNum",
        "formFfupChangeTelUnit",
        "formFfupDiscoVas",
        "formFfupDispute",
        "formFfupDowngrade",
        "formFfupDDE",
        "formFfupInmove",
        "formFfupMigration",
        "formFfupMisappPay",
        "formFfupNewApp",
        "formFfupOcular",
        "formFfupOverpay",
        "formFfupPermaDisco",
        "formFfupRenew",
        "formFfupResume",
        "formFfupUnbar",
        "formFfupCustDependency",
        "formFfupAMSF",
        "formFfupFinalAcc",
        "formFfupOverpayment",
        "formFfupWrongBiller",
        "formFfupReloc",
        "formFfupRelocCid",
        "formFfupSpecialFeat",
        "formFfupSAO",
        "formFfupTempDisco",
        "formFfupUP",
        "formFfupUpgrade",
        "formFfupVasAct",
        "formFfupVasDel",
        "formFfupReroute",
        "formFfupWT",
        
        // Request
        "formReqAccMgt",
        "formReqAddressMod",
        "formReqTaxAdj",
        "formReqSupRetAccNum",
        "formReqSupChangeAccNum",
        "formReqChgTelUnit",
        "formReqDisconnection",
        "formReqDispute",
        "formReqDowngrade",
        "formReqReconnect",
        "formReqRefund",
        "formReqRelocation",
        "formReqSpecFeat",
        "formReqSpeedAddOn",
        "formReqUfc",
        "formReqUpgrade",
        "formReqVAS",
        "formReqWireReroute",
        "formReqInmove",
        "formReqDDE",
        "formReqMigration",
        "formReqMisappPay",
        "formReqReflectPay",
        "formReqOcular",
        "formReqProofOfSub",
        
        // Others
        "othersToolsDown",
        "othersWebForm",
        "othersEntAcc",
        "othersHomeBro",
        "othersSmart",
        "othersSME177",
        "othersAO",
        "othersRepair",
        "othersBillAndAcc",
        "others164",
        "othersUT"
    ];

    let combinedNotes = "";

    if (nonTechIntents.includes(vars.selectedIntent)) {
        combinedNotes = nontechNotes || bantayKableNotes || "";
    } else if (vars.selectedIntent === "formFfupRepair") {
        const labeledFfup = ffupNotes ? `CEP NOTES:\n${ffupNotes}` : "";
        const labeledTech = techNotes ? `SF/FUSE NOTES:\n${techNotes}` : "";
        combinedNotes = [labeledFfup, labeledTech].filter(Boolean).join("\n\n");
    } else {
        combinedNotes = [fuseNotes, cepNotes].filter(Boolean).join("\n\n");
    }

    combinedNotes = (combinedNotes || "").toString().trim();

    const removeDuplicateBlocks = (text) => {
        const blocks = text.split(/\n\s*\n/);
        const seen = new Set();

        return blocks.filter(block => {
            const normalized = block.replace(/\s+/g, " ").trim();
            if (seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
        }).join("\n\n");
    };

    combinedNotes = removeDuplicateBlocks(combinedNotes);

    const now = new Date();
    const timestamp = now.toLocaleString();

    function generateHotlineKey() {
        const normalize = str => (str || "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        const raw = [
            normalize(document.querySelector('[name="custName"]')?.value),
            normalize(document.querySelector('[name="accountNum"]')?.value),
            normalize(document.querySelector('[name="slctFrm1"]')?.value),
            normalize((combinedNotes || "").slice(0, 100))
        ].join("|");

        // Simple hash → convert to 8-digit number
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }

        return Math.abs(hash).toString().padStart(8, "0").slice(0, 8);
    }

    const fallbackKey = generateHotlineKey();
    const uniqueKey = (selectedChannel === 'CDT-HOTLINE' || !sfCaseNumber)
        ? fallbackKey
        : sfCaseNumber;

    const intentSelect = document.querySelector('[name="slctFrm1"]');

    const intentText = intentSelect
        ? intentSelect.options[intentSelect.selectedIndex]?.text || ""
        : "";

    function getValue(name) {
        return (document.querySelector(`[name="${name}"]`)?.value || "")
            .trim()
            .toUpperCase();
    }

    const savedEntry = {
        timestamp: timestamp,
        callId: fallbackKey,
        selectChannel: getValue("selectChannel"),
        agentName: getValue("agentName"),
        teamLead: getValue("teamLead"),
        sfCaseNumber: sfCaseNumber,
        custName: getValue("custName"),
        selectLOB: getValue("selectLOB"),
        selectVOC: getValue("selectVOC"),
        selectIntent: intentText.trim().toUpperCase(),
        accountNum: getValue("accountNum"),
        landlineNum: getValue("landlineNum"),
        serviceID: getValue("serviceID"),
        Option82: getValue("Option82"),
        WOCAS: getValue("WOCAS"),
        combinedNotes: combinedNotes.toUpperCase(),
        upsell: getValue("upsell"),
        productsOffered: getValue("productsOffered"),
        declineReason: getValue("declineReason"),
        notEligibleReason: getValue("notEligibleReason")
    };

    const savedData = JSON.parse(localStorage.getItem("tempDatabase") || "{}");

    // Check if entry already exists
    if (savedData[uniqueKey]) {
        const existing = savedData[uniqueKey];

        const normalize = str => str.replace(/\s+/g, " ").trim();

        const existingNotes = normalize(existing.combinedNotes || "");
        const newNotes = normalize(savedEntry.combinedNotes || "");

        // No changes
        const hasChanges =
            existingNotes !== newNotes ||
            existing.upsell !== savedEntry.upsell ||
            existing.productsOffered !== savedEntry.productsOffered ||
            existing.declineReason !== savedEntry.declineReason ||
            existing.notEligibleReason !== savedEntry.notEligibleReason;

        if (!hasChanges) {
            showAlert("No changes detected. Notes were not updated.");
            return;
        }

        // Replace existing entry with updated notes and timestamp
        savedData[uniqueKey] = {
            ...existing,
            combinedNotes: savedEntry.combinedNotes,
            upsell: savedEntry.upsell,
            productsOffered: savedEntry.productsOffered,
            declineReason: savedEntry.declineReason,
            notEligibleReason: savedEntry.notEligibleReason,
            lastUpdated: new Date().toLocaleString()
        };

        showAlert("Changes saved successfully.");

    } else {
        savedData[uniqueKey] = {
            ...savedEntry,
            createdAt: savedEntry.timestamp,
            lastUpdated: ""
        };

        showAlert("All set! Your notes have been saved.");
    }

    // Save back to localStorage
    localStorage.setItem("tempDatabase", JSON.stringify(savedData));

}

// Load saved notes from localStorage
function loadFormData() {
    const rawInput = document.querySelector('[name="sfCaseNum"]')?.value || "";
    const sfCaseNumber = rawInput.trim();

    const savedData = JSON.parse(localStorage.getItem("tempDatabase")) || {};

    console.log("Looking for:", sfCaseNumber);
    console.log("Keys:", Object.keys(savedData));

    let savedEntry = savedData[sfCaseNumber];

    if (!savedEntry && sfCaseNumber) {
        savedEntry = Object.values(savedData).find(entry =>
            (entry.sfCaseNumber || "").toUpperCase() === sfCaseNumber
        );
    }

    if (!savedEntry) {
        console.log("No match found.");
        return;
    }

    console.log("Match found:", savedEntry);

    const setValue = (name, value) => {
        const el = document.querySelector(`[name="${name}"]`);
        if (el && value !== undefined && value !== null) {
            el.value = value;

            if (el.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    autoExpandTextarea({ target: el });
                }, 0);
            }
        }
    };

    setValue("sfCaseNum", savedEntry.sfCaseNumber);
    setValue("custName", savedEntry.custName);
    setValue("accountNum", savedEntry.accountNum);
    setValue("landlineNum", savedEntry.landlineNum);

    const buildSavedNotes = (entry) => {
        const parts = [];

        if (entry.timestamp) parts.push(`SAVED ON: ${entry.timestamp}`);
        if (entry.selectLOB) parts.push(`LOB: ${entry.selectLOB}`);
        if (entry.selectVOC) parts.push(`VOC: ${entry.selectVOC}`);
        if (entry.selectIntent) parts.push(`INTENT: ${entry.selectIntent}`);
        if (entry.serviceID) parts.push(`SERVICE ID: ${entry.serviceID}`);
        if (entry.Option82) parts.push(`OPTION82: ${entry.Option82}`);
        if (entry.WOCAS) parts.push(`WOCAS: ${entry.WOCAS}`);

        if (entry.combinedNotes) {
            parts.push(`\n${entry.combinedNotes}`);
        }

        return parts.join("\n");
    };

    setValue("savedNotes", buildSavedNotes(savedEntry));

    const notesRow = document.getElementById("saved-notes-row");

    if (savedEntry && savedEntry.combinedNotes?.trim()) {
        if (notesRow) notesRow.style.display = "table-row";
    }
}

// Export saved notes as a text file, sorted by timestamp
function exportDataAsTxt() {
    const savedData = JSON.parse(localStorage.getItem("tempDatabase") || "{}");
    
    if (Object.keys(savedData).length === 0) {
        showAlert("No data available to export.");
        return;
    }

    const sortedEntries = Object.entries(savedData).sort((a, b) => {
        const timeA = new Date(a[1].timestamp).getTime();
        const timeB = new Date(b[1].timestamp).getTime();
        return timeA - timeB;
    });

    let notepadContent = "";

    for (const [key, entry] of sortedEntries) {
        notepadContent += `SAVED ON: ${entry.timestamp}\n`;

        if (entry.lastUpdated) {
            notepadContent += `LAST UPDATED: ${entry.lastUpdated}\n`;
        }

        const appendIfValid = (label, value) => {
            if (value !== undefined && value !== "undefined") {
                notepadContent += `${label}: ${value}\n`;
            }
        };

        appendIfValid("SF CASE #", entry.sfCaseNumber);
        appendIfValid("CUSTOMER NAME", entry.custName);
        appendIfValid("LOB", entry.selectLOB);
        appendIfValid("VOC", entry.selectVOC);
        appendIfValid("INTENT", entry.selectIntent);
        appendIfValid("ACCOUNT #", entry.accountNum);
        appendIfValid("LANDLINE #", entry.landlineNum);

        const lob = entry.selectLOB ? entry.selectLOB : "";
        const voc = entry.selectVOC ? entry.selectVOC : "";

        if (lob === "NON-TECH") {

        } else {
            if (voc === "COMPLAINT") {
                appendIfValid("SERVICE ID", entry.serviceID);
                appendIfValid("OPTION82", entry.Option82);
            } else if (voc === "REQUEST") {
                appendIfValid("SERVICE ID", entry.serviceID);
                appendIfValid("OPTION82", entry.Option82);
            } else if (voc === "FOLLOW-UP") {
                // Nothing to Append
            } else {
                appendIfValid("SERVICE ID", entry.serviceID);
                appendIfValid("OPTION82", entry.Option82);
            }
        }

        notepadContent += `\nCASE NOTES:\n${entry.combinedNotes}\n`;
        notepadContent += "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n\n";
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    const blob = new Blob([notepadContent], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    link.download = `Saved Notes_${formattedDate}.txt`;

    link.click();
    
    showAlert("Notes exported successfully!");
}

// Export saved notes as an excel file, sorted by timestamp
function exportDataAsExcel() {
    const savedData = JSON.parse(localStorage.getItem("tempDatabase") || "{}");
    
    if (Object.keys(savedData).length === 0) {
        showAlert("No data available to export.");
        return;
    }

    const sortedEntries = Object.entries(savedData).sort((a, b) => {
        const timeA = new Date(a[1].timestamp).getTime();
        const timeB = new Date(b[1].timestamp).getTime();
        return timeA - timeB;
    });

    const excelData = [];

    for (const [key, entry] of sortedEntries) {

        const lob = entry.selectLOB || "";
        const voc = entry.selectVOC || "";

        let serviceID = "";
        let option82 = "";

        if (lob !== "NON-TECH" && voc !== "FOLLOW-UP") {
            serviceID = entry.serviceID || "";
            option82 = entry.Option82 || "";
        }

        excelData.push({
            "Saved On": entry.timestamp || "",
            "Modified On": entry.lastUpdated || "",
            "Channel": entry.selectChannel || "",
            "Agent Name": entry.agentName || "", 
            "Team Leader": entry.teamLead || "", 
            "SF Case #": entry.sfCaseNumber || "",  
            "Customer Name": entry.custName || "",
            "LOB": entry.selectLOB || "",
            "VOC": entry.selectVOC || "",
            "Intent": entry.selectIntent || "",
            "Account #": entry.accountNum || "",
            "Landline #": entry.landlineNum || "",
            "Service ID": serviceID,
            "Option82": option82,
            "Case Notes": entry.combinedNotes || "",
            "Upsell": entry.upsell || "",
            "Products Offered": entry.productsOffered || "",
            "Decline Reason": entry.declineReason || "",
            "Not Eligible Reason": entry.notEligibleReason || ""
        });
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    /* =======================
       COLUMN WIDTHS
    ======================= */
    const headers = Object.keys(excelData[0] || {});

    const colWidths = headers.map(key => ({
        wch: Math.max(
            key.length,
            ...excelData.map(row => String(row[key] || "").length)
        )
    }));

    // Dynamically target "Case Notes" width
    const caseNotesIndex = headers.indexOf("Case Notes");

    if (caseNotesIndex !== -1) {
        colWidths[caseNotesIndex].wch = 40;
    }

    worksheet["!cols"] = colWidths;

    /* =======================
       EXPORT
    ======================= */
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Saved Notes");

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    XLSX.writeFile(workbook, `Saved Notes_${formattedDate}.xlsx`);

    showAlert("Notes exported successfully as Excel file!");
}

// Delete all saved data in localStorage
function deleteAllData() {
    showConfirm2("Are you sure you want to delete all saved records in this workstation?")
    .then((userChoice) => {
        if (!userChoice) return;

        localStorage.clear();
        showAlert("All data has been deleted successfully.");
    });
}

// Show appropriate buttons based on form state
const primaryButtons = {
  saveButton: saveFormData,
  resetButton: resetButtonHandler
};

Object.entries(primaryButtons).forEach(([id, handler]) => {
  document.getElementById(id)?.addEventListener("click", handler);
});

// Form Container Scrollbar Behavior
const container = document.querySelector('.divsContainer');
const scrollbar = document.querySelector('.customScrollbar');

let hideTimeout;
let isDragging = false;
let dragOffset = 0;

// Update scrollbar size & position
function updateScrollbar() {
    const containerHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;

    if (contentHeight <= containerHeight) {
        scrollbar.style.display = 'none';
        return;
    } else {
        scrollbar.style.display = 'block';
    }

    const ratio = containerHeight / contentHeight;
    const thumbHeight = Math.max(ratio * containerHeight, 20);
    scrollbar.style.height = thumbHeight + 'px';

    const maxThumbTop = containerHeight - thumbHeight;
    const scrollPercent = container.scrollTop / (contentHeight - containerHeight);
    scrollbar.style.top = scrollPercent * maxThumbTop + 'px';
}

// Show scrollbar temporarily (scroll, hover, drag)
function showScrollbar() {
    scrollbar.classList.add('active');

    if (hideTimeout) clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
        if (!isDragging) {
            scrollbar.classList.remove('active');
        }
    }, 800);
}

// Dragging
scrollbar.addEventListener('mousedown', e => {
    isDragging = true;
    scrollbar.classList.add('active');
    dragOffset = e.clientY - scrollbar.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        scrollbar.classList.remove('active');
    }
    document.body.style.userSelect = 'auto';
});

document.addEventListener('mousemove', e => {
    if (!isDragging) return;

    const containerHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;
    const thumbHeight = scrollbar.clientHeight;
    const maxThumbTop = containerHeight - thumbHeight;

    // Thumb position follows cursor with dragOffset
    let newThumbTop = e.clientY - container.getBoundingClientRect().top - dragOffset;
    newThumbTop = Math.max(0, Math.min(maxThumbTop, newThumbTop));

    container.scrollTop = (newThumbTop / maxThumbTop) * (contentHeight - containerHeight);
    scrollbar.style.top = newThumbTop + 'px';
});

// Scroll event
container.addEventListener('scroll', () => { updateScrollbar(); showScrollbar(); });
window.addEventListener('resize', () => { updateScrollbar(); showScrollbar(); });

// Observe dynamic content in all children
const mutationObserver = new MutationObserver(() => { updateScrollbar(); showScrollbar(); });
mutationObserver.observe(container, { childList: true, subtree: true, characterData: true });

// Observe height changes of any child dynamically
const resizeObserver = new ResizeObserver(() => { updateScrollbar(); showScrollbar(); });
Array.from(container.children).forEach(child => resizeObserver.observe(child));

updateScrollbar();

// Updates Container
function renderUpdates(containerId, introduction, instructions, versions) {
    const container = document.getElementById(containerId);
    if (!container) return console.error(`Container with ID '${containerId}' not found.`);

    // --- Introduction Section ---
    introduction.forEach(({ version, updates }) => {
        const introductionDiv = document.createElement("div");
        introductionDiv.classList.add("updateItem");

        // clickable title
        const introductionTitle = document.createElement("h3");
        introductionTitle.classList.add("updateTitle");
        introductionTitle.textContent = version || "Standard Notes Generator (Autodocs) V5.4";

        // collapsible content
        const introductionContent = document.createElement("div");
        introductionContent.classList.add("updateContent");

        updates.forEach(section => {
            const sectionDiv = document.createElement("div");

            sectionDiv.innerHTML = `
                <strong>${section.title}</strong>
                <ul>${section.items.map(i => `<li>${i}</li>`).join("")}</ul>
            `;

            introductionContent.appendChild(sectionDiv);
        });

        // toggle behavior
        introductionTitle.addEventListener("click", () => {
            introductionDiv.classList.toggle("active");
        });

        introductionDiv.appendChild(introductionTitle);
        introductionDiv.appendChild(introductionContent);
        container.appendChild(introductionDiv);
    });

    // --- Instructions Section ---
    const instructionsDiv = document.createElement("div");
    instructionsDiv.classList.add("updateItem");
    instructionsDiv.innerHTML = `
        <h3>Instructions</h3>
        <ul>${instructions.map(item => `<li>${item}</li>`).join("")}</ul>
    `;
    container.appendChild(instructionsDiv);

    // --- Updates Sections ---
    versions.forEach(({ version, updates }) => {

        const updatesDiv = document.createElement("div");
        updatesDiv.classList.add("updateItem");

        // clickable title
        const title = document.createElement("h3");
        title.classList.add("updateTitle");
        title.textContent = `${version} Update`;

        // collapsible container
        const content = document.createElement("div");
        content.classList.add("updateContent");

        updates.forEach((section, index) => {

            const sectionDiv = document.createElement("div");

            sectionDiv.innerHTML = `
                <strong>${section.title}</strong>
                <ul>${section.items.map(i => `<li>${i}</li>`).join("")}</ul>
            `;

            content.appendChild(sectionDiv);
        });

        // click toggle
        title.addEventListener("click", () => {
            updatesDiv.classList.toggle("active");
        });

        updatesDiv.appendChild(title);
        updatesDiv.appendChild(content);
        container.appendChild(updatesDiv);
    });
}

const introduction = [
    {
        version: "Standard Notes Generator (Autodocs) V5",
        updates: [
            { title: "About", items: [
                "<strong>Where consistency meets efficiency.</strong>",
                "This tool is designed to standardize and streamline case documentation across all workflows.",
                "By enforcing a consistent structure, it enables agents and support teams to easily track, review, and understand case details.",
                "This reduces manual effort, minimizes errors, and improves overall case handling efficiency and accuracy."
            ]},
            { title: "Features", items: [
                "<strong>Concern Type Categorization:</strong> Easily identify whether a case is technical or non-technical, helping agents apply the correct handling approach.",
                "<strong>Voice of the Customer (VOC) Classification:</strong> Categorizes customer intent (e.g., complaint, request, follow-up, inquiry) for better case understanding and documentation accuracy.",
                "<strong>WOCAS-Based Intents:</strong> Intents are aligned with actual customer statements, guiding agents in selecting the correct option while enabling the system to generate accurate documentation output.",
                "<strong>Saved Notes Checker:</strong> Detects existing saved notes upon startup and prompts agents to either keep or delete them.",
                "<strong>Built-in Notepad:</strong> Provides a dedicated space for temporary notes or frequently used spiels.",
                "<strong>One-Click Copy Function:</strong> Simplifies copying of details or notes with a single click, no manual highlighting needed.",
                "<strong>One-Click Notes Generation:</strong> Automatically generates structured and standardized case notes, eliminating the need for manual formatting.",
                "<strong>Quick Copy for Generated Notes:</strong> Allows agents to instantly copy generated notes directly from the output section.",
                "<strong>Multiple Notes Format Support:</strong> Generates notes in different formats depending on the documentation requirements of the selected tool or process.",
                "<strong>Auto Data Retrieval:</strong> Automatically retrieves previously saved data or notes from the database, reducing the need for repeated data entry.",
                "<strong>Update Notes Feature:</strong> Appends new notes to existing records without overwriting previously saved information.",
                "<strong>Auto-Populate Fields:</strong> Automatically fills in key details such as customer name, account number, landline, concern type, VOC, service ID, Option 82, and WOCAS when available in the database.",
                "<strong>Intent-Based Fields:</strong> Dynamically displays only relevant fields based on the selected intent, ensuring required information is captured while excluding unnecessary inputs.",
                "<strong>Endorsement Notes Generation:</strong> Enables agents to generate endorsement notes aligned with standard endorsement guidelines when escalation is required.",
                "<strong>Instructions and Updates Section:</strong> Centralized area for tool updates, enhancements, and important instructions.",
                "<strong>LIT365 Work Instructions Integration:</strong> Provides intent-specific work instruction links to reduce time spent searching for guidelines.",
                "<strong>Export Saved Notes:</strong> Allows agents to export saved notes into Excel or Notepad format for reporting or backup purposes."
            ]},
        ]
    }
];

const instructions = [
    "Open the tool using the provided link or through smart assistant (Saya). Avoid using the browser's ‘Duplicate Tab’ to ensure the DOM scripts load properly.",
    "To ensure data accuracy, delete any previously saved records on this workstation before saving new ones.",
    "Always utilize the LIT365 work instructions to ensure accurate, consistent, and up-to-date handling of every intent. These guidelines outline the correct process flow and required checks, so make sure to utilize them before completing any action.",
    "Fill out all required fields.",
    "If a field is not required (e.g. L2 fields), leave it blank. Avoid entering 'NA' or any unnecessary details.",
    "Ensure that the information is accurate.",
    "Review your inputs before generating the notes."
];

const versions = [
    {
        version: "V5.4.170426",
        updates: [
            { title: "Prompt & Alert Message Improvements", items: [
                "Improved prompt and alert messages for better clarity and consistency.",
                "Refined wording to make instructions easier to understand.",
                "Minor adjustments for a smoother user experience.",
            ]},
            { title: "Fixes", items: [
                "Moved <strong>Change Configuration - Data</strong> intents from NON-TECH to TECH to match LIT365 standards and improve field visibility based on selection.",
            ]},
        ]
    },
    {
        version: "V5.4.150426",
        updates: [
            { title: "UI Enhancements:", items: [
                "Added Tool Overview. See <strong>Standard Notes Generator (Autodocs) V5</strong> section.",
                "Refined visuals for better readability.",
                "Consolidated multiple secondary actions into a single expandable “More” button to reduce clutter and improve usability.",
            ]},
            { title: "Fixes", items: [
                "<strong>Duplication Detection:</strong> Enhanced fallback key logic for saved hotline notes to improve duplicate detection accuracy.",
            ]},
        ]
    },
    {
        version: "V5.4.080426",
        updates: [
            { title: "Improvements", items: [
                "<strong>Auto Data Retrieval:</strong> Form now automatically loads saved data when a matching SF Case Number is detected, in preparation for live chat to PM/DM migration.",
                "<strong>Improved Matching Logic:</strong> Refined lookup to ensure accurate retrieval from local storage.",
                "<strong>Dynamic Notes Display:</strong> Saved notes section now appears only when data exists.",
                "<strong>Upsell Notes & Tagging:</strong> Added upsell details to notes and Excel (Product Offered, Decline Reason, Not Eligible Reason) for easier tracking.",
                "Enhanced note parsing to replace “|” with “/” in both FUSE and SF notes for consistent formatting.",
                "<strong>Added “Modified On” Timestamp:</strong> Saved and exported notes will now show when they were last updated, making it easier to track recent changes.",
                "<strong>Upsell Notes:</strong> Updated upsell options by mapping selections to predefined tags (e.g., #UpsellAccepted, #UpsellDeclined, #UpsellIgnored, #UpsellUndecided, #UpsellNotEligible)."
            ]},
            { title: "Fixes", items: [
                "<strong>Stability Fixes:</strong> Resolved issue where load function triggered only once.",
                "<strong>UI Behavior Fix:</strong> Addressed textarea auto-expand not triggering on initial load.",
                "<strong>Missing Options in Request Dropdown:</strong> Resolved an issue where only one option was showing under <stong>“Change Configuration - Data”</stong> when selecting a Request. All available options are now displayed correctly.",
                "<strongData Saving Fix: </strong> Saved notes now update correctly when changes are made."
            ]},
        ]
    },
    {
        version: "V5.3.010426",
        updates: [
            { title: "Improvements", items: [
                "Added ESA tagging for SMNT-BAA agents.",
                "Refined declined reason for upselling to enable clearer and more consistent tracking."
            ]},
        ]
    },
    {
        version: "V5.3.270326",
        updates: [
            { title: "Improvements", items: [
                "Added startup detection of existing saved notes with options to keep or delete them before saving new ones.",
                "Added an option to export saved notes to Excel in the Smart Assistant (Saya).",
                "Enhanced note parsing to replace “|” with “/” for consistent formatting."
            ]},
        ]
    },
    {
        version: "V5.3.230326",
        updates: [
            { title: "🎉 Introducing Saya", items: [
                "Meet <strong>Saya</strong>, your smart assistant that provides helpful tips, suggests actions, and makes your workflow faster and easier.",
            ]},
            { title: "🎨 UI Improvements", items: [
                "Improved the layout of alerts and confirmation messages for better clarity",
                "Fixed buttons alignment for a cleaner and more consistent look",
                "Enhanced how pop-ups appear and close for a smoother experience",
                "Reduced screen clutter to help you stay focused",
                "Added NIC Investigation 4 options under NIC-NDT",
                "Enhanced the Option82 field to allow agents to copy either the node or the complete Option82 value."
            ]},
            { title: "🛠️ Fixes", items: [
                "Fixed errors caused by missing functions to improve stability",
                "Corrected NDT intent logic for Copper VDSL accounts under network outage conditions.",
            ]},
            { title: "🚀 Overall Impact", items: [
                "Smoother and more seamless interactions",
                "Cleaner and more organized interface",
                "Faster and more responsive assistant behavior",
                "Easier to understand and use"
            ]},
        ]
    },
    {
        version: "V5.3.130326",
        updates: [
            { title: "✨ Enhancements", items: [
                "Main form behavior updated to display the correct fields based on the selected agent channel.",
                "Improved <strong>Updates</strong> section for better visuals.",
                "Expanded <strong>Notepad</strong> section to provide more space for notes and improve usability.",
                "Improved Upsell Notes integration to capture reasons for declined and ineligible offers for <strong>NIC-NDT</strong>, <strong>NIC</strong>, <strong>SIC</strong> and all <strong>Non-Tech</strong> intents."
            ]},
            { title: "➕ Added", items: [
                "Ordertake option for NSR and Relocation added for tracking purposes.",
                "Upsell <strong>Pending Req. (For callback)</strong> option added.",
                "Non-Tech request intents(<strong>Inmove</strong>, <strong>DDE</strong>, <strong>Migration</strong>, <strong>Misapplied Payment</strong>, <strong>Occular Inspection/Amend SAM</strong>, <strong>Proof of PLDT Subscription</strong>, and <strong>Unreflected Payment</strong>).",
                "<strong>NIC Intent</strong>: Reintroduced Equipment and Modem Brand fields to enable easier identification of the ONU connection type (InterOp vs. Non-InterOp).",
                "Added NIC Investigation 4 options for NIC-NDT intent."
            ]},
            { title: "🛠️ Fixes", items: [
                "Resolved a bug causing decline and ineligibility reasons to not display in the generated notes for all non-technical intents.",
            ]},
        ]
    },
    {
        version: "V5.2.040326",
        updates: [
        { title: "➕ Added", items: [
            "Non-Tech Request intents: <strong>Address Modification (Record), Disconnection, Dispute, Refund, Relocation, Special Features, Speed Add On 500, Unli Fam Call, Upgrade, VAS, Withholding Tax Adjustment,</strong> and <strong>Wire Re-Route</strong>.",
            "<strong>Service ID</strong> is now included in the generated notes for Non-Tech intents.",
            "Enabled <strong>ESA tagging</strong> for all Non-Tech intents (Hotline agents).",
        ]},
        ]
    },
    {
        version: "V5.2.160226",
        updates: [
        { title: "🛠️ Fixed", items: [
            "Formatting issue causing generated endorsement notes to be incorrectly split into multiple sections." ]},
        { title: "✨ Improvements", items: [
            "Enhanced the Endorsement Form to dynamically display only relevant fields based on the selected endorsement type, improving clarity and reducing unnecessary inputs." ]}
        ]
    },
    {
        version: "V5.2.140226",
        updates: [
        { title: "✨ Improvements", items: [
            "Enhanced Endorsement Form UI", 
            "Improved generating endorsement notes" ]},
        { title: "➕ Added", items: [
            "Non-Tech Request intents: <strong>Downgrade</strong> and <strong>Reconnection</strong>.", 
            "<strong>Repeater count</strong> field under FFUP intent.", 
            "<strong>“Not Applicable”</strong> option for ALS offering. This applies to tickets beyond the 24-hour SLA but still within the 36-hour ALS eligibility threshold." ]},
        { title: "🐞 Bug Fixes", items: [
            "Resolved layout overflow issue" ]},
        { title: "➖ Removed", items: [
            "ALS Offering notation from the CEP tool. ALS details will be available exclusively in FUSE or Salesforce (SF) notation.",
            "Ticket creation timer" ]}
        ]
    },
    {
        version: "V5.2.101225",
        updates: [
        { title: "➕ Added", items: ["Instructions to always utilize LIT365 work instructions for proper guidance", "Investigation 4 options for SIC (High Utilization OLT/PON Port)", "DC and RA Exec status fields in the NMS skin"] },
        { title: "✨ Improvements", items: ["UI enhancements for better usability", "Save and Export function enhancements to ensure accurate notation is saved and exported", "Special Instructions functionality", "Case Notes timeline formatting", "Enabled FCR notation for CEP tool"] },
        { title: "🐞 Bug Fixes", items: ["Fixed minor bugs in generated notes", "Resolved SF Tagging issue for SOCMED agents"] }
        ]
    },
    {
        version: "V5.2.131125",
        updates: [
        { title: "➕ Added Non-Tech Follow-up Intents", items: ["Refund", "Relocation", "Relocation - CID Creation", "Special Features", "Speed Add On 500", "Temporary Disconnection (VTD/HTD)", "Unreflected Payment", "Upgrade", "VAS", "Wire Re-Route", "Withholding Tax Adjustment"] }
        ]
    },
    {
        version: "V5.2.301025",
        updates: [
        { title: "✨ Generated FUSE Notes (Hotline)", items: ["Generated notes are automatically divided into sections, eliminating the need for manual formatting or separation"] },
        { title: "🛠️ Fixes", items: ["Resolved issue on Concern Type options not displaying correctly", "Fixed scrolling behavior for smoother navigation through form sections"] },
        { title: "✨ Improvements", items: ["Refined interface for smoother visuals and seamless workflow", "Enhanced user experience for more user-friendly navigation"] },
        ]
    },
    {
        version: "V5.2.291025",
        updates: [
        { title: "➖ Removed fields", items: ["Equipment Brand, Modem Brand, and ONU Connection Type (NIC)"] },
        { title: "➕ Added Intents", items: ["Request for Private IP", "Gaming - High Latency/Lag"] },
        { title: "➕ Added fields", items: ["Clearview Latest real-time request completion date", "Tested OK for Hotline Agents (NIC/SIC/Selective Browsing intents)"] },
        { title: "➕ Added CEP Investigation 4 tagging", items: ["Device and Website IP Configuration (Request for Public/Private IP)", "No Audio/Video Output w/ Test Channel (IPTV Intents)"] },
        { title: "✨ Updated field labels", items: ["'DMS Status' to 'Internet/Data Status'", "'RX Power/OPTICSRXPOWER' to 'RX Power'", "'No. of Connected Devices (L2)' to 'No. of Conn. Devices (L2)'"] },
        { title: "🛠️ Fix", items: ["Resolved Offer ALS notation bug"] },
        { title: "🎨 UI Enhancements", items: ["Slight tweaks for a fresher, more modern feel.", "New Instructions and Updates section: Your quick guide to staying informed!"] }
        ]
    }
];

renderUpdates("updatesContainer", introduction, instructions, versions);

// FAB MENU ELEMENT REFERENCES
const panel = document.getElementById("floatingPanel");
const fabButton = document.getElementById("fabButton");
const fabMenu = document.getElementById("fabMenu");
const fabMessage = document.getElementById("fabMessage");

const intro = "Hi! I’m Saya. Click me to explore more features.";

// Guard (prevents runtime errors)
if (!panel || !fabButton || !fabMenu || !fabMessage) {
    console.warn("FAB Assistant: Missing required elements.");
}

// CONFIGURATION
const FabConfig = {
    typingSpeed: 35,
    hideDelay: 7500,
    randomInterval: 600000,
    actionDelay: 120
};

// PANEL TOGGLE
fabButton?.addEventListener("click", () => {
    panel.classList.toggle("open");
});

// TYPEWRITER
let typingTimer = null;
let isTyping = false;
let stopTyping = false;
let isMessageActive = false;
let messageQueue = [];
let isProcessingQueue = false;
let hideTimer = null;

function typeWriter(text, element, speed, hideDelay = FabConfig.hideDelay, callback) {
    if (!element) return;

    clearTimeout(typingTimer);
    clearTimeout(hideTimer);

    element.classList.remove("hide");

    isTyping = true;
    element.innerHTML = "";

    let i = 0;

    function type() {
        if (stopTyping) {
            element.innerHTML = "";
            isTyping = false;
            if (callback) callback();
            return;
        }

        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            typingTimer = setTimeout(type, speed);
        } else {
            isTyping = false;

            hideTimer = setTimeout(() => {
                element.classList.add("hide");

                if (callback) callback();
            }, hideDelay);
        }
    }

    type();
}

function processQueue() {
    if (isProcessingQueue) return;
    if (messageQueue.length === 0) return;

    isProcessingQueue = true;

    const { text, delay, continueLoop } = messageQueue.shift();

    typeWriter(text, fabMessage, FabConfig.typingSpeed, delay, () => {
        isProcessingQueue = false;

        if (continueLoop) {
            setTimeout(() => {
                enqueueRandomMessage();
            }, FabConfig.randomInterval);
        } else {
            processQueue();
        }
    });
}

function enqueueMessage(text, delay = FabConfig.hideDelay, continueLoop = true) {
    if (!text) return;

    messageQueue.push({ text, delay, continueLoop });
    processQueue();
}

// HOVER BEHAVIOR
fabButton?.addEventListener("mouseenter", () => {
    stopTyping = true;
    clearTimeout(typingTimer);
    fabMessage?.classList.add("hide");
});

fabButton?.addEventListener("mouseleave", () => {
    stopTyping = false;
});

// MENU VISIBILITY (CLASS-BASED)
panel?.addEventListener("mouseenter", () => {
    fabMenu.classList.add("show");
});

panel?.addEventListener("mouseleave", () => {
    fabMenu.classList.remove("show");
});

function runFabAction(action) {
    fabMenu.classList.remove("show");
    setTimeout(action, FabConfig.actionDelay);
}

// BUTTON ACTIONS
function openDuplicateTab() {
    window.open(
        "https://not-a-bot-support.github.io/autodocs/",
        "_blank"
    );
}

// RANDOM MESSAGES
const assistantMessages = {
    tips: [
        // Tips
        "💡You can duplicate this tab anytime. Just click me and select 'Duplicate Tab'!",
        "💡You can use the Notepad section to store temporary notes or frequently used spiels for quick access.",
        "💡To ensure data accuracy, I highly recommend deleting any previously saved records on this workstation before saving new ones.",
        "💡When filling out the form, make sure all required fields are completed.",
        "💡If a field isn’t required (like L2 fields), you can leave it blank, no need to enter “NA” or extra unnecessary details.",

        // DYKs
        "🧠 Did you know? I can help you export your saved notes as a text file. Just click me and select 'Export Saved Notes'!",
        "🧠 Did you know? You can clear saved records in this workstation from my menu.",

        // Reminders
        "ℹ️ LIT365 work instructions outline the correct process flow and required checks, so make sure to utilize them before completing any action.",
        "ℹ️ Always remember! Review your inputs carefully and ensure all information is accurate before generating the notes.",
        "👋 Hey there! Just a quick reminder, I’m here to help with your standard notation, but I’m not a work instruction.",
        "ℹ️ For accurate and up-to-date handling, always utilize the LIT365 Work Instructions.",
        "ℹ️ Always ensure that all actions performed in each tool are properly documented.",
        "ℹ️ Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”.",
        "ℹ️ You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency under the “Other Actions Taken” field.",
    ],

    quotes: [
        "❤️ Every call or case is an opportunity to turn frustration into trust.",
        "❤️ Great agents don’t just answer calls or cases, they solve problems and create better experiences.",
        "❤️ Difficult calls or cases don’t define you; how you handle them does.",
        "❤️ One calm response can change an entire customer experience.",
        "❤️ Consistency, patience, and empathy are the true KPIs of a great agent.",
        "❤️ Every resolved issue is proof that your effort matters.",
        "❤️ Service excellence starts with listening.",
        "❤️ The best agents turn complaints into compliments.",
        "❤️ Stay calm, stay professional, and let your solutions speak for you.",
        "❤️ Behind every ‘thank you for your help’ is a job well done.",
        "❤️ Every conversation is a chance to make someone’s day better.",
        "❤️ A calm response can turn a frustrated customer into a loyal one.",
        "❤️ Great customer service isn’t about having all the answers, it's about caring enough to find them.",
        "❤️ One solved issue today can build a customer’s trust for years.",
        "❤️ Behind every successful team are team members who care about the customer experience.",
        "❤️ Not every call will be easy, but every call is an opportunity to grow.",
        "❤️ Stay calm, stay kind, and let your professionalism lead the way.",
        "❤️ Difficult customers test your patience, but they also sharpen your skills.",
        "❤️ The strongest agents stay composed even when the queue is full.",
        "❤️ Empathy turns service into a positive experience.",
        "❤️ Empathy turns tension into cooperation.",
        "❤️ Your patience today can turn a complaint into appreciation.",
        "❤️ Professionalism shines brightest in challenging conversations.",
        "❤️ Take a deep breath, stay composed, and guide the customer to a solution.",
        "❤️ Respectful communication can soften even the toughest interactions.",
        "❤️ Let empathy guide the conversation, not frustration.",
        "❤️ Difficult moments reveal the strength of a great support agent.",
        "❤️ Handling difficult customers well is a skill that builds true service excellence.",
        "❤️ Empathy can diffuse tension faster than explanations.",
        "❤️ When you understand the customer, the solution becomes obvious.",
        "❤️ Empathy turns difficult calls into manageable conversations.",
        "❤️ Empathy is your most powerful de-escalation tool.",
        "❤️ Understanding saves time, assumptions waste it.",
        "❤️ When you lead with empathy, control follows naturally.",
        "❤️ Empathy isn’t soft, it’s strategic.",
        "❤️ A calm customer starts with a calm, understanding agent.",
        "❤️ The better you connect, the faster you resolve.",
        "❤️ Empathy lowers stress, for both the customer and you.",
        "❤️ Customers cooperate more when they feel heard.",
        "❤️ Empathy builds trust, and trust speeds up every interaction.",
        "❤️ When customers feel understood, they stop resisting solutions.",
        "❤️ Empathy helps you handle calls, not absorb them.",
        "❤️ Empathy improves customer experience without increasing your average handling time.",
        "❤️ The right words early save minutes later.",
        "❤️ One empathetic sentence can prevent a long escalation.",
        "❤️ Customers remember how you made them feel, score that.",
        "❤️ Empathy is the bridge between script and success.",
        "❤️ A smooth call starts with emotional alignment.",
        "❤️ Empathy helps you respond, not react.",
        "❤️ Empathy gives you control in chaotic conversations.",
        "❤️ Empathy is a skill that grows your career, not just your metrics.",
        "❤️ Great agents don’t just solve problems, they understand people.",
        "❤️ Your ability to connect is your competitive advantage.",
        "❤️ Empathy today builds leadership tomorrow.",
        "❤️ The best communicators are the best listeners.",
        "❤️ Empathy sharpens emotional intelligence, your lifelong asset.",
        "❤️ Every call is practice in mastering human interaction.",
        "❤️ Every case is practice in mastering human interaction.",
        "❤️ Empathy doesn’t mean absorbing emotions, it means understanding them.",
        "❤️ You can care without carrying the weight.",
        "❤️ Professional empathy protects your energy.",
        "❤️ Listen deeply, but detach wisely.",
        "❤️ Your role is to guide, not to take things personally.",
        "❤️ You are there to help, not to be affected.",
        "❤️ Strong agents feel, but don’t fall.",
        "❤️ One good conversation can turn someone’s entire day around.",
        "❤️ Small moments of understanding create big impact.",
        "❤️ You don’t just answer calls, you improve experiences.",
        "❤️ Your voice can turn frustration into relief.",
        "❤️ Every interaction is an opportunity to stand out.",
        "❤️ You are the human side of the business.",
        "❤️ Quality is doing it right every time.",
        "🌡️ Behind every angry customer is an unmet expectation.",
        "🌡️ Frustrated customer? Don’t take it personally, take it professionally.",
        "🌡️ Frustration is a signal, not an attack.",
        "🌡️ The louder the customer, the more they need to feel heard.",
        "🌡️ You don’t fix emotions, but you can acknowledge them.",
        "👂 Acknowledging the issue early saves you from explaining twice later.",
        "👂 When customers feel heard, they stop repeating, and you gain control of the call.",
        "👂 A strong acknowledgement sets the tone, you lead the conversation from the start.",
        "👂 Recognition builds cooperation faster than solutions alone.",
        "👂 The first 10 seconds of empathy can save 10 minutes of handling time.",
        "👂 Acknowledging emotions is not extra, it’s strategic efficiency.",
        "👂 When you name the problem clearly, you reduce confusion instantly.",
        "👂 Customers don’t need perfection, they need to feel understood.",
        "👂 A good acknowledgement turns frustration into focus.",
        "👂 Listen to understand, not to respond!",
        "🤝 When you sound in control, the customer feels secure.",
        "🤝 Reassurance turns uncertainty into cooperation.",
        "🤝 Confidence in your words creates confidence in your solution.",
        "🤝 Customers don’t just need answers, they need certainty.",
        "🤝 Your assurance stabilizes the entire interaction.",
        "🤝 When customers trust you, resolution becomes easier.",
        "🤝 Guide the call, don’t let uncertainty take over.",
        "🤝 Reassurance prevents escalation.",
        "🤝 Confidence is part of the solution.",
    ],

    advice: [
        "🌟 Focus on solutions, not just the problem.",
        "🌟 Listen carefully; sometimes customers only need to feel heard.",
        "🌟 When customers raise their voice, raise your patience.",
        "🌟 Respond with solutions, not emotions.",
        "🌟 A calm agent can de-escalate even the most stressful situations.",
        "🌟 Focus on the issue, not the attitude.",
        "🌟 Keep your tone kind, even when the situation isn’t.",
        "🌟 Acknowledge the customer’s concern before offering the solution.",
        "🌟 Focus on helping, not on winning the argument.",
        "🌟 Sometimes the best solution begins with simply listening.",
        "🌟 Keep your responses professional, your tone sets the direction of the conversation.",
        "🌟 A calm explanation can clear confusion and rebuild trust.",
        "🌟 Treat every customer with respect, even when the conversation is challenging.",
        "🌟 Guide the conversation toward solutions with patience and clarity.",
        "🌟 Listen with patience, respond with empathy, and resolve with confidence.",
        "🌟 Listening patiently is the first step to de-escalating any situation.",
        "🌟 Lower your tone, slow the conversation, and guide it toward resolution.",
        "🌟 Let the customer feel heard before you try to be understood.",
        "🌟 Respond with clarity and respect, even when emotions run high.",
        "🌟 Take control of the conversation by staying professional and composed.",
        "🌟 Guide the conversation gently from frustration to resolution.",
        "🌟 Listen to understand, not just to reply. Pay attention to the customer’s real concern so you can provide the most accurate solution.",
        "🌟 Queues get heavy and customers may be frustrated. Remain calm, professional, and solution-focused even during difficult interactions.",
        "🌟 The more you know about the service or system, the faster you can resolve issues. Confidence comes from knowledge.",
        "🌟 Customers want to feel understood. Simple phrases like “I understand how difficult or challenging that must be” can immediately improve the interaction.",
        "🌟 Know how to balance speed and accuracy. Handle each case carefully while keeping an eye on response times.",
        "🌟 Each call or chat is a chance to improve. Successful agents review mistakes, accept feedback, and continuously grow.",
        "🌟 Use clear, polite, and structured responses. A professional tone builds trust and prevents misunderstandings.",
        "🌟 Even when the shift is long, maintaining a positive attitude helps you stay motivated and deliver better service.",
        "🌟 Customers contact support because they need help. Instead of focusing on the problem, focus on what you can do to resolve it.",
    ],

    jokes: [
        // Jokes
        "😆 Keep calm and clear the queue.",
        "😆 Powered by coffee and customer complaints.",
        "😆 The queue never sleeps.",
        "😆 Customer service: where patience becomes a career.",
        "😆 I don’t have anger issues, I just work in customer support.",
        "😆 My job is to turn ‘I want to speak to your manager’ into ‘Thank you for your help!’",
        "😆 Customer support: the art of keeping calm while everything is on fire.",
        "😆 I’m not just an agent, I’m a professional problem solver.",
        "😆 I don’t always handle difficult customers, but when I do, I prefer to do it with a smile.",
        "😆 Customer support: where every day is a new adventure in patience.",
        "😆 I’m not saying I’m a superhero, but have you ever seen me and a superhero in the same room?",
        "😆 My superpower? Turning frustrated customers into satisfied ones.",
        "😆 Customer: ‘I’ve been waiting for hours!\nChat start Time: 20 seconds ago.",
        "😆 Customer: ‘Calm down.\nAgent: Hindi naman ako galit bago ka nag-chat.",
        "😆 Customer: ‘You’re not listening to me!’\nAgent: ‘I’m sorry, I can barely hear you over the sound of your frustration.’",
        "😆 Agent life: Nagso-sorry sa problemang hindi mo naman ginawa.",
        "😆 Customer: “Why is this happening?” \nAgent: Also wondering why.",
        "😆 Customer: ‘Are you still there?’\nAgent: <i>Nagbabasa pa lang ng concern.</i>",
        "😆 Typing… deleting… typing ulit… para lang maging professional.",

        // Suspicious
        "🤔 Avail… suspicious.",
        "🤔 No irate customers today… suspicious.",
        "🤔 Customer says ‘no rush’… suspicious.",
        "🤔 Everything is working fine… suspicious.",
        "🤔 No escalations today… suspicious.",
        "🤔 Customer understood on first explanation… suspicious.",
        "🤔 Call ended in 2 minutes… suspicious.",
        "🤔 QA gave 100% score… suspicious.",
        "🤔 TL said ‘good job’ only… suspicious.",
        "🤔 Shift ended peacefully… suspicious.",
        "🤔 No ‘can I speak to your supervisor?’… suspicious.",
        "🤔 Customer says ‘I’m calm’… suspicious.",
        "🤔 Customer: ‘I won’t take much of your time’… suspicious.",
        "🤔 Customer understood the policy… suspicious.",
        "🤔 Customer read the instructions… suspicious.",
        "🤔 Customer didn’t interrupt… suspicious.",
        "🤔 Customer accepted resolution immediately… suspicious.",
        "🤔 Tools loaded fast… suspicious.",
        "🤔 No downtime announcement… suspicious.",
        "🤔 No error message today… suspicious.",
        "👀 Avail… parang may something.",
        "👀 Walang irate today… suspicious ah.",
        "👀 Customer na-gets agad… suspicious.",
        "👀 Walang escalation buong shift… hmm suspicious.",
        "👀 Ang bilis ng call… parang may mali ah.",
        "👀 Tools walang error… grabe suspicious.",
        "👀 Perfect QA? Ay wow… suspicious.",
    ],

    hugot: [
        "🥺 Sa trabaho kaya kong mag-sorry kahit hindi ko kasalanan… pero sa relasyon, ako pa rin ang iniwan.",
        "🥺 Parang queue lang ang feelings ko, akala ko tapos na, may papasok pa pala.",
        "🥺 Akala ko okay na ako, pero parang queue, bumabalik pa rin.",
        "🥺 Kung ang puso ko may status, siguro ‘Waiting for resolution’.",
        "🥺 Parang customer concern ang feelings ko, lagi na lang unresolved.",
        "🥺 Sana may troubleshooting din para sa broken heart.",
        "🥺 Parang escalation lang tayo… dumating ka lang para ipasa ako sa iba.",
        "🥺 Parang ticket ko sa system ang love life ko, lagi na lang awaiting for resolution.",
        "🥺 Sa BPO ko lang naranasan maging kalmado kahit internally nasasaktan.",
        "🥺 Sana relasyon din natin may QA score… para alam ko kung saan ako nagkulang.",
        "🥺 Kung may recording or transcript lang sa relasyon natin, malalaman ko kung kailan nagbago.",
        "🥺 Hindi lang queue ang mahirap i-handle… pati feelings ko.",
        "🥺 Parang shift schedule lang tayo, hindi talaga nagtatagpo.",
        "🥺 Parang internet connection… akala ko stable, biglang nawawala.",
        "🥺 Sana sinabi mo na lang agad… para hindi ako nag-invest ng effort.",
        "🥺 Sana puso ko may ‘End Chat’ button… para tapos na agad.",
        "🥺 Parang queue ang memories natin, kahit ayaw ko na, bumabalik pa rin.",
        "🥺 Akala ko clear na ang queue… pati pala ikaw babalik pa.",
        "🥺 Sana feelings ko may resolution agad… hindi yung laging follow-up.",
        "🥺 Akala ko resolved na… yun pala reopen lang ulit.",
        "🥺 Parang escalation lang ako sa buhay mo, ipinasa mo lang sa iba.",
        "🥺 Akala ko ako na ang final resolution… escalation lang pala ako.",
        "🥺 Sa relasyon natin, ako ang nag-handle… pero sa iba ka nagpa-resolve.",
        "🥺 Kung may evaluation lang ang feelings mo, baka alam ko kung bakit bumagsak.",
        "🥺 Ginawa ko naman lahat… pero parang QA audit, may nakita ka pa ring mali.",
        "🥺 Sa work kaya kong i-handle ang galit ng customer… pero hindi ang pagkawala mo.",
        "🥺 Sa BPO natutunan kong maging kalmado… kahit nasasaktan na.",
        "🥺 Kaya kong i-resolve ang customer issues… pero hindi ang feelings ko.",
        "🥺 Ako night shift, ikaw day shift… siguro kaya hindi tayo nag-work.",
        "🥺 Parang customer concern lang ako sa buhay mo, nireplyan mo lang kasi kailangan.",
        "🥺 Sa customer kaya kong sabihin ‘I understand your concern’… pero hanggang ngayon hindi ko pa rin maintindihan kung bakit mo ako iniwan.",
        "🥺 Sa trabaho may QA feedback… sa’yo wala man lang explanation.",
        "🥺 Mas mabilis ko pang naintindihan ang customer issue kaysa sa relasyon natin.",
        "🥺 Sa trabaho kaya kong ayusin ang problema ng iba… pero sarili kong feelings hindi ko ma-troubleshoot.",
        "🥺 Mas mabilis pa mag-reply ang irate customer kaysa sa’yo.",
        "🥺 Parang system outage ang feelings ko sa’yo, lahat affected.",
        "🥺 Parang queue ang love life ko, laging maraming issue.",
        "🥺 Mas malinaw pa instructions ng customer kaysa sa intentions mo.",
        "🥺 Sa work may knowledge base… sa’yo wala akong reference kung ano ba talaga tayo.",
        "🥺 Parang ticket lang ako sa buhay mo, sinilip mo lang, pero hindi mo inasikaso.",
        "🥺 Mas madali pang i-handle ang escalation kaysa sa mixed signals mo.",
        "🥺 Sa customer may resolution… sa’yo puro confusion.",
        "🥺 Mas consistent pa ang queue kaysa sa effort mo.",
        "🥺 Parang system update ka… biglang nagbago nang walang notification.",
        "🥺 Mas predictable pa ang queue kaysa sa mood mo.",
        "🥺 Parang knowledge base ka… marami akong gustong malaman pero kulang ang sagot.",
        "🥺 Sa trabaho lahat ng issue may case number… sa’yo hindi ko alam kung saan magsisimula.",
        "🥺 Mas madaling intindihin ang complicated na customer kaysa sa ugali mo.",
        "🥺 Sa trabaho may escalation path… sa’yo wala akong mapuntahan.",
        "🥺 Sa trabaho may SLA… sa’yo walang timeline kung kailan magiging okay.",
        "🥺 Parang auto-reply lang ako sa buhay mo… nandiyan pero walang tunay na meaning.",
        "🥺 Sa trabaho may step-by-step troubleshooting… sa’yo puro trial and error.",
        "🥺 Mas mabilis pa ma-resolve ang customer issue kaysa sa misunderstandings natin.",
        "🥺 Mas madaling sundan ang troubleshooting steps kaysa sa mood mo.",
        "🥺 Parang loading screen ang relasyon natin, ang tagal bago maintindihan kung saan papunta.",
        "🥺 Mas madaling magpaliwanag sa irate customer kaysa ipaintindi ang halaga ko sa’yo.",
        "🥺 Sa training may nesting period… sana sa feelings ko rin may practice muna bago masaktan.",
        "🥺 Parang trainee ako sa buhay mo… laging may room for improvement pero hindi sapat.",
        "🥺 Sa training may coaching… sa’yo walang nag-guide kung saan ako nagkamali.",
        "🥺 Parang trainee lang ako sa’yo… umaasang mapansin ng trainer.",
        "🥺 Sa training may graduation… pero sa’yo parang hindi ako nakaabot.",
        "🥺 Parang trainee ako sa feelings mo… hindi pa ready for regularization.",
        "🥺 Sa training may knowledge check… sa’yo wala akong tamang sagot.",
        "🥺 Parang trainee ako sa relasyon natin… trying my best pero kulang pa rin.",
        "🥺 Sa training may feedback… sa’yo wala man lang explanation.",
        "🥺 Parang trainee ako sa’yo… maraming effort pero hindi pa rin enough.",
        "🥺 Sa training may learning curve… sa’yo parang pababa.",
        "🥺 Sa training kaya kong pumasa sa assessments… pero sa’yo parang bagsak pa rin.",
        "🥺 Sa TL may feedback… sa’yo puro mixed signals.",
        "🥺 Sa TL may guidance… sa’yo iniwan mo lang ako mag-figure out.",
        "🥺 Sa TL may team huddle… sa’yo hindi man lang tayo nag-usap.",
        "🥺 Parang TL ka sa buhay ko… lagi mo akong pinapaisip kung sapat ba ako.",
        "🥺 Sa TL may coaching plan… sa’yo walang direction.",
        "🥺 Parang TL ka sa queue… lumalapit lang kapag mabigat na.",
        "🥺 Sa TL may encouragement… sa’yo puro confusion.",
        "🥺 Parang TL ka… alam mong may mali pero hindi mo sinasabi agad.",
        "🥺 Sa TL may performance review… sa’yo hindi ko alam kung pasado ba ako.",
        "🥺 Parang TL ka sa buhay ko… may authority pero hindi ko maintindihan.",
        "🥺 Parang TL ka sa buhay ko… alam kong may sasabihin ka, kinakabahan lang ako kung ano.",
        "😉 Hindi kita binagsak, may pinapaayos lang ako — QA",
        "😉 Hindi kulang effort mo, kulang lang ng isang linya — QA",
        "😉 Alam kong kaya mo, kaya kita kino-correct — QA",
        "😉 Kung hindi kita i-coach, hindi ka magle-level up — TL",
        "😉 Hindi ako kalaban, quality lang ang pinoprotektahan ko — QA",
        "😉 I see your effort, now let’s fix the gaps — QA",
        "😉 Magaling ka na, polish na lang kulang — QA",
        "😄 Na-resolve mo… pero hindi mo na-document — QA",
        "😄 Nasa isip mo, pero wala sa call — QA",
        "😄 Nasa isip mo, pero wala sa transcript — QA",
        "😅 Kaya mo ‘yan, kaya hindi kita pinalampas — QA",
        "😉 Hindi kita pinapahirapan, tinutulungan lang kitang humusay — QA",
    ]
};

// RANDOM MESSAGE PRIO
const messagePrio = {
    tips: 0.5,
    quotes: 0.2,
    advice: 0.2,
    jokes: 0.05,
    hugot: 0.05
};

function getWeightedCategory() {
    const categories = Object.keys(messagePrio);
    const weights = Object.values(messagePrio);

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const rand = Math.random() * totalWeight;

    let cumulative = 0;

    for (let i = 0; i < categories.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
            return categories[i];
        }
    }

    return categories[categories.length - 1]; // fallback
}

let lastMessage = "";

function randomAssistantMessage() {
    const category = getWeightedCategory();
    const messages = assistantMessages[category];

    if (!messages || messages.length === 0) return "";

    if (messages.length === 1) {
        lastMessage = messages[0];
        return messages[0];
    }

    const filtered = messages.filter(m => m !== lastMessage);
    const newMessage = filtered[Math.floor(Math.random() * filtered.length)];

    lastMessage = newMessage;
    return newMessage;
}

// MESSAGE DISPLAY
function showInitialMessage() {
    enqueueMessage(intro, 2500);
}

showInitialMessage();

function showAssistantMessage() {
    if (isTyping || !fabMessage) return;

    const text = randomAssistantMessage();
    if (!text) return;

    stopTyping = false;
    typeWriter(text, fabMessage, FabConfig.typingSpeed);
}

function showIntentMessage(text) {
    if (!text) return;

    messageQueue = [];
    stopTyping = true;

    setTimeout(() => {
        stopTyping = false;
        enqueueMessage(text, 2500, false);
    }, 50);
}

function enqueueRandomMessage() {
    if (panel.classList.contains("open")) return;

    const text = randomAssistantMessage();
    if (!text) return;

    enqueueMessage(text);
}

// CUSTOM ALERT
function showAlert(message) {
  const overlay = document.getElementById("customAlert");
  const messageBox = document.getElementById("alertMessage");
  const okBtn = document.getElementById("alertOkBtn");

  messageBox.textContent = message;

  // SHOW (fade in)
  overlay.classList.remove("hide");
  overlay.style.display = "flex";
  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  const closeAlert = () => {
    overlay.classList.remove("show");
    overlay.classList.add("hide");

    setTimeout(() => {
      overlay.style.display = "none";
      overlay.classList.remove("hide");
    }, 300); // match CSS transition
  };

  okBtn.onclick = closeAlert;
}

// CUSTOM CONFIRM
function showConfirm1(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("customConfirm1");

    const messageBox = overlay.querySelector("#confirmMessage1");
    const okBtn = overlay.querySelector("#confirmDelete");
    const cancelBtn = overlay.querySelector("#confirmKeep");

    messageBox.textContent = message;

    overlay.classList.remove("hide");
    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("show"));

    const cleanup = (result) => {
      overlay.classList.remove("show");
      overlay.classList.add("hide");

      setTimeout(() => {
        overlay.style.display = "none";
        overlay.classList.remove("hide");
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        resolve(result);
      }, 300);
    };

    okBtn.onclick = () => cleanup(true);
    cancelBtn.onclick = () => cleanup(false);
  });
}

function showConfirm2(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("customConfirm2");

    const messageBox = overlay.querySelector("#confirmMessage2");
    const okBtn = overlay.querySelector("#confirmOk");
    const cancelBtn = overlay.querySelector("#confirmCancel");

    messageBox.textContent = message;

    overlay.classList.remove("hide");
    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("show"));

    const cleanup = (result) => {
      overlay.classList.remove("show");
      overlay.classList.add("hide");

      setTimeout(() => {
        overlay.style.display = "none";
        overlay.classList.remove("hide");
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        resolve(result);
      }, 300);
    };

    okBtn.onclick = () => cleanup(true);
    cancelBtn.onclick = () => cleanup(false);
  });
}