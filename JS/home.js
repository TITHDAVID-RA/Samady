lucide.createIcons();

const API_URL = '/api';
let records = [];
let filteredRecords = [];
let currentRecord = null;

document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    document.getElementById('searchInput').addEventListener('input', filterRecords);
    document.getElementById('statusFilter').addEventListener('change', filterRecords);
});

async function loadRecords() {
    try {
        const response = await fetch(`${API_URL}/registrations`);
        records = await response.json();
        filterRecords();
    } catch (err) {
        showToast("Server Connection Failed");
    }
}

function filterRecords() {
    // 1. Grab the search text (lowercase for easier matching)
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    // 2. Grab the Village filter value
    const selectedVillage = document.getElementById('statusFilter').value;

    filteredRecords = records.filter(r => {
        // --- GLOBAL SEARCH LOGIC ---
        // We take all values of the record 'r', turn them into strings, and check the search term
        const matchesSearch = !search || Object.values(r).some(val => 
            val && String(val).toLowerCase().includes(search)
        );

        // --- VILLAGE FILTER LOGIC ---
        // Matches if the dropdown is empty OR if the record's village matches exactly
        const matchesVillage = !selectedVillage || r.village === selectedVillage;

        // Both must be true for the row to show up
        return matchesSearch && matchesVillage;
    });

    // 3. Refresh the table UI
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const empty = document.getElementById('emptyState');

    if (filteredRecords.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    tbody.innerHTML = filteredRecords.map(r => `
                <tr class="data-row cursor-pointer border-b" onclick="viewRecord(${r.id})">
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">${r.LMap || '-'}</td>
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">${r.oldMap  || '-'}</td>
                    <td class="px-6 py-4 font-semibold text-gray-800">${r.landNumber}</td>
                    <td class="px-6 py-4 text-gray-600">${r.applicantName}</td>
                    <td class="px-6 py-4 text-gray-600">${r.sellerName}</td>
                    <td class="px-6 py-4 text-gray-600">${r.buyerName}</td>
                    <td class="px-6 py-4 text-gray-600">${r.documentHolder}</td>
                    <td class="px-6 py-4 text-gray-600">${r.village}</td>
                    <td class="px-6 py-4 text-center">${getStatusBadge(r.serviceType)}</td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-blue-600 p-2 hover:bg-blue-50 rounded-lg"><i data-lucide="eye" class="w-4 h-4"></i></button>
                    </td>
                </tr>
            `).join('');
    lucide.createIcons();
}

function getStatusBadge(status) {
    const colors = { 'Enrolled': 'bg-green-100 text-green-700', 'Pending': 'bg-amber-100 text-amber-700' };
    return `<span class="px-3 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-blue-100 text-blue-700'}">${status || 'New'}</span>`;
}

function viewRecord(id) {
    // Find the record in our local array
    currentRecord = records.find(r => String(r.id) === String(id));
    if (!currentRecord) return;

    // Update Header
    document.getElementById('modalSubtitle').textContent = `Record ID: ${currentRecord.id}`;
    document.getElementById('modalStatusBadge').innerHTML = getStatusBadge(currentRecord.status);

    const grid = document.getElementById('detailGrid');

    // Clear and rebuild the grid with ALL fields
    grid.innerHTML = `
        <div class="col-span-full border-b pb-2 mb-2">
            <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4"></i> Location & Mapping
            </h3>
        </div>
        ${createItem('Village (ភូមិ)', currentRecord.village)}
        ${createItem('Land Number (លេខក្បាលដី)', currentRecord.landNumber)}
        ${createItem('Registration No', currentRecord.regNumber)}
        ${createItem('ប័ណ្ណL-Map', currentRecord.LMap)}
        ${createItem('ប័ណ្ណដីចាស់/ប័ណ្ណL-Mapចាស់', currentRecord.oldMap)}
        
        <div class="col-span-full border-b pb-2 mt-4 mb-2">
            <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <i data-lucide="users" class="w-4 h-4"></i> Parties Involved
            </h3>
        </div>
        ${createItem('Applicant Name', currentRecord.applicantName)}
        ${createItem('Seller Name', currentRecord.sellerName)}
        ${createItem('Buyer Name', currentRecord.buyerName)}
        ${createItem('Document Holder', currentRecord.documentHolder)}
        ${createItem('Signature Type', currentRecord.signature)}

        <div class="col-span-full border-b pb-2 mt-4 mb-2">
            <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <i data-lucide="gavel" class="w-4 h-4"></i> Legal / AJ
            </h3>
        </div>
        ${createItem('AJ 1', currentRecord.aj1)}
        ${createItem('ID Number 1', currentRecord.idNumber1)}

        <div class="col-span-full border-b pb-2 mt-4 mb-2">
            <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <i data-lucide="home" class="w-4 h-4"></i> Property Details
            </h3>
        </div>
        ${createItem('Unit Number', currentRecord.unitNumber)}
        ${createItem('Floor', currentRecord.floor)}
        ${createItem('Service Type', currentRecord.serviceType)}
        ${createItem('Date', currentRecord.date)}

        <div class="col-span-full border-b pb-2 mt-4 mb-2">
            <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <i data-lucide="banknote" class="w-4 h-4"></i> Financials
            </h3>
        </div>
        ${createItem('Bank Name', currentRecord.bankName)}
        ${createItem('Contract Date', currentRecord.contractDate)}
        ${createItem('Amount (USD)', currentRecord.amountUSD ? `$${Number(currentRecord.amountUSD).toLocaleString()}` : '-')}
        ${createItem('Amount (KHR)', currentRecord.amountKHR ? `${Number(currentRecord.amountKHR).toLocaleString()} ៛` : '-')}

        <div class="col-span-full border-b pb-2 mt-4 mb-2">
            <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <i data-lucide="info" class="w-4 h-4"></i> Other Information
            </h3>
        </div>
        <div class="col-span-full p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-400 uppercase">Other Info / Notes</p>
            <p class="font-medium text-gray-800">${currentRecord.otherInfo || 'No additional notes'}</p>
        </div>
    `;

    // Show the modal
    const modal = document.getElementById('detailModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Add animation classes
    setTimeout(() => {
        modal.querySelector('.modal-backdrop').classList.add('active');
        modal.querySelector('.modal-content').classList.add('active');
    }, 10);

    // Re-initialize icons inside the modal
    lucide.createIcons();
}

// Ensure your helper function handles empty values gracefully
function createItem(label, val) {
    return `
        <div class="p-3 bg-gray-50 rounded-lg hover:bg-white border border-transparent hover:border-gray-100 transition-all">
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">${label}</p>
            <p class="font-semibold text-gray-800 text-sm">${val || '-'}</p>
        </div>
    `;
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.querySelector('.modal-backdrop').classList.remove('active');
    modal.querySelector('.modal-content').classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function editFromModal() {
    if (!currentRecord) return;
    // This opens in the SAME tab
    window.location.href = `index.html?mode=edit&id=${currentRecord.id}`;
}

async function deleteCurrentRecord() {
    if (!confirm("Delete this record forever?")) return;
    try {
        const res = await fetch(`${API_URL}/registrations/${currentRecord.id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Record Deleted");
            closeModal();
            loadRecords();
        }
    } catch (err) { showToast("Delete Failed"); }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = msg;
    t.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000);
}

async function exportList() {
    const exportBtn = document.querySelector('button[onclick="exportList()"]');
    const originalContent = exportBtn.innerHTML;

    try {
        // 1. UI Loading State
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Exporting...';
        if (window.lucide) lucide.createIcons();

        // 2. Fetch data from API
        const response = await fetch('/api/registrations');
        const data = await response.json();

        if (!data || data.length === 0) {
            alert("គ្មានទិន្នន័យសម្រាប់ទាញយកទេ (No data to export)");
            return;
        }

        // 3. Define Headers (Matching your specific form order)
        const headers = [
            "ID", 
            "ភូមិ (Village)", 
            "លេខក្បាលដី (Land No)", 
            "លេខចុះបញ្ជី (Reg No)", 
            "កាលបរិច្ឆេទ (Date)", 
            "យូនីត (Unit)", 
            "ជាន់ (Floor)", 
            "ប័ណ្ណ LMap (LMap)", 
            "ប័ណ្ណចាស់ (Old Map)", 
            "អ្នកស្នើសុំ (Applicant)", 
            "អ្នកលក់ (Seller)", 
            "អ្នកទិញ (Buyer)", 
            "ប្រភេទសេវា (Service)", 
            "អ្នកកាន់ឯកសារ (Holder)", 
            "អាយជេ (AJ1)", 
            "អត្តសញ្ញាណប័ណ្ណ (ID No)", 
            "ហត្ថលេខា (Signature)", 
            "ធនាគារ (Bank)", 
            "ថ្ងៃកិច្ចសន្យា (Contract Date)", 
            "ចំនួនទឹកប្រាក់$ (USD)", 
            "ចំនួនទឹកប្រាក់៛ (KHR)", 
            "ព័ត៌មានផ្សេងៗ (Other Info)"
        ];

        // 4. Map the Data to Rows
        const csvRows = [];
        csvRows.push(headers.join(','));

        data.forEach(row => {
            const values = [
                row.id,
                `"${row.village || ''}"`,
                `"${row.landNumber || ''}"`,
                `"${row.regNumber || ''}"`,
                `"${row.date || ''}"`,
                `"${row.unitNumber || ''}"`,
                `"${row.floor || ''}"`,
                `"${row.LMap || ''}"`,
                `"${row.oldMap || ''}"`,
                `"${row.applicantName || ''}"`,
                `"${row.sellerName || ''}"`,
                `"${row.buyerName || ''}"`,
                `"${row.serviceType || ''}"`,
                `"${row.documentHolder || ''}"`,
                `"${row.aj1 || ''}"`,
                `"${row.idNumber1 || ''}"`,
                `"${row.signature || ''}"`,
                `"${row.bankName || ''}"`,
                `"${row.contractDate || ''}"`,
                `"${row.amountUSD || 0}"`,
                `"${row.amountKHR || 0}"`,
                `"${row.otherInfo || ''}"`
            ];
            // Remove any potential newlines from the data to prevent CSV breaking
            const cleanValues = values.map(v => String(v).replace(/\n/g, " "));
            csvRows.push(cleanValues.join(','));
        });

        // 5. Generate and Download
        // \uFEFF is essential for Khmer Unicode support in Excel
        const csvString = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
        link.download = `Report_Full_${timestamp}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Export Error:", error);
        alert("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ (Error exporting data)");
    } finally {
        // 6. Reset UI
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalContent;
        if (window.lucide) lucide.createIcons();
    }
}