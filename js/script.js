//script.js

// Standard Notes Generator Version 5.2.101225
// Developed & Designed by: QA Ryan

// Channel, Concern Type, and VOC Options
let lobSelect, vocSelect, intentSelect;
let serviceIDRow, option82Row, intentWocasRow, wocasRow;;
let allLobOptions, allVocOptions, allIntentChildren, placeholderClone;

function initializeFormElements() {
    lobSelect = document.getElementById("lob");
    vocSelect = document.getElementById("voc");
    intentSelect = document.getElementById("selectIntent");

    serviceIDRow = document.getElementById("service-id-row");
    option82Row = document.getElementById("option82-row");
    intentWocasRow = document.getElementById("intent-wocas-row");
    wocasRow = document.getElementById("wocas-row");

    allVocOptions = Array.from(vocSelect.options).map(opt => opt.cloneNode(true));
    vocSelect.innerHTML = "";

    const placeholder = allVocOptions.find(opt => opt.value === "");
    if (placeholder) {
        vocSelect.appendChild(placeholder);
    }

    allIntentChildren = Array.from(intentSelect.children).map(el => el.cloneNode(true));

    const placeholderOption = allIntentChildren.find(el => el.tagName === "OPTION" && el.value === "");
    placeholderClone = placeholderOption ? placeholderOption.cloneNode(true) : null;

    allLobOptions = [
        { value: "", text: "" },
        { value: "TECH", text: "TECH" },
        { value: "NON-TECH", text: "NON-TECH" }
    ];

    // Start LOB with only blank option
    lobSelect.innerHTML = "";
    const blankOption = document.createElement("option");
    blankOption.value = "";
    blankOption.textContent = "";
    blankOption.disabled = true;  // <-- cannot select
    blankOption.selected = true;  // <-- default shown
    lobSelect.appendChild(blankOption);
}

