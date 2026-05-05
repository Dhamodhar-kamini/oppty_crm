// ====== MODAL LOGIC ======
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => {
        openModal(openId);
    }, 300); 
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}


// ====== LOGIN / REGISTRATION LOGIC ======
document.getElementById('create-form').addEventListener('submit',(event)=>{
    event.preventDefault();

    const data = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch('http://127.0.0.1:8000/api/createaccount/', {
       method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
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
})

function performSignIn(event) {
    event.preventDefault();

    const data = {
        email: document.querySelector('#signinModal input[type="email"]').value,
        password: document.querySelector('#signinModal input[type="password"]').value
    };

    fetch('http://127.0.0.1:8000/api/signin/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(async res => {
        const result = await res.json();
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

            const status = result.form_status;

            // Reset all sections first
            document.getElementById('hiringForm').style.display = 'none';
            document.getElementById('processingSection').style.display = 'none';
            document.getElementById('interviewSection').style.display = 'none';
            document.getElementById('postInterviewSection').style.display = 'none'; // NEW
            document.getElementById('hrSimulatorTool').style.display = 'none';

            if (status === "form_pending" || !status) {
                document.getElementById('hiringForm').style.display = 'block';
            } else if (status === "form_submitted") {
                document.getElementById('processingSection').style.display = 'block';
                document.getElementById('hrSimulatorTool').style.display = 'block';
            } else if (status === "interview_scheduled") {
                document.getElementById('interviewSection').style.display = 'block';
                
                // Setup simulator for the next stage
                document.getElementById('hrSimulatorTool').style.display = 'block';
                document.getElementById('btnApprove').style.display = 'none';
                document.getElementById('btnReleaseOffer').style.display = 'inline-block';
                document.getElementById('hrSimText').innerText = 'Interview completed. Release offer?';
                
            } else if (status === "offer_released") {
                // UPDATED: Now shows the Post-Interview Section instead of just an alert
                document.getElementById('postInterviewSection').style.display = 'block';
            }

        } else {
            alert(result.message || "INVALID EMAIL OR PASSWORD");
        }
    })
    .catch(err => {
        console.error(err);
        alert(err.message || "INVALID EMAIL OR PASSWORD");
    });
}


function signOut() {
    document.getElementById('hiringForm').style.display = 'block';
    document.getElementById('processingSection').style.display = 'none';
    document.getElementById('interviewSection').style.display = 'none';
    document.getElementById('postInterviewSection').style.display = 'none'; // NEW
    document.getElementById('hrSimulatorTool').style.display = 'none';
    
    document.getElementById('hiringForm').reset();
    document.getElementById('fileNameDisplay').style.display = 'none';
    
    document.getElementById('hiringDashboard').style.display = 'none';
    document.getElementById('mainLandingPage').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ====== FORM SUBMISSION ======
function handleFormSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('hiringForm');
    const formData = new FormData();
    const emp_id = localStorage.getItem('id');

    if (!emp_id) {
        alert("User not logged in");
        return;
    }

    const fileInput = document.getElementById('resumeInput');
    if (fileInput.files.length === 0) {
        alert("Resume is required");
        return;
    }

    formData.append("name", emp_id);
    formData.append("full_name", form.querySelector('input[type="text"]').value);
    formData.append("email", form.querySelector('input[type="email"]').value);
    formData.append("phone", form.querySelector('input[type="tel"]').value.slice(0,10));
    formData.append("dob", form.querySelector('input[type="date"]').value);
    formData.append("passed_out", form.querySelectorAll('input[type="number"]')[0].value.toString().slice(0,4));
    formData.append("experiences", form.querySelectorAll('input[type="number"]')[1].value.toString());
    formData.append("resume", fileInput.files[0]);

    fetch('http://127.0.0.1:8000/api/formsubmit/', {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(result => {
        document.getElementById('hiringForm').style.display = 'none';
        document.getElementById('processingSection').style.display = 'block';
        
        // Reset simulator buttons for fresh flow
        document.getElementById('btnApprove').style.display = 'inline-block';
        document.getElementById('btnReleaseOffer').style.display = 'none';
        document.getElementById('hrSimText').innerText = 'A profile is waiting for review.';
        document.getElementById('hrSimulatorTool').style.display = 'block';
    })
    .catch(err => {
        console.error(err);
        alert("Error submitting form");
    });
}

// ====== HR SIMULATOR LOGIC ======
function approveCandidate() {
    document.getElementById('processingSection').style.display = 'none';
    document.getElementById('interviewSection').style.display = 'block';
    
    // Switch simulator button to Offer mode
    document.getElementById('btnApprove').style.display = 'none';
    document.getElementById('btnReleaseOffer').style.display = 'inline-block';
    document.getElementById('hrSimText').innerText = 'Interview completed. Release offer?';
}

// NEW: Simulator button to mimic sending the offer and updating status to "offer_released"
function releaseOffer() {
    document.getElementById('interviewSection').style.display = 'none';
    document.getElementById('postInterviewSection').style.display = 'block';
    document.getElementById('hrSimulatorTool').style.display = 'none'; // Hide simulator as flow is complete
}


// ====== FILE UPLOAD INTERACTION ======
const fileInput = document.getElementById('resumeInput');
const dropZone = document.getElementById('dropZone');
const fileNameDisplay = document.getElementById('fileNameDisplay');

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        fileNameDisplay.innerText = "Selected: " + this.files[0].name;
        fileNameDisplay.style.display = 'block';
    } else {
        fileNameDisplay.style.display = 'none';
    }
});

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
        fileInput.files = e.dataTransfer.files;
        fileNameDisplay.innerText = "Selected: " + e.dataTransfer.files[0].name;
        fileNameDisplay.style.display = 'block';
    }
});


// ====== SCROLL REVEAL ANIMATION ======
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