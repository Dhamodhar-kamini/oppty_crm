
document.addEventListener("DOMContentLoaded", () => {
    const loaderWrapper = document.getElementById('oppty-page-loader');
    
    // Hide loader smoothly once the page is fully loaded
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            setTimeout(() => {
                loaderWrapper.classList.add('hidden');
            }, 800); // Slight delay to ensure the bounce animation cycles elegantly
        }
    });

    // Re-trigger loader on internal page navigation
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // Check if it's a valid internal link (not a # anchor or new tab)
            if (href && href !== '#' && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript')) {
                if (loaderWrapper) {
                    loaderWrapper.classList.remove('hidden');
                }
            }
        });
    });
});








let candidatesData = [
    { id: 1, name: "Rahul Sharma", email: "rahul.s@example.com", mobile: "+91 9876543210", experience: "3 Years", status: "Pending", totalAmount: 5000, paidAmount: 0, joinDate: "2023-10-15" },
    { id: 2, name: "Priya Desai", email: "priya.d@example.com", mobile: "+91 8765432109", experience: "5 Years", status: "Completed", totalAmount: 8000, paidAmount: 8000, joinDate: "2023-10-22" },
    { id: 3, name: "Amit Kumar", email: "amit.k@example.com", mobile: "+91 7654321098", experience: "Fresher", status: "Completed", totalAmount: 3000, paidAmount: 1500, joinDate: "2023-11-05" }
];

// Reusable Utilities
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
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

const getPaymentBadge = (paid, total) => {
    if (paid === 0) return `<span class="badge pending">Pending</span>`;
    if (paid < total) return `<span class="badge partial">Partial</span>`;
    return `<span class="badge paid">Fully Paid</span>`;
}
const getInterviewBadge = (status) => {
    return status === 'Completed' ? `<span class="badge completed">Completed</span>` : `<span class="badge pending">Pending</span>`;
}
const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Sidebar Mobile Functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
}
if (sidebarClose) {
    sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));
}

// --- LOGIC FOR CANDIDATES PAGE (index.html) ---
if (document.getElementById('candidatesBody')) {
    const tbody = document.getElementById('candidatesBody');
    const searchInput = document.getElementById('candidatesSearch');
    const monthFilter = document.getElementById('candidateMonthFilter');
    const clearBtn = document.getElementById('clearFiltersBtn');
    
    // Define the generic render function
    const renderTable = (data) => {
        tbody.innerHTML = '';
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px;">No candidates found matching the criteria</td></tr>';
            return;
        }
        data.forEach(cand => {
            // Format the Join Date (e.g., Oct 15, 2023)
            const dateObj = new Date(cand.joinDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${getInitials(cand.name)}</div>
                        <div><strong>${cand.name}</strong><br><small style="color:var(--text-muted)">${cand.email}</small></div>
                    </div>
                </td>
                <td>${cand.mobile}</td>
                <td>
                    <div>${cand.experience}</div>
                    <small style="color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> Joined: ${formattedDate}</small>
                </td>
                <td>${getInterviewBadge(cand.status)}</td>
                <td>${getPaymentBadge(cand.paidAmount, cand.totalAmount)}</td>
                <td><a href="candidate-details.html?id=${cand.id}" class="btn btn-secondary btn-sm">View Profile</a></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Unified Filtering Function (Handles both Search and Month Filter)
    const applyFilters = () => {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const monthTerm = monthFilter ? monthFilter.value : ''; // Returns format "YYYY-MM"

        const filteredData = candidatesData.filter(cand => {
            // Check text match
            const matchesSearch = cand.name.toLowerCase().includes(searchTerm) ||
                                  cand.email.toLowerCase().includes(searchTerm) ||
                                  cand.experience.toLowerCase().includes(searchTerm);
            
            // Check month match (if month filter is used, does the joinDate start with "YYYY-MM"?)
            const matchesMonth = monthTerm === '' || cand.joinDate.startsWith(monthTerm);

            return matchesSearch && matchesMonth;
        });

        renderTable(filteredData);
    };

    // Event Listeners for Filters
    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(monthFilter) monthFilter.addEventListener('change', applyFilters);
    
    if(clearBtn) {
        clearBtn.addEventListener('click', () => {
            if(searchInput) searchInput.value = '';
            if(monthFilter) monthFilter.value = '';
            applyFilters(); // Reset the table
        });
    }

    // Initial render on page load
    renderTable(candidatesData);

    // Dynamic Search & Filter Logic
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filteredData = candidatesData.filter(cand => 
                cand.name.toLowerCase().includes(term) ||
                cand.email.toLowerCase().includes(term) ||
                cand.experience.toLowerCase().includes(term)
            );
            renderTable(filteredData);
        });
    }

    // "Add Candidate" Button placeholder action
    const addCandBtn = document.getElementById('addCandidateBtn');
    if(addCandBtn) {
        addCandBtn.addEventListener('click', () => {
            showToast('Opening Add Candidate Form Modal...');
            // In real app, open modal or navigate
        });
    }
}

