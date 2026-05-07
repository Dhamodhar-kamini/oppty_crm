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
// Assuming BASE_URL and candidateId are already defined in your file
// const BASE_URL = 'http://127.0.0.1:8000';
// const candidateId = ...;

const btnYes = document.getElementById('btnInterviewYes');
const btnNo = document.getElementById('btnInterviewNo');

// Handle the "Yes" Button Click
if (btnYes) {
    btnYes.addEventListener('click', async () => {
        try {
            // Disable button to prevent multiple clicks
            btnYes.disabled = true;
            btnYes.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

            const response = await fetch(`${BASE_URL}/api/update_candidate_status/${candidateId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'yes' }) // Sending "yes" as the status
            });

            if (response.ok) {
                showToast("Interview status updated to Yes!");
                // Reload the page after 1 second to show the updated UI
                setTimeout(() => location.reload(), 1000);
            } else {
                alert("Failed to update status on the server.");
                btnYes.disabled = false;
                btnYes.innerHTML = '<i class="fa-solid fa-check"></i> Yes';
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Network error. Could not connect to the server.");
        }
    });
}

// Handle the "No" Button Click (Optional, for completeness)
if (btnNo) {
    btnNo.addEventListener('click', async () => {
        try {
            btnNo.disabled = true;
            btnNo.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

            const response = await fetch(`${BASE_URL}/api/update_candidate_status/${candidateId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'no' }) // Sending "no" as the status
            });

            if (response.ok) {
                showToast("Interview status updated to No.");
                setTimeout(() => location.reload(), 1000);
            } else {
                alert("Failed to update status on the server.");
                btnNo.disabled = false;
                btnNo.innerHTML = '<i class="fa-solid fa-xmark"></i> No';
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    });
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
    let currentFeeState = { total: 0, paid: 0, balance: 0 }; 

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
        const cand = data.name;
        const payments = data.payments || [];
        const status = cand.status; 
        
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

        // FETCH ALL FINANCIALS DIRECTLY FROM DATABASE
        currentFeeState.total = parseFloat(cand.fee) || 150000;
        currentFeeState.paid = parseFloat(cand.total_paid) || 0;
        currentFeeState.balance = parseFloat(cand.balance) || 0;
        
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

        // ==========================================
        // UPDATED: Hiring Actions Status Logic
        // ==========================================
        const oldStatusSelect = document.getElementById('interviewStatusSelect');
        const hiringCardContainer = oldStatusSelect ? oldStatusSelect.closest('.card') : document.querySelectorAll('.card')[1]; 

        if (hiringCardContainer) {
            const currentStatus = cand.status ? cand.status.toLowerCase().trim() : '';

            // Dynamically inject the UI based on status
            let uiHtml = `<h3><i class="fa-solid fa-user-check" style="color: var(--primary);"></i> Hiring Actions</h3>`;

            if (currentStatus === 'approved') {
                uiHtml += `
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" style="width: 100%;" id="btnScheduleNow">
                            <i class="fa-regular fa-calendar-check"></i> Schedule Interview
                        </button>
                    </div>
                `;
            } else if (currentStatus === 'interview sheduled' || currentStatus === 'interview scheduled') {
                uiHtml += `
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="margin-bottom: 20px; font-weight: 500;">Does the employee completed his interview?</p>
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
            } else if (currentStatus === 'interview completed') {
                uiHtml += `
                    <div style="text-align: center; margin-top: 20px;">
                        <div style="background: var(--bg-body); padding: 20px; border-radius: 12px;">
                            <i class="fa-solid fa-circle-check" style="color: #05cd99; font-size: 2.5rem; margin-bottom: 10px;"></i>
                            <p style="font-weight: 600; margin: 0;">Interview Process Finished</p>
                        </div>
                    </div>
                `;
            } else {
                uiHtml += `<p style="margin-top: 20px; text-align: center; color: var(--text-muted);">Current Status: ${cand.status}</p>`;
            }

            hiringCardContainer.innerHTML = uiHtml;

            // API Call function to update backend
            const updateBackendStatus = async (newStatus) => {
                try {
                    const response = await fetch(`${BASE_URL}/api/update_candidate_status/${candidateId}/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    if (response.ok) {
                        showToast(`Status updated successfully!`);
                        setTimeout(() => location.reload(), 1000); // Reload page to see the new UI
                    } else {
                        alert("Failed to update status on server.");
                    }
                } catch (err) {
                    console.error("Status update error:", err);
                }
            };

            // Attach listeners to whichever buttons were rendered
            document.getElementById('btnScheduleNow')?.addEventListener('click', () => {
    // Redirects to the interviews page and passes the candidate's ID in the URL
    window.location.href = `../interviews/interviews.html`;
});
            document.getElementById('btnInterviewYes')?.addEventListener('click', () => updateBackendStatus('interview completed'));
            document.getElementById('btnInterviewNo')?.addEventListener('click', () => updateBackendStatus('approved'));
        }
        // ==========================================
        // END OF HIRING ACTIONS LOGIC
        // ==========================================
    };

    // Render Payment Box & Progress Bar dynamically
    const renderPaymentSummaryUI = () => {
        // We now rely on the backend's balance calculation, unless we just updated it locally
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

            // --- API CONNECTION: UPDATE TOTAL FEE ---
            saveBtn.addEventListener('click', async () => {
                const newFee = parseInt(input.value);
                if(!newFee || newFee <= 0 || newFee < currentFeeState.paid) {
                    alert('Invalid fee amount. It cannot be less than what is already paid.');
                    return;
                }

                // Show loading state
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = 'Saving...';
                saveBtn.disabled = true;

                try {
                    const response = await fetch(`${BASE_URL}/api/employee-fee/${candidateId}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            amount: newFee 
                        })
                    });

                    if (response.ok) {
                        // Success: Update local state with the exact new fee and redraw
                        currentFeeState.total = newFee;
                        showToast(`Total Fee updated to ₹${newFee}.`);
                        renderPaymentSummaryUI();
                    } else {
                        alert('Failed to update the fee in the database. Please try again.');
                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                    }
                } catch (error) {
                    console.error("Error updating fee:", error);
                    alert('Network error. Could not connect to the server.');
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            });
        }
    };

    // --- 5. Add Payment API Connection ---
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

    // Save Payment to Database
    if (savePaymentUpdateBtn) {
        savePaymentUpdateBtn.addEventListener('click', async () => {
            const amountInput = document.getElementById('updatePaidAmount').value;
            const bankNameInput = document.getElementById('updateBankName').value;
            const fileInput = document.getElementById('paymentScreenshotFile');
            const addedAmount = parseInt(amountInput);

            if (!addedAmount || addedAmount <= 0) return alert('Please enter a valid amount.');

            // Prepare FormData to handle both text and the Image File
            const formData = new FormData();
            formData.append('amount', addedAmount);
            formData.append('bank_name', bankNameInput);
            
            if (fileInput.files.length > 0) {
                formData.append('screenshot', fileInput.files[0]);
            }

            // Show loading state
            const originalBtnText = savePaymentUpdateBtn.innerHTML;
            savePaymentUpdateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            savePaymentUpdateBtn.disabled = true;

            try {
                // Send POST request to Django
                const response = await fetch(`${BASE_URL}/api/add_payment/${candidateId}/`, {
                    method: 'POST',
                    // CRITICAL: Do NOT set 'Content-Type' headers when using FormData. 
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json();

                    // Update UI State locally (or re-fetch the entire profile to be safe)
                    currentFeeState.paid += addedAmount;
                    if (currentFeeState.paid > currentFeeState.total) currentFeeState.paid = currentFeeState.total;
                    
                    renderPaymentSummaryUI(); // Re-draw progress bar
                    
                    // Add the newly uploaded image directly to the gallery UI
                    if (responseData.payment && responseData.payment.screenshot) {
                        const gallery = document.querySelector('.screenshot-gallery');
                        if (gallery) {
                            if (gallery.innerHTML.includes('No payment proofs')) gallery.innerHTML = '';
                            
                            const imgPath = responseData.payment.screenshot.startsWith('/media/') 
                                ? `${BASE_URL}${responseData.payment.screenshot}` 
                                : `${BASE_URL}/media/${responseData.payment.screenshot}`;
                                
                            const img = document.createElement('img');
                            img.src = imgPath;
                            img.alt = `Receipt ₹${addedAmount}`;
                            img.onclick = function() { openModal(this.src); };
                            gallery.appendChild(img);
                        }
                    }

                    // Close and reset modal
                    paymentUpdateModal.style.display = 'none';
                    document.getElementById('updatePaidAmount').value = '';
                    document.getElementById('updateBankName').value = '';
                    document.getElementById('updatePaymentDate').value = '';
                    
                    if(fileInput) {
                        fileInput.value = '';
                        fileInput.previousElementSibling.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Select Image`;
                    }

                    showToast(`Added ₹${addedAmount} to database successfully!`);
                } else {
                    const errorData = await response.json();
                    alert(`Error saving payment: ${errorData.error}`);
                }
            } catch (error) {
                console.error("Payment API Error:", error);
                alert("Network error. Could not save payment.");
            } finally {
                // Reset button state
                savePaymentUpdateBtn.innerHTML = originalBtnText;
                savePaymentUpdateBtn.disabled = false;
            }
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