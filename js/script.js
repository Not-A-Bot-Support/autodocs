//script.js

// Standard Notes Generator Version 5.2.310725
// Developed & Designed by: QA Ryan

let lobSelect, vocSelect, intentSelect;
let serviceIDRow, option82Row, intentWocasRow, wocasRow;;
let allVocOptions, allIntentChildren, placeholderClone;

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
}

function showRowAndScroll(rowElement) {
    rowElement.style.display = "";
    rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideRow(rowElement) {
    rowElement.style.display = "none";
}

function handleLobChange() {
    const lobSelectedValue = lobSelect.value;
    const channelField = document.getElementById("channel").value;

    if (!channelField) {
        lobSelect.selectedIndex = 0; 
        alert("Please select your designated channel.");
        
        const header = document.getElementById("headerValue");
        typeWriter("Standard Notes Generator", header, 50);
        
        return; 
    }

    resetForm2ContainerAndRebuildButtons();

    vocSelect.innerHTML = "";

    const placeholder = allVocOptions.find(opt => opt.value === "");
    if (placeholder) {
        vocSelect.appendChild(placeholder);
    }

    allVocOptions.forEach(option => {
        if (
            (lobSelectedValue === "TECH" && ["REQUEST", "FOLLOW-UP", "COMPLAINT"].includes(option.value)) ||
            (lobSelectedValue === "NON-TECH" && option.value === "REQUEST")
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

    if (lobValue === "TECH") {
        if (vocValue === "FOLLOW-UP") {
            showRowAndScroll(intentWocasRow);
        } else {
            showRowAndScroll(serviceIDRow);
            showRowAndScroll(option82Row);
            showRowAndScroll(intentWocasRow);
            showRowAndScroll(wocasRow);
        }
    } else if (lobValue === "NON-TECH") {
        hideRow(serviceIDRow);
        hideRow(option82Row);
        showRowAndScroll(intentWocasRow);
        hideRow(wocasRow);
    }

    intentSelect.innerHTML = "";
    if (placeholderClone) {
        intentSelect.appendChild(placeholderClone.cloneNode(true));
    }

    if (lobValue === "TECH") {
        if (vocValue === "FOLLOW-UP") {
            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTION" && el.value === "formFFUP") {
                intentSelect.appendChild(el.cloneNode(true));
                }
            });
        } else if (vocValue === "REQUEST") {
            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTGROUP" && el.label === "Modem Request Transactions") {
                intentSelect.appendChild(el.cloneNode(true));
                }
            });
        } else if (vocValue === "COMPLAINT") {
            const allowedGroups = [
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
                "Streaming Apps Issues"
            ];

            allIntentChildren.forEach(el => {
                if (el.tagName === "OPTGROUP" && allowedGroups.includes(el.label)) {
                intentSelect.appendChild(el.cloneNode(true));
                }
            });
        }
    } else if (lobValue === "NON-TECH") {
        let group = "";

        if (vocValue === "INQUIRY") {
        group = "inquiry";
        } else if (vocValue === "REQUEST") {
        group = "request";
        } else if (vocValue === "FOLLOW-UP") {
        group = "follow-up";
        } else if (vocValue === "COMPLAINT") {
        group = "complaint";
        }

        allIntentChildren.forEach(el => {
        if (el.tagName === "OPTION" && el.dataset.group === group) {
            intentSelect.appendChild(el.cloneNode(true));
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
    const originalSpan = element.querySelector(".version-circle"); 

    element.innerHTML = "";
    element.appendChild(originalSpan); 

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
    fieldNames.forEach(name => {
        const fieldRow = document.querySelector(`tr:has([name="${name}"])`);
        if (fieldRow) fieldRow.style.display = "none";
    });
}

function showFields(fieldNames) {
    fieldNames.forEach(name => {
        const fieldRow = document.querySelector(`tr:has([name="${name}"])`);
        if (fieldRow) fieldRow.style.display = "table-row";
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
        value = value.replace(/\n/g, " | ");
    }

    return value;
}

function createForm2() {
    const selectIntent = document.getElementById("selectIntent");
    const form2Container = document.getElementById("form2Container");

    form2Container.innerHTML = "";

    const selectedValue = selectIntent.value;
    const channelField = document.getElementById("channel").value;

    var form = document.createElement("form");
    form.setAttribute("id", "Form2");

    if (!channelField) {
        selectIntent.selectedIndex = 0; 
        alert("Please select your designated channel.");
        
        const header = document.getElementById("headerValue");
        typeWriter("Standard Notes Generator", header, 50);
        
        resetForm2ContainerAndRebuildButtons();
        return; 
    }
    
    const selectedOption = selectIntent.options[selectIntent.selectedIndex];
    const headerText = selectedOption.textContent; 
    const header = document.getElementById("headerValue");
    typeWriter(headerText, header, 50);

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
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7"
    ];

    const streamAppsForms = [
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ]

    // **********Follow-Up*****************************************************************************
    if (selectedValue === "formFFUP") { 
        const table = document.createElement("table");

        const fields = [
            { label: "CEP Case Number", type: "number", name: "cepCaseNumber" },
            { label: "Tech Repair Type", type: "select", name: "techRepairType", options: [
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
            { label: "Offer ALS", type: "select", name: "offerALS", options: [
                "", 
                "Offered ALS/Accepted", 
                "Offered ALS/Declined", 
                "Offered ALS/No Confirmation", 
                "Previous Agent Already Offered ALS" ]},
            { label: "Alternative Services Package Offered", type: "textarea", name: "alsPackOffered", placeholder: "(i.e. 10GB Open Access data, 5GB/day for Youtube, NBA, Cignal and iWantTFC, Unlimited call to Smart/TNT/SUN, Unlimited text to all network and 500MB of data for Viber, Messenger, WhatsApp and Telegram valid for 7 days)" },
            { label: "Effectivity Date", type: "date", name: "effectiveDate" },
            { label: "Nominated Mobile Number", type: "number", name: "nomiMobileNum" },
            { label: "No. of Follow-Up(s)", type: "select", name: "ffupCount", options: ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Multiple" ]},
            { label: "Case Age (HH:MM)", type: "text", name: "ticketAge" },
            { label: "Notes to Tech/ Actions Taken/ Add'l Remarks/ Decline Reason for ALS", type: "textarea", name: "remarks" },
            { label: "Issue Resolved", type: "select", name: "issueResolved", options: [
                "", 
                "Yes", 
                "No" ]},
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
            { label: "SLA / ETR", type: "text", name: "sla" },
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "Click the correct button to ensure the proper formatting is applied based on the tool you’re using to create your notes.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link = document.createElement("a");

            let url = "#";
            if (channelField === "CDT-HOTLINE") {
                url = "https://pldt365.sharepoint.com/sites/LIT365/PLDT_INTERACTIVE_TROUBLESHOOTING_GUIDE/Pages/FOLLOW_UP_REPAIR.aspx?csf=1&web=1&e=NDfTRV";
            } else if (channelField === "CDT-SOCMED") {
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

        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = (field.name === "cepCaseNumber" || field.name === "techRepairType" || field.name === "queue") ? "table-row" : "none";

            const td = document.createElement("td");
            const divInput = document.createElement("div");
            divInput.className = field.type === "textarea" ? "form2DivTextarea" : "form2DivInput";

            const label = document.createElement("label");
            label.textContent = `${field.label}:`;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
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
                input.rows = (field.name === "remarks") ? 6 : (field.name === "alsPackOffered" ? 4 : 3);
                if (field.placeholder) input.placeholder = field.placeholder;
            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = field.name;
                input.className = "form2-input";
                if (field.step) input.step = field.step;

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
        fields.forEach(field => table.appendChild(createFieldRow(field))); 

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "Salesforce", "FUSE", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            ffupButtonHandler, 
            salesforceButtonHandler, 
            fuseButtonHandler,
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
            resetAllFields(["techRepairType", "queue"]);
            if (queue.value === "FM POLL" || queue.value === "CCARE OFFBOARD" || queue.value === "Default Entity Queue") {
                showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "issueResolved"]);
                hideSpecificFields(["projRed", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks" ]);
            } else {
                showFields(["projRed" ]);
                hideSpecificFields(["ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "ffupCount", "ticketAge", "remarks", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks" ]);
            }
        });

        projRed.addEventListener("change", () => {
            resetAllFields(["techRepairType", "queue", "projRed"]);
            if (projRed.value === "Yes") {
                if (queue.value === "SDM CHILD" || queue.value ==="SDM" || queue.value ==="FSMG" || queue.value ==="L2 RESOLUTION" ) {
                    if (channelField === "CDT-HOTLINE") {
                        showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "contactName", "cbr" ]);
                        hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "specialInstruct", "availability", "address", "landmarks" ]);
                    } else if (channelField === "CDT-SOCMED") {
                        showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "specialInstruct" ]);
                        hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks" ]);
                    }
                } else {
                    if (channelField === "CDT-HOTLINE") {
                        showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "contactName", "cbr", "availability", "address", "landmarks" ]);
                        hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "specialInstruct" ]);
                    } else if (channelField === "CDT-SOCMED") {
                        showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks", "sla", "specialInstruct" ]);
                        hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks" ]);
                    }
                }
            } else if (projRed.value === "No"){
                showFields(["ticketStatus", "ffupCount", "ticketAge", "remarks" ]);
                hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks" ]);
            } else {
                hideSpecificFields(["ticketStatus", "offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum", "ffupCount", "ticketAge", "remarks", "issueResolved", "investigation1", "investigation2", "investigation3", "investigation4", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks" ]);
            }
        });

        ticketStatus.addEventListener("change", () => {
            if (ticketStatus.value === "Beyond SLA") {
                showFields(["offerALS" ]);
            } else {
                hideSpecificFields(["offerALS", "alsPackOffered", "effectiveDate", "nomiMobileNum" ]);
            }
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
                if (channelField === "CDT-HOTLINE") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "contactName", "cbr", "availability", "address", "landmarks" ]);
                    hideSpecificFields(["specialInstruct" ]);
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "specialInstruct" ]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks" ]);
                }
            } else {
                hideSpecificFields(["investigation1", "investigation2", "investigation3", "investigation4", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks" ]);
            }
        });
    
    // **********All Services Down (NO DIAL TONE AND NO INTERNET CONNECTION)*************************************
    } else if (voiceAndDataForms.includes(selectedValue)) { 
        
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
            { label: "Parent Case Number", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case" },
            // NMS Skin
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Also available in DMS."},
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
            { label: "RX Power (L2)", type: "number", name: "rxPower", step: "any"},
            { label: "VLAN (L2)", type: "text", name: "vlan"},
            // BSMP/Clearview
            { label: "Clearview Reading (L2)", type: "text", name: "cvReading", placeholder: "e.g. Without FTTH Line Problem" },
            // CEP Investigation Tagging
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "— Modem Light Status —",
                "Red LOS",
                "Blinking/No PON/FIBR/ADSL",
                "Normal Status",
                "Blinking/No PON/FIBR/ADSL",
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
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer’s actual experience in detail.\ne.g. “NDT-NIC with red LOS” DO NOT input the WOCAS!"},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount" }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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
                    
        function insertPromptRow(fields, relatedFieldName) {
            fields.splice(
                fields.findIndex(f => f.name === relatedFieldName) + 1,
                0,
                {
                    type: "promptRow",
                    name: "onuChecklist",
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

        insertPromptRow(enhancedFields, "onuRunStats");

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertToolLabel(enhancedFields, "NMS Skin", "onuSerialNum");
        insertToolLabel(enhancedFields, "BSMP/Clearview", "cvReading");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");

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
            if (field.type === "promptRow") {
                const row = document.createElement("tr");
                row.classList.add("checklist-prompt-row");
                row.dataset.relatedTo = field.relatedTo;
                row.style.display = "none";

                const td = document.createElement("td");
                const checklistDiv = document.createElement("div");
                checklistDiv.className = "form2DivChecklist";

                const req = document.createElement("p");
                req.textContent = "Note:";
                req.className = "requirements-header";
                checklistDiv.appendChild(req);

                const ulReq = document.createElement("ul");
                ulReq.className = "checklist";

                const li1 = document.createElement("li");
                li1.textContent = "If NMS Skin result (ONU Status/RunStat) is “-/N/A” (null value), select “LOS/Down” for Investigation 2.";
                ulReq.appendChild(li1);

                const li2 = document.createElement("li");
                li2.textContent = "If NMS Skin result (ONU Status/RunStat) is unavailable, use DMS (Device status > Online status) section.";
                const nestedUl = document.createElement("ul");
                ["Check Mark = Up/Active", "X Mark = LOS/Down"].forEach(text => {
                    const li = document.createElement("li");
                    li.textContent = text;
                    nestedUl.appendChild(li);
                });
                li2.appendChild(nestedUl);
                ulReq.appendChild(li2);

                const li3 = document.createElement("li");
                li3.textContent = "If NMS Skin and DMS is unavailable, select “LOS/Down” for Investigation 2 and notate “NMS Skin and DMS result unavailable” at Case Notes in Timeline.";
                ulReq.appendChild(li3);

                const li4 = document.createElement("li");
                li4.textContent = "If Option 82 in Clearview, NMS Skin (BSMP, EAAA, or SAAA), or CEP is misaligned, this MUST be documented in the ‘Remarks’ field.";
                ulReq.appendChild(li4);

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
                input.rows = (field.name === "remarks") 
                        ? 6 
                        : (field.name === "specialInstruct")
                        ? 5
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

        table.appendChild(createInstructionsRow()); 
        enhancedFields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        function updateToolLabelVisibility() {
            const allToolLabels = document.querySelectorAll(".tool-label-row, .checklist-prompt-row");
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
            cepButtonHandler,
            salesforceButtonHandler,
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
        const investigation2 = document.querySelector("[name='investigation2']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["onuSerialNum", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "flmFindings", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                        hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuRunStats", "rxPower", "vlan", "cvReading", "issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["onuSerialNum", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                        hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuRunStats", "rxPower", "vlan", "cvReading", "flmFindings", "issueResolved", "specialInstruct"]);
                    }
                } else {
                    showFields(["onuSerialNum", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                }
            } else if (facility.value === "Fiber - Radius") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "flmFindings", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "flmFindings", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                        hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                        hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "flmFindings", "issueResolved", "specialInstruct"]);
                    }
                } else {
                    alert("This form is currently unavailable for customers with Fiber - Radius service.");
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    const facilityField = document.querySelector('[name="facility"]');
                    if (facilityField) facilityField.value = "";
                    return;
                }
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            }
            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue === "form100_1" || selectedValue === "form100_2" || selectedValue === "form100_3") {
                    showFields(["outageStatus", "cvReading", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                } else if (selectedValue === "form100_4" || selectedValue === "form100_5") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                } else {
                    alert("This form is currently unavailable for customers with Fiber - DSL service.");
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    const resTypeField = document.querySelector('[name="resType"]');
                    if (resTypeField) resTypeField.value = "";
                    return;
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
            updateToolLabelVisibility();
        });
    
        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                if (channelField === "CDT-SOCMED") {
                    showFields(["outageReference", "pcNumber", "flmFindings", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "flmFindings", "issueResolved", "specialInstruct"]);
                }
            } else {
                showFields(["onuSerialNum", "onuRunStats", "rxPower", "vlan", "cvReading", "actualExp", "flmFindings", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
            updateToolLabelVisibility();
        });
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
        });

        updateToolLabelVisibility();

    // ********** Voice Connection Issues *********************************************************
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
            { label: "Parent Case Number", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case" },
            // NMS Skin
            { label: "Modem/ONU Serial #", type: "text", name: "onuSerialNum"},
            { label: "OLT and ONU Connection Type", type: "select", name: "oltAndOnuConnectionType", options: [
                "", 
                "FEOL - InterOp", 
                "FEOL - Non-interOp", 
                "HUOL - InterOp",
                "HUOL - Non-interOp"
            ]},
            { label: "FXS1 Status", type: "text", name: "fsx1Status" },
            { label: "Routing Index", type: "text", name: "routingIndex" },
            { label: "Call Source", type: "text", name: "callSource" },
            // DMS
            { label: "Voice Status", type: "text", name: "dmsVoipServiceStatus" },
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
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer’s actual experience in detail.\ne.g. “No outgoing”, “Busy tone only when dialing”. DO NOT input the WOCAS!"},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount" }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertToolLabel(enhancedFields, "NMS Skin", "onuSerialNum");
        insertToolLabel(enhancedFields, "DMS", "dmsVoipServiceStatus");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        
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

                if (field.name === "flmFindings") {
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
                input.rows = (field.name === "remarks") 
                    ? 6
                        : (field.name === "actualExp")
                        ? 2
                            : (field.name === "specialInstruct")
                            ? 5
                            : 3;
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
            cepButtonHandler,
            salesforceButtonHandler,
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
                if (selectedValue === "form101_1" || selectedValue === "form101_2" || selectedValue === "form101_3" || selectedValue === "form103_4" || selectedValue === "form103_5" || selectedValue === "form102_1" || selectedValue === "form102_2" || selectedValue === "form102_3") {
                    showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                    hideSpecificFields(["resType", "serviceStatus", "services", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else if (selectedValue === "form103_1" || selectedValue === "form103_2") {
                    showFields(["serviceStatus", "outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                    hideSpecificFields(["resType", "services", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                }
            } else if (facility.value === "Fiber - Radius") {
                showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                hideSpecificFields(["resType", "serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "investigation1", "investigation2", "investigation3", "investigation4", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            }

            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue === "form101_1" || selectedValue === "form101_2") {
                    showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["serviceStatus", "services", "outageReference", "pcNumber", "onuSerialNum", "oltAndOnuConnectionType", "dmsVoipServiceStatus", "fsx1Status", "routingIndex", "callSource", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else if (selectedValue === "form101_3") {
                    showFields(["services", "outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["serviceStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["serviceStatus", "services", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            if (channelField === "CDT-SOCMED") {
                showFields(["flmFindings"]);
            } else {
                hideSpecificFields(["flmFindings"]);
            }

            updateToolLabelVisibility();
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "services", "serviceStatus", "outageStatus"]);
            if (outageStatus.value === "No" && facility.value === "Fiber") {
                if (selectedValue === "form101_1" || selectedValue === "form101_2" || selectedValue === "form101_3") {
                    showFields(["onuSerialNum", "oltAndOnuConnectionType", "actualExp", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "dmsVoipServiceStatus", "fsx1Status", "routingIndex", "callSource", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else if (selectedValue === "form103_1" || selectedValue === "form103_2" || selectedValue === "form103_4" || selectedValue === "form103_5") {
                    showFields(["onuSerialNum", "dmsVoipServiceStatus", "fsx1Status", "routingIndex", "callSource", "actualExp", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "oltAndOnuConnectionType", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                }
            } else if (outageStatus.value === "No" && resType.value === "Yes" && services.value === "Voice Only") {
                if (selectedValue === "form101_3") {
                    showFields(["onuSerialNum", "dmsVoipServiceStatus", "actualExp", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                }
            } else if (outageStatus.value === "No" && resType.value === "Yes" && services.value === "Bundled") {
                showFields(["onuSerialNum", "issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "dmsVoipServiceStatus", "oltAndOnuConnectionType", "fsx1Status", "routingIndex", "callSource", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                if (channelField === "CDT-SOCMED") {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["oltAndOnuConnectionType", "dmsVoipServiceStatus", "fsx1Status", "routingIndex", "callSource", "issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["oltAndOnuConnectionType", "dmsVoipServiceStatus", "fsx1Status", "routingIndex", "callSource", "issueResolved", "specialInstruct"]);
                }
            }

            updateToolLabelVisibility();

            if (channelField === "CDT-SOCMED") {
                showFields(["flmFindings"]);
            } else {
                hideSpecificFields(["flmFindings"]);
            }
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
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
        });

        updateToolLabelVisibility();

    // ********** No Internet Connection ****************************************************
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
                "Clearview"
            ]},
            { label: "Parent Case Number", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
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
            // NMS Skin
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Also available in DMS."},
            { label: "RX Power/OPTICSRXPOWER", type: "number", name: "rxPower", step: "any"},
            { label: "VLAN", type: "text", name: "vlan"},
            { label: "IP Address", type: "text", name: "ipAddress"},
            { label: "No. of Connected Devices", type: "text", name: "connectedDevices", placeholder: "e.g. 2 on 2.4G, 3 on 5G"},
            // Clearview
            { label: "Clearview Reading (L2)", type: "text", name: "cvReading", placeholder: "e.g. Without FTTH Line Problem" },
            // Probing
            { label: "Connection Method", type: "select", name: "connectionMethod", options: [
                "", 
                "WiFi", 
                "LAN"
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
            // DMS
            { label: "DMS Status (L2)", type: "select", name: "dmsStatus", options: ["", "Offline", "Online"]},
            { label: "ONU Model (L2)", type: "text", name: "onuModel"},
            { label: "WiFi State", type: "select", name: "dmsWifiState", options: [
                "", 
                "On", 
                "Off"
            ]},
            { label: "LAN Port Status", type: "select", name: "dmsLanPortStatus", options: [
                "", 
                "Disabled", 
                "Enabled"
            ]},
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
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer’s actual experience in detail.\ne.g. “No internet connection using WiFi”. DO NOT input the WOCAS!"},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
                "",
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"}
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertToolLabel(enhancedFields, "NMS Skin", "onuSerialNum");
        insertToolLabel(enhancedFields, "BSMP/Clearview", "cvReading");
        insertToolLabel(enhancedFields, "DMS", "dmsStatus");
        insertToolLabel(enhancedFields, "Probing", "connectionMethod");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        
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
                input.rows = (field.name === "cvReading") 
                    ? 2 
                    : (field.name === "remarks") 
                        ? 6 
                        : 3;
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
            cepButtonHandler,
            salesforceButtonHandler,
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
        const equipmentBrand = document.querySelector("[name='equipmentBrand']");
        const modemBrand = document.querySelector("[name='modemBrand']");
        const onuConnectionType = document.querySelector("[name='onuConnectionType']");
        const connectionMethod = document.querySelector("[name='connectionMethod']");
        const issueResolved = document.querySelector("[name='issueResolved']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                if (selectedValue === "form500_1" || selectedValue === "form500_2") {
                    showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                    hideSpecificFields(["resType", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                }
            } else if (facility.value === "Fiber - Radius") {
                if (selectedValue === "form500_1") {
                    showFields(["connectionMethod", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "meshtype", "meshOwnership", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                } else if (selectedValue === "form500_3" || selectedValue === "form500_4") {
                    showFields(["meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                } else {
                    alert("This form is currently unavailable for customers with Fiber - Radius service.");
                    resetAllFields([]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    const facilityField = document.querySelector('[name="facility"]');
                    if (facilityField) facilityField.value = "";
                    return;
                }
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            }

            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                if (selectedValue=== "form500_1" || selectedValue === "form500_2") {
                    showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "meshtype", "meshOwnership", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "meshtype", "meshOwnership", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "issueResolved", "cepCaseNumber", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            }

            updateToolLabelVisibility();
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "No") {
                if (selectedValue === "form500_1" && facility.value === "Fiber") {
                    showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "cvReading", "dmsStatus", "onuModel", "connectionMethod", "actualExp", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "rxPower", "vlan", "ipAddress", "connectedDevices", "dmsWifiState", "dmsLanPortStatus", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else if (selectedValue === "form500_1" && facility.value === "Copper VDSL") {
                    showFields(["onuSerialNum", "connectionMethod", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["onuSerialNum", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                }
            } else {
                if (channelField === "CDT-SOCMED") {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "actualExp", "issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "vlan", "ipAddress", "connectedDevices", "cvReading", "dmsStatus", "onuModel", "dmsWifiState", "dmsLanPortStatus", "connectionMethod", "actualExp", "issueResolved", "specialInstruct"]);
                }
            }

            if (channelField === "CDT-SOCMED") {
                showFields(["flmFindings"]);
            } else {
                hideSpecificFields(["flmFindings"]);
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
            if (onuConnectionType.value === "Non-interOp") {
                showFields(["rxPower", "vlan", "ipAddress", "connectedDevices"]);
            } else if (onuConnectionType.value === "InterOp") {
                showFields(["rxPower"]);
            } else {
                hideSpecificFields(["rxPower", "vlan", "ipAddress", "connectedDevices"]);
            }
        });
    
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
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
        });

        updateToolLabelVisibility();

    // **********Slow Internet Connection (SLOW INTERNET CONNECTION)*********************************************
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
            { label: "Parent Case Number", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            { label: "Plan Details (L2)", type: "textarea", name: "planDetails", placeholder: "Please specify the plan details as indicated in FUSE.\ne.g. “Plan 2699 at 1GBPS”" },
            // NMS Skin
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Also available in DMS."},
            { label: "RX Power/OPTICSRXPOWER", type: "number", name: "rxPower", step: "any", placeholder: "Also available in Clearview."},
            { label: "SAAA Bandwidth Code (L2)", type: "text", name: "saaaBandwidthCode"},
            { label: "Connected Devices (L2)", type: "text", name: "connectedDevices", placeholder: "e.g. 2 on 2.4G, 3 on 5G, 2 LAN(Desktop/Laptop and Mesh)"},
            // BSMP/Clearview
            { label: "Clearview Reading (L2)", type: "text", name: "cvReading", placeholder: "e.g. Without FTTH Line Problem." },
            // DMS
            { label: "ONU Model", type: "text", name: "onuModel"},
            { label: "DMS Status (L2)", type: "select", name: "dmsStatus", options: ["", "Offline", "Online"]},
            { label: "WiFi Band of the Device (L2)", type: "text", name: "deviceWifiBand", placeholder: "e.g. Device used found in 5G WiFi" },
            { label: "Bandsteering (L2)", type: "select", name: "bandsteering", options: ["", "Yes", "No"]},
            // Probing
            { label: "Connection Method", type: "select", name: "connectionMethod", options: [
                "", 
                "WiFi", 
                "LAN"
            ]},
            { label: "Device Brand & Model", type: "text", name: "deviceBrandAndModel", placeholder: "Galaxy S25, Dell Latitude 3420"},
            { label: "Ping Test Result", type: "number", name: "pingTestResult", step: "any"},
            { label: "Speedtest Result", type: "number", name: "speedTestResult", step: "any"},
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
                "Individual Trouble",
                "Misaligned Record",
                "Network Trouble - High Latency",
                "Network Trouble - Slow Internet Connection",
                "Network Trouble - Slow/Intermittent Browsing",
                "Not Applicable [via Store]",
                "Slow/Intermittent Browsing",
                "With historical alarms",
                "Without historical alarms"
            ]},
            { label: "Actual Experience (L2)", type: "textarea", name: "actualExp", placeholder: "Please input the customer’s actual experience in detail.\ne.g. “Only Acquiring 180MBPS.” DO NOT input the WOCAS!"},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
                "",
                "Failed RX",
                "High Latency / Ping",
                "Manual Troubleshooting",
                "Mismatch Option 82 / Service ID",
                "NMS Refresh / Configuration",
                "Slow Browsing",
                "Zone",
                "Network / Outage"
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"}
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertToolLabel(enhancedFields, "NMS Skin", "onuSerialNum");
        insertToolLabel(enhancedFields, "BSMP/Clearview", "cvReading");
        insertToolLabel(enhancedFields, "DMS", "onuModel");
        insertToolLabel(enhancedFields, "Probing", "connectionMethod");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        
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
                        : (field.name === "specialInstruct")
                            ? 5
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
            cepButtonHandler,
            salesforceButtonHandler,
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

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Fiber") {
                showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                hideSpecificFields(["resType", "planDetails", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else if (facility.value === "Fiber - Radius") {
                showFields(["planDetails", "connectionMethod", "pingTestResult", "speedTestResult", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            } else if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "remarks", "flmFindings" ,"issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "flmFindings" ,"issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            updateToolLabelVisibility(); 
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                hideSpecificFields(["planDetails", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["planDetails", "outageStatus", "outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "investigation1", "investigation2", "investigation3", "investigation4", "actualExp", "flmFindings" ,"issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            updateToolLabelVisibility(); 
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "rptCount"]);
                hideSpecificFields(["onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "deviceBrandAndModel", "pingTestResult", "speedTestResult", "actualExp", "issueResolved"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings", "specialInstruct"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"]);
                } else {
                    showFields(["contactName", "cbr", "availability", "address", "landmarks"]);
                    hideSpecificFields(["flmFindings", "specialInstruct"]);
                }
            } else {
                if (facility.value === "Fiber") {
                    showFields(["planDetails", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "connectionMethod", "pingTestResult", "speedTestResult", "actualExp", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "deviceBrandAndModel", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }
                } else {
                    showFields(["planDetails", "connectionMethod", "pingTestResult", "speedTestResult", "issueResolved"]);
                    hideSpecificFields(["outageReference", "pcNumber", "onuSerialNum", "rxPower", "saaaBandwidthCode", "connectedDevices", "cvReading", "onuModel", "dmsStatus", "deviceWifiBand", "bandsteering", "deviceBrandAndModel", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }   
                }
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
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
        });

        updateToolLabelVisibility();

    // **********Selective Browsing*********************************************************************************
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
                "Clearview"
            ]},
            { label: "Parent Case Number", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
            { label: "Website URL", type: "text", name: "websiteURL"},
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
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
                "",
                "Manual Troubleshooting",
                "Request Timed Out",
                "Webpage Not Loading"
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"},
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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

        insertToolLabel(enhancedFields, "Visual Audit", "facility");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        
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
                input.rows = (field.name === "cvReading") 
                    ? 2 
                    : (field.name === "remarks") 
                        ? 6 
                        : 3;
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
            cepButtonHandler,
            salesforceButtonHandler,
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
        const issueResolved = document.querySelector("[name='issueResolved']");

        facility.addEventListener("change", () => {
            resetAllFields(["facility"]);
            if (facility.value === "Copper VDSL") {
                showFields(["resType"]);
                hideSpecificFields(["outageStatus", "outageReference", "websiteURL", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "flmFindings", "issueResolved", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else if (facility.value === "Copper HDSL/NGN") {
                showFields(["remarks"]);
                hideSpecificFields(["resType", "outageStatus", "outageReference", "websiteURL", "investigation1", "investigation2", "investigation3", "investigation4", "issueResolved", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            } else {
                showFields(["outageStatus", "websiteURL", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                hideSpecificFields(["resType", "outageReference", "pcNumber", "flmFindings", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }

            updateToolLabelVisibility();
        });
    
        resType.addEventListener("change", () => {
            resetAllFields(["facility", "resType"]);
            if (resType.value === "Yes") {
                showFields(["outageStatus", "websiteURL", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                hideSpecificFields(["outageReference", "pcNumber", "issueResolved", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            } else {
                showFields(["remarks"]);
                hideSpecificFields(["outageStatus", "outageReference", "websiteURL", "investigation1", "investigation2", "investigation3", "investigation4", "issueResolved", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }
            }

            updateToolLabelVisibility();
        });

        outageStatus.addEventListener("change", () => {
            resetAllFields(["facility", "resType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                if (channelField === "CDT-SOCMED") {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["issueResolved", "specialInstruct"]);
                }
            } else {
                showFields(["issueResolved"]);
                hideSpecificFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "specialInstruct", "rptCount"]);
            }

            if (channelField === "CDT-SOCMED") {
                showFields(["flmFindings"]);
            } else {
                hideSpecificFields(["flmFindings"]);
            }

            updateToolLabelVisibility();
        });
    
        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
        });

        updateToolLabelVisibility();

    // **********IPTV Issue******************************************************************************************
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
                "Lit365 Downtime Advisory"
            ]},
            { label: "Parent Case Number", type: "text", name: "pcNumber", placeholder: "Leave blank if Awaiting Parent Case"},
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
            // NMS Skin
            { label: "Modem/ONU Serial # (L2)", type: "text", name: "onuSerialNum", placeholder: "Also available in DMS."},
            { label: "RX Power/OPTICSRXPOWER", type: "number", name: "rxPower", step: "any"},
            { label: "WAN NAME_3", type: "text", name: "wanName_3"},
            { label: "SRVCTYPE_3", type: "text", name: "srvcType_3"},
            { label: "CONNTYPE_3", type: "text", name: "connType_3"},
            { label: "WANVLAN_3/LAN 4 Unicast", type: "text", name: "vlan_3"},
            // DMS
            { label: "LAN 4 Status", type: "text", name: "dmsLan4Status"},
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
                "No Audio/Video Output w/o Test Channel",
                "Not Applicable [via Store]",
                "Out-of-Sync",
                "Pixelated",
                "Recording Error",
                "Remote Control Issues",
                "STB Not Synched",
                "Too long to Boot Up"
            ]},
            // Request for Retracking
            { label: "Request for Retracking?", type: "select", name: "req4retracking", options: ["", "Yes", "No"]},
            { label: "STB Serial #", type: "text", name: "stbSerialNumber"},
            { label: "Smartcard ID", type: "text", name: "smartCardID"},
            { label: "Cignal Plan", type: "text", name: "cignalPlan"},
            { label: "Actual Experience", type: "textarea", name: "actualExp", placeholder: "Please input the customer's actual experience. e.g. “With IP but no tune service multicast” DO NOT input the WOCAS!"},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
                "",
                "Cignal Retracking",
                "Defective Cignal Accessories / Missing Cignal Accessories",
                "Defective Set Top Box / Missing Set Top Box",
                "Manual Troubleshooting",
                "Network Configuration",
                "Defective Remote Control"
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" },
            { label: "Repeats w/in 30 Days", type: "text", name: "rptCount"}
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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
        insertToolLabel(enhancedFields, "NMS Skin", "onuSerialNum");
        insertToolLabel(enhancedFields, "DMS", "dmsLan4Status");
        insertToolLabel(enhancedFields, "CEP Investigation Tagging", "investigation1");
        insertToolLabel(enhancedFields, "Request for Retracking", "req4retracking");
        
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

                if (field.name === "flmFindings") {
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
                input.rows = (field.name === "cvReading") 
                    ? 2 
                    : (field.name === "remarks") 
                        ? 6 
                        : (field.name === "specialInstruct") 
                            ? 5
                            : 3;
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
            cepButtonHandler,
            salesforceButtonHandler,
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
                    showFields(["outageStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks"]);
                    hideSpecificFields(["outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "req4retracking", "actualExp", "stbSerialNumber", "smartCardID", "cignalPlan", "issueResolved", "flmFindings", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    updateToolLabelVisibility();
                } else if (selectedValue === "form511_1" || selectedValue === "form511_2" || selectedValue === "form511_3" || selectedValue === "form511_4" || selectedValue === "form511_5") {
                    showFields(["rxPower", "investigation1", "investigation2", "investigation3", "investigation4", "req4retracking", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "stbSerialNumber", "smartCardID", "cignalPlan", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }

                    updateToolLabelVisibility();
                } else if (selectedValue === "form512_1") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "req4retracking", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "stbSerialNumber", "smartCardID", "cignalPlan", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }

                    updateToolLabelVisibility();
                } else if (selectedValue === "form510_7") {
                    showFields(["onuSerialNum", "dmsLan4Status", "investigation1", "investigation2", "investigation3", "investigation4", "stbSerialNumber", "smartCardID", "actualExp", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "req4retracking", "cignalPlan", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }

                    updateToolLabelVisibility();
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "req4retracking", "stbSerialNumber", "smartCardID", "cignalPlan", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    if (channelField === "CDT-SOCMED") {
                        showFields(["flmFindings"]);
                    } else {
                        hideSpecificFields(["flmFindings"]);
                    }

                    updateToolLabelVisibility();
                }
            } else if (accountType.value === "RADIUS") {
                if (selectedValue === "form510_1" || selectedValue === "form510_2" || selectedValue === "form511_1" || selectedValue === "form511_2" || selectedValue === "form511_3" || selectedValue === "form511_4" || selectedValue === "form511_5" || selectedValue === "form512_1") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "req4retracking", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "equipmentBrand", "modemBrand", "onuConnectionType", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "stbSerialNumber", "smartCardID", "cignalPlan", "actualExp", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                } else {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved"]);
                    hideSpecificFields(["outageStatus", "outageReference", "pcNumber", "equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "rxPower", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "req4retracking", "stbSerialNumber", "smartCardID", "cignalPlan", "actualExp", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                }

                if (channelField === "CDT-SOCMED") {
                    showFields(["flmFindings"]);
                } else {
                    hideSpecificFields(["flmFindings"]);
                }

                updateToolLabelVisibility();
            }
        });
    
        outageStatus.addEventListener("change", () => {
            resetAllFields(["accountType", "outageStatus"]);
            if (outageStatus.value === "Yes") {
                if (channelField === "CDT-SOCMED") {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "req4retracking", "actualExp", "issueResolved", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else {
                    showFields(["outageReference", "pcNumber", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "wanName_3", "srvcType_3", "connType_3", "vlan_3", "dmsLan4Status", "req4retracking", "actualExp", "issueResolved", "specialInstruct"]);
                }

                updateToolLabelVisibility();
            } else {
                    showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "onuSerialNum", "dmsLan4Status", "req4retracking", "actualExp", "issueResolved"]);
                    hideSpecificFields(["wanName_3", "srvcType_3", "connType_3", "vlan_3", "outageReference", "pcNumber", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);

                    updateToolLabelVisibility();
            }

            if (channelField === "CDT-SOCMED") {
                showFields(["flmFindings"]);
            } else {
                hideSpecificFields(["flmFindings"]);
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
            if (selectedValue === "form510_1" || selectedValue === "form510_2") {
                if (req4retracking.value === "Yes") {
                    showFields(["stbSerialNumber", "smartCardID", "cignalPlan"]);
                } else {
                    hideSpecificFields(["stbSerialNumber", "smartCardID", "cignalPlan"]);
                }
            } else {
                if (req4retracking.value === "Yes") {
                    showFields(["stbSerialNumber", "smartCardID", "cignalPlan", "actualExp"]);
                } else {
                    hideSpecificFields(["stbSerialNumber", "smartCardID", "cignalPlan", "actualExp"]);
                }
            }
            

            updateToolLabelVisibility();
        });

        issueResolved.addEventListener("change", () => {
            if (issueResolved.selectedIndex === 2) {
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct", "rptCount"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks", "rptCount"]);
            }
        });

        updateToolLabelVisibility();
    
    // **********300: Modem Request Transactions**************************************************
    } else if (mrtForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
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
            { label: "DMS: LAN Port Status", type: "text", name: "dmsLanPortStatus"},
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "",
                "Normal Status",
                "Not Applicable [via Store]"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "",
                "Up/Active",
                "VLAN Configuration issue",
                "Not Applicable [via Store]"                    
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "",
                "Without Line Problem Detected",
                "The ONU performance is degraded"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Cannot Browse",
                "Change set-up Route to Bridge and Vice Versa",
                "Change set-up Route to Bridge and Vice Versa [InterOP]",
                "Data Bind Port",
                "FCR - Change WiFi SSID UN/PW",
                "Not Applicable [via Store]",
                "Request Modem/ONU GUI Access",
                "Request Modem/ONU GUI Access [InterOP]"
            ]},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
            { label: "FLM Findings", type: "select", name: "flmFindings", options: [
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                
                let optionsToUse = field.options;

                if (field.name === "flmFindings") {
                    if (["form300_1"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[2], field.options[3]];
                    } else if (["form300_2"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[1], field.options[2], field.options[3]];
                    } else if (["form300_3"].includes(selectedValue)) {
                        optionsToUse = [field.options[0], field.options[3]];
                    } else if (["form300_4", "form300_5", "form300_7"].includes(selectedValue)) {
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
                input.rows = (field.name === "cvReading") 
                    ? 2 
                    : (field.name === "remarks") 
                        ? 6 
                        : 3;
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
        fields.forEach(field => table.appendChild(createFieldRow(field))); 

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            cepButtonHandler,
            salesforceButtonHandler,
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
                    showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved", "flmFindings"]);
                    hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else if (["form300_2", "form300_3", "form300_4", "form300_5"].includes(selectedValue)) {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "specialInstruct", "flmFindings"]);
                        hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["equipmentBrand", "modemBrand", "onuConnectionType", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "flmFindings"]);
                        hideSpecificFields(["specialInstruct"]);
                    }   
                } else if (selectedValue === "form300_6") {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["lanPortNum", "dmsLanPortStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "specialInstruct", "flmFindings"]);
                        hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["lanPortNum", "dmsLanPortStatus", "investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "flmFindings"]);
                        hideSpecificFields(["specialInstruct"]);
                    }     
                } else {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "specialInstruct", "flmFindings"]);
                        hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "flmFindings"]);
                        hideSpecificFields(["specialInstruct"]);
                    }
                }
            } else if (custAuth.value === "Passed" && accountType.value === "RADIUS") {
                if (selectedValue === "form300_1") {
                    showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "issueResolved", "flmFindings"]);
                    hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks"]);
                } else if (["form300_2", "form300_3", "form300_4", "form300_5"].includes(selectedValue)) {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "specialInstruct", "flmFindings"]);
                        hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "flmFindings"]);
                        hideSpecificFields(["equipmentBrand", "modemBrand", "onuConnectionType", "specialInstruct"]);
                    }
                } else if (selectedValue === "form300_6") {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "specialInstruct", "flmFindings"]);
                        hideSpecificFields(["lanPortNum", "dmsLanPortStatus", "contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "flmFindings"]);
                        hideSpecificFields(["lanPortNum", "dmsLanPortStatus", "specialInstruct"]);
                    }
                } else {
                    if (channelField === "CDT-SOCMED") {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "specialInstruct", "flmFindings"]);
                        hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"]);
                    } else {
                        showFields(["investigation1", "investigation2", "investigation3", "investigation4", "remarks", "cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks", "flmFindings"]);
                        hideSpecificFields(["specialInstruct"]);
                    }
                }
            } else {
                showFields(["remarks"]);
                hideSpecificFields([
                    "equipmentBrand", "modemBrand", "onuConnectionType", "lanPortNum", "dmsLanPortStatus",
                    "investigation1", "investigation2", "investigation3", "investigation4", "issueResolved",
                    "cepCaseNumber", "sla", "specialInstruct", "flmFindings", "contactName", "cbr", "availability", "address", "landmarks"
                ]);
            }
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
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks"]);
            }
        });
    
    // **********Streaming Apps Issues**************************************************
    } else if (streamAppsForms.includes(selectedValue)) { 
        const table = document.createElement("table");

        const fields = [
            { label: "Investigation 1", type: "select", name: "investigation1", options: [
                "",
                "Normal Status"
            ]},
            { label: "Investigation 2", type: "select", name: "investigation2", options: [
                "",
                "Up/Active"                  
            ]},
            { label: "Investigation 3", type: "select", name: "investigation3", options: [
                "",
                "Without Line Problem Detected"
            ]},
            { label: "Investigation 4", type: "select", name: "investigation4", options: [
                "— Select applicable Investigation 4 —",
                "Content",
                "FCR - Device - Advised Physical Set Up",
                "FCR - Device for Replacement in Store"
            ]},
            { label: "Troubleshooting/ Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Ensure that all actions performed in each tool are properly documented. Avoid using generic notations such as “ACK CX”,“PROVIDE EMPATHY”, “CONDUCT VA”, “CONDUCT BTS”, “CREATE FT”, or “PROVIDE SLA/PLDT TRACKER”. You may also include any SNOW or E-Solve tickets raised for tool-related issues or latency." },
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
            { label: "Special Instructions", type: "textarea", name: "specialInstruct", placeholder: "Contact Details, CBR, Address, Landmarks, & Availability" },
            { label: "Contact Person", type: "text", name: "contactName" },
            { label: "Contact Number", type: "number", name: "cbr" },
            { label: "Availability", type: "text", name: "availability" },
            { label: "Address", type: "textarea", name: "address" },
            { label: "Landmarks", type: "textarea", name: "landmarks" }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "See ";

            const link1 = document.createElement("a");

            let url1 = "#";
            if (channelField === "CDT-HOTLINE") {
                url1 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP%2FCEP%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20CEP";
            } else if (channelField === "CDT-SOCMED") {
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
            if (channelField === "CDT-HOTLINE") {
                url2 = "https://pldt365.sharepoint.com/sites/LIT365/files/2025Advisories/Forms/AllItems.aspx?id=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA%2FGAMMA%5FHOTLINE%5FTROUBLESHOOTING%5FGUIDE%2Epdf&parent=%2Fsites%2FLIT365%2Ffiles%2F2025Advisories%2F02FEBRUARY%2FPLDT%20%2D%20GAMMA";
            } else if (channelField === "CDT-SOCMED") {
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
        
        function createFieldRow(field) {
            const row = document.createElement("tr");
            row.style.display = (!["cepCaseNumber", "sla", "specialInstruct"].includes(field.name)) ? "table-row" : "none";

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
                input.rows = (field.name === "cvReading") 
                    ? 2 
                    : (field.name === "remarks") 
                        ? 6 
                        : 3;
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
        fields.forEach(field => table.appendChild(createFieldRow(field))); 

        form2Container.appendChild(table);

        const buttonLabels = ["CEP", "Salesforce", "Endorse", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            cepButtonHandler,
            salesforceButtonHandler,
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
                if (channelField === "CDT-SOCMED") {
                    showFields(["cepCaseNumber", "sla", "specialInstruct"]);
                    hideSpecificFields(["contactName", "cbr", "availability", "address", "landmarks"])
                } else {
                    showFields(["cepCaseNumber", "sla", "contactName", "cbr", "availability", "address", "landmarks"]);
                    hideSpecificFields(["specialInstruct"])
                }
            } else {
                hideSpecificFields(["cepCaseNumber", "sla", "specialInstruct", "contactName", "cbr", "availability", "address", "landmarks"]);
            }
        });
    
    //********************* REQUEST: Dispute Non-Service*************************************************************
    } else if (selectedValue === "formReqNonServiceRebate") { 
        const table = document.createElement("table");

        const fields = [
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
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Service Request #", type: "number", name: "srNum" },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            // Requirements Section
            const req = document.createElement("p");
            req.textContent = "Customer Talking Points:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Inform the customer of the SR number and corresponding amount before ending the conversation.";
            ulReq.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "Explain that the adjustment is expected to reflect in the next billing cycle.";
            ulReq.appendChild(li2);

            checklistDiv.appendChild(ulReq);

            // Checklist Section
            const cl = document.createElement("p");
            cl.textContent = "Checklist:";
            cl.className = "checklist-header";
            checklistDiv.appendChild(cl);

            const ulCl = document.createElement("ul");
            ulCl.className = "checklist";

            const li8 = document.createElement("li");
            li8.textContent = "Make sure that your CASIO notes are also logged in FUSE.";
            ulCl.appendChild(li8);

            checklistDiv.appendChild(ulCl);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custConcern", "ownership", "custAuth", "remarks", "srNum", "upsell", "issueResolved"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];

        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** REQUEST: Reconnection via FUSE***********************************************************
    } else if (selectedValue === "formReqReconnection") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** COMPLAINT: Cannot Open MyHome Website ****************************************************
    } else if (selectedValue === "formMyHomeWeb") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

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
        
        table.appendChild(createInstructionsRow()); 
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** COMPLAINT: Misapplied Payment ************************************************************
    } else if (selectedValue === "formMisappliedPayment") {
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
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="ownership"]');
            const findingsEl = document.querySelector('[name="findings"]');

            const ownership = ownershipEl ? ownershipEl.value : "";
            const findings = findingsEl ? findingsEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

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
            const existingChecklist = document.querySelector(".form2DivChecklist")?.parentElement?.parentElement;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "findings") {
            ownershipRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [fuseButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
        
    //******************** COMPLAINT: Unreflected Payment ***********************************************************
    } else if (selectedValue === "formUnreflectedPayment") {
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
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="ownership"]');
            const paymentChannelEl = document.querySelector('[name="paymentChannel"]');

            const ownership = ownershipEl ? ownershipEl.value : "";
            const paymentChannel = paymentChannelEl ? paymentChannelEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

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
            const existingChecklist = document.querySelector(".form2DivChecklist")?.parentElement?.parentElement;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "paymentChannel") {
            ownershipRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [fuseButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
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
    
    //******************** COMPLAINT: Personnel Concerns ************************************************************
    } else if (selectedValue === "formPersonnelIssue") {
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
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="personnelType"]');
            const ownership = ownershipEl ? ownershipEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const req = document.createElement("p");
            req.textContent = "Instructions:";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "Acknowledge and empathize with the customer’s experience";

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
            const existingChecklist = document.querySelector(".form2DivChecklist")?.parentElement?.parentElement;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "personnelType") {
                personnelTypeRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [fuseButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
    
    //******************** INQUIRY: Account/Service Status	 ********************************************************
    } else if (selectedValue === "formInqAccSrvcStatus") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "select", name: "custConcern", options: [
                "", 
                "Account Status", 
                "Service Status"
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const custConcernEl = document.querySelector('[name="custConcern"]');

            const custConcern = custConcernEl ? custConcernEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const req = document.createElement("p");
            req.textContent = "Definition";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquires about the status of their account.";

            const li2 = document.createElement("li");
            li2.textContent = "The customer inquires about the status of their services.";

            if (custConcern === "Account Status") {
                ulReq.appendChild(li1);
            } else if (custConcern === "Service Status") {
                ulReq.appendChild(li2);
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let custConcernRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivChecklist")?.parentElement?.parentElement;
            if (existingChecklist) {
                existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (custConcernRow && custConcernRow.parentNode) {
                custConcernRow.parentNode.insertBefore(checklistRow, custConcernRow.nextSibling);
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
                if (field.name === "custConcern") {
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

                if (field.name === "custConcern") {
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "custConcern") {
            custConcernRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [fuseButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
    
    //******************** INQUIRY: Bill Interpretation (Prorate / Breakdown) ***************************************
    } else if (selectedValue === "formInqBillInterpret") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "select", name: "custConcern", options: [
                "", 
                "Add On Service", 
                "New Connect",
                "Relocation",
                "Upgrade",
                "Downgrade",
                "Migration"
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const custConcernEl = document.querySelector('[name="custConcern"]');

            const custConcern = custConcernEl ? custConcernEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const req = document.createElement("p");
            req.textContent = "Definition";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquired about the breakdown of their bill due to an add-on service.";

            const li2 = document.createElement("li");
            li2.textContent = "The customer inquired about the details of their first bill or its prorated charges.";

            const li3 = document.createElement("li");
            li3.textContent = "The customer inquired about their bill in relation to the relocation process, including any applicable fees and prorated charges after relocation.";

            const li4 = document.createElement("li");
            li4.textContent = "The customer inquired about their bill related to an upgrade, downgrade, or migration, including any fees and prorated charges after the process.";

            if (custConcern === "Add On Service") {
                ulReq.appendChild(li1);
            } else if (custConcern === "New Connect") {
                ulReq.appendChild(li2);
            } else if (custConcern === "Relocation") {
                ulReq.appendChild(li3);
            } else if (custConcern === "Upgrade" || custConcern === "Downgrade" || custConcern === "Migration") {
                ulReq.appendChild(li4);
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let custConcernRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivChecklist")?.parentElement?.parentElement;
            if (existingChecklist) {
                existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (custConcernRow && custConcernRow.parentNode) {
                custConcernRow.parentNode.insertBefore(checklistRow, custConcernRow.nextSibling);
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
                if (field.name === "custConcern") {
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

                if (field.name === "custConcern") {
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "custConcern") {
            custConcernRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [fuseButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
    
    //******************** INQUIRY: Approved rebate / Credit Adjustment	 ********************************************
    } else if (selectedValue === "formInqRebCredAdj") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "select", name: "custConcern", options: [
                "", 
                "Approved Rebate", 
                "Approved Credit Adjustment"
            ]},
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "Issue Resolved? (Y/N)", type: "select", name: "issueResolved", options: ["", "Yes", "No - Customer is Unresponsive", "No - Customer Declined Further Assistance", "No - System Ended Chat"] },
            { label: "Upsell", type: "select", name: "upsell", options: ["", "Yes - Accepted", "No - Declined", "No - Ignored", "NA - Not Eligible"] }
        ];

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const custConcernEl = document.querySelector('[name="custConcern"]');
            const custConcern = custConcernEl ? custConcernEl.value : "";

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const req = document.createElement("p");
            req.textContent = "Definition";
            req.className = "requirements-header";
            checklistDiv.appendChild(req);

            const ulReq = document.createElement("ul");
            ulReq.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquired whether their rebate was approved.";

            const li2 = document.createElement("li");
            li2.textContent = "The customer inquired whether their credit adjustment was approved.";

            if (custConcern === "Approved Rebate") {
                ulReq.appendChild(li1);
            } else if (custConcern === "Approved Credit Adjustment") {
                ulReq.appendChild(li2);
            }

            checklistDiv.appendChild(ulReq);
            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let custConcernRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivChecklist")?.parentElement?.parentElement;
            if (existingChecklist) {
            existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (custConcernRow && custConcernRow.parentNode) {
            custConcernRow.parentNode.insertBefore(checklistRow, custConcernRow.nextSibling);
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
                if (field.name === "custConcern") {
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

                if (field.name === "custConcern") {
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "custConcern") {
            custConcernRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [fuseButtonHandler, sfTaggingButtonHandler, saveFormData, resetButtonHandler];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);
    
    //******************** INQUIRY: Contract / Lock In **************************************************************
    } else if (selectedValue === "formInqLockIn") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer asked when their 36-month lock-in contract began and when it will end.";
            ul.appendChild(li1);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custAuth", "remarks", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** INQUIRY: Copy of Bill ****************************************************
    } else if (selectedValue === "formInqCopyOfBill") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquired about where or how they can get a copy of their monthly bill.";
            ul.appendChild(li1);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custAuth", "remarks", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** INQUIRY: My Home Account *****************************************************************
    } else if (selectedValue === "formInqMyHomeAcc") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquired about how to log in through MyHome Account.";
            ul.appendChild(li1);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custAuth", "remarks", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** INQUIRY: Plan Details ********************************************************************
    } else if (selectedValue === "formInqPlanDetails") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquired about the various plans offered.";
            ul.appendChild(li1);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["planDetails", "custAuth", "remarks", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** INQUIRY: Auto Debit Arrangement (ADA) ****************************************************
    } else if (selectedValue === "formInqAda") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer is inquiring about Auto Debit Arrangement.";
            ul.appendChild(li1);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custAuth", "remarks", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** INQUIRY: Balance transfer ***************************************************************
    } else if (selectedValue === "formInqBalTransfer") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Customer Authentication", type: "select", name: "custAuth", options: [
                "", 
                "Failed", 
                "Passed",
                "NA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Definition";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The customer inquired about how to transfer their balance to another account.";
            ul.appendChild(li1);

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["custAuth", "remarks", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
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
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** FOLLOW-UP: Change Ownership ****************************************************
    } else if (selectedValue === "formFfupChangeOwnership") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Status", type: "select", name: "ffupStatus", options: [
                "", 
                "Beyond SLA", 
                "Within SLA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "SO/SR #", type: "text", name: "srNum"},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Supersedure retain Account number",
                "Supersedure with change account number"
            ] },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput"; 

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            const li1 = document.createElement("li");
            li1.textContent = "Please fill out all required fields.";
            ul.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.";
            ul.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Ensure that the information is accurate.";
            ul.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "Please review your inputs before generating the notes.";
            ul.appendChild(li4);

            instructionsDiv.appendChild(ul);

            td.appendChild(instructionsDiv);
            row.appendChild(td);

            return row;
        }

        function createPromptRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist"; 

            const header = document.createElement("p");
            header.textContent = "Mandatory Information";
            header.className = "requirements-header";
            checklistDiv.appendChild(header);

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

            checklistDiv.appendChild(header);
            checklistDiv.appendChild(ul);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        function createFieldRow(field) {
            const row = document.createElement("tr");
            const primaryFields = ["ffupStatus", "custConcern", "remarks", "srNum", "requestType", "issueResolved", "upsell"];
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
        
        table.appendChild(createInstructionsRow()); 
        fields.forEach((field, index) => {
            const row = createFieldRow(field);
            table.appendChild(row);

            if (field.name === "ffupStatus") {
                table.appendChild(createPromptRow());
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** FOLLOW-UP: Change Telephone Number ****************************************************
    } else if (selectedValue === "formFfupChangeTelNum") { 
        const table = document.createElement("table");

        const fields = [
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
                "", 
                "Activation Task",
                "No SO Generated",
                "System Task / Stuck SO"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
            { label: "SO/SR #", type: "text", name: "srNum"},
            { label: "Type of Request", type: "select", name: "requestType", options: [
                "", 
                "Supersedure retain Account number",
                "Supersedure with change account number"
            ] },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        function createPromptRow() {
            const ownershipEl = document.querySelector('[name="ownership"]');
            const findingsEl = document.querySelector('[name="findings"]');

            const ownership = ownershipEl ? ownershipEl.value : "";
            const findings = findingsEl ? findingsEl.value : "";

            if (findings !== "No SO Generated") {
                return null;
            }

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const mInfo = document.createElement("p");
            mInfo.textContent = "Mandatory Information:";
            mInfo.className = "requirements-header";
            checklistDiv.appendChild(mInfo);

            const ulMandaInfo = document.createElement("ul");
            ulMandaInfo.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The Account is Active";
            ulMandaInfo.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "No pending bill-related issues";
            ulMandaInfo.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Zero balance MSF";
            ulMandaInfo.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "No open dispute";
            ulMandaInfo.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "Paid unbilled toll charges";
            ulMandaInfo.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "Paid Pre-Termination Fee if within lock-in (Supersedure with creation of New Account number) for the following:";
            const nestedUl = document.createElement("ul");
            [
                "Remaining months of gadget amortization",
                "Remaining months of installation fee",
                "Remaining months of activation fee"
            ].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                nestedUl.appendChild(li);
            });
            li6.appendChild(nestedUl);
            ulMandaInfo.appendChild(li6);

            const li7 = document.createElement("li");
            li7.textContent = "Supersedure with retention of account number and all account-related details shall only be allowed for the following incoming customer:";
            const nestedOl = document.createElement("ol");
            nestedOl.type = "a";
            [
                "Spouse of the outgoing customer must submit (PSA) Copy of Marriage Certificate",
                "Child of the outgoing customer must submit (PSA) Copy of Birth Certificate",
                "Sibling of the outgoing customer must submit (PSA) copies of Birth Certificate of both incoming and outgoing customers"
            ].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                nestedOl.appendChild(li);
            });
            li7.appendChild(nestedOl);
            ulMandaInfo.appendChild(li7);

            checklistDiv.appendChild(ulMandaInfo);

            const req = document.createElement("p");
            req.textContent = "Requirements:";
            req.className = "customer-talking-points-header";
            checklistDiv.appendChild(req);

            const ulreq = document.createElement("ul");
            ulreq.className = "checklist";

            const talkingPoints = [
                "Service Request Form (if required for the feature being requested)", // index 0
                "Subscription Certificate (if required for the feature being requested)", // index 1
                "Refer to PLDT Guidelines in Handling Non-SOR Aftersales Request for the guidelines", // index 2
                "Signed document should be sent back to proceed with the SO creation", // index 3
                "Authorization letter signed by the customer on record", // index 4
                "Valid ID of the customer on record", // index 5
                "Valid ID of the authorized requestor" // index 6
            ];

            const liElements = talkingPoints.map(text => {
                const li = document.createElement("li");
                li.textContent = text;
                return li;
            });

            if (ownership === "SOR") {
                ulreq.appendChild(liElements[0]);
                ulreq.appendChild(liElements[1]);
            } else {
                ulreq.appendChild(liElements[2]);
                ulreq.appendChild(liElements[3]);
                ulreq.appendChild(liElements[4]);
                ulreq.appendChild(liElements[5]);
            }

            checklistDiv.appendChild(ulreq);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let findingsRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivChecklist")?.closest("tr");
            if (existingChecklist) {
                existingChecklist.remove();
            }

            const checklistRow = createPromptRow();
            if (checklistRow && findingsRow && findingsRow.parentNode) {
                findingsRow.parentNode.insertBefore(checklistRow, findingsRow.nextSibling);
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "findings") {
                findingsRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** FOLLOW-UP: Change Telephone unit ****************************************************
    } else if (selectedValue === "formFfupChangeTelUnit") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
            { label: "Status", type: "select", name: "ffupStatus", options: [
                "", 
                "Beyond SLA", 
                "Within SLA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        // function createPromptRow() {
        //     const ownershipEl = document.querySelector('[name="ownership"]');
        //     const findingsEl = document.querySelector('[name="findings"]');

        //     const ownership = ownershipEl ? ownershipEl.value : "";
        //     const findings = findingsEl ? findingsEl.value : "";

        //     if (findings !== "No SO Generated") {
        //         return null;
        //     }

        //     const row = document.createElement("tr");
        //     const td = document.createElement("td");

        //     const checklistDiv = document.createElement("div");
        //     checklistDiv.className = "form2DivChecklist";

        //     const mInfo = document.createElement("p");
        //     mInfo.textContent = "Mandatory Information:";
        //     mInfo.className = "requirements-header";
        //     checklistDiv.appendChild(mInfo);

        //     const ulMandaInfo = document.createElement("ul");
        //     ulMandaInfo.className = "checklist";

        //     const li1 = document.createElement("li");
        //     li1.textContent = "The Account is Active";
        //     ulMandaInfo.appendChild(li1);

        //     const li2 = document.createElement("li");
        //     li2.textContent = "No pending bill-related issues";
        //     ulMandaInfo.appendChild(li2);

        //     const li3 = document.createElement("li");
        //     li3.textContent = "Zero balance MSF";
        //     ulMandaInfo.appendChild(li3);

        //     const li4 = document.createElement("li");
        //     li4.textContent = "No open dispute";
        //     ulMandaInfo.appendChild(li4);

        //     const li5 = document.createElement("li");
        //     li5.textContent = "Paid unbilled toll charges";
        //     ulMandaInfo.appendChild(li5);

        //     const li6 = document.createElement("li");
        //     li6.textContent = "Paid Pre-Termination Fee if within lock-in (Supersedure with creation of New Account number) for the following:";
        //     const nestedUl = document.createElement("ul");
        //     [
        //         "Remaining months of gadget amortization",
        //         "Remaining months of installation fee",
        //         "Remaining months of activation fee"
        //     ].forEach(text => {
        //         const li = document.createElement("li");
        //         li.textContent = text;
        //         nestedUl.appendChild(li);
        //     });
        //     li6.appendChild(nestedUl);
        //     ulMandaInfo.appendChild(li6);

        //     const li7 = document.createElement("li");
        //     li7.textContent = "Supersedure with retention of account number and all account-related details shall only be allowed for the following incoming customer:";
        //     const nestedOl = document.createElement("ol");
        //     nestedOl.type = "a";
        //     [
        //         "Spouse of the outgoing customer must submit (PSA) Copy of Marriage Certificate",
        //         "Child of the outgoing customer must submit (PSA) Copy of Birth Certificate",
        //         "Sibling of the outgoing customer must submit (PSA) copies of Birth Certificate of both incoming and outgoing customers"
        //     ].forEach(text => {
        //         const li = document.createElement("li");
        //         li.textContent = text;
        //         nestedOl.appendChild(li);
        //     });
        //     li7.appendChild(nestedOl);
        //     ulMandaInfo.appendChild(li7);

        //     checklistDiv.appendChild(ulMandaInfo);

        //     const req = document.createElement("p");
        //     req.textContent = "Requirements:";
        //     req.className = "customer-talking-points-header";
        //     checklistDiv.appendChild(req);

        //     const ulreq = document.createElement("ul");
        //     ulreq.className = "checklist";

        //     const talkingPoints = [
        //         "Service Request Form (if required for the feature being requested)", // index 0
        //         "Subscription Certificate (if required for the feature being requested)", // index 1
        //         "Refer to PLDT Guidelines in Handling Non-SOR Aftersales Request for the guidelines", // index 2
        //         "Signed document should be sent back to proceed with the SO creation", // index 3
        //         "Authorization letter signed by the customer on record", // index 4
        //         "Valid ID of the customer on record", // index 5
        //         "Valid ID of the authorized requestor" // index 6
        //     ];

        //     const liElements = talkingPoints.map(text => {
        //         const li = document.createElement("li");
        //         li.textContent = text;
        //         return li;
        //     });

        //     if (ownership === "SOR") {
        //         ulreq.appendChild(liElements[0]);
        //         ulreq.appendChild(liElements[1]);
        //     } else {
        //         ulreq.appendChild(liElements[2]);
        //         ulreq.appendChild(liElements[3]);
        //         ulreq.appendChild(liElements[4]);
        //         ulreq.appendChild(liElements[5]);
        //     }

        //     checklistDiv.appendChild(ulreq);

        //     td.appendChild(checklistDiv);
        //     row.appendChild(td);

        //     return row;
        // }

        // let findingsRow = null;

        // function updateChecklist() {
        //     const existingChecklist = document.querySelector(".form2DivChecklist")?.closest("tr");
        //     if (existingChecklist) {
        //         existingChecklist.remove();
        //     }
        //     const checklistRow = createPromptRow();
        //     if (findingsRow && findingsRow.parentNode) {
        //         findingsRow.parentNode.insertBefore(checklistRow, findingsRow.nextSibling);
        //     }
        // }

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
                // if (field.name === "ownership" || field.name === "findings") {
                //     input.id = field.name;
                // }

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

                // if (field.name === "ownership" || field.name === "findings") {
                //     input.addEventListener("change", updateChecklist);
                // }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            // if (field.name === "findings") {
            //     findingsRow = row;
            // }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** FOLLOW-UP: Disconnection (VAS) ****************************************************
    }  else if (selectedValue === "formFfupDiscoVas") { 
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
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
                "", 
                "Activation Task",
                "No SO Generated",
                "System Task / Stuck SO"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        function createPromptRow() {
            // const ownershipEl = document.querySelector('[name="ownership"]');
            const findingsEl = document.querySelector('[name="findings"]');

            // const ownership = ownershipEl ? ownershipEl.value : "";
            const findings = findingsEl ? findingsEl.value : "";

            if (findings !== "No SO Generated") {
                return null;
            }

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const mInfo = document.createElement("p");
            mInfo.textContent = "Mandatory Information:";
            mInfo.className = "requirements-header";
            checklistDiv.appendChild(mInfo);

            const ulMandaInfo = document.createElement("ul");
            ulMandaInfo.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "PTF applies if within the lock-in period";
            ulMandaInfo.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "Within 7 calendar days from the date of SO issuance";
            ulMandaInfo.appendChild(li2);

            checklistDiv.appendChild(ulMandaInfo);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let findingsRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivChecklist")?.closest("tr");
            if (existingChecklist) {
                existingChecklist.remove();
            }
            const checklistRow = createPromptRow();
            if (checklistRow && findingsRow && findingsRow.parentNode) {
                findingsRow.parentNode.insertBefore(checklistRow, findingsRow.nextSibling);
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
                if (field.name === "findings") {
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

                if (field.name === "findings") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "findings") {
                findingsRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** FOLLOW-UP: Dispute ****************************************************
    }  else if (selectedValue === "formFfupDispute") { 
        const table = document.createElement("table");

        const fields = [
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
            { label: "Status", type: "select", name: "ffupStatus", options: [
                "", 
                "Beyond SLA", 
                "Within SLA"
            ]},
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
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
            label.textContent = field.label;
            label.className = field.type === "textarea" ? "form2-label-textarea" : "form2-label";
            label.setAttribute("for", field.name);

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;
                input.className = "form2-input";
                // if (field.name === "findings") {
                //     input.id = field.name;
                // }

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

                // if (field.name === "findings") {
                //     input.addEventListener("change", updateChecklist);
                // }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            // if (field.name === "findings") {
            //     findingsRow = row;
            // }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

        const disputeTypeSelect = document.querySelector('select[name="disputeType"]');
        const approverSelect = document.querySelector('select[name="approver"]');

        const allApproverOptions = [
            "", 
            "Account Admin", 
            "Agent",
            "Cust Head",
            "Cust Sup",
            "Cust TL"
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

    //******************** FOLLOW-UP:  ****************************************************
    } else if (selectedValue === "formFfupDowngrade") {
        const table = document.createElement("table");

        const fields = [
            { label: "Concern", type: "textarea", name: "custConcern", placeholder: "Please input short description of the concern." },
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
                "", 
                "Activation Task",
                "No SO Generated",
                "Opsim",
                "RSO Customer",
                "RSO PLDT",
                "System Task / Stuck SO"
            ] },
            { label: "Actions Taken/ Remarks", type: "textarea", name: "remarks", placeholder: "Please input all actions taken, details/information shared, or any additional remarks to assist the customer." },
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

        function createInstructionsRow() {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            const instructionsDiv = document.createElement("div");
            instructionsDiv.className = "form2DivInput";

            const ul = document.createElement("ul");
            ul.className = "instructions-list";

            ["Please fill out all required fields.",
            "If a field is not required, please leave it blank. Avoid entering 'NA' or any unnecessary details.",
            "Ensure that the information is accurate.",
            "Please review your inputs before generating the notes."].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            instructionsDiv.appendChild(ul);
            td.appendChild(instructionsDiv);
            row.appendChild(td);
            return row;
        }

        function createPromptRow() {
            // const ownershipEl = document.querySelector('[name="ownership"]');
            const findingsEl = document.querySelector('[name="findings"]');

            // const ownership = ownershipEl ? ownershipEl.value : "";
            const findings = findingsEl ? findingsEl.value : "";

            if (findings !== "No SO Generated") {
                return null;
            }

            const row = document.createElement("tr");
            const td = document.createElement("td");

            const checklistDiv = document.createElement("div");
            checklistDiv.className = "form2DivChecklist";

            const mInfo = document.createElement("p");
            mInfo.textContent = "Mandatory Information:";
            mInfo.className = "requirements-header";
            checklistDiv.appendChild(mInfo);

            const ulMandaInfo = document.createElement("ul");
            ulMandaInfo.className = "checklist";

            const li1 = document.createElement("li");
            li1.textContent = "The Account is Active";
            ulMandaInfo.appendChild(li1);

            const li2 = document.createElement("li");
            li2.textContent = "No pending bill-related issues";
            ulMandaInfo.appendChild(li2);

            const li3 = document.createElement("li");
            li3.textContent = "Zero balance MSF";
            ulMandaInfo.appendChild(li3);

            const li4 = document.createElement("li");
            li4.textContent = "No open dispute";
            ulMandaInfo.appendChild(li4);

            const li5 = document.createElement("li");
            li5.textContent = "Paid unbilled toll charges";
            ulMandaInfo.appendChild(li5);

            const li6 = document.createElement("li");
            li6.textContent = "Paid Pre-Termination Fee if within lock-in (Supersedure with creation of New Account number) for the following:";
            const nestedUl = document.createElement("ul");
            [
                "Remaining months of gadget amortization",
                "Remaining months of installation fee",
                "Remaining months of activation fee"
            ].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                nestedUl.appendChild(li);
            });
            li6.appendChild(nestedUl);
            ulMandaInfo.appendChild(li6);

            const li7 = document.createElement("li");
            li7.textContent = "Supersedure with retention of account number and all account-related details shall only be allowed for the following incoming customer:";
            const nestedOl = document.createElement("ol");
            nestedOl.type = "a";
            [
                "Spouse of the outgoing customer must submit (PSA) Copy of Marriage Certificate",
                "Child of the outgoing customer must submit (PSA) Copy of Birth Certificate",
                "Sibling of the outgoing customer must submit (PSA) copies of Birth Certificate of both incoming and outgoing customers"
            ].forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                nestedOl.appendChild(li);
            });
            li7.appendChild(nestedOl);
            ulMandaInfo.appendChild(li7);

            checklistDiv.appendChild(ulMandaInfo);

            const req = document.createElement("p");
            req.textContent = "Requirements:";
            req.className = "customer-talking-points-header";
            checklistDiv.appendChild(req);

            const ulreq = document.createElement("ul");
            ulreq.className = "checklist";

            const talkingPoints = [
                "Service Request Form (if required for the feature being requested)", // index 0
                "Subscription Certificate (if required for the feature being requested)", // index 1
                "Refer to PLDT Guidelines in Handling Non-SOR Aftersales Request for the guidelines", // index 2
                "Signed document should be sent back to proceed with the SO creation", // index 3
                "Authorization letter signed by the customer on record", // index 4
                "Valid ID of the customer on record", // index 5
                "Valid ID of the authorized requestor" // index 6
            ];

            const liElements = talkingPoints.map(text => {
                const li = document.createElement("li");
                li.textContent = text;
                return li;
            });

            if (ownership === "SOR") {
                ulreq.appendChild(liElements[0]);
                ulreq.appendChild(liElements[1]);
            } else {
                ulreq.appendChild(liElements[2]);
                ulreq.appendChild(liElements[3]);
                ulreq.appendChild(liElements[4]);
                ulreq.appendChild(liElements[5]);
            }

            checklistDiv.appendChild(ulreq);

            td.appendChild(checklistDiv);
            row.appendChild(td);

            return row;
        }

        let findingsRow = null;

        function updateChecklist() {
            const existingChecklist = document.querySelector(".form2DivChecklist")?.closest("tr");
            if (existingChecklist) {
                existingChecklist.remove();
            }

            const checklistRow = createPromptRow();
            if (checklistRow && findingsRow && findingsRow.parentNode) {
                findingsRow.parentNode.insertBefore(checklistRow, findingsRow.nextSibling);
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
                if (field.name === "findings") {
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

                if (field.name === "findings") {
                    input.addEventListener("change", updateChecklist);
                }
            } else if (field.type === "textarea") {
                input = document.createElement("textarea");
                input.name = field.name;
                input.className = "form2-textarea";
                input.rows = field.name === "remarks" ? 6 : 2;
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

        table.appendChild(createInstructionsRow());

        fields.forEach(field => {
            const row = createFieldRow(field);
            table.appendChild(row);
            if (field.name === "findings") {
                findingsRow = row;
            }
        });

        form2Container.appendChild(table);

        const buttonLabels = ["Generate", "SF Tagging", "💾 Save", "🔄 Reset"];
        const buttonHandlers = [
            fuseButtonHandler,
            sfTaggingButtonHandler,
            saveFormData,
            resetButtonHandler,
        ];
        const buttonTable = createButtons(buttonLabels, buttonHandlers);
        form2Container.appendChild(buttonTable);

    //******************** FOLLOW-UP:  ****************************************************
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

                if (channelField === "CDT-HOTLINE" && (label === "SF Tagging" || label === "Endorse")) {
                    buttonIndex++;
                    continue;
                }

                if (channelField === "CDT-HOTLINE" && label === "Salesforce") {
                    label = "FUSE/ESA";
                }

                if (label === "CEP" && vars.selectedIntent !== "formFFUP") {
                    const dropdown = document.createElement("div");
                    dropdown.classList.add("dropdown");

                    const mainButton = document.createElement("button");
                    mainButton.textContent = "CEP ⮝";
                    mainButton.classList.add("form2-button");
                    dropdown.appendChild(mainButton);

                    const dropdownContent = document.createElement("div");
                    dropdownContent.classList.add("dropdown-content");

                    const subOptions = [
                        { label: "Title", keys: ["Title"] },
                        { label: "Description", keys: ["Description"] },
                        { label: "Case Notes", keys: ["Case Notes in Timeline"] },
                        { label: "Special Instructions", keys: ["Special Instructions"] }
                        // { label: "All", keys: [] } // default for all
                    ];

                    subOptions.forEach(option => {
                        const subBtn = document.createElement("button");
                        subBtn.textContent = option.label;
                        subBtn.onclick = () => cepButtonHandler(true, option.keys);
                        dropdownContent.appendChild(subBtn);
                    });

                    dropdown.appendChild(dropdownContent);
                    cell.appendChild(dropdown);
                    row.appendChild(cell);
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

function initializeVariables() {
    const q = (selector) => {
        const field = document.querySelector(selector);
        return field && isFieldVisible(field.name) ? field.value.trim() : "";
    };

    const selectIntentElement = document.querySelector("#selectIntent");
    const selectedIntentText = selectIntentElement 
        ? selectIntentElement.selectedOptions[0].textContent.trim() 
        : "";

    return {
        selectedIntent: q("#selectIntent"),
        selectedIntentText,
        channel: q("#channel"),
        sfCaseNum: q('[name="sfCaseNum"]'),
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
        techRepairType: q('[name="techRepairType"]'),
        flmFindings: q('[name="flmFindings"]'),
        paymentChannel: q('[name="paymentChannel"]'),
        personnelType: q('[name="personnelType"]'),
        wocas: q('[name="WOCAS"]'),
        planDetails: q('[name="planDetails"]'),
        ffupStatus: q('[name="ffupStatus"]'),
        requestType: q('[name="requestType"]'),
        findings: q('[name="findings"]'),
        disputeType: q('[name="disputeType"]'),
        approver: q('[name="approver"]'),
    };
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
        } else if (vars.issueResolved !=="No - for Ticket Creation") {
            alert('This option is not available. Please use Salesforce or FUSE/ESA button.');
            return true;
        }
    }

    return false;
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
        group8_1: { intents: ["form501_4"], title: "FREQUENT DISCONNECTION" },
        group9: { intents: ["form502_1", "form502_2"], title: "SELECTIVE BROWSING" },
        group10: { intents: ["form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8"], title: "IPTV NO AUDIO VIDEO OUTPUT", useAccountType: true },
        group11: { intents: ["form511_1", "form511_2", "form511_3", "form511_4", "form511_5"], title: "IPTV POOR AUDIO VIDEO QUALITY", useAccountType: true },
        group12: { intents: ["form512_1", "form512_2", "form512_3"], title: "IPTV MISSING SET-TOP-BOX FUNCTIONS", useAccountType: true },
        group13: { intents: ["form300_1", "form300_2", "form300_3"], title: "REQUEST MODEM/ONU GUI ACCESS", useAccountType: true },
        group14: { intents: ["form300_4", "form300_5"], title: "REQUEST CHANGE MODEM ONU CONNECTION MODE", useAccountType: true },
        group15: { intents: ["form300_6"], title: "REQUEST DATA BIND PORT", useAccountType: true },
        group16: { intents: ["form300_7"], title: "REQUEST FOR PUBLIC IP", useAccountType: true },
        group17: { intents: ["formStrmApps_1"], title: "EUFY", useGamma: false },
        group18: { intents: ["formStrmApps_2"], title: "STREAM TV", useGamma: false },
        group19: { intents: ["formStrmApps_3"], title: "NETFLIX", useGamma: false },
        group20: { intents: ["formStrmApps_4"], title: "VIU", useGamma: false },
        group21: { intents: ["formStrmApps_5"], title: "HBO MAX", useGamma: false },
    };

    for (const group of Object.values(intentGroups)) {
        if (group.intents.includes(vars.selectedIntent)) {
            const prefix = group.useAccountType
                ? (vars.accountType === "RADIUS" ? "GAMMA " : "")
                : (group.useGamma === false ? "" : (vars.facility === "Fiber - Radius" ? "GAMMA " : ""));

            const title = typeof group.title === "function" ? group.title() : group.title;
            caseTitle = `${prefix}${vars.channel} - ${title}`;
            break;
        }
    }

    return caseTitle;

}

function cepCaseDescription() {
    const vars = initializeVariables(); 

    const validIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form501_1", "form501_2", "form501_3", "form501_4",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5",
        "form300_1", "form300_2", "form300_3",
        "form300_4", "form300_5", "form300_6", "form300_7"
    ];

    let caseDescription = "";

    if (validIntents.includes(vars.selectedIntent)) {
        const selectedValue = vars.selectedIntent;
        const selectedOption = document.querySelector(`#selectIntent option[value="${selectedValue}"]`);
        const visibleFields = [];

        if (selectedOption) visibleFields.push(selectedOption.textContent);

        const investigation3Index = document.querySelector('[name="investigation3"]');
        if (
            (vars.facility !== "Fiber - Radius" && vars.accountType !== "RADIUS") &&
            isFieldVisible("investigation3") &&
            investigation3Index &&
            investigation3Index.selectedIndex > 0 &&
            vars.investigation3 &&
            !vars.investigation3.startsWith("Not Applicable")
        ) {
            visibleFields.push(investigation3Index.options[investigation3Index.selectedIndex].textContent);
        }

        if (isFieldVisible("Option82") && vars.Option82) {
            visibleFields.push(vars.Option82);
        }

        caseDescription = visibleFields.join(" | ");
    }

    return caseDescription;
}

function cepCaseNotes() {
    const vars = initializeVariables();

    const validIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form501_1", "form501_2", "form501_3", "form501_4",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ];

    if (!validIntents.includes(vars.selectedIntent)) {
        return "";
    }

    function constructCaseNotes() {
        const fields = [
            { name: "investigation1", label: "Investigation 1" },
            { name: "investigation2", label: "Investigation 2" },
            { name: "investigation3", label: "Investigation 3" },
            { name: "investigation4", label: "Investigation 4" },
            { name: "onuSerialNum" },
            { name: "Option82" },
            { name: "onuConnectionType" },

            //NMS Skin
            { name: "onuRunStats", label: "NMS SKIN ONU STATUS" },
            { name: "rxPower", label: "RX POWER" },
            { name: "vlan", label: "VLAN" },
            { name: "ipAddress", label: "IP ADDRESS" },
            { name: "connectedDevices", label: "CONNECTED DEVICES" },
            { name: "fsx1Status", label: "FXS1" },
            { name: "wanName_3", label: "WAN NAME_3" },
            { name: "srvcType_3", label: "SRVCTYPE_3" },
            { name: "connType_3", label: "CONNTYPE_3" },
            { name: "vlan_3", label: "WANVLAN_3" },
            { name: "saaaBandwidthCode" },
            { name: "routingIndex", label: "ROUTING INDEX" },
            { name: "callSource", label: "CALL SOURCE" },

            // Clearview
            { name: "cvReading", label: "CV" },
            
            // DMS
            { name: "dmsStatus", label: "DMS" },
            { name: "deviceWifiBand"},
            { name: "bandsteering", label: "BANDSTEERING" },
            { name: "dmsVoipServiceStatus", label: "DMS VOICE STATUS" },
            { name: "dmsLanPortStatus", label: "DMS LAN PORT STATUS" },
            { name: "dmsWifiState", label: "DMS WIFI STATUS" },
            { name: "dmsLan4Status", label: "DMS LAN STATUS - LAN 4" },

            // Probing
            { name: "sfCaseNum", label: "SF" },
            { name: "custAuth", label: "CUST AUTH" },
            { name: "lanPortNum", label: "LAN PORT NUMBER" },
            { name: "serviceStatus", label: "VOICE SERVICE STATUS" },
            { name: "services", label: "SERVICE(S)" },
            { name: "outageStatus", label: "OUTAGE" },
            { name: "outageReference", label: "SOURCE REFERENCE" },
            { name: "connectionMethod", label: "CONNECTED VIA" },
            { name: "onuModel" },
            { name: "deviceBrandAndModel", label: "DEVICE BRAND & MODEL" },
            { name: "pingTestResult", label: "PING" },
            { name: "speedTestResult", label: "SPEEDTEST RESULT" },
            { name: "meshtype" },
            { name: "meshOwnership", label: "MESH" },
            { name: "websiteURL", label: "URL" },
            { name: "remarks", label: "ACTIONS TAKEN" },
            { name: "pcNumber", label: "PARENT CASE NUMBER" },
            { name: "cepCaseNumber" },
            { name: "sla" },
            { name: "stbSerialNumber", label: "STB SERIAL #" },
            { name: "smartCardID", label: "SMARTCARD ID" },
            { name: "accountNum", label: "PLDT ACCOUNT #" },
            { name: "cignalPlan", label: "CIGNAL TV PLAN" },
            { name: "actualExp", label: "ACTUAL EXPERIENCE"},
            { name: "WOCAS", label: "WOCAS"}
        ];

        const seenFields = new Set();
        let output = "";
        let retrackingOutput = "";
        let actionsTakenParts = [];

        const req4retrackingValue = document.querySelector('[name="req4retracking"]')?.value || "";
        const retrackingFields = ["stbSerialNumber", "smartCardID", "accountNum", "cignalPlan", "actualExp"];

        fields.forEach(field => {
            if (
                req4retrackingValue !== "Yes" &&
                retrackingFields.includes(field.name) &&
                !(vars.selectedIntent === "form510_7" && (field.name === "stbSerialNumber" || field.name === "smartCardID"))
            ) {
                return;
            }

            const inputElement = document.querySelector(`[name="${field.name}"]`);
            let value = getFieldValueIfVisible(field.name);

            if (inputElement && inputElement.tagName === "SELECT" && inputElement.selectedIndex === 0) {
                return;
            }

            if (value && !seenFields.has(field.name)) {
                seenFields.add(field.name);

                if (field.name === "pingTestResult") value += "MS";
                if (field.name === "speedTestResult") value += " MBPS";

                if (field.name.startsWith("investigation")) {
                    output += `${field.label}: ${value}\n`;
                } else if (field.name === "outageStatus" && value === "Yes") {
                    actionsTakenParts.push("Part of network outage");
                } else {
                    actionsTakenParts.push((field.label ? `${field.label}: ` : "") + value);
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
        if (issueResolvedValue === "Yes") actionsTakenParts.push("Resolved");
        else if (issueResolvedValue === "No - Customer is Unresponsive") actionsTakenParts.push("Customer is Unresponsive");
        else if (issueResolvedValue === "No - Customer is Not At Home") actionsTakenParts.push("Customer is Not At Home");
        else if (issueResolvedValue === "No - Customer Declined Further Assistance") actionsTakenParts.push("Customer Declined Further Assistance");
        else if (issueResolvedValue === "No - System Ended Chat") actionsTakenParts.push("System Ended Chat");

        const facilityValue = document.querySelector('[name="facility"]')?.value || "";
        if (facilityValue === "Copper VDSL") actionsTakenParts.push("Copper");

        const actionsTaken = actionsTakenParts.join(" | ");

        return [output.trim(), retrackingOutput.trim(), actionsTaken.trim()]
            .filter(section => section)
            .join("\n\n");
    }

    return constructCaseNotes();

}

function specialInstButtonHandler() {
    const vars = initializeVariables();

    const validIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form501_1", "form501_2", "form501_3", "form501_4",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ];

    const allFields = [
        { name: "specialInstruct" },
        { name: "contactName", label: "Contact Person" },
        { name: "cbr", label: "CBR" },
        { name: "availability", label: "Availability" },
        { name: "address", label: "Address" },
        { name: "landmarks", label: "Landmarks" },
        { name: "rptCount", label: "Repeats w/in 30 Days" }
    ];

    const specialInstructVisible = isFieldVisible("specialInstruct");

    const fieldsToInclude = specialInstructVisible
        ? allFields.filter(f => f.name !== "rptCount")
        : allFields.filter(f => ["contactName", "cbr", "availability", "address", "landmarks"].includes(f.name));

    const parts = fieldsToInclude.map(field => {
        if (!isFieldVisible(field.name)) return "";
        const value = getFieldValueIfVisible(field.name);
        if (!value) return "";
        const formattedValue = value.replace(/\n/g, " | ");
        return field.label
            ? `${field.label}: ${formattedValue}`
            : `${formattedValue}`;
    }).filter(Boolean);

    let specialInstCopiedText = specialInstructVisible
        ? `${parts.join("")}`
        : `${parts.join(" | ")}`;

    if (isFieldVisible("rptCount")) {
        const repeaterValue = getFieldValueIfVisible("rptCount");
        if (repeaterValue) {
            specialInstCopiedText += ` | REPEATER: ${repeaterValue}`;
        }
    }

    const issueResolved = getFieldValueIfVisible("issueResolved");
    if (isFieldVisible("issueResolved") && issueResolved !== "No - for Ticket Creation") {
        const repeaterValue = getFieldValueIfVisible("rptCount");
        if (repeaterValue) {
            specialInstCopiedText = `REPEATER: ${repeaterValue}`;
        } else {
            specialInstCopiedText = "";
        }
    }

    specialInstCopiedText = specialInstCopiedText.toUpperCase();

    return specialInstCopiedText;
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
        "stbSerialNumber": "Set-Top-Box Serial Number",
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

    const validIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form501_1", "form501_2", "form501_3", "form501_4",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7"
    ];

    if (!validIntents.includes(vars.selectedIntent)) return;

    if (optionNotAvailable()) return "";

    if (vars.selectedIntent.startsWith("form300") && vars.custAuth === "Failed") {
        alert("This option is not available. Please use the Salesforce or FUSE button.");
        return;
    }

    const { emptyFields, alertFields } = validateRequiredFields(filter);
    if (alertFields.length > 0) return;

    const dataMap = {
        Title: (cepCaseTitle() || "").toUpperCase(),
        Description: (cepCaseDescription() || "").toUpperCase(),
        "Case Notes in Timeline": (cepCaseNotes() || "").toUpperCase(),
        "Special Instructions": (specialInstButtonHandler() || "").toUpperCase()
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
        wrapper.style.marginBottom = "20px";

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


function ffupButtonHandler(showFloating = true, enableValidation = true) {
    const vars = initializeVariables();

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
        console.log("Copied to clipboard:", text);
        }).catch(err => {
        console.error("Failed to copy text: ", err);
        });
    }

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
            value = value.replace(/\n/g, " | ");
        }

        switch (field.name) {
            case "remarks":
            remarks = value;
            break;
            case "offerALS":
            offerALS = value;
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

        const finalRemarks = filteredRemarks.join(" | ");

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
        { name: "offerALS" },
        { name: "ticketStatus", label: "Case Status" },
        { name: "ffupCount", label: "No. of Follow-Up(s)" },
        { name: "queue", label: "QUEUE" },
        { name: "ticketAge", label: "Ticket Age" },
        { name: "investigation1", label: "Investigation 1" },
        { name: "investigation2", label: "Investigation 2" },
        { name: "investigation3", label: "Investigation 3" },
        { name: "investigation4", label: "Investigation 4" },
        { name: "remarks", label: "Remarks" },
        { name: "sla", label: "SLA" },
    ];

    let ffupCopiedText = constructOutputFFUP(fields).toUpperCase();
    let specialInstCopiedText = (specialInstButtonHandler() || "").toUpperCase();

    const combinedOutput = [
        ffupCopiedText,
        specialInstCopiedText
    ].filter(Boolean).join("\n\n");

    if (showFloating) {
        showFfupFloatingDiv(combinedOutput);
    }

    return combinedOutput;
}

function showFfupFloatingDiv(combinedOutput) {
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

    const sections = combinedOutput.split(/\n\n+/).filter(Boolean);
    const sectionLabels = ["Follow-Up Case Notes", "Special Instructions"];

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

function salesforceButtonHandler(showFloating = true, suppressRestrictions = false) {
    const vars = initializeVariables(); 

    let titleCopiedText = "";
    let descriptionCopiedText = "";
    let caseNotesCopiedText = "";
    let specialInstCopiedText = "";
    let ffupCopiedText = "";

    const validIntents = [
        "form100_1", "form100_2", "form100_3", "form100_4", "form100_5", "form100_6", "form100_7",
        "form101_1", "form101_2", "form101_3", "form101_4",
        "form102_1", "form102_2", "form102_3", "form102_4", "form102_5", "form102_6", "form102_7",
        "form103_1", "form103_2", "form103_3", "form103_4", "form103_5",
        "form500_1", "form500_2", "form500_3", "form500_4",
        "form501_1", "form501_2", "form501_3", "form501_4",
        "form502_1", "form502_2",
        "form510_1", "form510_2", "form510_3", "form510_4", "form510_5", "form510_6", "form510_7", "form510_8",
        "form511_1", "form511_2", "form511_3", "form511_4", "form511_5",
        "form512_1", "form512_2", "form512_3",
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5",
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7"
    ];

    // *****************************************FOLLOW UP CONCERN***************************************************
    if (vars.selectedIntent === "formFFUP") {
        const missingFields = [];
        if (!vars.channel) missingFields.push("Channel");
        if (!vars.pldtUser) missingFields.push("PLDT Username");

        if (!suppressRestrictions && missingFields.length > 0) {
            alert(`Please fill out the following fields: ${missingFields.join(", ")}`);
            return; 
        }

        ffupCopiedText = ffupButtonHandler(false, true);

    // *********************************VOICE AND DATA CONNECTION************************************************
    } else if (validIntents.includes(vars.selectedIntent)) {
        const fieldLabels = {
            "WOCAS": "WOCAS",
            "remarks": "Actions Taken",
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

        if (emptyFields.length > 0) {
            alert(`Please complete the following field(s): ${emptyFields.join(", ")}`);
            return;
        }

        titleCopiedText = (cepCaseTitle() || "").toUpperCase();
        descriptionCopiedText = (cepCaseDescription() || "").toUpperCase();
        caseNotesCopiedText = (cepCaseNotes() || "").toUpperCase();
        specialInstCopiedText = (specialInstButtonHandler() || "").toUpperCase();
    }

    const textToCopy = [
        titleCopiedText,
        descriptionCopiedText,
        caseNotesCopiedText,
        ffupCopiedText,
        specialInstCopiedText
    ].filter(Boolean)
    .join("\n\n");

    if (showFloating) {
        showSalesforceFloatingDiv(textToCopy);
    }

    return textToCopy;

}

function showSalesforceFloatingDiv(textToCopy) {
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

    const section = document.createElement("div");
    section.style.marginTop = "5px";
    section.style.padding = "10px";
    section.style.border = "1px solid #ccc";
    section.style.borderRadius = "4px";
    section.style.cursor = "pointer";
    section.style.whiteSpace = "pre-wrap";
    section.style.transition = "background-color 0.2s, transform 0.1s ease";

    section.textContent = textToCopy;

    section.addEventListener("mouseover", () => {
        section.style.backgroundColor = "#edf2f7";
    });
    section.addEventListener("mouseout", () => {
        section.style.backgroundColor = "";
    });

    section.onclick = () => {
        section.style.transform = "scale(0.99)";
        navigator.clipboard.writeText(textToCopy).then(() => {
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

function getFuseFieldValueIfVisible(fieldName) {
    const vars = initializeVariables();
    
    if (!isFieldVisible(fieldName)) return "";

    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return "";

    let value = field.value.trim();

    if (field.tagName.toLowerCase() === "textarea") {
        if (
            vars.selectedIntent === "formFFUP" &&
            vars.ticketStatus === "Beyond SLA" &&
            (vars.offerALS !== "Offered ALS/Accepted" && vars.offerALS !== "Offered ALS/Declined")
        ) {
            value = value.replace(/\n/g, " | ");
        } else {
            value = value.replace(/\n/g, "/ ");
        }
    }

    return value;
}

function fuseButtonHandler(showFloating = true) {
    const vars = initializeVariables();

    let concernCopiedText = "";
    let actionsTakenCopiedText = "";
    let specialInstCopiedText = "";
    let ffupCopiedText = "";

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
            "upsell": "Upsell"
        };

        const requiredFields = Object.keys(fieldLabels);
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
            { name: "flmFindings" },
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

    const sfCaseNum = (isFieldVisible("sfCaseNum") && vars.sfCaseNum) 
    ? `SF#: ${vars.sfCaseNum}/ ` 
    : "";

    const accountNum = (isFieldVisible("accountNum") && vars.accountNum) 
    ? `ACC#: ${vars.accountNum}/ ` 
    : "";

    const soSrNum = (isFieldVisible("srNum") && vars.srNum) 
    ? `${vars.srNum}/ ` 
    : "";

    // ***************************************** FOLLOW UP CONCERN *************************************************
    if (vars.selectedIntent === "formFFUP") {
        if (
            vars.ticketStatus === "Within SLA" ||
            (vars.offerALS !== "Offered ALS/Accepted" && vars.offerALS !== "Offered ALS/Declined")
        ) {
            ffupCopiedText = ffupButtonHandler(false, true);
        } else {
            concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}FOLLOW-UP ${vars.ticketStatus}`;
            actionsTakenCopiedText = constructFuseOutput();
        }

    // ***************************************** Request: Non-Service Rebate ***************************************
    } else if (vars.selectedIntent === "formReqNonServiceRebate") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}NON-SERVICE REBATE/ ${vars.custConcern}/ ${soSrNum}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Request: Reconnection *********************************************
    } else if (vars.selectedIntent === "formReqReconnection") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}RECONNECTION/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Complaint: Web and MyHome Access **********************************
    } else if (vars.selectedIntent === "formMyHomeWeb") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.selectedIntentText}/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Complaint: Misapplied Payment **********************************
    } else if (vars.selectedIntent === "formMisappliedPayment") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.selectedIntentText} - ${vars.findings}/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Complaint: Unreflected Payment **********************************
    } else if (vars.selectedIntent === "formUnreflectedPayment") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.selectedIntentText}/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Complaint: Personnel Concerns **********************************
    } else if (vars.selectedIntent === "formPersonnelIssue") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.personnelType} COMPLAINT/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Account/Service Status **********************************
    } else if (vars.selectedIntent === "formInqAccSrvcStatus") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.custConcern} INQUIRY`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Bill Interpretation (Prorate / Breakdown) *****************
    } else if (vars.selectedIntent === "formInqBillInterpret") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.selectedIntentText} FOR ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Approved rebate / Credit Adjustment ***********************
    } else if (vars.selectedIntent === "formInqRebCredAdj") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.custConcern} INQUIRY`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Contract / Lock In ****************************************
    } else if (vars.selectedIntent === "formInqLockIn") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}CONTRACT OR LOCK IN PERIOD INQUIRY/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Copy of Bill **********************************************
    } else if (vars.selectedIntent === "formInqCopyOfBill") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}COPY OF BILL INQUIRY/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: My Home Account *******************************************
    } else if (vars.selectedIntent === "formInqMyHomeAcc") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}MYHOME ACCOUNT LOGIN INQUIRY/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Plan Details **********************************************
    } else if (vars.selectedIntent === "formInqPlanDetails") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Auto Debit Arrangement (ADA) *****************************
    } else if (vars.selectedIntent === "formInqAda") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}AUTO DEBIT ARRANGEMENT INQUIRY/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Inquiry: Balance Transfer *****************************************
    } else if (vars.selectedIntent === "formInqBalTransfer") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}BALANCE TRANSFER INQUIRY/ ${vars.custConcern}`;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Follow-Up: Change of Ownership ************************************
    } else if (vars.selectedIntent === "formFfupChangeOwnership") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP ${vars.selectedIntentText}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Follow-Up: Change Telephone number *****************
    } else if (vars.selectedIntent === "formFfupChangeTelNum") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP ${vars.selectedIntentText}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Follow-Up: Change Telephone unit *****************
    } else if (vars.selectedIntent === "formFfupChangeTelUnit") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP ${vars.selectedIntentText}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Follow-Up: Disconnection (VAS) *****************
    } else if (vars.selectedIntent === "formFfupDiscoVas") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP ${vars.selectedIntentText}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Follow-Up:  *****************
    } else if (vars.selectedIntent === "formFfupDispute") {
        const emptyFields = validateRequiredFields();
        if (emptyFields.length > 0) return;

        if (vars.disputeType === "Rebate Non Service"){
            if (vars.approver === "Agent") {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP ${vars.disputeType} WITH APPROVED AJUSTMENT BY ${vars.approver}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            } else {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP ${vars.disputeType} FOR ${vars.approver} APPROVAL/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            }
        } else if (vars.disputeType === "Rentals") {
            if (vars.approver === "Account Admin") {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP REBATE FOR ${vars.disputeType} WITH OPEN DISPUTE FOR APPROVAL BY ${vars.approver}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            } else if (vars.approver === "Agent") {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP REBATE FOR ${vars.disputeType} WITH APPROVED AJUSTMENT BY ${vars.approver}/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            } else {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP REBATE FOR ${vars.disputeType} WITH OPEN DISPUTE UNDER APPROVAL/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            }
        } else if (vars.disputeType === "Usage") {
            if (vars.approver === "Account Admin") {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP DISPUTE FOR TOLL ${vars.disputeType}S/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            } else {
                concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP DISPUTE FOR ${vars.disputeType}S UNDER APPROVAL/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
            }
        } else {
            concernCopiedText = `C: ${vars.channel}/ ${sfCaseNum}${accountNum}FOLLOW-UP DISPUTE FOR ${vars.disputeType}S/ ${vars.custConcern}/ ${soSrNum}${vars.ffupStatus} `;
        }
            
        actionsTakenCopiedText = constructFuseOutput();

    // ***************************************** Follow-Up:  *****************
    }

    concernCopiedText = concernCopiedText.toUpperCase();
    actionsTakenCopiedText = actionsTakenCopiedText.toUpperCase();
    ffupCopiedText = ffupCopiedText.toUpperCase();
    specialInstCopiedText = specialInstCopiedText.toUpperCase();

    const textToCopyGroups = [
        [concernCopiedText, actionsTakenCopiedText].filter(Boolean).join("\n"),
        [ffupCopiedText, specialInstCopiedText].filter(Boolean).join("\n\n")
    ].filter(Boolean);

    if (showFloating) {
        showFuseFloatingDiv(concernCopiedText, actionsTakenCopiedText, ffupCopiedText, specialInstCopiedText);
    }

    return textToCopyGroups;
}

function showFuseFloatingDiv(concernCopiedText, actionsTakenCopiedText, ffupCopiedText, specialInstCopiedText) {
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

    const combinedSections = [
        [concernCopiedText, actionsTakenCopiedText].filter(Boolean).join("\n"),
        [ffupCopiedText, specialInstCopiedText].filter(Boolean).join("\n\n")
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
        "form300_1", "form300_2", "form300_3", "form300_4", "form300_5", "form300_6", "form300_7"
    ];

    const streamAppsForms = [
        "formStrmApps_1", "formStrmApps_2", "formStrmApps_3", "formStrmApps_4", "formStrmApps_5"
    ]

    let bauRows = [];
    let netOutageRows = [];
    let crisisRows = [];

    if (vars.selectedIntent === 'formFFUP') {
        bauRows = [
            ['VOC:', `Follow up - ${vars.ticketStatus}`],
            ['Case Type:', `Tech Repair - ${vars.techRepairType}`],
            ['Case Sub-Type:', 'Zone']
        ];

        netOutageRows = [
            ['VOC:', `Follow up - ${vars.ticketStatus}`],
            ['Case Type:', `Tech Repair - ${vars.techRepairType}`],
            ['Case Sub-Type:', 'Network / Outage']
        ];

    } else if (voiceAndDataForms.includes(vars.selectedIntent)) {
        const caseSubType =
            (vars.flmFindings === 'Network / Outage' || vars.flmFindings === 'Zone')
            ? `No Dial Tone and No Internet Connection - ${vars.flmFindings}`
            : `NDT NIC - ${vars.flmFindings}`;

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Voice and Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (voiceForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (['form101_1', 'form101_2', 'form101_3', 'form101_4'].includes(vars.selectedIntent)) {
            if (vars.flmFindings === 'Zone' || vars.flmFindings === 'Network / Outage') {
            caseSubType = `No Dial Tone - ${vars.flmFindings}`;
            } else {
            caseSubType = `Dial Tone Problem - ${vars.flmFindings}`;
            }
        } else if (['form102_1', 'form102_2', 'form102_3', 'form102_4', 'form102_5', 'form102_6', 'form102_7'].includes(vars.selectedIntent)) {
            caseSubType = `Poor Call Quality - ${vars.flmFindings}`;
        } else if (['form103_1', 'form103_2', 'form103_3', 'form103_4', 'form103_5'].includes(vars.selectedIntent)) {
            caseSubType = `Cannot Make / Receive Calls - ${vars.flmFindings}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Voice'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (nicForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (vars.flmFindings === 'Defective Mesh' || vars.flmFindings === 'Mesh Configuration') {
        caseSubType = `NIC - ${vars.flmFindings} (#VAS type - indicate in remarks)`;
        } else if (vars.flmFindings === 'Network / Outage' || vars.flmFindings === 'Zone') {
        caseSubType = `No Internet Connection - ${vars.flmFindings}`;
        } else {
        caseSubType = `NIC - ${vars.flmFindings}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (sicForms.includes(vars.selectedIntent)) {
        const caseSubType =
            (vars.flmFindings === 'Network / Outage' || vars.flmFindings === 'Zone')
            ? `Slow Internet Connection - ${vars.flmFindings}`
            : `SIC - ${vars.flmFindings}`;

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (selectiveBrowseForms.includes(vars.selectedIntent)) {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - Data'],
            ['Case Sub-Type:', `Selective Browsing - ${vars.flmFindings}`]
        ];
    } else if (iptvForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (['form510_1', 'form510_2', 'form510_3', 'form510_4', 'form510_5', 'form510_6', 'form510_7', 'form510_8'].includes(vars.selectedIntent)) {
            caseSubType = `No A/V Output - ${vars.flmFindings}`;
        } else if (['form511_1', 'form511_2', 'form511_3', 'form511_4', 'form511_5'].includes(vars.selectedIntent)) {
            caseSubType = `Poor A/V Quality - ${vars.flmFindings}`;
        } else if (['form512_1', 'form512_2', 'form512_3'].includes(vars.selectedIntent)) {
            caseSubType = `STB Functions - ${vars.flmFindings}`;
        }

        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Report Trouble - IPTV'],
            ['Case Sub-Type:', caseSubType]
        ];
    } else if (mrtForms.includes(vars.selectedIntent)) {
        let caseSubType = '';

        if (['form300_1'].includes(vars.selectedIntent)) {
            caseSubType = `Change Wifi UN/PW - ${vars.flmFindings}`;
        } else if (['form300_2'].includes(vars.selectedIntent)) {
            if (vars.flmFindings === "Defective Modem") {
                caseSubType = `GUI Access - ${vars.flmFindings}`;   
            } else {
                caseSubType = `GUI Reset (Local User) - ${vars.flmFindings}`;
            } 
        } else if (['form300_3'].includes(vars.selectedIntent)) {
            caseSubType = `GUI Access (Super Admin) - ${vars.flmFindings}`;
        } else if (['form300_4', 'form300_5', 'form300_7'].includes(vars.selectedIntent)) {
            if (vars.flmFindings === "NMS Configuration") {
                caseSubType = `Mode Set-Up - ${vars.flmFindings} (Route to Bridge or Bridge to Route - indicate in remarks)`;  
            } else {
                caseSubType = `Mode Set-Up - ${vars.flmFindings}`;
            }
        } else if (['form300_6'].includes(vars.selectedIntent)) {
            caseSubType = `LAN Port Activation - ${vars.flmFindings}`;
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
    } else if (vars.selectedIntent === 'formInqVtd' || vars.selectedIntent === 'formActivateFeat') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Aftersales Inquiry'],
            ['Case Sub-Type:', 'Other Aftersales']
        ];
    } else if (vars.selectedIntent === 'formReqNonServiceRebate') {
        bauRows = [
            ['VOC:', 'Request'],
            ['Case Type:', 'Dispute'],
            ['Case Sub-Type:', 'Rebate (Non-Service)']
        ];
    } else if (vars.selectedIntent === 'formFfupRecon') {
        bauRows = [
            ['VOC:', 'Follow-up'],
            ['Case Type:', 'Follow-up Aftersales'],
            ['Case Sub-Type:', 'Reconnection']
        ];
    } else if (vars.selectedIntent === 'formMyHomeWeb') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'PLDT Web'],
            ['Case Sub-Type:', 'PLDT Web Inaccessibility']
        ];
    } else if (vars.selectedIntent === 'formMisappliedPayment') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formUnreflectedPayment') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText} - ${vars.paymentChannel}`]
        ];
    } else if (vars.selectedIntent === 'formPersonnelIssue') {
        bauRows = [
            ['VOC:', 'Complaint'],
            ['Case Type:', 'Personnel'],
            ['Case Sub-Type:', `${vars.personnelType}`]
        ];
    } else if (vars.selectedIntent === 'formInqAccSrvcStatus') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqBillInterpret') {
        let subType = '';

        const custConcernSelect = document.querySelector('[name="custConcern"]');
        const selectedIndex = custConcernSelect ? custConcernSelect.selectedIndex : -1;

        if (selectedIndex >= 4 && selectedIndex <= 6) {
            subType = `${vars.selectedIntentText} (Prorate / Breakdown) - Upgrade/Downgrade/Migration`;
        } else {
            subType = `${vars.selectedIntentText} (Prorate / Breakdown) - ${vars.custConcern}`;
        }

        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', subType]
        ];
    } else if (vars.selectedIntent === 'formInqRebCredAdj') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqLockIn') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqCopyOfBill') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqMyHomeAcc') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Account'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formInqPlanDetails') {
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
    } else if (vars.selectedIntent === 'formInqBalTransfer') {
        bauRows = [
            ['VOC:', 'Inquiry'],
            ['Case Type:', 'Billing'],
            ['Case Sub-Type:', `${vars.selectedIntentText}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeOwnership') {
        bauRows = [
            ['VOC:', `Follow-up ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.requestType}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeTelNum') {
        bauRows = [
            ['VOC:', `Follow-up ${vars.ffupStatus}`],
            ['Case Type:', 'Change of Telephone Number'],
            ['Case Sub-Type:', `Change TelNum - ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupChangeTelUnit') {
        bauRows = [
            ['VOC:', `Follow-up ${vars.ffupStatus}`],
            ['Case Type:', 'Change Telephone Unit'],
            ['Case Sub-Type:', 'Change Tel Unit - Opsim']
        ];
    } else if (vars.selectedIntent === 'formFfupDiscoVas') {
        bauRows = [
            ['VOC:', `Follow-up ${vars.ffupStatus}`],
            ['Case Type:', 'Disconnection (VAS)'],
            ['Case Sub-Type:', `Disconnect -  ${vars.findings}`]
        ];
    } else if (vars.selectedIntent === 'formFfupDispute') {
        bauRows = [
            ['VOC:', `Follow-up ${vars.ffupStatus}`],
            ['Case Type:', `${vars.selectedIntentText}`],
            ['Case Sub-Type:', `${vars.disputeType} - ${vars.approver}`]
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
        { label: "Contact Details, Complete Address, & Landmarks", type: "textarea", name: "specialInstruct2" },
        { label: "Contact Person", type: "text", name: "contactName2" },
        { label: "Mobile #/CBR", type: "number", name: "cbr2" },
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
        { label: "Additional Remarks", type: "textarea", name: "remarks2" },
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
        { source: "specialInstruct", target: "specialInstruct2" },
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

            if (source === "specialInstruct") {
                value = value.trim().replace(/\n/g, " | ");
            }

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
            if (vars.selectedIntent === "formFFUP") {
                if (vars.channel === "CDT-SOCMED") {
                    showFields(["WOCAS2", "sfCaseNum2", "accOwnerName", "accountNum2", "landlineNum2", "specialInstruct2", "cepCaseNumber2", "queue2", "ticketStatus2", "agentName2", "teamLead2", "date", "remarks2"]);
                    hideSpecificFields(["contactName2", "cbr2", "availability", "address2", "landmarks2", "refNumber2", "paymentChannel2", "amountPaid2"]);
                } else if (vars.channel === "CDT-HOTLINE") {
                    showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "cepCaseNumber2", "queue2", "ticketStatus2", "agentName2", "teamLead2", "date", "remarks2"]);
                    hideSpecificFields(["sfCaseNum2", "specialInstruct2", "refNumber2", "paymentChannel2", "amountPaid2"]);
                }
            } else {
                if (vars.channel === "CDT-SOCMED") {
                    showFields(["WOCAS2", "sfCaseNum2", "accOwnerName", "accountNum2", "landlineNum2", "specialInstruct2", "cepCaseNumber2", "agentName2", "teamLead2", "date", "remarks2"]);
                    hideSpecificFields(["queue2", "ticketStatus2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "refNumber2", "paymentChannel2", "amountPaid2"]);
                } else if (vars.channel === "CDT-HOTLINE") {
                    showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "cepCaseNumber2", "agentName2", "teamLead2", "date", "remarks2"]);
                    hideSpecificFields(["sfCaseNum2", "queue2", "ticketStatus2", "specialInstruct2", "refNumber2", "paymentChannel2", "amountPaid2"]);
                }
            }
        } else if (endorsementType.value === "Sup Call") {
            if (vars.selectedIntent === "formFFUP") {
                if (vars.channel === "CDT-SOCMED") {
                    showFields(["WOCAS2", "sfCaseNum2", "accOwnerName", "accountNum2", "landlineNum2", "specialInstruct2", "cepCaseNumber2", "queue2", "ticketStatus2", "remarks2"]);
                    hideSpecificFields(["agentName2", "teamLead2", "date", "contactName2", "cbr2", "availability", "address2", "landmarks2", "refNumber2", "paymentChannel2", "amountPaid2"]);
                } else if (vars.channel === "CDT-HOTLINE") {
                    showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "cepCaseNumber2", "queue2", "ticketStatus2", "remarks2"]);
                    hideSpecificFields(["sfCaseNum2", "specialInstruct2", "agentName2", "teamLead2", "date", "refNumber2", "paymentChannel2", "amountPaid2"]);
                }
            } else {
                if (vars.channel === "CDT-SOCMED") {
                    showFields(["WOCAS2", "sfCaseNum2", "accOwnerName", "accountNum2", "landlineNum2", "specialInstruct2", "cepCaseNumber2", "remarks2"]);
                    hideSpecificFields(["queue2", "ticketStatus2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "agentName2", "teamLead2", "date", "refNumber2", "paymentChannel2", "amountPaid2"]);
                } else if (vars.channel === "CDT-HOTLINE") {
                    showFields(["WOCAS2", "accOwnerName", "accountNum2", "landlineNum2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "cepCaseNumber2", "remarks2"]);
                    hideSpecificFields(["sfCaseNum2", "specialInstruct2", "queue2", "ticketStatus2", "agentName2", "teamLead2", "date", "refNumber2", "paymentChannel2", "amountPaid2"]);
                }
            }
        } else if (endorsementType.value === "Unbar Request") {
            if (vars.channel === "CDT-SOCMED" || vars.channel === "CDT-HOTLINE") {
                showFields(["WOCAS2", "accountNum2", "refNumber2", "paymentChannel2", "amountPaid2", "date", "remarks2"]);
                hideSpecificFields(["sfCaseNum2", "accOwnerName", "landlineNum2", "specialInstruct2", "contactName2", "cbr2", "availability", "address2", "landmarks2", "cepCaseNumber2", "queue2", "ticketStatus2", "agentName2", "teamLead2"]);
            }
        }
    });
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

        const header = document.getElementById("headerValue");
        header.innerHTML = '<span class="version-circle">V5</span>Standard Notes Generator';

        typeWriter("Standard Notes Generator", header, 50);

        const notepad = document.getElementById("notepad");
        notepad.rows = 10;
        notepad.style.height = "";

        setTimeout(function() {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }, 100);  
    }
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

document.addEventListener('DOMContentLoaded', function() { 
    let timerInterval;
    let startTime;
    let elapsedTime = 0;
    let isRunning = false;

    document.getElementById('timerDisplay').textContent = formatTime(0);

    function formatTime(seconds) {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    function updateDisplay() {
        const now = Date.now();
        const totalElapsedSeconds = Math.floor((now - startTime + elapsedTime) / 1000);
        document.getElementById('timerDisplay').textContent = formatTime(totalElapsedSeconds);
    }

    function handleTimer(action) {
        if (action === 'start' && !isRunning) {
            startTime = Date.now();
            timerInterval = setInterval(updateDisplay, 1000);
            isRunning = true;
            document.getElementById('timerToggleButton').textContent = 'Pause';
        } else if (action === 'pause' && isRunning) {
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
            isRunning = false;
            document.getElementById('timerToggleButton').textContent = 'Resume';
        } else if (action === 'reset') {
            const confirmReset = confirm("Are you sure you want to reset the timer?");
            if (confirmReset) {
                clearInterval(timerInterval);
                elapsedTime = 0;
                document.getElementById('timerDisplay').textContent = formatTime(0);
                isRunning = false;
                document.getElementById('timerToggleButton').textContent = 'Start';
            }
        }
    }

    document.getElementById('timerToggleButton').addEventListener('click', function() {
        if (isRunning) {
            handleTimer('pause');
        } else {
            handleTimer('start');
        }
    });

    document.getElementById('timerResetButton').addEventListener('click', function() {
        handleTimer('reset');
    });

    const channelSelect = document.getElementById("channel");
    const sfCaseNumRow = document.getElementById("case-num-row");

    channelSelect.addEventListener("change", function () {
        const channelSelectedValue = channelSelect.value;
        const shouldShow = channelSelectedValue === "CDT-SOCMED";

        sfCaseNumRow.style.display = shouldShow ? "" : "none";
    });

    initializeFormElements();
    registerEventHandlers();

});

// let selectedBgColor = "#ffffff"; 

// const bgColorPicker = document.getElementById('bgColorPicker');
// const floating2Div = document.getElementById('form3Container');

// function getBrightness(hex) {
//     hex = hex.replace('#', '');
//     const r = parseInt(hex.substr(0, 2), 16);
//     const g = parseInt(hex.substr(2, 2), 16);
//     const b = parseInt(hex.substr(4, 2), 16);
//     return (0.299 * r + 0.587 * g + 0.114 * b);
// }

// bgColorPicker.addEventListener('input', function () {
//     const bgColor = this.value;
//     selectedBgColor = bgColor;

//     document.body.style.backgroundColor = bgColor;

//     const brightness = getBrightness(bgColor);
//     const textColor = brightness < 128 ? '#ffffff' : '#000000';

//     document.body.style.color = textColor;

//     if (floating2Div) {
//         floating2Div.style.backgroundColor = bgColor;
//         floating2Div.style.color = textColor;
//     }
// });

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

    const vars = initializeVariables();
    const ffupNotes = ffupButtonHandler(false, false);
    const rawFuseNotes = fuseButtonHandler(false);
    const fuseNotes = Array.isArray(rawFuseNotes) ? rawFuseNotes.join("\n") : (rawFuseNotes || "");
    const sfNotes = salesforceButtonHandler(false, true);
    const nonTechIntents = [
        "formReqNonServiceRebate",
        "formReqReconnection",
        "formMyHomeWeb",
        "formMisappliedPayment",
        "formUnreflectedPayment",
        "formPersonnelIssue",
        "formInqAccSrvcStatus",
        "formInqLockIn",
        "formInqCopyOfBill",
        "formInqMyHomeAcc",
        "formInqPlanDetails",
        "formInqAda",
        "formInqRebCredAdj",
        "formInqBalTransfer",
        "formInqBillInterpret",
        "formFfupChangeOwnership",
        "formFfupChangeTelNum",
        "formFfupChangeTelUnit",
        "formFfupDiscoVas",
        "formFfupDispute",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];

    let combinedNotes = "";

    if (nonTechIntents.includes(vars.selectedIntent)) {
        combinedNotes = fuseNotes || "";
    } else if (
        vars.selectedIntent === "formFFUP" &&
            (
                vars.ticketStatus === "Within SLA" ||
                (
                    vars.ticketStatus === "Beyond SLA" &&
                    vars.offerALS !== "Offered ALS/Accepted" &&
                    vars.offerALS !== "Offered ALS/Declined"
                )
            )
        ) {
            combinedNotes = ffupNotes || "";
    } else if (
        vars.selectedIntent === "formFFUP" &&
        vars.ticketStatus === "Beyond SLA" &&
            (vars.offerALS === "Offered ALS/Accepted" || vars.offerALS === "Offered ALS/Declined")
        ) {
            combinedNotes = `${fuseNotes || ""}\n\n${ffupNotes || ""}`.trim();
    } else {
        combinedNotes = sfNotes || "";
    }

    combinedNotes = combinedNotes.trim();

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
        notepadContent += "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=\n\n";
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

document.getElementById("saveButton").addEventListener("click", saveFormData);
document.getElementById("resetButton").addEventListener("click", resetButtonHandler);
document.getElementById("exportButton").addEventListener("click", exportFormData);
document.getElementById("deleteButton").addEventListener("click", deleteAllData);