// --- LOGIC FOR CANDIDATE DETAILS PAGE (candidate-details.html) ---
if (document.getElementById('profileBannerInfo')) {
    const urlParams = new URLSearchParams(window.location.search);
    const candidateId = parseInt(urlParams.get('id')) || 1;
    const candidate = candidatesData.find(c => c.id === candidateId);
    
    if(candidate) {
        // 1. Populate Profile Banner
        document.getElementById('profileBannerInfo').innerHTML = `
            <div class="user-avatar" style="width:70px;height:70px;font-size:1.6rem;border-radius:18px;">${getInitials(candidate.name)}</div>
            <div>
                <h2>${candidate.name}</h2>
                <p><i class="fa-solid fa-envelope"></i> ${candidate.email} &nbsp; | &nbsp; <i class="fa-solid fa-phone"></i> ${candidate.mobile}</p>
            </div>
        `;
        
        // Populate Email Input for Hiring Status
        const candEmailInput = document.getElementById('candEmail');
        if(candEmailInput) candEmailInput.value = candidate.email;

        // --- PAYMENT & EDIT FEE LOGIC ---
        const renderPaymentDetails = () => {
            const remaining = candidate.totalAmount - candidate.paidAmount;
            const percent = candidate.totalAmount > 0 ? ((candidate.paidAmount / candidate.totalAmount) * 100).toFixed(0) : 0;

            document.getElementById('paymentSummaryBox').innerHTML = `
                <div class="payment-summary">
                    <div class="edit-fee-wrap">
                        Total Fee: ₹<span id="feeDisplay">${candidate.totalAmount}</span>
                        <input type="number" id="feeInput" value="${candidate.totalAmount}" class="form-control">
                        <button class="edit-fee-btn" id="editFeeBtn"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button id="saveFeeBtn">Save</button>
                    </div>
                    <span style="color: var(--primary);">Paid: ₹${candidate.paidAmount}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted);">
                    <span>${percent}% Completed</span>
                    <span style="color: var(--danger); font-weight: 500;">Balance: ₹${remaining}</span>
                </div>
            `;

            // Attach Edit Fee Handlers
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
                    if(!newFee || newFee <= 0 || newFee < candidate.paidAmount) {
                        alert('Please enter a valid fee amount that is at least equal to the paid amount.');
                        return;
                    }
                    candidate.totalAmount = newFee; // Update dummy data
                    showToast(`Total Fee updated to ₹${newFee}. Recalculating progress.`);
                    renderPaymentDetails(); // Re-render this section
                    renderSendOfferSection(); // Re-check visibility of Send Offer section
                });
            }
        };

        // --- SEND OFFER SECTION LOGIC ---
        const renderSendOfferSection = () => {
            const offerSection = document.getElementById('sendOfferSection');
            if(!offerSection) return;

            if(candidate.paidAmount >= candidate.totalAmount) {
                offerSection.style.display = 'block';
            } else {
                offerSection.style.display = 'none';
            }
        };

        // Initialize detailed sections
        renderPaymentDetails();
        renderSendOfferSection();

        // Hiring Status UI Toggling
        const statusSelect = document.getElementById('interviewStatusSelect');
        const scheduleSection = document.getElementById('scheduleSection');
        const emailSection = document.getElementById('emailSection');

        if(statusSelect) {
            statusSelect.value = candidate.status;
            const toggleHiringViews = (status) => {
                if (status === 'Completed') {
                    scheduleSection.style.display = 'none';
                    emailSection.style.display = 'block';
                } else {
                    scheduleSection.style.display = 'block';
                    emailSection.style.display = 'none';
                }
            }
            toggleHiringViews(candidate.status);
            statusSelect.addEventListener('change', (e) => toggleHiringViews(e.target.value));
        }

        // --- IMAGE PREVIEW MODAL LOGIC ---
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');
        const closeModal = document.getElementById('modalClose');

        if(modal && modalImg && closeModal) {
            window.openModal = (src) => {
                modal.style.display = 'flex';
                modalImg.src = src;
            }
            closeModal.addEventListener('click', () => modal.style.display = 'none');
            window.addEventListener('click', (e) => {
                if(e.target == modal) modal.style.display = 'none';
            });
        }
    }
}


