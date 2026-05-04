// ==========================================
// HR CRM Admin - Candidate Details Profile Logic
// ==========================================

const BASE_URL = 'http://127.0.0.1:8000'; // Ensure this points to your Django server

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Page Loader Logic ---
    const loaderWrapper = document.getElementById('oppty-page-loader');
    
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            setTimeout(() => loaderWrapper.classList.add('hidden'), 800); 
        }
    });

    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            if (href && href !== '#' && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript')) {
                if (loaderWrapper) loaderWrapper.classList.remove('hidden');
            }
        });
    });
});

// --- 2. Reusable Utilities ---
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

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// --- 3. Sidebar Mobile Functionality ---
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));


// ==========================================
// 4. CANDIDATE PROFILE API & UI LOGIC
// ==========================================
if (document.getElementById('profileBannerInfo')) {
    const urlParams = new URLSearchParams(window.location.search);
    const candidateId = parseInt(urlParams.get('id'));

    // Local state for UI updates
    let currentFeeState = { total: 100000, paid: 0 }; 

    const fetchCandidateProfile = async () => {
        if (!candidateId) return;
        try {
            const response = await fetch(`${BASE_URL}/api/employee/${candidateId}/`);
            if (!response.ok) throw new Error("Failed to fetch candidate details");
            const data = await response.json();
            renderProfileDetails(data);
        } catch (error) {
            console.error("Error:", error);
            showToast("Failed to load profile data");
        }
    };

    const renderProfileDetails = (data) => {
        const cand = data.candidate_info;
        const payments = data.payments || [];

        // Populate Profile Banner
        document.getElementById('profileBannerInfo').innerHTML = `
            <div class="user-avatar" style="width:70px;height:70px;font-size:1.6rem;border-radius:18px;">${getInitials(cand.name)}</div>
            <div>
                <h2>${cand.name}</h2>
                <p><i class="fa-solid fa-envelope"></i> ${cand.email} &nbsp; | &nbsp; <i class="fa-solid fa-phone"></i> ${cand.phone}</p>
            </div>
        `;

        // Hook up Download Resume Button
        const downloadBtn = document.querySelector('.profile-banner .btn-secondary');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                if (cand.resume) {
                    window.open(`${BASE_URL}${cand.resume}`, '_blank');
                } else {
                    alert('No resume file uploaded for this candidate.');
                }
            };
        }

        // Populate Hidden Email Input for Offer Letter Section
        const candEmailInput = document.getElementById('candEmail');
        if(candEmailInput) candEmailInput.value = cand.email;

        // Calculate Payments from Database
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        currentFeeState.paid = totalPaid;
        renderPaymentSummaryUI();

        // Render Screenshot Gallery dynamically
        const gallery = document.querySelector('.screenshot-gallery');
        if (gallery) {
            gallery.innerHTML = ''; 
            if (payments.length === 0) {
                gallery.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No payment proofs uploaded.</p>';
            } else {
                payments.forEach(p => {
                    if (p.screenshot) {
                        const imgPath = p.screenshot.startsWith('/media/') ? `${BASE_URL}${p.screenshot}` : `${BASE_URL}/media/${p.screenshot}`;
                        const img = document.createElement('img');
                        img.src = imgPath;
                        img.alt = `Receipt ₹${p.amount}`;
                        img.onclick = function() { openModal(this.src); };
                        gallery.appendChild(img);
                    }
                });
            }
        }

        // Hiring Actions Status Logic (Toggle Views based on interview status)
        const statusSelect = document.getElementById('interviewStatusSelect');
        const scheduleSection = document.getElementById('scheduleSection');
        const emailSection = document.getElementById('emailSection');

        if(statusSelect) {
            statusSelect.value = (cand.status === 'Completed') ? 'Completed' : 'Pending';
            const toggleHiringViews = (status) => {
                if (status === 'Completed') {
                    scheduleSection.style.display = 'none';
                    emailSection.style.display = 'block';
                } else {
                    scheduleSection.style.display = 'block';
                    emailSection.style.display = 'none';
                }
            }
            toggleHiringViews(statusSelect.value);
            statusSelect.addEventListener('change', (e) => toggleHiringViews(e.target.value));
        }
    };

    // Render Payment Box & Progress Bar dynamically
    const renderPaymentSummaryUI = () => {
        const remaining = currentFeeState.total - currentFeeState.paid;
        const percent = currentFeeState.total > 0 ? ((currentFeeState.paid / currentFeeState.total) * 100).toFixed(0) : 0;

        document.getElementById('paymentSummaryBox').innerHTML = `
            <div class="payment-summary">
                <div class="edit-fee-wrap">
                    Total Fee: ₹<span id="feeDisplay">${currentFeeState.total}</span>
                    <input type="number" id="feeInput" value="${currentFeeState.total}" class="form-control" style="display:none; width: 100px; padding: 6px 10px; margin-left: 5px;">
                    <button class="edit-fee-btn" id="editFeeBtn"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button id="saveFeeBtn" class="btn btn-primary btn-sm" style="display:none; margin-left: 10px;">Save</button>
                </div>
                <span style="color: var(--primary);">Paid: ₹${currentFeeState.paid}</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted);">
                <span>${percent}% Completed</span>
                <span style="color: var(--danger); font-weight: 500;">Balance: ₹${remaining}</span>
            </div>
        `;

        // Manage Send Offer Section visibility based on payments
        const offerSection = document.getElementById('sendOfferSection');
        if (offerSection) {
            offerSection.style.display = (currentFeeState.paid >= currentFeeState.total) ? 'block' : 'none';
        }

        // Attach Inline Edit Total Fee Handlers
        const editBtn = document.getElementById('editFeeBtn');
        const saveBtn = document.getElementById('saveFeeBtn');
        const display = document.getElementById('feeDisplay');
        const input = document.getElementById('feeInput');

        if(editBtn && saveBtn && display && input) {
            editBtn.addEventListener('click', () => {
                display.style.display = 'none';
                editBtn.style.display = 'none';
                input.style.display = 'inline-block';
                saveBtn.style.display = 'inline-block';
                input.focus();
            });

            saveBtn.addEventListener('click', () => {
                const newFee = parseInt(input.value);
                if(!newFee || newFee <= 0 || newFee < currentFeeState.paid) {
                    alert('Invalid fee amount.');
                    return;
                }
                currentFeeState.total = newFee; 
                showToast(`Total Fee updated to ₹${newFee}.`);
                renderPaymentSummaryUI();
            });
        }
    };

    // --- 5. Add Payment Modal Logic ---
    const savePaymentUpdateBtn = document.getElementById('savePaymentUpdateBtn');
    const paymentUpdateModal = document.getElementById('paymentUpdateModal');
    const openPaymentModalBtn = document.getElementById('openPaymentModalBtn');
    const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
    const paymentScreenshotFile = document.getElementById('paymentScreenshotFile');

    // Open/Close Modal
    if (paymentUpdateModal && openPaymentModalBtn && closePaymentModalBtn) {
        openPaymentModalBtn.addEventListener('click', () => paymentUpdateModal.style.display = 'flex');
        closePaymentModalBtn.addEventListener('click', () => paymentUpdateModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === paymentUpdateModal) paymentUpdateModal.style.display = 'none';
        });
    }

    // Show filename on custom upload button
    if (paymentScreenshotFile) {
        paymentScreenshotFile.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : "Select Image";
            const label = this.previousElementSibling;
            if (label) label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> ${fileName}`;
        });
    }

    // Save Payment locally (Setup for future API POST request)
    if (savePaymentUpdateBtn) {
        savePaymentUpdateBtn.addEventListener('click', () => {
            const addedAmount = parseInt(document.getElementById('updatePaidAmount').value);
            if (!addedAmount || addedAmount <= 0) return alert('Please enter a valid amount.');
            
            // Update UI State locally
            currentFeeState.paid += addedAmount;
            if (currentFeeState.paid > currentFeeState.total) currentFeeState.paid = currentFeeState.total;
            
            renderPaymentSummaryUI(); // Re-draw progress bar
            
            // Close and reset modal
            paymentUpdateModal.style.display = 'none';
            document.getElementById('updatePaidAmount').value = '';
            document.getElementById('updateBankName').value = '';
            document.getElementById('updatePaymentDate').value = '';
            
            if(paymentScreenshotFile) {
                paymentScreenshotFile.value = '';
                paymentScreenshotFile.previousElementSibling.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Select Image`;
            }

            showToast(`Added ₹${addedAmount} to candidate payment!`);
        });
    }

    // Trigger Initial Fetch on page load
    fetchCandidateProfile();
}


// ==========================================
// 6. GLOBAL IMAGE PREVIEW MODAL
// ==========================================
window.openModal = function(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = src;
    }
}

const closeModal = document.getElementById('modalClose');
const imageModal = document.getElementById('imageModal');
if(closeModal && imageModal) {
    closeModal.addEventListener('click', () => imageModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if(e.target == imageModal) imageModal.style.display = 'none';
    });
}