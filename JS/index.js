
// Initialize Lucide icons
lucide.createIcons();

// 1. Declare these at the very top of your <script> tag
const API_URL = 'http://localhost:3000/api';
let isEditMode = false;
let editId = null;
let debounceTimer;
document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();

    initServiceSearch();

    // 2. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    editId = urlParams.get('id');
    const mode = urlParams.get('mode'); // Matches 'index.html?mode=edit&id=...'

    if (editId && mode === 'edit') {
        isEditMode = true;

        // Update UI Title
        const titleElem = document.getElementById("formTitle");
        if (titleElem) titleElem.innerText = "កែប្រែទិន្នន័យ (Edit Registration)";

        // 3. Load the data
        await loadRecordForEditing(editId);
    }
});

function initServiceSearch() {
    const serviceInput = document.getElementById('serviceSearch');
    const resultsList = document.getElementById('resultsList');

    if (!serviceInput || !resultsList) return;

    serviceInput.addEventListener('input', () => {
        const query = serviceInput.value.trim();

        if (query.length < 1) {
            resultsList.classList.add('hidden');
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                // Call your SQLite API search endpoint
                const response = await fetch(`${API_URL}/services?q=${encodeURIComponent(query)}`);
                const services = await response.json();

                resultsList.innerHTML = '';

                if (services.length > 0) {
                    services.forEach(name => {
                        const item = document.createElement('div');
                        item.className = 'px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0';
                        item.textContent = name;
                        
                        item.onclick = () => {
                            serviceInput.value = name;
                            resultsList.classList.add('hidden');
                        };
                        resultsList.appendChild(item);
                    });
                    resultsList.classList.remove('hidden');
                } else {
                    resultsList.classList.add('hidden');
                }
            } catch (err) {
                console.error("Search error:", err);
            }
        }, 300);
    });
// Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!serviceInput.contains(e.target) && !resultsList.contains(e.target)) {
            resultsList.classList.add('hidden');
        }
    });
}
// 4. Fetch specific record from SQLite for editing
async function loadRecordForEditing(id) {
    try {
        const response = await fetch(`${API_URL}/registrations/${id}`);

        if (!response.ok) {
            throw new Error("រកមិនឃើញទិន្នន័យ (Record not found)");
        }

        const data = await response.json();

        // Fill every input field with database data
        // We use optional chaining or || "" to prevent 'undefined' showing in inputs
        setFieldValue("village", data.village);
        setFieldValue("landNumber", data.landNumber);
        setFieldValue("regNumber", data.regNumber);
        setFieldValue("date", data.date);
        setFieldValue("unitNumber", data.unitNumber);
        setFieldValue("floor", data.floor);
        setFieldValue("LMap", data.LMap);
        setFieldValue("oldMap", data.oldMap);
        setFieldValue("applicantName", data.applicantName);
        setFieldValue("sellerName", data.sellerName);
        setFieldValue("buyerName", data.buyerName);
        setFieldValue("serviceType", data.serviceType);
        setFieldValue("serviceSearch", data.serviceType);
        setFieldValue("documentHolder", data.documentHolder);
        setFieldValue("aj1", data.aj1);
        setFieldValue("idNumber1", data.idNumber1);
        setFieldValue("signature", data.signature);
        setFieldValue("bankName", data.bankName);
        setFieldValue("contractDate", data.contractDate);
        setFieldValue("amountUSD", data.amountUSD);
        setFieldValue("amountKHR", data.amountKHR);
        setFieldValue("otherText", data.otherInfo); // Matches SQLite column 'otherInfo'

    } catch (error) {
        console.error("Error loading record:", error);
        alert("មិនអាចទាញយកទិន្នន័យបានទេ (Could not load the record for editing)");
    }
}

// Helper function to safely set values
function setFieldValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value || "";
    }
}
// Save Button Interaction
const saveBtn = document.getElementById("saveBtn");
const saveIcon = document.getElementById("saveIcon");
const saveText = document.getElementById("saveText");