// Profile Dropdown Logic
const profileBtn = document.getElementById('profileDropdownBtn');
const profileMenu = document.getElementById('profileDropdown');

if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        profileMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', () => {
        if (profileMenu.classList.contains('show')) {
            profileMenu.classList.remove('show');
        }
    });
}

// Global Logout Function
window.logoutAdmin = function() {
    showToast('Logging out... Redirecting to login.', 'success');
    // In a real app: setTimeout(() => window.location.href = 'login.html', 1500);
}

// Global Image Modal Setup (Ensuring it runs globally for Payments Page)
if (!window.openModal) {
    window.openModal = function(src) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');
        if (modal && modalImg) {
            modal.style.display = 'flex';
            modalImg.src = src;
        }
    }
}

// --- NEW INTERVIEW MODAL LOGIC ---
// ==========================================
// INTERVIEW MODAL & MEETING LINKS UNIFIED LOGIC
// ==========================================

// 1. Get Modal Elements
const interviewModal = document.getElementById('newInterviewModal');
const openInterviewBtn = document.getElementById('openInterviewModalBtn');
const closeInterviewBtn = document.getElementById('closeInterviewModalBtn');
const saveInterviewBtn = document.getElementById('saveInterviewBtn');

// 2. Get Meeting Link Elements
const savedLinksDropdown = document.getElementById('savedLinksDropdown');
const toggleAddLinkBtn = document.getElementById('toggleAddLinkBtn');
const addNewLinkContainer = document.getElementById('addNewLinkContainer');
const saveNewLinkBtn = document.getElementById('saveNewLinkBtn');
const newLinkLabel = document.getElementById('newLinkLabel');
const newLinkUrl = document.getElementById('newLinkUrl');

// 3. Default links
const defaultLinks = [
    { label: "Technical Room (General)", url: "meet.google.com/abc-defg-hij" },
    { label: "HR Interview Room", url: "meet.google.com/xyz-uvwx-abc" }
];

// --- FUNCTION: Load & Display Links ---
function loadMeetingLinks() {
    if (!savedLinksDropdown) return;
    
    let links = JSON.parse(localStorage.getItem('hr_meeting_links'));
    if (!links) {
        links = defaultLinks;
        localStorage.setItem('hr_meeting_links', JSON.stringify(links));
    }
    
    savedLinksDropdown.innerHTML = '<option value="">-- Select a Link --</option>';
    links.forEach((link) => {
        const option = document.createElement('option');
        option.value = link.url;
        option.textContent = `${link.label} (${link.url})`;
        savedLinksDropdown.appendChild(option);
    });
}

// Call immediately on page load
if (savedLinksDropdown) {
    loadMeetingLinks();
}

// --- LOGIC: Open & Close Modal ---
if (openInterviewBtn && interviewModal) {
    // Open the modal
    openInterviewBtn.addEventListener('click', () => {
        interviewModal.style.display = 'flex';
        loadMeetingLinks(); // Refresh links just in case
    });
}

if (closeInterviewBtn && interviewModal) {
    // Close the modal via 'X'
    closeInterviewBtn.addEventListener('click', () => {
        interviewModal.style.display = 'none';
    });
}

// Close the modal when clicking outside the white box
window.addEventListener('click', (e) => {
    if (e.target === interviewModal) {
        interviewModal.style.display = 'none';
    }
});

// --- LOGIC: Add New Meeting Link ---
if (toggleAddLinkBtn && addNewLinkContainer) {
    toggleAddLinkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = addNewLinkContainer.style.display === 'none' || addNewLinkContainer.style.display === '';
        addNewLinkContainer.style.display = isHidden ? 'block' : 'none';
        toggleAddLinkBtn.textContent = isHidden ? '- Cancel' : '+ Add New Link';
    });
}

