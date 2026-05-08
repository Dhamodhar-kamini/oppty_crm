const BASE_URL = 'https://hiring-api.theoppty.com';

// ==========================================
// 1. PAGE LOAD LOGIC (Database Fetch)
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    const emp_id = localStorage.getItem('id');

    if (!emp_id) {
        document.getElementById('mainLandingPage').style.display = 'block';
        document.getElementById('hiringDashboard').style.display = 'none';
        return;
    }

    // User is logged in - show dashboard immediately
    document.getElementById('mainLandingPage').style.display = 'none';
    document.getElementById('hiringDashboard').style.display = 'block';

    try {
        const response = await fetch(`${BASE_URL}/api/employee-by-user/${emp_id}/`);

        // 404 = Candidate_Form not submitted yet, show the form
        if (response.status === 404) {
            console.log("No form submitted yet. Showing hiring form.");
            restoreDashboardState("form pending", null);
            return;
        }

        if (!response.ok) {
            console.warn(`Server error ${response.status}. Defaulting to form pending.`);
            restoreDashboardState("form pending", null);
            return;
        }

        const dbData = await response.json();
        console.log("FULL API RESPONSE:", JSON.stringify(dbData));

        // Your API returns { name: { status: "..." }, payments: [...] }
        const rawStatus =
            dbData?.name?.status      ||   // YOUR ACTUAL STRUCTURE
            dbData?.status            ||
            dbData?.form_status       ||
            "form pending";

        console.log("Extracted Raw Status:", rawStatus);

        const safeStatus = rawStatus.toLowerCase().replace(/_/g, ' ').trim();
        console.log("Safe Status:", safeStatus);

        restoreDashboardState(safeStatus, dbData);

    } catch (error) {
        console.error("Network/Connection Error:", error);
        restoreDashboardState("form pending", null);
    }
});


// ==========================================
// HELPER - Show correct section based on status
// ==========================================
function restoreDashboardState(status, dbData) {
    console.log("Restoring dashboard with status:", status);

    // Hide all sections first
    document.getElementById('hiringForm').style.display        = 'none';
    document.getElementById('processingSection').style.display = 'none';
    document.getElementById('interviewSection').style.display  = 'none';

    // form_pending (default status in your model)
    if (
        status === "form pending"  ||
        status === "form_pending"  ||
        status === "pending"
    ) {
        document.getElementById('hiringForm').style.display = 'block';

    // form_submitted - show processing
    } else if (
        status === "form submitted" ||
        status === "form_submitted" ||
        status === "submitted"
    ) {
        document.getElementById('processingSection').style.display = 'block';
        document.querySelector('#processingSection h3').innerText  = "Profile Under Review";
        document.querySelector('#processingSection p').innerText   = "Our HR team is currently reviewing your skills, experience, and portfolio.";

    // approved - show processing
    } else if (status === "approved") {
        document.getElementById('processingSection').style.display = 'block';
        document.querySelector('#processingSection h3').innerText  = "Profile Approved! ✅";
        document.querySelector('#processingSection p').innerText   = "Congratulations! Your profile has been approved. We will contact you shortly for the next steps.";

    // interview sheduled (note: your DB has typo "sheduled")
    } else if (
        status.includes("interview") &&
        (status.includes("scheduled") || status.includes("sheduled"))
    ) {
        document.getElementById('interviewSection').style.display = 'block';

        const interviewData =
            dbData?.interview_details  ||
            dbData?.interview          ||
            null;

        if (interviewData) {
            const dateEl        = document.getElementById('empInterviewDate');
            const interviewerEl = document.getElementById('empInterviewer');
            const linkBtn       = document.getElementById('empInterviewLink');

            if (dateEl && interviewData.date) {
                dateEl.innerText = new Date(interviewData.date).toLocaleString();
            }
            if (interviewerEl && interviewData.interviewer) {
                interviewerEl.innerText = interviewData.interviewer;
            }
            if (linkBtn && interviewData.link) {
                linkBtn.href = interviewData.link;
                linkBtn.removeAttribute('onclick');
            }
        }

    // interview completed
    } else if (status.includes("interview completed")) {
        document.getElementById('processingSection').style.display = 'block';
        document.querySelector('#processingSection h3').innerText  = "Interview Completed! 🎯";
        document.querySelector('#processingSection p').innerText   = "HR is reviewing your interview. We will get back to you shortly.";

    // offer released
    } else if (status.includes("offer")) {
        document.getElementById('processingSection').style.display = 'block';
        document.querySelector('#processingSection h3').innerText  = "Offer Letter Released 🎉";
        document.querySelector('#processingSection p').innerText   = "Please check your email inbox to view and sign your official offer letter.";

    // Default fallback
    } else {
        document.getElementById('processingSection').style.display = 'block';
        document.querySelector('#processingSection h3').innerText  = "Processing Profile...";
        document.querySelector('#processingSection p').innerText   = "Our HR team is currently reviewing your skills, experience, and portfolio.";
    }
}


// ==========================================
// 2. MODAL & UI UTILITIES
// ==========================================
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 300);
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};


// ==========================================
// 3. AUTHENTICATION LOGIC
// ==========================================

