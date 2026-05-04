document.addEventListener("DOMContentLoaded", () => {
    // 1. PAGE LOADER
    const loaderWrapper = document.getElementById('oppty-page-loader');
    if (loaderWrapper) {
        setTimeout(() => { loaderWrapper.classList.add('hidden'); }, 800);
    }

    // 2. SKELETON LOADER
    const dashboard = document.querySelector('.skeleton-container');
    if(dashboard) {
        dashboard.classList.add('loading');
        setTimeout(() => {
            dashboard.classList.remove('loading');
            initDashboardData();
        }, 1200);
    }

    // 3. SIDEBAR TOGGLE
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    }
    function closeSidebarMobile() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }
    if(menuToggle) menuToggle.addEventListener('click', openSidebar);
    if(sidebarClose) sidebarClose.addEventListener('click', closeSidebarMobile);
    if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarMobile);
});

// Global state to hold candidates
let allCandidates = [];
let currentSelectedId = null;

// 4. FETCH DATA FROM DJANGO
async function initDashboardData() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/candidates');
        const data = await response.json();
        
        allCandidates = Array.isArray(data) ? data : (data.candidates || []);

        // Filter based on status
        const pending = allCandidates.filter(c => c.status === 'form_pending');
        const accepted = allCandidates.filter(c => c.status === 'approved');
        const rejected = allCandidates.filter(c => c.status === 'rejected');

        renderTable(pending);
        updateCounters(pending.length, accepted.length, rejected.length);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// 5. RENDER TABLE
function renderTable(candidates) {
    const tableBody = document.getElementById('candidateTableBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.querySelector('.data-table');
    
    tableBody.innerHTML = ''; 

    if (!candidates || candidates.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    candidates.forEach(candidate => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${candidate.full_name}</strong></td>
            <td>${candidate.email}</td>
            <td><a href="tel:${candidate.phone}" class="btn-phone"><i class="fa-solid fa-phone"></i> ${candidate.phone}</a></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon accept" onclick="handleAction(${candidate.id}, 'approved')" title="Accept"><i class="fa-solid fa-check"></i></button>
                    <button class="btn-icon reject" onclick="handleAction(${candidate.id}, 'rejected')" title="Reject"><i class="fa-solid fa-xmark"></i></button>
                    <button class="btn-icon view" onclick="openDetailsModal(${candidate.id})" title="Show More"><i class="fa-solid fa-eye"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 6. APPROVAL/REJECTION HANDLER
async function handleAction(id, statusValue) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/approval/${id}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusValue })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showToast(`Candidate ${statusValue} successfully!`, 'success');
        await initDashboardData(); 
        closeModal('detailsModal');
    } catch (error) {
        console.error('Action error:', error);
        showToast('Error updating candidate.', 'danger');
    }
}

// 7. MODAL LOGIC
function openDetailsModal(id) {
    const candidate = allCandidates.find(c => c.id === id);
    if (!candidate) return;

    currentSelectedId = id;

    document.getElementById('modalName').innerText = candidate.full_name;
    document.getElementById('modalEmail').innerText = candidate.email;
    document.getElementById('modalPhone').innerText = candidate.phone;
    document.getElementById('modalDob').innerText = candidate.dob || 'N/A';
    document.getElementById('modalPassedOut').innerText = candidate.passed_out || 'N/A';
    document.getElementById('modalExperience').innerText = candidate.experiences ? `${candidate.experiences} Years` : 'N/A';
    // Add skill display if it exists in your model
    const skillEl = document.getElementById('modalSkills');
    if(skillEl) skillEl.innerText = candidate.skills || 'N/A';

    document.getElementById('detailsModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

document.getElementById('modalBtnAccept').addEventListener('click', () => {
    if(currentSelectedId) handleAction(currentSelectedId, 'approved');
});
document.getElementById('modalBtnReject').addEventListener('click', () => {
    if(currentSelectedId) handleAction(currentSelectedId, 'rejected');
});

// 8. COUNTERS
function updateCounters(pending, accepted, rejected) {
    document.getElementById('count-pending').setAttribute('data-target', pending);
    document.getElementById('count-accepted').setAttribute('data-target', accepted);
    document.getElementById('count-rejected').setAttribute('data-target', rejected);
    animateCounters();
}

function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        counter.innerText = counter.getAttribute('data-target');
    });
}

// 9. TOAST
function showToast(message, type) {
    const toast = document.getElementById('toastNotification');
    const icon = toast.querySelector('.toast-icon');
    const text = document.getElementById('toastMessage');
    text.innerText = message;
    toast.className = `toast show ${type}`;
    icon.className = type === 'success' ? 'fa-solid fa-circle-check toast-icon' : 'fa-solid fa-circle-xmark toast-icon';
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}