if (saveNewLinkBtn) {
    saveNewLinkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const label = newLinkLabel.value.trim();
        const url = newLinkUrl.value.trim();

        if (!label || !url) {
            alert("Please provide both a label and a URL.");
            return;
        }

        const links = JSON.parse(localStorage.getItem('hr_meeting_links')) || [];
        links.push({ label, url });
        localStorage.setItem('hr_meeting_links', JSON.stringify(links));

        // Reset inputs and refresh dropdown
        newLinkLabel.value = '';
        newLinkUrl.value = '';
        addNewLinkContainer.style.display = 'none';
        toggleAddLinkBtn.textContent = '+ Add New Link';
        loadMeetingLinks();
        
        if (typeof showToast === 'function') {
            showToast('Meeting link saved to your list!', 'success');
        } else {
            alert('Meeting link saved to your list!');
        }
    });
}

// --- LOGIC: Save Interview Button ---
if (saveInterviewBtn) {
    saveInterviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (interviewModal) interviewModal.style.display = 'none';
        
        if (typeof showToast === 'function') {
            showToast('Interview Successfully Scheduled!', 'success');
        } else {
            alert('Interview Successfully Scheduled!');
        }
    });
}



// ==========================================
// PAYMENT UPDATE MODAL LOGIC (UPDATED)
// ==========================================

const paymentUpdateModal = document.getElementById('paymentUpdateModal');
const openPaymentModalBtn = document.getElementById('openPaymentModalBtn');
const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
const savePaymentUpdateBtn = document.getElementById('savePaymentUpdateBtn');
const paymentScreenshotFile = document.getElementById('paymentScreenshotFile');

if (paymentUpdateModal && openPaymentModalBtn && closePaymentModalBtn) {
    // Open Modal
    openPaymentModalBtn.addEventListener('click', () => {
        paymentUpdateModal.style.display = 'flex';
    });

    // Close Modal via 'X' button
    closePaymentModalBtn.addEventListener('click', () => {
        paymentUpdateModal.style.display = 'none';
    });

    // Close Modal when clicking outside the box
    window.addEventListener('click', (e) => {
        if (e.target === paymentUpdateModal) {
            paymentUpdateModal.style.display = 'none';
        }
    });
}

// Show selected file name on the upload button label
if (paymentScreenshotFile) {
    paymentScreenshotFile.addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Select Image";
        const label = this.previousElementSibling;
        if (label) {
            label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> ${fileName}`;
        }
    });
}

// Handle Save Button Click (Update Data & UI)
if (savePaymentUpdateBtn) {
    savePaymentUpdateBtn.addEventListener('click', () => {
        const paidAmountInput = document.getElementById('updatePaidAmount').value;
        const bankName = document.getElementById('updateBankName').value;
        const paymentDate = document.getElementById('updatePaymentDate').value;
        
        const addedAmount = parseInt(paidAmountInput);

        // Validation
        if (!addedAmount || addedAmount <= 0) {
            alert('Please enter a valid paid amount.');
            return;
        }

        // 1. Get Current Candidate Context
        const urlParams = new URLSearchParams(window.location.search);
        const candidateId = parseInt(urlParams.get('id')) || 1;
        const candidate = candidatesData.find(c => c.id === candidateId);

        if (candidate) {
            // Add new payment to total paid
            candidate.paidAmount += addedAmount;
            
            // Prevent paying more than the total fee
            if (candidate.paidAmount > candidate.totalAmount) {
                candidate.paidAmount = candidate.totalAmount;
            }

            // Recalculate Math
            const remaining = candidate.totalAmount - candidate.paidAmount;
            const percent = candidate.totalAmount > 0 ? ((candidate.paidAmount / candidate.totalAmount) * 100).toFixed(0) : 0;

            // Update UI dynamically
            const paymentSummaryBox = document.getElementById('paymentSummaryBox');
            if (paymentSummaryBox) {
                paymentSummaryBox.innerHTML = `
                    <div class="payment-summary">
                        <div class="edit-fee-wrap">
                            Total Fee: ₹<span id="feeDisplay">${candidate.totalAmount}</span>
                            <input type="number" id="feeInput" value="${candidate.totalAmount}" class="form-control" style="display:none; width: 100px; padding: 6px 10px; margin-left: 5px;">
                            <button class="edit-fee-btn" id="editFeeBtn"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button id="saveFeeBtn" class="btn btn-primary btn-sm" style="display:none; margin-left: 10px;">Save</button>
                        </div>
                        <span style="color: var(--primary);">Paid: ₹${candidate.paidAmount}</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${percent}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted);">
                        <span>${percent}% Completed</span>
                        <span style="color: var(--danger); font-weight: 500;">Balance: ₹${remaining}</span>
                    </div>
                `;

                // Re-attach edit fee button logic after UI update
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
                        if(!newFee || newFee <= 0 || newFee < candidate.paidAmount) {
                            alert('Invalid fee amount. It must be greater than the paid amount.');
                            return;
                        }
                        candidate.totalAmount = newFee; 
                        showToast(`Total Fee updated to ₹${newFee}.`);
                        // Re-trigger the logic to reset the UI
                        document.getElementById('savePaymentUpdateBtn').click(); 
                    });
                }
            }

            // Show Offer Section automatically if fully paid
            const offerSection = document.getElementById('sendOfferSection');
            if (offerSection && candidate.paidAmount >= candidate.totalAmount) {
                offerSection.style.display = 'block';
            }
        }

        // 2. Handle Image Upload & Add to Gallery
        const screenshotGallery = document.querySelector('.screenshot-gallery');
        if (paymentScreenshotFile && paymentScreenshotFile.files && paymentScreenshotFile.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newImg = document.createElement('img');
                newImg.src = e.target.result; // Convert uploaded file to base64 image URL
                newImg.alt = "Uploaded Receipt";
                newImg.onclick = function() { openModal(this.src); }; // Retain modal popup functionality
                if (screenshotGallery) {
                    screenshotGallery.appendChild(newImg);
                }
            };
            reader.readAsDataURL(paymentScreenshotFile.files[0]);
        }

        // 3. Reset Modal Fields and Close
        if (paymentUpdateModal) paymentUpdateModal.style.display = 'none';
        
        document.getElementById('updatePaidAmount').value = '';
        document.getElementById('updateBankName').value = '';
        document.getElementById('updatePaymentDate').value = '';
        
        if (paymentScreenshotFile) {
            paymentScreenshotFile.value = '';
            paymentScreenshotFile.previousElementSibling.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Select Image`;
        }

        if (typeof showToast === 'function') {
            showToast(`Added ₹${addedAmount} to candidate payment!`, 'success');
        } else {
            alert(`Added ₹${addedAmount} to candidate payment!`);
        }
    });
}