function showRowAndScroll(rowElement) {
    rowElement.style.display = "";
    rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideRow(rowElement) {
    rowElement.style.display = "none";
}

const channelField = document.getElementById("channel");

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

function handleLobChange() {
    const lobSelectedValue = lobSelect.value;

    resetForm2ContainerAndRebuildButtons();

    vocSelect.innerHTML = "";

    const placeholder = allVocOptions.find(opt => opt.value === "");
    if (placeholder) {
        vocSelect.appendChild(placeholder);
    }

    allVocOptions.forEach(option => {
    if (
            (lobSelectedValue === "TECH" && ["COMPLAINT", "FOLLOW-UP", "REQUEST", "OTHERS"].includes(option.value)) ||
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

    // Show only blank option
    intentSelect.innerHTML = "";
    if (placeholderClone) {
        intentSelect.appendChild(placeholderClone.cloneNode(true));
    }

    // Show-Hide Intent/OCAS Options
    let group = "";

    if (lobValue === "TECH") {
        if (vocValue === "COMPLAINT") {
            const techComplaintGroups = [
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

            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTGROUP" && techComplaintGroups.includes(el.label)) {
                    intentSelect.appendChild(el.cloneNode(true));
                } else if (el.tagName === "OPTION" && techComplaintGroups.includes(el.value)) {
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
            group = "others";

            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTION" && el.dataset.group === group) {
                    intentSelect.appendChild(el.cloneNode(true));
                } else if (el.tagName === "OPTGROUP") {
                    const matchingOptions = Array.from(el.children).filter(opt => opt.dataset.group === group);
                    if (matchingOptions.length > 0) {
                        const newGroup = el.cloneNode(false);
                        matchingOptions.forEach(opt => newGroup.appendChild(opt.cloneNode(true)));
                        intentSelect.appendChild(newGroup);
                    }
                }
            });
        }
    } else if (lobValue === "NON-TECH") {
        // Map vocValue to group
        let groupMap = {
            "INQUIRY": "inquiry",
            "COMPLAINT": "complaint",
            "FOLLOW-UP": "follow-up",
            "REQUEST": "request",
            "OTHERS": "others"
        };

        let group = groupMap[vocValue];

        // Loop through intent children once
        allIntentChildren.forEach(el => {
            if (el.tagName === "OPTION" && el.dataset.group === group) {
                // Add matching option
                intentSelect.appendChild(el.cloneNode(true));

            } else if (el.tagName === "OPTGROUP") {
                let matchingOptions;

                // Special handling for REQUEST + "Change Configuration - Data"
                if (vocValue === "REQUEST" && el.label === "Change Configuration - Data") {
                    matchingOptions = Array.from(el.children).filter(opt => opt.value === "form300_1");
                } else {
                    matchingOptions = Array.from(el.children).filter(opt => opt.dataset.group === group);
                }

                if (matchingOptions.length > 0) {
                    const newGroup = el.cloneNode(false); // clone optgroup label only
                    matchingOptions.forEach(opt => newGroup.appendChild(opt.cloneNode(true)));
                    intentSelect.appendChild(newGroup);
                }
            }
        });
    }

    intentSelect.selectedIndex = 0;
}

function registerEventHandlers() {
    lobSelect.addEventListener("change", handleLobChange);
    vocSelect.addEventListener("change", handleVocChange);
}

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

function autoExpandTextarea(event) {
    if (event.target.tagName === 'TEXTAREA') {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 1}px`;
    }
}

document.addEventListener('input', autoExpandTextarea);

function copyValue(button) {
    const input = button.previousElementSibling || document.getElementById("option82");
    if (input) {
        let valueToCopy;

        if (input.id === "option82") {
            valueToCopy = input.value.split("_")[0];
        } else {
            valueToCopy = input.value;
        }

        navigator.clipboard.writeText(valueToCopy)
            .catch(err => console.error("Error copying text: ", err));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const copyButtons = document.querySelectorAll("button.input-and-button");
    copyButtons.forEach(button => {
        button.addEventListener("click", () => copyValue(button));
    });

    const option82Button = document.getElementById("copyButton");
    if (option82Button) {
        option82Button.addEventListener("click", () => copyValue(option82Button));
    }
});

function resetAllFields(excludeFields = []) {
    const selects = document.querySelectorAll("#form2Container select");
    selects.forEach(select => {
        if (!excludeFields.includes(select.name)) { 
            select.selectedIndex = 0; 
        }
    });
}

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

function getFieldValueIfVisible(fieldName) {
    if (!isFieldVisible(fieldName)) return "";

    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return "";

    let value = field.value.trim();

    if (field.tagName.toLowerCase() === "textarea") {
        value = value.replace(/\n/g, "/ ");
    }

    return value;
}

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

function createForm2() {
    const selectIntent = document.getElementById("selectIntent");
    const form2Container = document.getElementById("form2Container");

    form2Container.innerHTML = "";

    const selectedValue = selectIntent.value;
    const channelField = document.getElementById("channel");

    var form = document.createElement("form");
    form.setAttribute("id", "Form2");

    // if (!channelField) {
    //     selectIntent.selectedIndex = 0; 
    //     alert("Please select your designated channel.");
        
    //     const footer = document.getElementById("footerValue");
    //     typeWriter("Standard Notes Generator Version 5.2.101225", footer, 50);
        
    //     resetForm2ContainerAndRebuildButtons();
    //     return; 
    // }
    
    const selectedOption = selectIntent.options[selectIntent.selectedIndex];
    let footerText = selectedOption.textContent;

    const lobValue = document.getElementById("lob").value;

    if (lobValue === "NON-TECH") {
        const optgroupElement = selectedOption.parentElement;
        if (optgroupElement.tagName === "OPTGROUP") {
            const optgroupLabel = optgroupElement.label;
            footerText = `${optgroupLabel} - ${footerText}`;
        }
    }

    const footer = document.getElementById("footerValue");
    typeWriter(footerText, footer, 50);

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

    const requestForms = [
        "formReqGoGreen", "formReqUpdateContact", "formReqSrvcRenewal", "formReqBillAdd", "formReqSrvcAdd", "formReqTaxAdj", "formReqChgTelUnit", "formReqDiscoVAS", "formReqTempDisco", "formReqNSR", "formReqRentMSF", "formReqRentLPN", "formReqNRC", "formReqSCC", "formReqTollUFC", "formReqOtherTolls" 
    ]

    const othersForms = [
        "othersWebForm", "othersEntAcc", "othersHomeBro", "othersSmart", "othersSME177", "othersAO", "othersRepair", "othersBillAndAcc", "othersUT"
    ]

    const ffupForms = [
        "formFfupChangeOwnership", "formFfupChangeTelNum", "formFfupChangeTelUnit", "formFfupDiscoVas", "formFfupDispute", "formFfupDowngrade", "formFfupDDE", "formFfupInmove", "formFfupMigration", "formFfupMisappPay", "formFfupNewApp", "formFfupOcular", "formFfupOverpay", "formFfupPermaDisco", "fomFfupRenew", "fomFfupResume", "fomFfupUnbar", "formFfupCustDependency", "formFfupAMSF", "formFfupFinalAcc", "formFfupOverpayment", "formFfupWrongBiller", "formFfupReloc", "formFfupRelocCid", "formFfupSpecialFeat", "formFfupSAO", "formFfupTempDisco", "formFfupUP", "formFfupUpgrade", "formFfupVasAct", "formFfupVasDel", "formFfupReroute", "formFfupWT"
    ]

    const alwaysOnForms = [
        "form500_5", "form501_7", "form101_5", "form510_9", "form500_6"
    ]

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
                "Previous Agent Already Offered ALS"
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
            { label: "Re-Open Status Reason", type: "textarea", name: "reOpenStatsReason", placeholder: "Indicate the reason for re-opening the ticket (Dispatched to Field Technician - Re-Open or Escalated to Network - Re-Open)." },
            // Cross Sell/Upsell
            { label: "Cross Sell/Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const queue = document.querySelector("[name='queue']");
        const projRed = document.querySelector("[name='projRed']");
        const ticketStatus = document.querySelector("[name='ticketStatus']");
        const offerALS = document.querySelector("[name='offerALS']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        queue.addEventListener("change", () => {
            resetAllFields(["subject1", "statusReason","subStatus", "queue"]);
            if (queue.value === "FM POLL" || queue.value === "CCARE OFFBOARD") {
                showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "issueResolved", "upsell" ]);
                hideSpecificFields(["projRed", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason" ]);

                updateToolLabelVisibility();

            }else if (queue.value === "Default Entity Queue") {
                showFields(["ffupCount", "ticketAge", "remarks", "issueResolved", "upsell"]);
                hideSpecificFields(["projRed", "ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason" ]);

                updateToolLabelVisibility();

            } else {
                showFields(["projRed" ]);
                hideSpecificFields(["ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "ffupCount", "ticketAge", "remarks", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason", "upsell" ]);

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

        projRed.addEventListener("change", () => {
            resetAllFields(["subject1", "statusReason","subStatus", "queue", "projRed"]);
            if (projRed.value === "Yes") {
                if (queue.value === "SDM CHILD" || queue.value ==="SDM" || queue.value ==="FSMG" || queue.value ==="L2 RESOLUTION" ) {
                    showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "contactName", "cbr", "upsell" ]);
                        hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "availability", "address", "landmarks", "reOpenStatsReason" ]);
                } else {
                    showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "contactName", "cbr", "availability", "address", "landmarks", "upsell" ]);
                    hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "reOpenStatsReason" ]);
                }

                updateToolLabelVisibility();

            } else if (projRed.value === "No"){
                showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "upsell" ]);
                hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason" ]);

                updateToolLabelVisibility();

            } else {
                hideSpecificFields(["ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "ffupCount", "ticketAge", "remarks", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason", "upsell" ]);

                updateToolLabelVisibility();
            }
            updateToolLabelVisibility();
        });

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

        issueResolved.addEventListener("change", () => {
            if (issueResolved.value === "No") {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason" ]);
                updateToolLabelVisibility();
            } else {
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks", "reOpenStatsReason" ]);
                updateToolLabelVisibility();
            }
            updateToolLabelVisibility();
        });
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
                "FCR - Cannot Browse", 
                "FCR - Cannot Connect via LAN", 
                "FCR - Cannot Connect via WiFi", 
                "FCR - Device - Advised Physical Set-Up",
                "FCR - Low BW profile",
                "FCR - Slow/Intermittent Browsing",
                "Individual Trouble", 
                "Misaligned Record", 
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler, 
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        const resType = document.querySelector("[name='resType']");
        const outageStatus = document.querySelector("[name='outageStatus']");
        const onuRunStats = document.querySelector("[name='onuRunStats']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "onuSerialNum", "modemLights", "option82Config", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["onuSerialNum", "modemLights", "actualExp", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "option82Config", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "issueResolved"]);

                    if (channelField.value === "CDT-SOCMED") {
                        showFields(["resolution"]);
                    } else {
                        hideSpecificFields(["resolution"]);
                    }
                } else {
                    showFields(["onuSerialNum", "modemLights", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "option82Config", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
            } else if (facility.value === "Fiber - Radius") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "cvReading", "rtaRequest", "actualExp", "issueResolved"]);

                    if (channelField.value === "CDT-SOCMED") {
                        showFields(["resolution"]);
                    } else {
                        hideSpecificFields(["resolution"]);
                    }
                } else {
                    alert("This form is currently unavailable for customers with Fiber - Radius service.");
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    const facilityField = document.querySelector('[name="facility"]');
                    if (facilityField) facilityField.value = "";
                    return;
                }
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "issueResolved", "resolution", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "remarks", "issueResolved", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    alert("This form is currently unavailable for customers with Fiber - DSL service.");
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                    const resTypeField = document.querySelector('[name="resType"]');
                    if (resTypeField) resTypeField.value = "";
                    return;
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "resolution", "issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility();
        });
    
        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["onuSerialNum", "option82Config", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "issueResolved", "availability", "address", "landmarks"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else {
                if (facility.value === "Fiber") {
                    showFields(["onuSerialNum", "modemLights", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "cvReading", "rtaRequest", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "option82Config", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["onuSerialNum", "modemLights", "cvReading", "rtaRequest", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuRunStats", "rxPower", "vlan", "nmsSkinRemarks", "option82Config", "actualExp", "resolution", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                
            }
            updateToolLabelVisibility();
        });

        onuRunStats.addEventListener("change", () => {
            if (onuRunStats.value === "UP" || onuRunStats.value === "Active") {
                showFields(["option82Config"]);
            } else {
                hideSpecificFields(["option82Config"]);
            }
            updateToolLabelVisibility();
        });
    
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
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        const resType = document.querySelector("[name='resType']");
        const oltAndOnuConnectionType = document.querySelector("[name='oltAndOnuConnectionType']");
        const services = document.querySelector("[name='services']");
        const outageStatus = document.querySelector("[name='outageStatus']");
        const issueResolved = document.querySelector("[name='issueResolved']");

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
                hideSpecificFields(["onuSerialNum", "modemLights", "callType", "oltAndOnuConnectionType", "dmsVoipServiceStatus", "dmsRemarks", "fsx1Status", "routingIndex", "callSource", "ldnSet", "nmsSkinRemarks", "issueResolved", "availability", "address", "landmarks"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
                updateToolLabelVisibility();
            }

            updateToolLabelVisibility();
        });

        services.addEventListener("change", () => {
            if (services.value === "Voice Only") {
                if (outageStatus.value === "No") {
                    showFields(["dmsVoipServiceStatus"])
                }
            } else {
                hideSpecificFields(["dmsVoipServiceStatus"])
            }
        });

        oltAndOnuConnectionType.addEventListener("change", () => {
            if (oltAndOnuConnectionType.value === "FEOL - Non-interOp") {
                showFields(["fsx1Status"]);
            } else {
                hideSpecificFields(["fsx1Status"]);
            }
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
            // { label: "Equipment Brand", type: "select", name: "equipmentBrand", options: [
            //     "", 
            //     "FEOL", 
            //     "HUOL"
            // ]},
            // { label: "Modem Brand", type: "select", name: "modemBrand", options: [
            //     "", 
            //     "FHTT", 
            //     "HWTC", 
            //     "ZTEG",
            //     "AZRD",
            //     "PRLN",
            //     "Other Brands"
            // ]},
            // { label: "ONU Connection Type", type: "select", name: "onuConnectionType", options: [
            //     "", 
            //     "InterOp", 
            //     "Non-interOp"
            // ]},
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
                "Network Trouble - Cannot Browse",
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        const resType = document.querySelector("[name='resType']");
        const outageStatus = document.querySelector("[name='outageStatus']");
        const onuRunStats = document.querySelector("[name='onuRunStats']");
        // const equipmentBrand = document.querySelector("[name='equipmentBrand']");
        const modemBrand = document.querySelector("[name='modemBrand']");
        const onuConnectionType = document.querySelector("[name='onuConnectionType']");
        const connectionMethod = document.querySelector("[name='connectionMethod']");
        const issueResolved = document.querySelector("[name='issueResolved']");
        const resolution = document.querySelector("[name='resolution']");
        const testedOk = document.querySelector("[name='testedOk']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form500_1") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form500_2") {
                    showFields(["nmsSkinRemarks", "dmsRemarks", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "connectionMethod", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["meshtype", "meshOwnership", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }

                updateToolLabelVisibility();
            } else if (facility.value === "Fiber - Radius") {
                if (selectedValue === "form500_1") {
                    showFields(["connectionMethod", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "meshtype", "meshOwnership", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form500_3" || selectedValue === "form500_4") {
                    showFields(["meshtype", "meshOwnership", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    alert("This form is currently unavailable for customers with Fiber - Radius service.");
                    resetAllFields([]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                    const facilityField = document.querySelector('[name="facility"]');
                    if (facilityField) facilityField.value = "";
                    return;
                }
                
                updateToolLabelVisibility();
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }

            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue=== "form500_1") {
                    showFields(["outageStatus"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else if (selectedValue === "form500_2") {
                    showFields(["remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                } else {
                    showFields(["meshtype", "meshOwnership", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                }
                
                updateToolLabelVisibility();
            } else {
                showFields(["remarks", "issueResolved"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }

            updateToolLabelVisibility();
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (selectedValue === "form500_1" && facility.value === "Fiber" && outageStatus.value === "No") {
                showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "option82Config", "dmsWifiState", "dmsLanPortStatus", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else if (selectedValue === "form500_1" && facility.value === "Copper VDSL" && outageStatus.value === "No") {
                showFields(["onuSerialNum", "intLightStatus", "wanLightStatus", "connectionMethod", "remarks", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "option82Config", "onuRunStats", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "intLightStatus", "wanLightStatus", "onuRunStats", "option82Config", "rxPower", "vlan", "ipAddress", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "dmsInternetStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "dmsSelfHeal", "dmsRemarks", "connectionMethod", "actualExp", "issueResolved", "testedOk", "availability", "address", "landmarks"]);
                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            }
            updateToolLabelVisibility();
        });

        onuRunStats.addEventListener("change", () => {
            if (onuRunStats.value === "UP" || onuRunStats.value === "Active") {
                showFields(["option82Config"]);
            } else {
                hideSpecificFields(["option82Config"]);
            }
            updateToolLabelVisibility();
        });

        // function updateONUConnectionType() {
        //     if (!equipmentBrand.value || !modemBrand.value) {
        //         onuConnectionType.value = ""; 
        //         onuConnectionType.dispatchEvent(new Event("change")); 
        //         return;
        //     }

        //     const newValue =
        //         (equipmentBrand.value === "FEOL" && modemBrand.value === "FHTT") ||
        //         (equipmentBrand.value === "HUOL" && modemBrand.value === "HWTC")
        //             ? "Non-interOp"
        //             : "InterOp";

        //     if (onuConnectionType.value !== newValue) {
        //         onuConnectionType.value = ""; 
        //         onuConnectionType.dispatchEvent(new Event("change")); 

        //         setTimeout(() => {
        //             onuConnectionType.value = newValue; 
        //             onuConnectionType.dispatchEvent(new Event("change")); 
        //         }, 0);
        //     }
        // }

        // onuConnectionType.addEventListener("mousedown", (event) => {
        //     event.preventDefault();
        // });

        // equipmentBrand.addEventListener("change", updateONUConnectionType);
        // modemBrand.addEventListener("change", updateONUConnectionType);

        // updateONUConnectionType();

        // onuConnectionType.addEventListener("change", () => {
        //     if (onuConnectionType.value === "Non-interOp") {
        //         showFields(["vlan", "ipAddress", "connectedDevices"]);
        //     } else {
        //         hideSpecificFields(["vlan", "ipAddress", "connectedDevices"]);
        //     }
        //     updateToolLabelVisibility();
        // });
    
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const facility = document.querySelector("[name='facility']");
        const resType = document.querySelector("[name='resType']");
        const outageStatus = document.querySelector("[name='outageStatus']");
        const connectionMethod = document.querySelector("[name='connectionMethod']");
        const issueResolved = document.querySelector("[name='issueResolved']");
        const resolution = document.querySelector("[name='resolution']");
        const testedOk = document.querySelector("[name='testedOk']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                showFields(["outageStatus"]);
                hideSpecificFields(["resType", "planDetails", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
                updateToolLabelVisibility(); 
            } else if (facility.value === "Fiber - Radius") {
                showFields(["planDetails", "connectionMethod", "pingTestResult", "speedTestResult", "remarks", "issueResolved"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "remarks","issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "resolution", "testedOk" ,"issueResolved", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility(); 
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                showFields(["outageStatus"]);
                hideSpecificFields(["planDetails", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "remarks", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "issueResolved", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);
            }
            updateToolLabelVisibility(); 
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "remarks", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "rptCount", "upsell"]);
                hideSpecificFields(["planDetails", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "issueResolved", "testedOk", "availability", "address", "landmarks"]);

                if (channelField.value === "CDT-SOCMED") {
                    showFields(["resolution"]);
                } else {
                    hideSpecificFields(["resolution"]);
                }
            } else {
                if (facility.value === "Fiber") {
                    showFields(["planDetails", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "connectionMethod", "pingTestResult", "speedTestResult", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "outageReference", "pcNumber", "deviceBrandAndModel", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);

                } else {
                    showFields(["planDetails", "connectionMethod", "pingTestResult", "speedTestResult", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "rxPower", "option82Config", "saaaBandwidthCode", "connectedDevices", "nmsSkinRemarks", "cvReading", "rtaRequest", "onuModel", "dmsInternetStatus", "deviceWifiBand", "bandsteering", "dmsRemarks", "deviceBrandAndModel", "actualExp", "resolution", "testedOk", "investigation1", "investigation2", "investigation3", "investigation4", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount", "upsell"]);   
                }
                updateToolLabelVisibility(); 
            }

            updateToolLabelVisibility(); 
        });

        connectionMethod.addEventListener("change", () => {
            if (connectionMethod.value === "WiFi") {
                showFields(["deviceBrandAndModel"]);
            } else {
                hideSpecificFields(["deviceBrandAndModel"]);
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
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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
                fields.splice(index + 1, 0, { // 👈 insert AFTER the tool label
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
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
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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
            // row.style.display = "table-row";

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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
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
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
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
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler, 
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
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
            // Cross-Sell/Upsell
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]},
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler,
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
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

    // Tech Requests
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
            // { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
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

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            techNotesButtonHandler, 
            endorsementForm, 
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
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
    else if (requestForms.includes(selectedValue)) { 
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
                formReqGoGreen: "Requests for enrollment in the Go Green program",
                formReqUpdateContact: "Requests to update the account's contact information (Primary or Secondary)",
                formReqSrvcRenewal: "Requests for renewal of a service (subscription, contract, or add-on)",
                formReqBillAdd: "Requests for modification of the billing address (without SO creation)",
                formReqSrvcAdd: "Requests for modification of the service address with SO creation for AMEND SAM",
                formReqTaxAdj: "Requests for a tax adjustment (typically for Microbusiness accounts)",
                formReqChgTelUnit: "Requests for change of telephone unit (SO creation)",
                formReqDiscoVAS: "Requests for the disconnection of Value-Added Services (VAS) such as Mesh, Cignal Add-on, Always-On, etc.",
                formReqTempDisco: "Requests for the temporary disconnection of the account",
                formReqNSR: "Requests for bill adjustment related to rebate on non-service",
                formReqRentMSF: "Requests for dispute on rental adjustment for Monthly Service Fee (MSF)",
                formReqRentLPN: "Requests for dispute on rental adjustment for Value-Added Services (VOD such as Netflix, LGP, VIU)",
                formReqNRC: "Requests for dispute on rental adjustment for non-recurring charges and one-time device costs (e.g., remaining device balance)",
                formReqSCC: "Requests for dispute on rental adjustment for service connection charges (e.g., relocation, reconnection, in-move fees)",
                formReqTollUFC: "To be updated.",
                formReqOtherTolls: "To be updated.",
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
            const custAuthEl = document.querySelector('[name="custAuth"]');
            const custAuth = custAuthEl ? custAuthEl.value : "";

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
            li4.textContent = "Active account or No treatment";

            const li5 = document.createElement("li");
            li5.textContent = "No open Service Order (SO)";

            const li6 = document.createElement("li");
            li6.textContent = "If the account is still within the lock-in period, advise the customer to settle the Pre-Termination Fee (PTF) at the Smart/PLDT Sales and Service Center (SSC) and then proceed with the request for disconnection of the Value-Added Service (VAS)";

            const li7 = document.createElement("li");
            li7.textContent = "At least 1 year in tenure";

            const li8 = document.createElement("li");
            li8.textContent = "Paid maintenance fee";

            const li9 = document.createElement("li");
            li9.textContent = "Zero outstanding balance at the time of request";

            if (selectedValue === "formReqTaxAdj") {
                [li1, li2, li3].forEach(li => ulReq.appendChild(li));
            } else if (selectedValue === "formReqChgTelUnit") {
                [li4, li5].forEach(li => ulReq.appendChild(li));
            } else if (selectedValue === "formReqDiscoVAS") {
                ulReq.appendChild(li6);
            } else if (selectedValue === "formReqTempDisco") {
                [li7, li8, li9].forEach(li => ulReq.appendChild(li));
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
            "formReqDiscoVAS",
            "formReqTempDisco"
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
            clHeader.textContent = requestType;
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
                requestTypeRow = row; // keep reference
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

    } else if (selectedValue === "formReqPermaDisco") {
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
            li1.textContent = "Requests for the permanent disconnection of the account";
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
            li1.textContent = "Paid Pre-Termination Fee (PTF) and any remaining gadget amortization (if applicable)";
            ulReq.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "Paid all unbilled toll charges";
            ulReq.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "No open disputes";
            ulReq.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "No pending bill-related concerns";
            ulReq.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "Zero balance on Monthly Service Fee (MSF)";
            ulReq.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "Picture of Valid ID";

            const li7 = document.createElement("li");
            li7.textContent = "Proof of Payment-Final Amount";

            const li8 = document.createElement("li");
            li8.textContent = "Duly signed Letter of Undertaking (LOU)";

            const li9 = document.createElement("li");
            li9.textContent = "LOA (Letter of Authorization signed by the SOR)";

            const li10 = document.createElement("li");
            li10.textContent = "One (1) valid ID of the representative";

            const li11 = document.createElement("li");
            li11.textContent = "For Deceased SOR: Death Certificate and Valid ID of requestor";

            if (ownership === "SOR") {
                [li6, li7, li8].forEach(li => ulReq.appendChild(li));
            } else if (ownership === "Non-SOR") {
                [li9, li10, li11].forEach(li => ulReq.appendChild(li));
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
    
    } else if (selectedValue === "formReqReconnection") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, or “CONDUCT BTS”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
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
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: [
                "", 
                "Yes",
                "No - Customer is Unresponsive",
                "No - Customer Declined Further Assistance",
                "No - System Ended Chat"
            ] },
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
        ];

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivPrompt"; 

            const header = document.createElement("p");
            header.textContent = "Checklist:";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Verify full payment of the total amount due.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "Check SLA (2 hours).";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Confirm if the service is working after completing all reconnection steps. If not, provide the 2-hour SLA spiel.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Verify eligibility for PTP based on credit rating and past broken promises.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "Verify if there is an open Unbar SO.";
            ul.appendChild(li5);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custConcern", "ownership", "custAuth", "ticketStatus", "remarks", "upsell", "issueResolved"];
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

            if (field.name === "custAuth") {
                table.appendChild(createPromptRow());
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
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
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
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
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
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
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
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
            { label: "Upsell", type: "select", name: "upsell", options: [
                "", 
                "Yes - Accepted", 
                "No - Declined",
                "No - Ignored",
                "NA - Not Eligible"
            ]}
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
                fomFfupRenew: "Follow-up on Reconnection from PD requests: considered within SLA if made within 5 calendar days from SO issuance, and beyond SLA if made after 5 calendar days",
                fomFfupResume: "Follow-up on Reconnection from TD requests: considered within SLA if made within 24-48 hours for churn or within 2 hours for regular payment, and beyond SLA if made after 48 hours for churn or after 2 hours for regular payment",
                fomFfupUnbar: "Follow-up on Reconnection from CK requests: considered within SLA if made within 2 hours upon SO issuance and beyond SLA if made after 2 hours",
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
                    subUl.className = "checklist-sub"; // optional, for styling

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
            "formFfupDiscoVas", "formFfupDowngrade", "formFfupInmove", "formFfupMigration", "formFfupNewApp", "formFfupPermaDisco", "fomFfupRenew", "fomFfupResume", "fomFfupUnbar", "formFfupReloc", "formFfupTempDisco", "formFfupUpgrade"
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
                "fomFfupRenew": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "fomFfupResume": [
                    "Activation Task",
                    "No SO Generated",
                    "System Task / Stuck SO"
                ],
                "fomFfupUnbar": [
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

document.getElementById("selectIntent").addEventListener("change", createForm2);

function createButtons(buttonLabels, buttonHandlers) {
    const vars = initializeVariables();

    const channelField = document.getElementById("channel").value;
    const buttonTable = document.createElement("table");
    let buttonIndex = 0;

    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const row = document.createElement("tr");
        let hasButton = false;

        for (let colIndex = 0; colIndex < 4; colIndex++) {
            const cell = document.createElement("td");

            while (buttonIndex < buttonLabels.length) {
                let label = buttonLabels[buttonIndex];

                const isHotline = channelField === "CDT-HOTLINE";

                if (isHotline) {
                    if (label === "Salesforce") {
                        label = "FUSE";
                    }

                    if (label === "SF Tagging" || label === "Endorse") {
                        buttonIndex++;
                        continue;
                    }
                } else if (vars.selectedIntent === "formFfupRepair" && label === "Salesforce") {
                    label = "SF & FUSE";
                }

                if (label === "CEP" && vars.selectedIntent !== "formFfupRepair") {
                    const dropdown = document.createElement("div");
                    dropdown.classList.add("dropdown");

                    const mainButton = document.createElement("button");
                    mainButton.textContent = "CEP ⮝";
                    mainButton.classList.add("form2-button", "dropdown-toggle");

                    const dropdownContent = document.createElement("div");
                    dropdownContent.classList.add("dropdown-content");

                    const subOptions = [
                        { label: "Title", keys: ["Title"] },
                        { label: "Description", keys: ["Description"] },
                        { label: "Case Notes", keys: ["Case Notes in Timeline"] },
                        { label: "Special Inst.", keys: ["Special Instructions"] }
                    ];

                    subOptions.forEach(option => {
                        const subBtn = document.createElement("button");
                        subBtn.textContent = option.label;
                        subBtn.onclick = () => cepButtonHandler(true, option.keys);
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

function optionNotAvailable() {
    const vars = initializeVariables();

    if (isFieldVisible("facility")) {
        if (vars.facility === "") {
            alert("Please complete the form.");
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

function ffupButtonHandler(
    showFloating = true,
    enableValidation = true,
    includeSpecialInst = true,  
    showSpecialInstSection = true 
) {
    const vars = initializeVariables();

    const missingFields = [];
    if (!vars.channel) missingFields.push("Channel");
    if (!vars.pldtUser) missingFields.push("PLDT Username");

    if (enableValidation && missingFields.length > 0) {
        alert(`Please fill out the following fields: ${missingFields.join(", ")}`);
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

    const okButton = document.getElementById("okButton");
    okButton.textContent = "Close";

    okButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
        floatingDiv.style.display = "none";
        overlay.style.display = "none";
        }, 300);
    };
}

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
                    alert("Please fill out Investigation 4 to proceed.");
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

function validateRequiredFields(filter = []) {
    const fieldLabels = {
        // Description
        "Option82": "Option82",
        "investigation3": "Investigation 3",

        // Case Notes in Timeline
        "facility": "Facility",
        "resType": "Residential Type",
        "outageStatus": "Network Outage Status",
        "accountType": "Account Type",
        "WOCAS": "WOCAS",
        "investigation1": "Investigation 1",
        "investigation2": "Investigation 2",
        "investigation4": "Investigation 4",
        "req4retracking": "Request for Retracking",
        "stbID": "Set-Top-Box ID",
        "smartCardID": "Smartcard ID",
        "cignalPlan": "Cignal TV Plan",
        "onuSerialNum": "Modem/ONU Serial #",
        "onuRunStats": "NMS Skin ONU Status",
        "cvReading": "Clearview Reading",

        // Special Instructions
        "specialInstruct": "Special Instructions",
        "contactName": "Contact Person",
        "cbr": "CBR",
        "availability": "Availability",
        "address": "Complete Address",
        "landmarks": "Nearest Landmarks"
    };

    const emptyFields = [];

    for (const field in fieldLabels) {
        const inputField = document.querySelector(`[name="${field}"]`);
        if (isFieldVisible(field)) {
        const isEmpty =
            !inputField ||
            inputField.value.trim() === "" ||
            (inputField.tagName === "SELECT" && inputField.selectedIndex === 0);

        if (isEmpty) {
            emptyFields.push(fieldLabels[field]);
        }
        }
    }

    let alertFields = [];

    if (filter.length === 0 || filter.includes("Title")) {
        // Don't alert for anything
        alertFields = [];
    } else if (filter.includes("Description")) {
        // Only alert for Option82 and Investigation 3 if they're missing
        const importantKeys = ["Option82", "Investigation 3"];
        alertFields = emptyFields.filter(field => importantKeys.includes(field));
    } else if (filter.includes("Case Notes in Timeline")) {
        const importantKeys = ["Facility", "Residential Type", "Network Outage Status", "Account Type", "WOCAS", "Investigation 1", "Investigation 2", "Investigation 3", "Investigation 4", "Request for Retracking", "Set-Top-Box Serial Number", "Smartcard ID", "Cignal TV Plan", "Modem/ONU Serial #", "NMS Skin ONU Status", "Clearview Reading"];
        alertFields = emptyFields.filter(field => importantKeys.includes(field));
    } else if (filter.includes("Special Instructions")) {
        const importantKeys = ["Network Outage Status", "Special Instructions", "Contact Person", "CBR", "Availability", "Complete Address", "Nearest Landmarks"];
        alertFields = emptyFields.filter(field => importantKeys.includes(field));
    }

    if (alertFields.length > 0) {
        alert(`Please complete the following field(s): ${alertFields.join(", ")}`);
    }

    return { emptyFields, alertFields };
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
        alert("This option is not available. Please use the Salesforce or FUSE button.");
        return;
    }

    const { emptyFields, alertFields } = validateRequiredFields(filter);
    if (alertFields.length > 0) return;

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

    const okButton = document.getElementById("okButton");
    okButton.textContent = "Close";
    okButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

function getSfFieldValueIfVisible(fieldName) {
    const vars = initializeVariables();
    
    if (!isFieldVisible(fieldName)) return "";

    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return "";

    let value = field.value.trim();

    if (field.tagName.toLowerCase() === "textarea") {
        value = value.replace(/\n/g, "/ ");
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

    function validateRequiredFields() {
        const fieldLabels = {
            "WOCAS": "WOCAS",
            "remarks": "Actions Taken",
            "upsell": "Upsell",
        };

        let requiredFields = Object.keys(fieldLabels);

        const emptyFields = [];

        requiredFields.forEach(field => {
            const inputField = document.querySelector(`[name="${field}"]`);
            if (isFieldVisible(field)) {
                if (!inputField || inputField.value.trim() === "" ||
                    (inputField.tagName === "SELECT" && inputField.selectedIndex === 0)) {
                    emptyFields.push(fieldLabels[field]);
                }
            }
        });

        if (emptyFields.length > 0) {
            alert(`Please complete the following field(s): ${emptyFields.join(", ")}`);
        }

        return emptyFields;
    }

    function constTechCAOutput() {
        const fields = [

            // Probing
            { name: "remarks" },

            // Alternative Services
            { name: "offerALS"},
            { name: "alsPackOffered"},
            { name: "effectiveDate", label: "Effectivity Date" },
            { name: "nomiMobileNum", label: "MOBILE #" }
        ];

        const seenFields = new Set();
        let actionsTakenParts = [];

        fields.forEach(field => {
            const inputElement = document.querySelector(`[name="${field.name}"]`);
            let value = getSfFieldValueIfVisible(field.name);

            value = getSfFieldValueIfVisible(field.name);

            if (inputElement && inputElement.tagName === "SELECT" && inputElement.selectedIndex === 0) {
                return;
            }

            const offerALS = document.querySelector('[name="offerALS"]')?.value || "";
            const alsPackValue = getSfFieldValueIfVisible("alsPackOffered");

            if (value && !seenFields.has(field.name)) {
                seenFields.add(field.name);

                if (field.name === "offerALS") {
                    let alsValue = "";

                    if (offerALS === "Offered ALS/Accepted") {
                        alsValue = `Customer Accepted ${alsPackValue || "ALS"} Offer`;
                    } else if (offerALS === "Offered ALS/Declined") {
                        alsValue = "Offered ALS But Customer Declined";
                    } else if (offerALS === "Offered ALS/No Confirmation") {
                        alsValue = "Offered ALS But No Confirmation";
                    } else if (offerALS === "Previous Agent Already Offered ALS") {
                        alsValue = "Previous Agent Already Offered ALS";
                    }

                    if (alsValue) actionsTakenParts.push(alsValue);
                } else {
                    actionsTakenParts.push((field.label ? `${field.label}: ` : "") + value);
                }
            }
        });

        const issueResolvedValue = document.querySelector('[name="issueResolved"]')?.value || "";
        if (issueResolvedValue === "Yes") {
            actionsTakenParts.push("Resolved");
        } else if (issueResolvedValue === "No - Customer is Unresponsive") {
            actionsTakenParts.push("Customer is Unresponsive");
        } else if (issueResolvedValue === "No - Customer Declined Further Assistance") {
            actionsTakenParts.push("Customer Declined Further Assistance");
        } else if (issueResolvedValue === "No - System Ended Chat") {
            actionsTakenParts.push("System Ended Chat");
        }

        const upsellValue = document.querySelector('[name="upsell"]')?.value || "";
        let upsellNote = "";
        if (upsellValue === "Yes - Accepted") {
            upsellNote = "#CDNTUPGACCEPTED";
        } else if (upsellValue === "No - Declined") {
            upsellNote = "#CDNTUPGDECLINED";
        } else if (upsellValue === "No - Ignored") {
            upsellNote = "#CDNTUPGIGNORED";
        } else if (upsellValue === "NA - Not Eligible") {
            upsellNote = "#CDNTUPGNOTELIGIBLE";
        }

        let actionsTaken = "A: " + actionsTakenParts.join("/ ");

        if (upsellNote) {
            actionsTaken += "\n\n" + upsellNote;
        }

        return actionsTaken.trim();
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
    // const pcNumber = formatField("PARENT", "pcNumber");
    // const cepCaseNumber = formatField("", "cepCaseNumber");
    const minNumber = formatField("/ AFFECTED MIN", "minNumber");

    const combinedInfo = [
        custName, sfCaseNum, minNumber
        // , pcNumber, cepCaseNumber
    ]
        .filter(Boolean)
        .join("/ "); 

    const selectedOptGroupLabel = vars.selectedOptGroupLabel ? `/ ${vars.selectedOptGroupLabel}` : "";
    const selectedIntentText = vars.selectedIntentText ? `/ ${vars.selectedIntentText}` : "";
    const queue = formatField("/ QUEUE", "queue");
    const ffupCount = formatField("/ FFUP COUNT", "ffupCount");
    const ticketAge = formatField("/ CASE AGE", "ticketAge");
    // const wocas = formatField("/ WOCAS", "WOCAS");

    const emptyFields = validateRequiredFields();
    if (emptyFields.length > 0) return;

    if (vars.selectedIntent === "formFfupRepair") {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}_${vars.pldtUser}/ FOLLOW-UP REPAIR ${vars.ticketStatus}${queue}${ffupCount}${ticketAge}`;
        actionsTakenCopiedText = constTechCAOutput();
    } else if (optGroupIntents.includes(vars.selectedIntent)) {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}${selectedOptGroupLabel}`;
        actionsTakenCopiedText = constTechCAOutput();
        if (vars.channel === "CDT-HOTLINE") {
            otherDetailsCopiedText = constOtherDetails();
        }
    } else if (optTextIntents.includes(vars.selectedIntent)) {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}${selectedIntentText}`;
        actionsTakenCopiedText = constTechCAOutput();
        if (vars.channel === "CDT-HOTLINE") {
            otherDetailsCopiedText = constOtherDetails();
        }
    } else if (alwaysOnIntents.includes(vars.selectedIntent)) {
        concernCopiedText = `${combinedInfo}\nC: ${vars.channel}${selectedIntentText} (ALWAYS ON)`;
        actionsTakenCopiedText = constTechCAOutput();
        if (vars.channel === "CDT-HOTLINE") {
            otherDetailsCopiedText = constOtherDetails();
        }
    }

    concernCopiedText = concernCopiedText.toUpperCase();
    actionsTakenCopiedText = actionsTakenCopiedText.toUpperCase();
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

    const okButton = document.getElementById("okButton");
    okButton.textContent = "Close";
    okButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

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
            value = value.replace(/\n/g, " / ");
        } else {
            value = value.replace(/\n/g, "/ ");
        }
    }

    return value;
}

