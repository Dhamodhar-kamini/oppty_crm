/** * HR CRM Admin - Unified Logic
 */

// 1. Global State
let candidatesData = [];

async function fetchCandidates() {
    try {
        const response = await fetch('http://192.168.1.10:8000/api/approved_candidates/');
        console.log("Response Status:", response.status); // Check if it's 200
        
        const data = await response.json();
        console.log("Data received from API:", data); // Check the structure
        
        if (!Array.isArray(data)) {
            console.warn("Expected an array but received:", typeof data);
            candidatesData = []; 
        } else {
            candidatesData = data;
        }
        
        renderTable(candidatesData);
    } catch (error) {
        console.error('Fetch Error:', error);
        showToast('Check console for API error details');
    }
}

// 3. Helper Functions
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const getPaymentBadge = (paid, total) => {
    if (paid === 0) return `<span class="badge pending">Pending</span>`;
    if (paid < total) return `<span class="badge partial">Partial</span>`;
    return `<span class="badge paid">Fully Paid</span>`;
};

const getInterviewBadge = (status) => 
    status === 'Completed' ? `<span class="badge completed">Completed</span>` : `<span class="badge pending">Pending</span>`;

const showToast = (message) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <div>Success</div> <small>${message}</small>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
};

// 4. Render Table
const renderTable = (data) => {
    const tbody = document.getElementById('candidatesBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">No candidates found.</td></tr>';
        return;
    }
    
    data.forEach(cand => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="user-cell"><div class="user-avatar">${getInitials(cand.name)}</div><div><strong>${cand.name}</strong><br><small>${cand.email}</small></div></div></td>
            <td>${cand.mobile || 'N/A'}</td>
            <td><div>${cand.experience}</div><small><i class="fa-regular fa-calendar"></i> Joined: 11/08/2020</small></td>
            <td>${getInterviewBadge(cand.status)}</td>
            <td>100000</td>
            <td><a href="candidate-details.html?id=${cand.id}" class="btn btn-secondary btn-sm">View Profile</a></td>
        `;
        tbody.appendChild(tr);
    });
};

// 5. Main Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Page Loader
    const loader = document.getElementById('oppty-page-loader');
    window.addEventListener('load', () => { if (loader) setTimeout(() => loader.classList.add('hidden'), 800); });

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle')?.addEventListener('click', () => sidebar?.classList.add('active'));
    document.getElementById('sidebarClose')?.addEventListener('click', () => sidebar?.classList.remove('active'));

    // Candidates Page Filters
    const searchInput = document.getElementById('candidatesSearch');
    const monthFilter = document.getElementById('candidateMonthFilter');

    const applyFilters = () => {
        const s = searchInput?.value.toLowerCase() || '';
        const m = monthFilter?.value || '';
        const filtered = candidatesData.filter(c => 
            (c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)) &&
            (m === '' || c.joinDate.startsWith(m))
        );
        renderTable(filtered);
    };

    searchInput?.addEventListener('input', applyFilters);
    monthFilter?.addEventListener('change', applyFilters);
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        if(monthFilter) monthFilter.value = '';
        renderTable(candidatesData);
    });

    // Start App
    fetchCandidates();
});

// 6. Global Helpers
window.logoutAdmin = () => showToast('Logging out...');