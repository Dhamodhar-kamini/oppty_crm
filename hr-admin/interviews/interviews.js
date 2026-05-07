// ==========================================
// HR CRM Admin - Interview Schedule Logic
// ==========================================

const BASE_URL = 'http://127.0.0.1:8000'; // Django Server URL

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Page Loader & Sidebar Logic ---
    const loaderWrapper = document.getElementById('oppty-page-loader');
    if (loaderWrapper) {
        window.addEventListener('load', () => setTimeout(() => loaderWrapper.classList.add('hidden'), 800));
    }

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
    if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdown');
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('show');
        });
        window.addEventListener('click', () => profileMenu.classList.remove('show'));
    }

    // --- 2. Elements Cache ---
    const interviewModal = document.getElementById('newInterviewModal');
    const openInterviewBtn = document.getElementById('openInterviewModalBtn');
    const closeInterviewBtn = document.getElementById('closeInterviewModalBtn');
    const saveInterviewBtn = document.getElementById('saveInterviewBtn');
    
    const candidateDropdown = document.getElementById('interviewCandidate');
    const meetingUrlInput = document.getElementById('interviewMeetingUrl');
    const interviewerInput = document.getElementById('interviewerName');
    const dateTimeInput = document.getElementById('interviewDateTime');

    // --- 3. API: Load Approved Candidates ---
    const loadApprovedCandidates = async () => {
        try {
            candidateDropdown.innerHTML = '<option value="">-- Choose Candidate --</option>';
            const response = await fetch(`${BASE_URL}/api/interviews/`);
            const candidates = await response.json();

            if (candidates.length === 0) {
                candidateDropdown.innerHTML = '<option value="">No approved candidates found</option>';
                return;
            }

            candidates.forEach(cand => {
                const option = document.createElement('option');
                option.value = cand.id; 
                option.textContent = cand.full_name;
                candidateDropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading candidates:", error);
            candidateDropdown.innerHTML = '<option value="">Error loading list</option>';
        }
    };

    // --- 4. Modal Controls ---
    if (openInterviewBtn) {
        openInterviewBtn.addEventListener('click', () => {
            interviewModal.style.display = 'flex';
            loadApprovedCandidates();
        });
    }

    if (closeInterviewBtn) {
        closeInterviewBtn.addEventListener('click', () => {
            interviewModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === interviewModal) interviewModal.style.display = 'none';
    });

    // --- 5. API: Save Interview ---
    if (saveInterviewBtn) {
        saveInterviewBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const payload = {
                candidate_id: candidateDropdown.value,
                link: meetingUrlInput.value.trim(),
                interviewer: interviewerInput.value.trim(),
                interview_date: dateTimeInput.value
            };

            // Basic Validation
            if (!payload.candidate_id || !payload.link || !payload.interviewer || !payload.interview_date) {
                alert("Please fill all fields before scheduling.");
                return;
            }

            // Disable button during save
            saveInterviewBtn.disabled = true;
            saveInterviewBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scheduling...';

            try {
                const response = await fetch(`${BASE_URL}/api/interviews/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast('Interview Successfully Scheduled!');
                    interviewModal.style.display = 'none';
                    
                    // Reset Form
                    candidateDropdown.value = '';
                    meetingUrlInput.value = '';
                    interviewerInput.value = '';
                    dateTimeInput.value = '';
                } else {
                    const errorData = await response.json();
                    alert("Error: " + (errorData.error || "Failed to schedule"));
                }
            } catch (error) {
                console.error("Save Error:", error);
                alert("Network error. Please try again.");
            } finally {
                saveInterviewBtn.disabled = false;
                saveInterviewBtn.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Schedule Now';
            }
        });
    }
});

// Utility: Toast Notification
const showToast = (message) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <div>Success</div> <small>${message}</small>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

window.logoutAdmin = () => showToast('Logging out...');