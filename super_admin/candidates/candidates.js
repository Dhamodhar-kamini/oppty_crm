let candidatesData = [];

async function fetchCandidates() {
    try {
        const response = await fetch('https://hiring-api.theoppty.com/api/approved_candidates/');
        console.log("Response Status:", response.status);
        const data = await response.json();
        console.log("Data received from API:", data); 
        
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

const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getPaymentBadge = (paid, total) => {
    if (paid === 0) return `<span class="badge pending">Pending</span>`;
    if (paid < total) return `<span class="badge partial">Partial</span>`;
    return `<span class="badge paid">Fully Paid</span>`;
};

// Your specific status badges
const getStatusBadge = (status) => {
    if (!status) return `<span class="badge pending">Pending</span>`;
    
    // Convert to lowercase and remove extra spaces for reliable matching
    const s = status.toLowerCase().trim();
    
    if (s === 'approved') {
        return `<span class="badge approved">Approved</span>`;
        
    } else if (s.includes('schedule') || s.includes('shedule')) {
        return `<span class="badge scheduled">Interview Scheduled</span>`;
        
    } else if (s === 'interview completed' || s === 'interview complted') {
        return `<span class="badge interview-completed">Interview Completed</span>`;
        
    } else if (s === 'offer released') {
        return `<span class="badge offer">Offer Released 🎉</span>`; 
        
    } else if (s.includes('reject')) {
        return `<span class="badge rejected">Rejected</span>`;
        
    } else {
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return `<span class="badge pending">${formattedStatus}</span>`;
    }
};

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

const renderTable = (data) => {
    const tbody = document.getElementById('candidatesBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">No candidates found.</td></tr>';
        return;
    }
    
    data.forEach(cand => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${getInitials(cand.full_name)}</div>
                    <div>
                        <strong>${cand.full_name}</strong><br>
                        <small>${cand.email}</small>
                    </div>
                </div>
            </td>
            <td>${cand.phone || 'N/A'}</td>
            <td><div>${cand.experiences || '0'} Years</div></td>
            
            <!-- FIX 1: Actually call the getStatusBadge function here! -->
            <td>${getStatusBadge(cand.status)}</td>
            
            <td>${cand.refered || 'NA'}</td>
            <td>${cand.fee || 'Not Decided'}</td>
            <td><a href="../candidate-profile/candidate-details.html?id=${cand.id}" class="btn btn-secondary btn-sm">View Profile</a></td>
        `;
        tbody.appendChild(tr);
    });
};

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
        
        const filtered = candidatesData.filter(c => {
            // FIX 2: Safely check full_name instead of name to prevent crashes
            const nameMatch = c.full_name && c.full_name.toLowerCase().includes(s);
            const emailMatch = c.email && c.email.toLowerCase().includes(s);
            
            // Check for date. Falls back to an empty string if your API doesn't return a date field yet.
            const candDate = c.date || c.created_at || c.joinDate || '';
            const monthMatch = m === '' || candDate.startsWith(m);
            
            return (nameMatch || emailMatch) && monthMatch;
        });
        
        renderTable(filtered);
    };

    searchInput?.addEventListener('input', applyFilters);
    monthFilter?.addEventListener('change', applyFilters);
    
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        if(monthFilter) monthFilter.value = '';
        renderTable(candidatesData); // Reset the table to show everyone
    });

    // Fetch data when page loads
    fetchCandidates();
});

window.logoutAdmin = () => showToast('Logging out...');