// Candidate Sign Up
document.getElementById('create-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const data = {
        name:     document.getElementById('fullName').value,
        email:    document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch(`${BASE_URL}/api/createaccount/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert("Account created successfully!");
        switchModal('signupModal', 'signinModal');
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Something went wrong");
    });
});


// Candidate Sign In
function performSignIn(event) {
    event.preventDefault();

    const data = {
        email:    document.querySelector('#signinModal input[type="email"]').value,
        password: document.querySelector('#signinModal input[type="password"]').value
    };

    fetch(`${BASE_URL}/api/signin/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
    })
    .then(async res => {
        const result = await res.json();
        console.log("FULL SIGNIN RESPONSE:", JSON.stringify(result));
        if (!res.ok) throw new Error(result.message || "Login failed");
        return result;
    })
    .then(result => {
        if (result.status === "success") {
            localStorage.setItem('id', result.id);

            closeModal('signinModal');
            document.getElementById('mainLandingPage').style.display = 'none';
            document.getElementById('hiringDashboard').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const rawStatus = result?.form_status || "form_pending";
            const safeStatus = rawStatus.toLowerCase().replace(/_/g, ' ').trim();
            console.log("SignIn Status:", safeStatus);

            restoreDashboardState(safeStatus, result);

        } else {
            alert(result.message || "INVALID EMAIL OR PASSWORD");
        }
    })
    .catch(err => {
        console.error(err);
        alert(err.message || "INVALID EMAIL OR PASSWORD");
    });
}


// NEW: Admin Sign In
function performAdminSignIn(event) {
    event.preventDefault();

    const data = {
        email: document.getElementById('adminemail').value,
        password: document.getElementById('adminpassword').value
    };

    fetch(`${BASE_URL}/api/adminsignin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(async res => {
        const result = await res.json();
        console.log("FULL ADMIN SIGNIN RESPONSE:", result);
        localStorage.setItem('adminid',result.id)
        if (!res.ok) throw new Error(result.message || "Admin login failed");
        return result;
    })
    .then(result => {
        if (result.status === "success" || result.message === "success") {
            // Note: Fixed the file path typo below (added the slash before hr-admin)
            window.location.href = "../hr-admin/dashboard/dashboard.html";
        } else {
            alert(result.message || "INVALID ADMIN CREDENTIALS");
        }
    })
    .catch(err => {
        console.error(err);
        alert(err.message || "INVALID ADMIN CREDENTIALS");
    });
}



// NEW: Admin Sign In
function performSuperAdminSignIn(event) {
    event.preventDefault();

    const data = {
        email: document.getElementById('sadminemail').value,
        password: document.getElementById('sadminpassword').value
    };

    fetch(`${BASE_URL}/api/superadminsignin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(async res => {
        const result = await res.json();
        console.log("FULL ADMIN SIGNIN RESPONSE:", result);
        localStorage.setItem('adminid',result.id)
        if (!res.ok) throw new Error(result.message || "superAdmin login failed");
        return result;
    })
    .then(result => {
        if (result.status === "success" || result.message === "success") {
            // Note: Fixed the file path typo below (added the slash before hr-admin)
            window.location.href = "../super_admin/dashboard/dashboard.html";
        } else {
            alert(result.message || "INVALID ADMIN CREDENTIALS");
        }
    })
    .catch(err => {
        console.error(err);
        alert(err.message || "INVALID ADMIN CREDENTIALS");
    });
}


// Sign Out
function signOut() {
    localStorage.removeItem('id');

    document.getElementById('hiringForm').style.display        = 'block';
    document.getElementById('processingSection').style.display = 'none';
    document.getElementById('interviewSection').style.display  = 'none';
    document.getElementById('hiringForm').reset();

    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (fileNameDisplay) fileNameDisplay.style.display = 'none';

    document.getElementById('hiringDashboard').style.display = 'none';
    document.getElementById('mainLandingPage').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================
// 4. FORM SUBMISSION LOGIC
// ==========================================
function handleFormSubmit(event) {
    event.preventDefault();

    const form     = document.getElementById('hiringForm');
    const formData = new FormData();
    const emp_id   = localStorage.getItem('id');

    if (!emp_id) {
        alert("User not logged in");
        return;
    }

    const fileInput = document.getElementById('resumeInput');
    if (!fileInput || fileInput.files.length === 0) {
        alert("Resume is required");
        return;
    }

    const textInputs   = form.querySelectorAll('input[type="text"]');
    const numberInputs = form.querySelectorAll('input[type="number"]');

    formData.append("name",        emp_id);
    formData.append("full_name",   textInputs[0].value);
    formData.append("refered",     textInputs[1].value);
    formData.append("email",       form.querySelector('input[type="email"]').value);
    formData.append("phone",       form.querySelector('input[type="tel"]').value.slice(0, 10));
    formData.append("dob",         form.querySelector('input[type="date"]').value);
    formData.append("passed_out",  numberInputs[0].value.toString().slice(0, 4));
    formData.append("experiences", numberInputs[1].value.toString());
    formData.append("resume",      fileInput.files[0]);

    fetch(`${BASE_URL}/api/formsubmit/`, {
        method: "POST",
        body:   formData
    })
    .then(res => res.json())
    .then(result => {
        console.log("Form Submit Response:", result);
        restoreDashboardState('form submitted', null);
    })
    .catch(err => {
        console.error(err);
        alert("Error submitting form");
    });
}


// ==========================================
// 5. DRAG & DROP / FILE INPUT LOGIC
// ==========================================
const fileInput       = document.getElementById('resumeInput');
const dropZone        = document.getElementById('dropZone');
const fileNameDisplay = document.getElementById('fileNameDisplay');

if (fileInput) {
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileNameDisplay.innerText     = "Selected: " + this.files[0].name;
            fileNameDisplay.style.display = 'block';
        } else {
            fileNameDisplay.style.display = 'none';
        }
    });
}

if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files               = e.dataTransfer.files;
            fileNameDisplay.innerText     = "Selected: " + e.dataTransfer.files[0].name;
            fileNameDisplay.style.display = 'block';
        }
    });
}


// ==========================================
// 6. SCROLL REVEAL ANIMATION
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});