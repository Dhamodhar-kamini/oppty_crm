// ==========================================
// HR CRM Admin - Candidate Details Profile Logic
// ==========================================

const BASE_URL = 'https://hiring-api.theoppty.com';

document.addEventListener("DOMContentLoaded", () => {
    // --- Page Loader Logic ---
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
            if (
                href &&
                href !== '#' &&
                !href.startsWith('#') &&
                target !== '_blank' &&
                !href.startsWith('javascript')
            ) {
                if (loaderWrapper) loaderWrapper.classList.remove('hidden');
            }
        });
    });
});

// --- Reusable Utilities ---
const showToast = (message) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <div>Success</div>
        <small>${message}</small>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// --- Sidebar Mobile ---
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose  = document.getElementById('sidebarClose');
const sidebar       = document.getElementById('sidebar');

if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
if (sidebarClose)  sidebarClose.addEventListener('click',  () => sidebar.classList.remove('active'));


// ==========================================
// CANDIDATE PROFILE API & UI LOGIC
// ==========================================
if (document.getElementById('profileBannerInfo')) {

    const urlParams     = new URLSearchParams(window.location.search);
    const candidateId   = parseInt(urlParams.get('id'));

    if (!candidateId || isNaN(candidateId)) {
        console.error("Invalid or missing candidate ID in URL params");
        document.getElementById('profileBannerInfo').innerHTML = `
            <p style="color: red;">Error: No valid candidate ID found in URL. Please go back.</p>
        `;
    }

    let currentFeeState = { total: 0, paid: 0, balance: 0 };
    let currentCandidateStatus = "";

    const fetchCandidateProfile = async () => {
        if (!candidateId || isNaN(candidateId)) return;

        try {
            const response = await fetch(`${BASE_URL}/api/employee/${candidateId}/`);
            if (!response.ok) throw new Error("Failed to fetch candidate details");
            const data = await response.json();
            renderProfileDetails(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            showToast("Failed to load profile data.");
        }
    };

    const renderProfileDetails = (data) => {
        const cand     = data.name;
        const payments = data.payments || [];

        if (!cand) return;

        currentCandidateStatus = cand.status ? cand.status.toLowerCase().trim() : '';

        // Profile Banner
        document.getElementById('profileBannerInfo').innerHTML = `
            <div class="user-avatar" style="width:70px;height:70px;font-size:1.6rem;border-radius:18px;">
                ${getInitials(cand.name)}
            </div>
            <div>
                <h2>${cand.name}</h2>
                <p>
                    <i class="fa-solid fa-envelope"></i> ${cand.email}
                    &nbsp;|&nbsp;
                    <i class="fa-solid fa-phone"></i> ${cand.phone}
                </p>
            </div>
        `;

        // Resume Download
        const downloadBtn = document.getElementById('downloadResumeBtn');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                if (cand.resume) {
                    window.open(`${BASE_URL}${cand.resume}`, '_blank');
                } else {
                    alert('No resume file uploaded for this candidate.');
                }
            };
        }

        // Email for offer section
        const candEmailInput = document.getElementById('candEmail');
        if (candEmailInput) candEmailInput.value = cand.email;

        // Fee state
        currentFeeState.total   = parseFloat(cand.fee) || 0;
        currentFeeState.paid    = parseFloat(cand.total_paid) || 0;
        currentFeeState.balance = parseFloat(cand.balance) || 0;

        renderPaymentSummaryUI();

        // Screenshot Gallery
        const gallery = document.querySelector('.screenshot-gallery');
        if (gallery) {
            gallery.innerHTML = '';
            if (payments.length === 0) {
                gallery.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No payment proofs uploaded.</p>`;
            } else {
                payments.forEach(p => {
                    if (p.screenshot) {
                        const imgPath = p.screenshot.startsWith('/media/') ? `${BASE_URL}${p.screenshot}` : `${BASE_URL}/media/${p.screenshot}`;
                        const img    = document.createElement('img');
                        img.src      = imgPath;
                        img.alt      = `Receipt ₹${p.amount}`;
                        img.onclick  = function() { openModal(this.src); };
                        gallery.appendChild(img);
                    }
                });
            }
        }

        renderHiringActions(cand);
    };

    // ==========================================
    // HIRING ACTIONS UI
    // ==========================================
    const renderHiringActions = (cand) => {
        const hiringCardContainer = document.getElementById('hiringCardContainer');
        if (!hiringCardContainer) return;

        let uiHtml = `<h3><i class="fa-solid fa-user-check" style="color: var(--primary);"></i> Hiring Actions</h3>`;

        if (currentCandidateStatus === 'approved') {
            uiHtml += `
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-primary" style="width: 100%;" id="btnScheduleNow">
                        <i class="fa-regular fa-calendar-check"></i> Schedule Interview
                    </button>
                </div>
            `;
        } else if (currentCandidateStatus.includes('schedule') || currentCandidateStatus.includes('shedule')) {
            uiHtml += `
                <div style="text-align: center; margin-top: 20px;">
                    <p style="margin-bottom: 20px; font-weight: 500;">Has the employee completed the interview?</p>
                    <div style="display: flex; gap: 15px;">
                        <button class="btn btn-primary" id="btnInterviewYes" style="flex: 1; background: #05cd99; border: none;">
                            <i class="fa-solid fa-check"></i> Yes
                        </button>
                        <button class="btn btn-secondary" id="btnInterviewNo" style="flex: 1; color: #ee5d50; border-color: #ee5d50;">
                            <i class="fa-solid fa-xmark"></i> No
                        </button>
                    </div>
                </div>
            `;
        } else if (currentCandidateStatus === 'interview completed' || currentCandidateStatus === 'offer_released') {
            uiHtml += `
                <div style="text-align: center; margin-top: 20px;">
                    <div style="background: var(--bg-body); padding: 20px; border-radius: 12px;">
                        <i class="fa-solid fa-circle-check" style="color: #05cd99; font-size: 2.5rem; margin-bottom: 10px;"></i>
                        <p style="font-weight: 600; margin: 0;">Interview Process Finished</p>
                    </div>
                </div>
            `;
        } else {
            const displayStatus = cand.status.charAt(0).toUpperCase() + cand.status.slice(1);
            uiHtml += `<p style="margin-top: 20px; text-align: center; color: var(--text-muted);">Current Status: <strong>${displayStatus}</strong></p>`;
        }

        hiringCardContainer.innerHTML = uiHtml;

        document.getElementById('btnScheduleNow')?.addEventListener('click', () => { window.location.href = `../interviews/interviews.html`; });
        document.getElementById('btnInterviewYes')?.addEventListener('click', () => { updateBackendStatus('interview completed', 'btnInterviewYes'); });
        document.getElementById('btnInterviewNo')?.addEventListener('click', () => { updateBackendStatus('approved', 'btnInterviewNo'); });
    };

    const updateBackendStatus = async (newStatus, btnId) => {
        const btn = document.getElementById(btnId);
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

        try {
            const response = await fetch(`${BASE_URL}/api/update_candidate_status/${candidateId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showToast(`Status updated to "${newStatus}" successfully!`);
                setTimeout(() => location.reload(), 1000);
            } else {
                alert('Failed to update status');
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        } catch (err) {
            console.error(err);
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    };

    // ==========================================
    // PAYMENT SUMMARY UI
    // ==========================================
    const renderPaymentSummaryUI = () => {
        const remaining = currentFeeState.total - currentFeeState.paid;
        const percent   = currentFeeState.total > 0 ? ((currentFeeState.paid / currentFeeState.total) * 100).toFixed(0) : 0;
        const summaryBox = document.getElementById('paymentSummaryBox');
        if (!summaryBox) return;

        summaryBox.innerHTML = `
            <div class="payment-summary">
                <div class="edit-fee-wrap">
                    Total Fee: ₹<span id="feeDisplay">${currentFeeState.total}</span>
                    <input type="number" id="feeInput" value="${currentFeeState.total}" class="form-control" style="display:none; width:100px; padding:6px 10px; margin-left:5px;">
                    <button class="edit-fee-btn" id="editFeeBtn"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button id="saveFeeBtn" class="btn btn-primary btn-sm" style="display:none; margin-left:10px;">Save</button>
                </div>
                <span style="color: var(--primary);">Paid: ₹${currentFeeState.paid}</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.9rem; color:var(--text-muted);">
                <span>${percent}% Completed</span>
                <span style="color:var(--danger); font-weight:500;">Balance: ₹${remaining}</span>
            </div>
        `;

        // SHOW OFFER SECTION ONLY IF STATUS IS EXACTLY 'interview completed'
        const offerSection = document.getElementById('sendOfferSection');
        if (offerSection) {
            offerSection.style.display = (currentCandidateStatus === 'interview completed') ? 'block' : 'none';
        }

        // Edit Fee Logic
        const editBtn = document.getElementById('editFeeBtn');
        const saveBtn = document.getElementById('saveFeeBtn');
        const display = document.getElementById('feeDisplay');
        const input   = document.getElementById('feeInput');

        if (editBtn && saveBtn && display && input) {
            editBtn.addEventListener('click', () => {
                display.style.display = 'none';
                editBtn.style.display = 'none';
                input.style.display   = 'inline-block';
                saveBtn.style.display = 'inline-block';
                input.focus();
            });

            saveBtn.addEventListener('click', async () => {
                const newFee = parseInt(input.value);
                if (!newFee || newFee <= 0 || newFee < currentFeeState.paid) {
                    alert('Invalid fee. Cannot be less than what is already paid.');
                    return;
                }

                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = 'Saving...';
                saveBtn.disabled = true;

                try {
                    const response = await fetch(`${BASE_URL}/api/employee-fee/${candidateId}/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: newFee })
                    });
                    if (response.ok) {
                        currentFeeState.total = newFee;
                        showToast(`Fee updated to ₹${newFee}.`);
                        renderPaymentSummaryUI();
                    } else {
                        alert('Failed to update fee.');
                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                    }
                } catch (error) {
                    console.error(error);
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            });
        }
    };

    // ==========================================
    // ADD PAYMENT MODAL
    // ==========================================
    const paymentUpdateModal  = document.getElementById('paymentUpdateModal');
    const openPaymentModalBtn = document.getElementById('openPaymentModalBtn');
    const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
    const paymentScreenshotFile = document.getElementById('paymentScreenshotFile');
    const paymentDisplaySpan = document.getElementById('paymentFileNameDisplay');
    const savePaymentUpdateBtn  = document.getElementById('savePaymentUpdateBtn');

    if (paymentUpdateModal && openPaymentModalBtn && closePaymentModalBtn) {
        openPaymentModalBtn.addEventListener('click',  () => paymentUpdateModal.style.display = 'flex');
        closePaymentModalBtn.addEventListener('click', () => paymentUpdateModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === paymentUpdateModal) paymentUpdateModal.style.display = 'none';
        });
    }

    if (paymentScreenshotFile && paymentDisplaySpan) {
        paymentScreenshotFile.addEventListener('change', function(e) {
            paymentDisplaySpan.textContent = e.target.files[0] ? e.target.files[0].name : "Select Image";
        });
    }

    if (savePaymentUpdateBtn) {
        savePaymentUpdateBtn.addEventListener('click', async () => {
            const amountInput  = document.getElementById('updatePaidAmount').value;
            const bankNameInput = document.getElementById('updateBankName').value;
            const addedAmount  = parseInt(amountInput);

            if (!addedAmount || addedAmount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            const formData = new FormData();
            formData.append('amount', addedAmount);
            formData.append('bank_name', bankNameInput);
            if (paymentScreenshotFile.files.length > 0) {
                formData.append('screenshot', paymentScreenshotFile.files[0]);
            }

            const originalBtnText = savePaymentUpdateBtn.innerHTML;
            savePaymentUpdateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            savePaymentUpdateBtn.disabled = true;

            try {
                const response = await fetch(`${BASE_URL}/api/add_payment/${candidateId}/`, { method: 'POST', body: formData });
                if (response.ok) {
                    showToast(`₹${addedAmount} payment recorded! Reloading...`);
                    setTimeout(() => location.reload(), 1500);
                } else {
                    alert('Error saving payment.');
                }
            } catch (error) {
                console.error(error);
            } finally {
                savePaymentUpdateBtn.innerHTML = originalBtnText;
                savePaymentUpdateBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // UPLOAD & SEND OFFER LETTER
    // ==========================================
    
    // File Name Update
    const offerLetterFile = document.getElementById('offerLetterFile');
    const offerFileNameDisplay = document.getElementById('offerFileNameDisplay');
    
    if (offerLetterFile && offerFileNameDisplay) {
        offerLetterFile.addEventListener('change', function(e) {
            offerFileNameDisplay.textContent = e.target.files[0] ? e.target.files[0].name : "Select PDF File";
        });
    }

    const btnSendOffer = document.getElementById('btnSendOffer');
    if (btnSendOffer) {
        btnSendOffer.addEventListener('click', async () => {
            
            const position = document.getElementById('offerPosition')?.value || '';
            const salary   = document.getElementById('offerSalary')?.value || '';
            const doj      = document.getElementById('offerDateOfJoining')?.value || '';

            if (!offerLetterFile || offerLetterFile.files.length === 0) {
                alert("Please upload the Offer Letter PDF before sending.");
                return;
            }

            const formData = new FormData();
            formData.append('offer_letter', offerLetterFile.files[0]);
            formData.append('position', position);
            formData.append('salary', salary);
            if (doj) formData.append('date_of_joining', doj);

            const originalText = btnSendOffer.innerHTML;
            btnSendOffer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
            btnSendOffer.disabled = true;

            try {
                const response = await fetch(`${BASE_URL}/api/upload_offer/${candidateId}/`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    showToast("Offer Letter uploaded and sent successfully!");
                    
                    const offerSection = document.getElementById('sendOfferSection');
                    if(offerSection) {
                        offerSection.innerHTML = `
                            <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #a7f3d0;">
                                <i class="fa-solid fa-file-circle-check" style="font-size: 2.5rem; color: #10b981; margin-bottom: 10px;"></i>
                                <h4 style="color: #065f46; margin-bottom: 15px;">Offer Letter Released</h4>
                                <button class="btn btn-secondary" onclick="window.open('${BASE_URL}${data.pdf_url}', '_blank')">
                                    <i class="fa-solid fa-eye"></i> View Uploaded Offer
                                </button>
                            </div>
                        `;
                    }
                    setTimeout(() => location.reload(), 2000);
                } else {
                    const errorData = await response.json();
                    alert(`Failed to upload offer: ${errorData.error || 'Server error'}`);
                    btnSendOffer.innerHTML = originalText;
                    btnSendOffer.disabled = false;
                }
            } catch (error) {
                console.error("Offer Upload Error:", error);
                alert("Network error. Could not upload the offer letter.");
                btnSendOffer.innerHTML = originalText;
                btnSendOffer.disabled = false;
            }
        });
    }

    // Start fetching
    fetchCandidateProfile();
}

// ==========================================
// GLOBAL IMAGE PREVIEW MODAL
// ==========================================
window.openModal = function(src) {
    const modal    = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src        = src;
    }
};

const closeModalBtn = document.getElementById('modalClose');
const imageModal    = document.getElementById('imageModal');
if (closeModalBtn && imageModal) {
    closeModalBtn.addEventListener('click', () => imageModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === imageModal) imageModal.style.display = 'none';
    });
}