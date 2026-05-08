/**
 * HR CRM - Candidates Management Script
 */

// Global State
let candidatesData = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize UI Components
    initLoader();
    initSidebar();
    initProfileDropdown();
    
    // 2. Load Data
    fetchCandidates();

    // 3. Initialize Filters
    initFilters();
});

/**
 * UI: Page Loader Logic
 */
function initLoader() {
    const loader = document.getElementById('oppty-page-loader');
    if (loader) {
        // Hide loader after page content is fully ready
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 800);
        });
    }
}

/**
 * UI: Sidebar Toggle (Mobile)
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('sidebarClose');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => sidebar.classList.add('active'));
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
    }
}

/**
 * UI: Profile Dropdown Logic
 */
function initProfileDropdown() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu = document.getElementById('profileMenu');

    if (profileTrigger && profileMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
            profileTrigger.classList.toggle('active');
        });

        // Close menu when clicking anywhere else on the document
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
                profileTrigger.classList.remove('active');
            }
        });
    }
}

/**
 * Data: Fetch from API
 */
async function fetchCandidates() {
    try {
        const response = await fetch('https://hiring-api.theoppty.com/api/approved_candidates/');
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        candidatesData = Array.isArray(data) ? data : [];
        
        renderTable(candidatesData);
    } catch (error) {
        console.error('Fetch Error:', error);
        showToast('Error loading candidates. Please check API.', 'danger');
        
        // Show empty state if fetch fails
        const tbody = document.getElementById('candidatesBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:red;">Failed to connect to API.</td></tr>';
    }
}

/**
 * Data: Table Rendering
 */
function renderTable(data) {
    const tbody = document.getElementById('candidatesBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">No candidates found matching your criteria.</td></tr>';
        return;
    }
    
    data.forEach(cand => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${getInitials(cand.full_name)}</div>
                    <div>
                        <strong>${cand.full_name || 'Unnamed'}</strong><br>
                        <small style="color:var(--text-muted)">${cand.email || 'No Email'}</small>
                    </div>
                </div>
            </td>
            <td>${cand.phone || 'N/A'}</td>
            <td><div>${cand.experiences || '0'} Years</div></td>
            <td>${getStatusBadge(cand.status)}</td>
            <td>${cand.refered || 'Direct'}</td>
            <td><strong>₹${cand.fee || '0'}</strong></td>
            <td>
                <a href="../candidate-profile/candidate-details.html?id=${cand.id}" class="btn btn-secondary btn-sm">
                    View Profile
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Logic: Filtering
 */
function initFilters() {
    const searchInput = document.getElementById('candidatesSearch');
    const monthFilter = document.getElementById('candidateMonthFilter');
    const clearBtn = document.getElementById('clearFiltersBtn');

    const applyFilters = () => {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const selectedMonth = monthFilter?.value || ''; // Format: YYYY-MM
        
        const filtered = candidatesData.filter(c => {
            const nameMatch = (c.full_name || '').toLowerCase().includes(searchTerm);
            const expMatch = (c.experiences || '').toString().includes(searchTerm);
            
            // Handle date matching (c.date should be in ISO format or starts with YYYY-MM)
            const candDate = c.date || c.created_at || '';
            const monthMatch = selectedMonth === '' || candDate.startsWith(selectedMonth);
            
            return (nameMatch || expMatch) && monthMatch;
        });
        
        renderTable(filtered);
    };

    searchInput?.addEventListener('input', applyFilters);
    monthFilter?.addEventListener('change', applyFilters);
    
    clearBtn?.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        if(monthFilter) monthFilter.value = '';
        renderTable(candidatesData);
    });
}

/**
 * Helper: Status Badges
 */
function getStatusBadge(status) {
    if (!status) return `<span class="badge pending">Pending</span>`;
    
    const s = status.toLowerCase().trim();
    
    if (s === 'approved') return `<span class="badge approved">Approved</span>`;
    if (s.includes('schedule')) return `<span class="badge scheduled">Interview Scheduled</span>`;
    if (s.includes('completed')) return `<span class="badge interview-completed">Interview Completed</span>`;
    if (s === 'offer released') return `<span class="badge offer">Offer Released 🎉</span>`;
    if (s.includes('reject')) return `<span class="badge rejected">Rejected</span>`;
    
    // Default fallback
    return `<span class="badge pending">${status}</span>`;
}

/**
 * Helper: Initials for Avatar
 */
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

/**
 * Helper: Toasts
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast`;
    if (type === 'danger') toast.style.background = 'var(--danger)';
    
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> 
        <div>${message}</div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 300); 
    }, 3500);
}

/**
 * Auth: Sign Out
 */
function signOut() {
    localStorage.removeItem('id');
    // Change index.html path according to your actual structure
    window.location.href = "../../index.html"; 
}