saveBtn.addEventListener("click", async () => {
    // 1. UI Loading State
    saveBtn.disabled = true;
    saveBtn.classList.add("opacity-70", "cursor-not-allowed");
    saveIcon.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
    saveText.innerText = isEditMode ? "Updating..." : "Saving...";
    lucide.createIcons();

    // 2. Prepare data for the SQLite server
    const formData = {
        village: document.getElementById("village").value,
        landNumber: document.getElementById("landNumber").value,
        regNumber: document.getElementById("regNumber").value,
        date: document.getElementById("date").value,
        unitNumber: document.getElementById("unitNumber").value,
        floor: document.getElementById("floor").value,
        LMap: document.getElementById("LMap").value,
        oldMap: document.getElementById("oldMap").value,
        applicantName: document.getElementById("applicantName").value,
        sellerName: document.getElementById("sellerName").value,
        buyerName: document.getElementById("buyerName").value,
        // serviceType: document.getElementById("serviceType").value,
        serviceType: document.getElementById("serviceSearch").value,
        documentHolder: document.getElementById("documentHolder").value,
        aj1: document.getElementById("aj1").value,
        idNumber1: document.getElementById("idNumber1").value,
        signature: document.getElementById("signature").value,
        bankName: document.getElementById("bankName").value,
        contractDate: document.getElementById("contractDate").value,
        amountUSD: document.getElementById("amountUSD").value,
        amountKHR: document.getElementById("amountKHR").value,
        otherInfo: document.getElementById("otherText").value
    };

    // 3. Determine URL and Method (POST for new, PUT for edit)
    const url = isEditMode
        ? `http://localhost:3000/api/registrations/${editId}`
        : 'http://localhost:3000/api/registrations';

    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();

            if (isEditMode) {
                // If editing, usually we show a success toast or redirect back
                alert("Record updated successfully!");
                window.location.href = 'home.html';
            } else {
                // If new, trigger the summary modal as before
                showSummary(formData, result.id);
            }
        } else {
            const errorData = await response.json();
            console.error("Server Error:", errorData);
            alert("Failed to process request. Check server logs.");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Cannot connect to server. Is it running on port 3000?");
    } finally {
        // Reset UI State
        saveBtn.disabled = false;
        saveBtn.classList.remove("opacity-70", "cursor-not-allowed");
        saveIcon.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i>';
        saveText.innerText = "Save";
        lucide.createIcons();
    }
});
function showSummary(record, id) {
    // Update summary cards
    document.getElementById("summaryDate").textContent = record.date
        ? new Date(record.date).toLocaleDateString("km-KH") : "-";
    document.getElementById("summaryApplicant").textContent = record.applicantName || "-";
    document.getElementById("summaryAmount").textContent = record.amountUSD
        ? `$${parseInt(record.amountUSD).toLocaleString()}` : "-";

    // Fill Grids
    document.getElementById("propertyGrid").innerHTML = `
          ${createSummaryItem("ភូមិ / Village", record.village)}
          ${createSummaryItem("លេខក្បាលដី / Land Number", record.landNumber)}
          ${createSummaryItem("លេខចុះបញ្ជី / Registration No", record.regNumber)}
          ${createSummaryItem("ប័ណ្ណ /  LMap", record.LMap)}
          ${createSummaryItem("ប័ណ្ណដីចាស់ / Old Map", record.oldMap)}
        `;

    document.getElementById("personalGrid").innerHTML = `
          ${createSummaryItem("ឈ្មោះអ្នកស្នើសុំ / Applicant", record.applicantName)}
          ${createSummaryItem("ឈ្មោះអ្នកលក់ / Seller", record.sellerName)}
            ${createSummaryItem("ឈ្មោះអ្នកទិញ / Buyer", record.buyerName)}
          ${createSummaryItem("ប្រភេទសេវា / Service Type", record.serviceType)}
        `;

    // Show modal
    const modal = document.getElementById("summaryModal");
    const modalContent = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    setTimeout(() => {
        modalContent.classList.remove("scale-95", "opacity-0");
        modalContent.classList.add("scale-100", "opacity-100");
    }, 10);
    lucide.createIcons();
}

function createSummaryItem(label, value) {
    return `
          <div class="bg-white p-3 rounded-lg border border-gray-200">
            <span class="text-xs text-gray-500 uppercase tracking-wider">${label}</span>
            <p class="font-semibold text-gray-900 mt-1">${value || "-"}</p>
          </div>
        `;
}

function closeModal() {
    window.location.href = 'home.html'; // Redirect back to list after closing summary
}

document.getElementById("summaryModal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
});