// ==========================================
// EXPENSES PAGE, FILTER, & MODAL LOGIC
// ==========================================

const addExpenseModal = document.getElementById('addExpenseModal');
const openExpenseModalBtn = document.getElementById('openExpenseModalBtn');
const closeExpenseModalBtn = document.getElementById('closeExpenseModalBtn');
const saveExpenseBtn = document.getElementById('saveExpenseBtn');
const expenseReceiptFile = document.getElementById('expenseReceiptFile');
const expensesTableBody = document.getElementById('expensesTableBody');
const expenseMonthFilter = document.getElementById('expenseMonthFilter');

// Default initial expenses data
const defaultExpenses = [
    { id: 1, date: "2023-10-28", category: "Software Tools", desc: "AWS Hosting Renewal", amount: 8500, receipt: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" },
    { id: 2, date: "2023-10-25", category: "Office Supplies", desc: "New monitors and keyboards", amount: 12500, receipt: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&q=80" },
    { id: 3, date: "2023-10-20", category: "Marketing", desc: "LinkedIn Job Ads", amount: 24200, receipt: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" }
];

// Helper: Format Date from YYYY-MM-DD to Oct 28, 2023
function formatExpenseDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Render Expenses Table & Update Totals based on Calendar Filter
function renderExpenses() {
    if (!expensesTableBody) return;

    let expenses = JSON.parse(localStorage.getItem('hr_expenses'));
    if (!expenses || expenses.length === 0) {
        expenses = defaultExpenses;
        localStorage.setItem('hr_expenses', JSON.stringify(expenses));
    }

    // Determine the month and year to filter by
    let filterYear, filterMonthIndex;
    if (expenseMonthFilter && expenseMonthFilter.value) {
        const parts = expenseMonthFilter.value.split('-');
        filterYear = parseInt(parts[0]);
        filterMonthIndex = parseInt(parts[1]) - 1; // 0-indexed for JS Date
    } else {
        const d = new Date();
        filterYear = d.getFullYear();
        filterMonthIndex = d.getMonth();
    }

    expensesTableBody.innerHTML = '';
    let allTimeTotal = 0;
    let filteredMonthlyTotal = 0;

    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(exp => {
        allTimeTotal += exp.amount; // All time total always calculates
        
        const expDate = new Date(exp.date);
        const isMatch = (expDate.getMonth() === filterMonthIndex && expDate.getFullYear() === filterYear);
        
        // Only render the row if it matches the selected month
        if (isMatch) {
            filteredMonthlyTotal += exp.amount;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatExpenseDate(exp.date)}</td>
                <td><strong>${exp.category}</strong></td>
                <td><span style="color: var(--text-muted);">${exp.desc}</span></td>
                <td>₹${exp.amount.toLocaleString('en-IN')}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="openModal('${exp.receipt}')"><i class="fa-solid fa-eye"></i> View</button></td>
            `;
            expensesTableBody.appendChild(tr); 
        }
    });

    // Handle empty state for the selected month
    if (filteredMonthlyTotal === 0 && expensesTableBody.children.length === 0) {
        expensesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px;">No expenses found for this month.</td></tr>';
    }

    // Update Summary Cards dynamically
    const monthEl = document.getElementById('monthlyExpensesTotal');
    const allTimeEl = document.getElementById('allTimeExpensesTotal');
    const monthLabelEl = document.getElementById('monthlyExpensesLabel');
    
    if (monthEl) monthEl.textContent = `₹${filteredMonthlyTotal.toLocaleString('en-IN')}`;
    if (allTimeEl) allTimeEl.textContent = `₹${allTimeTotal.toLocaleString('en-IN')}`;
    
    if (monthLabelEl) {
         const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
         monthLabelEl.textContent = `Total Expenses (${monthNames[filterMonthIndex]} ${filterYear})`;
    }
}

// Set default value for month filter to CURRENT month and render
if (expensesTableBody) {
    if (expenseMonthFilter && !expenseMonthFilter.value) {
        const today = new Date();
        const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        expenseMonthFilter.value = currentMonthString;
    }
    
    // Initial Render
    renderExpenses();
    
    // Re-render when admin changes the month
    if (expenseMonthFilter) {
        expenseMonthFilter.addEventListener('change', renderExpenses);
    }
}

// --- MODAL TOGGLES ---
if (addExpenseModal && openExpenseModalBtn && closeExpenseModalBtn) {
    openExpenseModalBtn.addEventListener('click', () => addExpenseModal.style.display = 'flex');
    closeExpenseModalBtn.addEventListener('click', () => addExpenseModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === addExpenseModal) addExpenseModal.style.display = 'none';
    });
}

// --- FILE UPLOAD NAME DISPLAY ---
if (expenseReceiptFile) {
    expenseReceiptFile.addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Select Image/PDF";
        const label = this.previousElementSibling;
        if (label) label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> ${fileName}`;
    });
}

// --- SUBMIT NEW EXPENSE ---
if (saveExpenseBtn) {
    saveExpenseBtn.addEventListener('click', () => {
        const amount = document.getElementById('expenseAmount').value;
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value.trim();
        const desc = document.getElementById('expenseDescription').value.trim();

        if (!amount || !category || !date) {
            alert('Please fill out the Amount, Date, and Category.');
            return;
        }

        const handleSave = (receiptDataUrl) => {
            let expenses = JSON.parse(localStorage.getItem('hr_expenses')) || [];
            expenses.push({
                id: Date.now(),
                date: date,
                category: category,
                desc: desc || "No description",
                amount: parseFloat(amount),
                receipt: receiptDataUrl
            });
            
            localStorage.setItem('hr_expenses', JSON.stringify(expenses));
            
            // Set the calendar filter to the month of the newly added expense
            const newExpDate = new Date(date);
            if (expenseMonthFilter) {
                expenseMonthFilter.value = `${newExpDate.getFullYear()}-${String(newExpDate.getMonth() + 1).padStart(2, '0')}`;
            }

            // Re-render table and cards dynamically
            renderExpenses();

            // Reset Modal
            addExpenseModal.style.display = 'none';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseCategory').value = '';
            document.getElementById('expenseDate').value = '';
            document.getElementById('expenseDescription').value = '';
            
            if (expenseReceiptFile) {
                expenseReceiptFile.value = '';
                expenseReceiptFile.previousElementSibling.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Select Image/PDF`;
            }

            if (typeof showToast === 'function') {
                showToast('Expense recorded successfully!', 'success');
            } else {
                alert('Expense recorded successfully!');
            }
        };

        // If file is uploaded, convert to Base64 to save and display instantly
        if (expenseReceiptFile && expenseReceiptFile.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                handleSave(e.target.result);
            };
            reader.readAsDataURL(expenseReceiptFile.files[0]);
        } else {
            // Default placeholder image if no receipt is uploaded
            handleSave("https://placehold.co/600x400/eeeeee/ff6b00?text=No+Receipt+Uploaded");
        }
    });
}