function nontechNotesButtonHandler(showFloating = true) {
    const vars = initializeVariables();

    let concernCopiedText = "";
    let actionsTakenCopiedText = "";

    function validateRequiredFields() {
        const fieldLabels = {
            "srNum": "SR Number",
            "custConcern": "Concern",
            "ownership": "Ownership",
            "custAuth": "Customer Authentication",
            "findings": "Cause of Misapplied Payment",
            "paymentChannel": "Payment Channel",
            "otherPaymentChannel": "Other Payment Channel",
            "issueResolved": "Issue Resolved",
            "upsell": "Upsell",
            "eSnowTicketNum": "E-Solve/Snow Ticket Number"
        };

        let requiredFields = Object.keys(fieldLabels);

        if (vars.selectedIntent === "othersUT") {
            requiredFields = requiredFields.filter(field => field !== "custConcern");
        }

        const emptyFields = [];

        requiredFields.forEach(field => {
            const inputField = document.querySelector(`[name="${field}"]`);
            if (isFieldVisible(field)) {
                if (!inputField || inputField.value.trim() === "" ||
                    (inputField.tagName === "SELECT" && inputField.selectedIndex === 0)) {
                    emptyFields.push(fieldLabels[field]);
                }
            }
        });

        if (emptyFields.length > 0) {
            alert(`Please complete the following field(s): ${emptyFields.join(", ")}`);
        }

        return emptyFields;
    }

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
        ];

        const seenFields = new Set();
        let actionsTakenParts = [];

        fields.forEach(field => {
            const inputElement = document.querySelector(`[name="${field.name}"]`);
            let value = getFuseFieldValueIfVisible(field.name);

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
                actionsTakenParts.push((field.label ? `${field.label}: ` : "") + value);
            }
        });

        const affectedTool = getFuseFieldValueIfVisible("affectedTool");
        const otherTool = getFuseFieldValueIfVisible("otherTool");

        if (affectedTool === "Other PLDT tools") {
            if (otherTool) {
                actionsTakenParts.push(`${otherTool} Downtime`);
            }
        } else if (affectedTool) {
            actionsTakenParts.push(`${affectedTool} Downtime`);
        }

        const issueResolvedValue = document.querySelector('[name="issueResolved"]')?.value || "";
        if (issueResolvedValue === "Yes") {
            actionsTakenParts.push("Resolved");
        } else if (issueResolvedValue === "No - Customer is Unresponsive") {
            actionsTakenParts.push("Customer is Unresponsive");
        } else if (issueResolvedValue === "No - Customer Declined Further Assistance") {
            actionsTakenParts.push("Customer Declined Further Assistance");
        } else if (issueResolvedValue === "No - System Ended Chat") {
            actionsTakenParts.push("System Ended Chat");
        }

        const upsellValue = document.querySelector('[name="upsell"]')?.value || "";
        let upsellNote = "";
        if (upsellValue === "Yes - Accepted") {
            upsellNote = "#CDNTUPGACCEPTED";
        } else if (upsellValue === "No - Declined") {
            upsellNote = "#CDNTUPGDECLINED";
        } else if (upsellValue === "No - Ignored") {
            upsellNote = "#CDNTUPGIGNORED";
        } else if (upsellValue === "NA - Not Eligible") {
            upsellNote = "#CDNTUPGNOTELIGIBLE";
        }

        let actionsTaken = "A: " + actionsTakenParts.join("/ ");

        if (upsellNote) {
            actionsTaken += "\n\n" + upsellNote;
        }

        const eSnowTicketNum = getFuseFieldValueIfVisible("eSnowTicketNum");
        if (eSnowTicketNum) {
            actionsTaken += eSnowTicketNum;
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
    const soSrNum = formatField("", "srNum");

    const inquiryForms = [
        "formInqAccSrvcStatus", "formInqLockIn", "formInqCopyOfBill", "formInqMyHomeAcc", "formInqPlanDetails", "formInqAda", "formInqRebCredAdj", "formInqBalTransfer", "formInqBrokenPromise", "formInqCreditAdj", "formInqCredLimit", "formInqNSR", "formInqDdate", "formInqBillDdateExt", "formInqEcaPip", "formInqNewBill", "formInqOneTimeCharges", "formInqOverpay", "formInqPayChannel", "formInqPayPosting", "formInqPayRefund", "formInqPayUnreflected", "formInqDdateMod", "formInqBillRefund", "formInqSmsEmailBill", "formInqTollUsage", "formInqCoRetain", "formInqCoChange", "formInqPermaDisc", "formInqTempDisc", "formInqD1299", "formInqD1399", "formInqD1799", "formInqDOthers", "formInqDdateExt", "formInqEntertainment", "formInqInmove", "formInqMigration", "formInqProdAndPromo", "formInqHomeRefNC", "formInqHomeDisCredit", "formInqReloc", "formInqRewards", "formInqDirectDial", "formInqBundle", "formInqSfOthers", "formInqSAO500", "formInqUfcEnroll", "formInqUfcPromoMech", "formInqUpg1399", "formInqUpg1599", "formInqUpg1799", "formInqUpg2099", "formInqUpg2499", "formInqUpg2699", "formInqUpgOthers", "formInqVasAO", "formInqVasIptv", "formInqVasMOW", "formInqVasSAO", "formInqVasWMesh", "formInqVasOthers", "formInqWireReRoute"
    ];

    const requestForms = [
        "formReqGoGreen", "formReqUpdateContact", "formReqSrvcRenewal", "formReqBillAdd", "formReqSrvcAdd", "formReqTaxAdj", "formReqChgTelUnit", "formReqDiscoVAS", "formReqPermaDisco", "formReqTempDisco", "formReqNSR", "formReqRentMSF", "formReqRentLPN", "formReqNRC", "formReqSCC", "formReqTollUFC", "formReqOtherTolls", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
    ];

    const ffupForms = [
        "formFfupChangeOwnership", "formFfupChangeTelUnit", "formFfupDDE",, "formFfupRelocCid", "formFfupReroute", "formFfupWT"
    ];

    const ffupFormsBasedOnFindings = [
        "formFfupChangeTelNum", "formFfupDowngrade", "formFfupInmove", "formFfupMigration", "formFfupNewApp", "formFfupOcular", "formFfupDiscoVas", "formFfupPermaDisco", "fomFfupRenew", "fomFfupResume", "fomFfupUnbar", "formFfupReloc", "formFfupSAO", "formFfupUpgrade"
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
    
    // non-Tech Complaints
    if (vars.selectedIntent === "formCompMyHomeWeb") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formCompMisappliedPayment") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ ${vars.selectedIntentText} - ${vars.findings}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formCompUnreflectedPayment") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formCompPersonnelIssue") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ ${vars.personnelType} COMPLAINT${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }
    
    // non-Tech Inquiries
    else if (inquiryForms.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formInqBillInterpret") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ BILL INTERPRETATION - ${vars.subType}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formInqOutsBal") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ OUTSTANDING BALANCE - ${vars.subType}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formInqRefund") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ REFUND - ${vars.subType}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }
    
    // Non-Tech Follow-Ups
    else if (ffupForms.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupDispute") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

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

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP ${disputeNotes}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();
    } else if (ffupFormsBasedOnFindings.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

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
            concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText} ${findingsMap[vars.findings]}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        }
        actionsTakenCopiedText = constructFuseOutput();
    } else if (ffupFormsDisputes.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP DISPUTE FOR ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (ffupFormsRefund.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP REFUND - ${vars.selectedIntentText}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupSpecialFeat") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText} (${vars.requestType})${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupTempDisco") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        const findingsMap = {
            "CCAM (Processing)": "FOR PROCESSING",
            "DeActivation Task": "DEACTIVATION",
            "No SO Generated": "- NO SO PROCESSED",
            "System Task / Stuck SO": "STUCK OR PROLONGED SO"
        };

        if (vars.findings && findingsMap[vars.findings]) {
            concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP TEMPORARY DISCONNECTION ${findingsMap[vars.findings]}${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        }
        actionsTakenCopiedText = constructFuseOutput();
    } else if (vars.selectedIntent === "formFfupUP") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP ${vars.selectedIntentText} FOR VALIDATION${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupVasAct") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP VAS FOR ACTIVATION${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    } else if (vars.selectedIntent === "formFfupVasDel") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}/ FOLLOW-UP VAS FOR ${vars.vasProduct} DELIVERY${insertCustConcern(vars.custConcern)}/ ${vars.ffupStatus}${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    }
    
    // Non-Tech Requests
    else if (requestForms.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}${soSrNum}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }

    // Others
    else if (othersForms.includes(vars.selectedIntent)) {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `${custName}${sfCaseNum}${accountNum}\nC: ${vars.channel}${insertCustConcern(vars.custConcern)}`;
        actionsTakenCopiedText = constructFuseOutput();

    }

    concernCopiedText = concernCopiedText.toUpperCase();
    actionsTakenCopiedText = actionsTakenCopiedText.toUpperCase();

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
        // [addUniqueText(titleCopiedText), addUniqueText(descriptionCopiedText), addUniqueText(caseNotesCopiedText), addUniqueText(specialInstCopiedText)].filter(Boolean).join("\n\n"),
        // [addUniqueText(ffupCopiedText), addUniqueText(specialInstCopiedText)].filter(Boolean).join("\n\n")
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
            // section.classList.add("noselect");

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

    const okButton = document.getElementById("okButton");
    okButton.textContent = "Close";

    okButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

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

    const okButton = document.getElementById("okButton");
    okButton.textContent = "Close";
    okButton.onclick = () => {
        floatingDiv.classList.remove("show");
        setTimeout(() => {
            floatingDiv.style.display = "none";
            overlay.style.display = "none";
        }, 300);
    };
}

function sfTaggingButtonHandler() {
    const vars = initializeVariables();

    let bauRows = [];
    let netOutageRows = [];
    let crisisRows = [];

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

    const inqUpgrade = [
        "formInqUpg1399", "formInqUpg1599", "formInqUpg1799", "formInqUpg2099", "formInqUpg2499", "formInqUpg2699", "formInqUpgOthers"
    ];

    const inqVAS = [
        "formInqVasAO", "formInqVasIptv", "formInqVasMOW", "formInqVasSAO", "formInqVasWMesh", "formInqVasOthers"
    ];

    const reqAccounts = ["formReqGoGreen", "formReqUpdateContact", "formReqSrvcRenewal"];

    const reqAddressMod = ["formReqBillAdd", "formReqSrvcAdd"];

    const reqBilling = ["formReqTaxAdj"];

    const reqChngOwnership = ["formReqSupRetAccNum", "formReqSupChangeAccNum"];

    const reqChngTelUnit = ["formReqChgTelUnit"];

    const reqDisco = ["formReqDiscoVAS", "formReqPermaDisco", "formReqTempDisco"];

    const reqDispute = ["formReqNSR", "formReqRentMSF", "formReqRentLPN", "formReqNRC", "formReqSCC", "formReqTollUFC", "formReqOtherTolls"];

    const othHotline = ["others164", "othersEntAcc", "othersHomeBro", "othersSmart", "othersSME177"];

    const othTransfer = ["othersAO", "othersRepair", "othersBillAndAcc"]

    const ffupBasedOnFindings = ["formFfupDowngrade", "formFfupInmove", "formFfupMigration", "formFfupReloc", "formFfupUpgrade"];

    const ffupDisputes = ["formFfupMisappPay", "formFfupOverpay"];

    const ffupDisco = ["formFfupDiscoVas", "formFfupPermaDisco"];

    const ffupRecon = ["fomFfupRenew", "fomFfupResume", "fomFfupUnbar"];

    const ffupRefund = ["formFfupCustDependency", "formFfupAMSF", "formFfupFinalAcc", "formFfupOverpayment", "formFfupWrongBiller"];

    const ffupVAS =["formFfupVasAct", "formFfupVasDel"];

    const alwaysOn = ["form500_5", "form501_7", "form101_5", "form510_9", "form500_6"];

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
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'PLDT Web'],
            ['Case Sub-Type:', 'PLDT Web Inaccessibility']
        ];
    } else if (vars.selectedIntent === 'formCompMisappliedPayment') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formCompUnreflectedPayment') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.paymentChannel}`]
        ];
    } else if (vars.selectedIntent === 'formCompPersonnelIssue') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Personnel'],
            ['Case Sub-Type:', `${vars.personnelType}`]
        ];
    }
    
    // Non-Tech Inquiry
    else if (inqAccounts.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqAda') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', 'ADA']
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

        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', subType]
        ];
    } else if (inqBilling.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqOutsBal') {
        let subType = '';
        
        subType = `${vars.selectedIntentText} - ${vars.subType}`;

        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', subType]
        ];
    } else if (inqChangeOwnership.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Change Ownership'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (inqDisco.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Disconnection'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (inqDowngrade.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Downgrade'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqDdateExt') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Due Date Extension'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqEntertainment') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Entertainment'],
            ['Case Sub-Type:', 'Lions Gate/HBO Go/Viu/Others']
        ];
    } else if (vars.selectedIntent === 'formInqInmove') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Inmove'],
            ['Case Sub-Type:', 'Inmove (Same Address)']
        ];
    } else if (vars.selectedIntent === 'formInqMigration') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Migration'],
            ['Case Sub-Type:', 'Migration - Customer Initiated / PLDT Initiated']
        ];
    } else if (vars.selectedIntent === 'formInqProdAndPromo') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Product & Promos'],
            ['Case Sub-Type:', 'New Application / PLDT Plans']
        ];
    } else if (inqRefProgram.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Referral Program'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqRefund') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Refund'],
            ['Case Sub-Type:', '`Refund - ${vars.subType}`']
        ];
    } else if (vars.selectedIntent === 'formInqReloc') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Relocation'],
            ['Case Sub-Type:', 'Relocation - Facility Availability / Transfer Fees / SLA']
        ];
    } else if (vars.selectedIntent === 'formInqRewards') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Rewards Program'],
            ['Case Sub-Type:', 'MVP/HOME Rewards']
        ];
    } else if (inqSpecialFeat.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Special Features'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqSAO500') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Speed Add On 500'],
            ['Case Sub-Type:', 'Product Info']
        ];
    } else if (inqUfc.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'UNLI FAM CALL'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (inqUpgrade.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Upgrade'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (inqVAS.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'VAS'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqWireReRoute') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Wire Re-Route'],
            ['Case Sub-Type:', 'Processing Fees / SLA']
        ];
    }
    
    // Non-Tech Follow-up
    else if (vars.selectedIntent === 'formFfupChangeOwnership') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.requestType}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeTelNum') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', 'Change of Telephone Number'],
            ['Case Sub-Type:', `Change TelNum - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeTelUnit') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', 'Change Telephone Unit'],
            ['Case Sub-Type:', 'Change Tel Unit - Opsim']
        ];
    } else if (ffupDisco.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `Disconnect -  ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupDispute') {
        const cleanApprvr = vars.approver ? vars.approver.replace(/\s*\([^)]*\)/, '') : '';

        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.disputeType} - ${cleanApprvr}`]
        ];
    } else if (ffupBasedOnFindings.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupDDE') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Due Date Ext (CCAM)']
        ];
    } else if (ffupDisputes.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - Payman`]
        ];
    } else if (vars.selectedIntent === 'formFfupOcular') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}/AMEND SAM`],
            ['Case Sub-Type:', `Ocular/Amend - ${vars.findings}`]
        ];
    } else if (ffupRecon.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `Reconnection - ${vars.findings}`]
        ];
    } else if (ffupRefund.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `Refund - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupRelocCid') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Relocation - PMA']
        ];
    } else if (vars.selectedIntent === 'formFfupSpecialFeat') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Special Features - Activation/Deactivation	']
        ];
    } else if (vars.selectedIntent === 'formFfupSAO') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupTempDisco') {
        let caseSubType = "";

        if (vars.findings === "CCAM (Processing)") {
            caseSubType = `Temp Disconnect - ${vars.findings}`;
        } else {
            caseSubType = `VTD - ${vars.findings}`;
        }

        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (vars.selectedIntent === 'formFfupUP') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.selectedIntentText} - Payman`]
        ];
    } else if (ffupVAS.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', 'VAS'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formFfupReroute') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Re-Route/OW - Opsim']
        ];
    }  else if (vars.selectedIntent === 'formFfupWT') {
        bauRows = [
            ['VOC:', `Follow-up - ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Withholding Tax (CCAM)']
        ];
    } 
    
    // For validation
    else if (vars.selectedIntent === 'formFfupRepairRecon') {
        bauRows = [
            ['VOC:', 'Follow-up'],
            ['Case Type:', 'Follow-up Aftersales'],
            ['Case Sub-Type:', 'Reconnection']
        ];
    } 

    // Non-Tech Request
    else if (reqAccounts.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (reqAddressMod.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Address Modification (Record)'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (reqBilling.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (reqChngOwnership.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Change of Ownership'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (reqChngTelUnit.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', 'Customer Initiated']
        ];
    } else if (reqDisco.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Disconnection'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (reqDispute.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Dispute'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    }

    // Others
    else if (vars.selectedIntent === 'othersToolsDown') {
        bauRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Tools Downtime'],
            ['Case Sub-Type:', `${vars.affectedTool}`]
        ];
    } else if (vars.selectedIntent === 'othersWebForm') {
        bauRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Refer to Hero Channel'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (othHotline.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Refer to other hotline'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (othTransfer.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Transfer'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'othersUT') {
        bauRows = [
            ['VOC:', 'Others'],
            ['Case Type:', 'Unsuccessful Transaction'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
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
    floating1DivHeader.textContent = "SALESFORCE CASE TAGGING";

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
        { label: "Escalation Remarks", type: "textarea", name: "remarks2" },
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

    const copyTd = document.createElement("td");
    copyTd.style.paddingLeft = "5px";  
    copyTd.style.paddingRight = "5px"; 

    const copyButton = document.createElement("button");
    copyButton.className = "form3-button";
    copyButton.innerText = "📋 Copy";
    copyButton.onclick = () => {
    const textToCopy = [];

    const endorsementTypeInput = table.querySelector('select[name="endorsementType"]');
    const endorsementTypeLabel = table.querySelector('label[for="endorsementType"]');
        if (endorsementTypeInput && endorsementTypeLabel) {
            const endorsementTypeText = endorsementTypeLabel.textContent.trim();
            const endorsementTypeValue = endorsementTypeInput.value || "Not Provided";
            textToCopy.push(`${endorsementTypeText.toUpperCase()}: ${endorsementTypeValue.toUpperCase()}`);
        }

        const otherFields = Array.from(table.querySelectorAll("textarea, input"))
            .filter(input => input.offsetWidth > 0 && input.offsetHeight > 0) 
            .map(input => {
                
                const label = table.querySelector(`label[for="${input.name}"]`);
                const labelText = label ? label.textContent.trim() : "Unknown Field";
                const valueText = (input.value || "").toUpperCase();
                
                if (labelText.trim().toLowerCase() === "contact details, complete address, & landmarks") {
                    const replacedValue = valueText.replace(/ \| /g, "\n");
                    return `${labelText.toUpperCase()}:\n${replacedValue}`;
                } else {
                    return `${labelText.toUpperCase()}: ${valueText}`;
                }
            });

            textToCopy.push(...otherFields);

            const finalText = textToCopy.join("\n");

            navigator.clipboard.writeText(finalText)
            .then(() => {
                alert("Endorsement details copied! You can now paste them into the designated GC or Salesforce Chatter for further processing.");
                console.log("Copied to clipboard:", finalText);
            })
            .catch(err => {
                console.error("Error copying to clipboard:", err);
            });
    }    

    copyTd.appendChild(copyButton);

    const okTd = document.createElement("td");
    okTd.style.paddingLeft = "5px";  
    okTd.style.paddingRight = "5px"; 

    const okButton = document.createElement("button");
    okButton.className = "form3-button";
    okButton.innerText = "Close";
    okButton.onclick = function () {
        floating2Div.classList.remove("show");
        setTimeout(() => {
            floating2Div.style.display = "none";
            overlay.style.display = "none";
            document.body.removeChild(floating2Div);
        }, 300);
    };

    okTd.appendChild(okButton);

    buttonsRow.appendChild(copyTd);
    buttonsRow.appendChild(okTd);

    table.appendChild(buttonsRow);

    document.body.appendChild(floating2Div);
    floating2Div.style.display = "block";
    setTimeout(() => {
        floating2Div.classList.add("show");
    }, 10);

    const endorsementType = document.querySelector("[name='endorsementType']");

    endorsementType.addEventListener("change", () => {
        const selectedValue = vars.selectedIntent;
        const selectedOption = document.querySelector(`#selectIntent option[value="${selectedValue}"]`);

        if (endorsementType.value === "Zone" || endorsementType.value === "Network" || endorsementType.value === "Potential Crisis" ) {
            if (vars.selectedIntent === "formFfupRepair") {
                showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability2", "address2", "landmarks2", "cepCaseNumber2", "queue2", "ticketStatus2", "agentName2", "teamLead2", "date", "remarks2"]);
                hideSpecificFields(["specialInstruct2", "refNumber2", "paymentChannel2", "amountPaid2"]);
            } else {
                showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability2", "address2", "landmarks2", "cepCaseNumber2", "agentName2", "teamLead2", "date", "remarks2"]);
                hideSpecificFields(["queue2", "ticketStatus2", "specialInstruct2", "refNumber2", "paymentChannel2", "amountPaid2"]);
            }

            if (vars.channel === "CDT-SOCMED") {
                showFields(["sfCaseNum2"]);
            } else if (vars.channel === "CDT-HOTLINE") {
                hideSpecificFields(["sfCaseNum2"]);
            }
        } else if (endorsementType.value === "Sup Call") {
            if (vars.selectedIntent === "formFfupRepair") {
                showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability2", "address2", "landmarks2", "cepCaseNumber2", "queue2", "ticketStatus2", "remarks2"]);
                hideSpecificFields(["specialInstruct2", "agentName2", "teamLead2", "date", "refNumber2", "paymentChannel2", "amountPaid2"]);
            } else {
                showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability2", "address2", "landmarks2", "cepCaseNumber2", "remarks2"]);
                hideSpecificFields(["specialInstruct2", "queue2", "ticketStatus2", "agentName2", "teamLead2", "date", "refNumber2","paymentChannel2", "amountPaid2"]);
            }

            if (vars.channel === "CDT-SOCMED") {
                showFields(["sfCaseNum2"]);
            } else if (vars.channel === "CDT-HOTLINE") {
                hideSpecificFields(["sfCaseNum2"]);
            }
        }
    });
}

function resetForm2ContainerAndRebuildButtons() {
    const form2Container = document.getElementById("form2Container");
    form2Container.innerHTML = "";

    const buttonTable = document.createElement("table");
    buttonTable.id = "form2ButtonTable";

    const row = document.createElement("tr");

    const buttonData = [
        { label: "💾 Save", handler: saveFormData },
        { label: "🔄 Reset", handler: resetButtonHandler },
        { label: "📄 Export", handler: exportFormData },
        { label: "🗑️ Delete All", handler: deleteAllData }
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

function resetButtonHandler() {
    const userChoice = confirm("Are you sure you want to reset the form?");

    if (userChoice) {
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

        const footerElement = document.getElementById("footerValue");
        const footerText = "Standard Notes Generator Version 5.2.101225";
        typeWriter(footerText, footerElement, 50);

        const notepad = document.getElementById("notepad");
        notepad.rows = 10;
        notepad.style.height = "";

        const ticketTimer = document.getElementById("ticketTimer");

        if (ticketTimer) ticketTimer.style.display = "none";

        if (typeof window.resetTicketTimer === "function") {
            window.resetTicketTimer();
        } else if (typeof window.stopTicketTimer === "function") {
            window.stopTicketTimer();
            const ticketDisplay = document.getElementById("ticketTimerDisplay");
            if (ticketDisplay) ticketDisplay.textContent = "00:00:00";
        }

        setTimeout(function() {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }, 100);
    }
}

function saveFormData() {
    const selectedChannel = document.getElementById("channel")?.value?.trim();
    const sfCaseNumberElement = document.querySelector('[name="sfCaseNum"]');
    const sfCaseNumber = sfCaseNumberElement?.value.trim();

    const customerNameElement = document.querySelector('[name="custName"]');
    const customerName = customerNameElement?.value.trim();

    const accountNumberElement = document.querySelector('[name="accountNum"]');
    const accountNumber = accountNumberElement?.value.trim();

    const missingFields = [];

    if (!sfCaseNumberElement) {
        alert("Case number field is missing on the form.");
        return;
    }

    if (!customerName) missingFields.push("Customer Name");
    if (!accountNumber) missingFields.push("Account Number");

    if (selectedChannel !== "CDT-HOTLINE") {
        if (!sfCaseNumber) missingFields.push("SF Case Number");
    }

    if (missingFields.length > 0) {
        alert(`Notes cannot be saved. Please fill out the following fields: ${missingFields.join(", ")}`);
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
        ? `SF/FUSE:\n${techNotes.join("\n")}`
        : techNotes
            ? `SF/FUSE:\n${techNotes}`
            : "";

    const cepNotes = newTicketNotes.length
        ? `CEP:\n${newTicketNotes.join("\n")}`
        : "";

    const bantayKableNotes = bantayKableButtonHandler(false);
    const nonTechIntents = [
        // Complaint
        "formReqNonServiceRebate",
        "formReqReconnection",
        "formCompMyHomeWeb",
        "formCompMisappliedPayment",
        "formCompUnreflectedPayment",
        "formCompPersonnelIssue",

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
        "fomFfupRenew",
        "fomFfupResume",
        "fomFfupUnbar",
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
        "formReqGoGreen",
        "formReqUpdateContact",
        "formReqSrvcRenewal",
        "formReqBillAdd",
        "formReqSrvcAdd",
        "formReqTaxAdj",
        "formReqSupRetAccNum",
        "formReqSupChangeAccNum",
        "formReqChgTelUnit",
        "formReqDiscoVAS",
        "formReqPermaDisco",
        "formReqTempDisco",
        "formReqNSR",
        "formReqRentMSF",
        "formReqRentLPN",
        "formReqNRC",
        "formReqSCC",
        "formReqTollUFC",
        "formReqOtherTolls",

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
        const labeledFfup = ffupNotes ? `CEP:\n${ffupNotes}` : "";
        const labeledTech = techNotes ? `SF/FUSE:\n${techNotes}` : "";
        combinedNotes = [labeledFfup, labeledTech].filter(Boolean).join("\n\n");
    } else {
        combinedNotes = [fuseNotes, cepNotes].filter(Boolean).join("\n\n");
    }

    // combinedNotes = combinedNotes.trim();
    combinedNotes = (combinedNotes || "").toString().trim();
    //console.log(typeof combinedNotes, combinedNotes);

    const now = new Date();
    const timestamp = now.toLocaleString();
    const fallbackKey = `NOCASE-${now.getTime()}`;

    const uniqueKey = (selectedChannel === 'CDT-HOTLINE' || !sfCaseNumber) ? fallbackKey : sfCaseNumber.toUpperCase();

    const savedEntry = {
        timestamp: timestamp, 
        custName: document.querySelector('[name="custName"]').value.trim().toUpperCase(),
        sfCaseNumber: sfCaseNumber,
        selectLOB: document.querySelector('[name="selectLOB"]').value.trim().toUpperCase(),
        selectVOC: document.querySelector('[name="selectVOC"]').value.trim().toUpperCase(),
        accountNum: document.querySelector('[name="accountNum"]').value.trim().toUpperCase(),
        landlineNum: document.querySelector('[name="landlineNum"]').value.trim().toUpperCase(),
        serviceID: document.querySelector('[name="serviceID"]').value.trim().toUpperCase(),
        Option82: document.querySelector('[name="Option82"]').value.trim().toUpperCase(),
        combinedNotes: combinedNotes.toUpperCase()
    };

    const savedData = JSON.parse(localStorage.getItem("tempDatabase") || "{}");
    savedData[uniqueKey] = savedEntry;
    localStorage.setItem("tempDatabase", JSON.stringify(savedData));

    alert("All set! Your notes have been saved.");
}

function exportFormData() {
    const savedData = JSON.parse(localStorage.getItem("tempDatabase") || "{}");
    
    if (Object.keys(savedData).length === 0) {
        alert("No data available to export.");
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

        const appendIfValid = (label, value) => {
            if (value !== undefined && value !== "undefined") {
                notepadContent += `${label}: ${value}\n`;
            }
        };

        appendIfValid("CUSTOMER NAME", entry.custName);
        appendIfValid("SF CASE #", entry.sfCaseNumber);
        appendIfValid("LOB", entry.selectLOB);
        appendIfValid("VOC", entry.selectVOC);
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

        notepadContent += `\nCASE NOTES:\n${entry.combinedNotes}\n\n`;
        notepadContent += "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n\n";
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    const blob = new Blob([notepadContent], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    link.download = `Saved Notes_${formattedDate}.txt`;

    link.click();
    
    alert("Notes exported successfully!");
}

function deleteAllData() {
    const userChoice = confirm("Are you sure you want to delete all saved data?");
    
    if (userChoice) {
        localStorage.clear();
        alert("All data has been deleted successfully.");
    }
}

const primaryButtons = {
  saveButton: saveFormData,
  resetButton: resetButtonHandler,
  exportButton: exportFormData,
  deleteButton: deleteAllData
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
function renderUpdates(containerId, instructions, versions) {
    const container = document.getElementById(containerId);
    if (!container) return console.error(`Container with ID '${containerId}' not found.`);

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
        updatesDiv.innerHTML = `<h3>${version} Update</h3>`;

        updates.forEach((section, index) => {
        const sectionDiv = document.createElement("div");
        sectionDiv.innerHTML = `
            <strong>${index + 1}. ${section.title}</strong>
            <ul>${section.items.map(i => `<li>${i}</li>`).join("")}</ul>
        `;
        updatesDiv.appendChild(sectionDiv);
        });

        container.appendChild(updatesDiv);
    });
}

const instructions = [
    "Open the tool using the provided link. Avoid using ‘Duplicate Tab’ to ensure the DOM scripts load properly.",
    "Always utilize the LIT365 work instructions to ensure accurate, consistent, and up-to-date handling of every intent. These guidelines outline the correct process flow and required checks, so make sure to utilize them before completing any action.",
    "Fill out all required fields.",
    "If a field is not required (e.g. L2 fields), leave it blank. Avoid entering 'NA' or any unnecessary details.",
    "Ensure that the information is accurate.",
    "Review your inputs before generating the notes."
];

const versions = [
    {
        version: "V5.2.101225",
        updates: [
        { title: "Added", items: ["Instructions to always utilize LIT365 work instructions for proper guidance", "Investigation 4 options for SIC (High Utilization OLT/PON Port)", "DC and RA Exec status fields in the NMS skin"] },
        { title: "Improvements", items: ["UI enhancements for better usability", "Save and Export function enhancements to ensure accurate notation is saved and exported", "Special Instructions functionality", "Case Notes timeline formatting", "Enabled FCR notation for CEP tool"] },
        { title: "Bug Fixes", items: ["Fixed minor bugs in generated notes", "Resolved SF Tagging issue for SOCMED agents"] }
        ]
    },
    {
        version: "V5.2.131125",
        updates: [
        { title: "Added Non-Tech Follow-up Intents", items: ["Refund", "Relocation", "Relocation - CID Creation", "Special Features", "Speed Add On 500", "Temporary Disconnection (VTD/HTD)", "Unreflected Payment", "Upgrade", "VAS", "Wire Re-Route", "Withholding Tax Adjustment"] }
        ]
    },
    {
        version: "V5.2.301025",
        updates: [
        { title: "Generated FUSE Notes (Hotline)", items: ["Generated notes are automatically divided into sections, eliminating the need for manual formatting or separation"] },
        { title: "Fixes", items: ["Resolved issue on Concern Type options not displaying correctly", "Fixed scrolling behavior for smoother navigation through form sections"] },
        { title: "Improvements & Enhancements:", items: ["Refined interface for smoother visuals and seamless workflow", "Enhanced user experience for more user-friendly navigation"] },
        ]
    },
    {
        version: "V5.2.291025",
        updates: [
        { title: "Removed fields", items: ["Equipment Brand, Modem Brand, and ONU Connection Type (NIC)"] },
        { title: "Added Intents", items: ["Request for Private IP", "Gaming - High Latency/Lag"] },
        { title: "Added fields", items: ["Clearview Latest real-time request completion date", "Tested OK for Hotline Agents (NIC/SIC/Selective Browsing intents)"] },
        { title: "Added CEP Investigation 4 tagging", items: ["Device and Website IP Configuration (Request for Public/Private IP)", "No Audio/Video Output w/ Test Channel (IPTV Intents)"] },
        { title: "Updated field labels", items: ["'DMS Status' to 'Internet/Data Status'", "'RX Power/OPTICSRXPOWER' to 'RX Power'", "'No. of Connected Devices (L2)' to 'No. of Conn. Devices (L2)'"] },
        { title: "Fix", items: ["Resolved Offer ALS notation bug"] },
        { title: "UI Enhancements", items: ["Slight tweaks for a fresher, more modern feel.", "New Instructions and Updates section: Your quick guide to staying informed!"] }
        ]
    }
];

renderUpdates("updatesContainer", instructions, versions);

const toggleBtn = document.getElementById("toggleUpdatesBtn");
const updatesDiv = document.getElementById("updatesContainer");

toggleBtn.addEventListener("click", () => {
    updatesDiv.classList.toggle("expanded");
    toggleBtn.textContent = updatesDiv.classList.contains("expanded") ? "-" : "+";
});

document.addEventListener('DOMContentLoaded', function() { 
    // ================================
    // SECTION 1: MAIN TIMER
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
            const confirmReset = confirm("Are you sure you want to reset the timer?");
            if (confirmReset) {
                clearInterval(timerInterval);
                elapsedTime = 0;
                timerDisplay.textContent = formatTime(0);
                isRunning = false;
                timerToggleButton.textContent = 'Start';
            }
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

    const channelSelect = document.getElementById("channel");
    const sfCaseNumRow = document.getElementById("case-num-row");

    channelSelect?.addEventListener("change", function () {
        const shouldShow = channelSelect.value === "CDT-SOCMED";
        sfCaseNumRow.style.display = shouldShow ? "" : "none";
    });

    if (typeof initializeFormElements === "function") initializeFormElements();
    if (typeof registerEventHandlers === "function") registerEventHandlers();

    // ================================
    // SECTION 2: TICKET CREATION TIMER
    // ================================
    let ticketTimerInterval = null;
    let ticketSeconds = 0;

    const ticketTimer = document.getElementById("ticketTimer");
    const ticketDisplay = document.getElementById("ticketTimerDisplay");

    function formatTicketTime(sec) {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    function startTicketTimer() {
        if (ticketTimerInterval) return;
        ticketTimerInterval = setInterval(() => {
            ticketSeconds++;
            if (ticketDisplay) ticketDisplay.textContent = formatTicketTime(ticketSeconds);
        }, 1000);
        console.log("▶️ Ticket Timer started");
    }

    function stopTicketTimer() {
        clearInterval(ticketTimerInterval);
        ticketTimerInterval = null;
        console.log("⏸ Ticket Timer stopped");
    }

    function resetTicketTimer() {
        clearInterval(ticketTimerInterval);
        ticketTimerInterval = null;
        ticketSeconds = 0;
        if (ticketDisplay) ticketDisplay.textContent = formatTicketTime(0);
        console.log("♻️ Ticket Timer reset");
    }

    window.stopTicketTimer = stopTicketTimer;
    window.resetTicketTimer = resetTicketTimer;
    window.startTicketTimer = startTicketTimer;

    function isVisible(el) {
        if (!el) return false;
        let cur = el;
        while (cur && cur.nodeType === 1) {
            const cs = window.getComputedStyle(cur);
            if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) {
                return false;
            }
            cur = cur.parentElement;
        }
        const rect = el.getBoundingClientRect();
        return !(rect.width === 0 && rect.height === 0);
    }

    function checkStopConditions() {
        const landmarks = document.querySelector("input[name='landmarks'], textarea[name='landmarks'], #landmarks");
        const cbr = document.querySelector("input[name='cbr'], textarea[name='cbr'], #cbr");

        const landmarksVisible = isVisible(landmarks);
        const landmarksHasValue = landmarks && landmarks.value.trim() !== "";
        const cbrHasValue = cbr && cbr.value.trim() !== "";

        if (landmarksVisible) {
            if (landmarksHasValue) stopTicketTimer();
        } else {
            if (cbrHasValue) stopTicketTimer();
        }
    }

    document.addEventListener("change", function (e) {
        const t = e.target;

        if (t.matches("select[name='issueResolved'], #issueResolved") ||
            t.matches("select[name='outageStatus'], #outageStatus")) {

            const issueResolved = document.querySelector("select[name='issueResolved']")?.value || "";
            const outageStatus = document.querySelector("select[name='outageStatus']")?.value || "";

            if (issueResolved === "No - for Ticket Creation" || outageStatus === "Yes") {
                if (ticketTimer) ticketTimer.style.display = "block";
                startTicketTimer();
            } else {
                stopTicketTimer();
                resetTicketTimer();
                if (ticketTimer) {
                    ticketTimer.style.display = "none";
                }
            }
        }

        if (t.matches("input[name='landmarks'], textarea[name='landmarks'], #landmarks")) checkStopConditions();
        if (t.matches("input[name='cbr'], textarea[name='cbr'], #cbr")) {
            const landmarks = document.querySelector("input[name='landmarks'], textarea[name='landmarks'], #landmarks");
            if (!isVisible(landmarks)) checkStopConditions();
        }
    });

    document.addEventListener("input", function (e) {
        const t = e.target;

        if (t.matches("input[name='landmarks'], textarea[name='landmarks'], #landmarks")) checkStopConditions();
        if (t.matches("input[name='cbr'], textarea[name='cbr'], #cbr")) {
            const landmarks = document.querySelector("input[name='landmarks'], textarea[name='landmarks'], #landmarks");
            if (!isVisible(landmarks)) checkStopConditions();
        }
    });

    (function makeDraggable(el) {
        if (!el) return;
        let offsetX = 0, offsetY = 0, isDown = false;
        const header = el.querySelector("#ticketTimerHeader") || el;
        header.style.cursor = "grab";

        header.addEventListener("mousedown", dragMouseDown);
        document.addEventListener("mouseup", closeDragElement);
        document.addEventListener("mousemove", elementDrag);

        function dragMouseDown(e) {
            e.preventDefault();
            isDown = true;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            header.style.cursor = "grabbing";
        }

        function elementDrag(e) {
            if (!isDown) return;
            e.preventDefault();
            el.style.left = (e.clientX - offsetX) + "px";
            el.style.top = (e.clientY - offsetY) + "px";
        }

        function closeDragElement() {
            isDown = false;
            header.style.cursor = "grab";
        }
    })(ticketTimer);

    window.__checkTicketStop = checkStopConditions;
});