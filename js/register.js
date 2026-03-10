/* ═══════════════════════════════════════════════════════
   MURIOUS 20.0 — Registration Page Script
   Firebase + Razorpay Integration (Multi-Event)
   ═══════════════════════════════════════════════════════ */

// ── Firebase Config ──
const firebaseConfig = {
    apiKey: "AIzaSyDFt5T1GCewg1Ai5PF6l3YG8y26dIEZ7Ug",
    authDomain: "techfest-registration-eace0.firebaseapp.com",
    projectId: "techfest-registration-eace0",
    storageBucket: "techfest-registration-eace0.firebasestorage.app",
    messagingSenderId: "1094190297812",
    appId: "1:1094190297812:web:007376a2e08b4ff7fb4141",
    measurementId: "G-36RTV9Y354"
};

const RAZORPAY_KEY = "rzp_live_SODKZII24hVdSO";

let db = null;
let storage = null;

// ── Initialize Firebase ──
function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
storage = firebase.storage();
            console.log('✦ Firebase initialized');
        }
    } catch (e) {
        console.warn('Firebase init error:', e);
    }
}

// ── Generate Stars ──
function generateStars() {
    const container = document.getElementById('starfield');
    if (!container) return;
    const count = Math.floor(window.innerWidth * window.innerHeight / 1500);
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star' + (Math.random() > 0.92 ? ' large' : '');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (2 + Math.random() * 5) + 's');
        star.style.setProperty('--delay', (Math.random() * 5) + 's');
        container.appendChild(star);
    }
}

// ── Generate Particles ──
function generateParticles() {
    const body = document.body;
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.bottom = '-10px';
        p.style.setProperty('--speed', (8 + Math.random() * 16) + 's');
        p.style.setProperty('--delay', (Math.random() * 10) + 's');
        p.style.width = (2 + Math.random() * 4) + 'px';
        p.style.height = p.style.width;
        body.appendChild(p);
    }
}

// ── DOM Elements ──
const regForm = document.getElementById('registerForm');
const eventGrid = document.getElementById('eventGrid');
const eventCheckboxes = document.querySelectorAll('input[name="events"]');
const feeDisplay = document.getElementById('feeDisplay');
const feeAmount = document.getElementById('feeAmount');
const feeCount = document.getElementById('feeCount');
const regLoading = document.getElementById('regLoading');
const regSuccess = document.getElementById('regSuccess');
const regError = document.getElementById('regError');
const regErrorMsg = document.getElementById('regErrorMsg');
const registerBtn = document.getElementById('registerBtn');

// ── Get selected events ──
function getSelectedEvents() {
    const selected = [];
    eventCheckboxes.forEach(cb => {
        if (cb.checked) {
            selected.push({
                name: cb.value,
                fee: parseInt(cb.getAttribute('data-fee'))
            });
        }
    });
    return selected;
}

// ── Calculate and display total fee ──
function updateFeeDisplay() {
    const selected = getSelectedEvents();
    const totalFee = selected.reduce((sum, e) => sum + e.fee, 0);
    const count = selected.length;

    if (count > 0) {
        feeAmount.textContent = '₹' + totalFee;
        feeCount.textContent = count + (count === 1 ? ' event selected' : ' events selected');
        feeDisplay.style.display = 'flex';
        feeDisplay.style.animation = 'none';
        void feeDisplay.offsetHeight; // reflow
        feeDisplay.style.animation = 'feeSlideIn 0.4s ease forwards';
    } else {
        feeDisplay.style.display = 'none';
    }

    // Clear error state
    if (eventGrid) eventGrid.classList.remove('invalid');

    return { totalFee, count, events: selected };
}

// ── Event checkbox listeners ──
eventCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateFeeDisplay);
});

// ── Clear invalid on input ──
document.querySelectorAll('.form-group input').forEach(inp => {
    inp.addEventListener('input', () => inp.classList.remove('invalid'));
});

// ── Helper Functions ──
function showLoading(show) {
    if (regLoading) regLoading.classList.toggle('active', show);
}

function hideMessages() {
    if (regSuccess) regSuccess.classList.remove('active');
    if (regError) regError.classList.remove('active');
}

function showSuccessMsg() {
    hideMessages();
    if (regSuccess) regSuccess.classList.add('active');
    setTimeout(() => { if (regSuccess) regSuccess.classList.remove('active'); }, 8000);
}

function showErrorMsg(msg) {
    hideMessages();
    if (regErrorMsg) regErrorMsg.textContent = msg;
    if (regError) regError.classList.add('active');
    setTimeout(() => { if (regError) regError.classList.remove('active'); }, 8000);
}

// ── Form Submission ──
if (regForm) {
    regForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideMessages();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const college = document.getElementById('regCollege').value.trim();
        const screenshotFile = document.getElementById('paymentSS').files[0];
        const { totalFee, count, events: selectedEvents } = updateFeeDisplay();

        // Validate text fields
        let valid = true;
        regForm.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(inp => {
            if (!inp.value || !inp.value.trim()) {
                inp.classList.add('invalid');
                valid = false;
            } else {
                inp.classList.remove('invalid');
            }
        });

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            document.getElementById('regEmail').classList.add('invalid');
            showErrorMsg('Please enter a valid email address.');
            return;
        }

        // Phone length
        if (phone && !/^\d{10}$/.test(phone)) {
            document.getElementById('regPhone').classList.add('invalid');
            showErrorMsg('Phone number must be exactly 10 digits.');
            return;
        }

        // Check at least one event selected
        // Check at least one event selected
if (count === 0) {
    if (eventGrid) eventGrid.classList.add('invalid');
    showErrorMsg('Please select at least one event.');
    return;
}

// Validate payment screenshot
if (!screenshotFile) {
    showErrorMsg('Please upload your payment screenshot.');
    return;
}

        if (!valid) {
            showErrorMsg('Please fill in all required fields.');
            return;
        }

        // Check duplicate registrations for each selected event
        if (db) {
            try {
                showLoading(true);
                const dupes = [];
                for (const ev of selectedEvents) {
                    const snapshot = await db.collection('registrations')
                        .where('email', '==', email)
                        .where('event', '==', ev.name)
                        .get();
                    if (!snapshot.empty) {
                        dupes.push(ev.name);
                    }
                }
                if (dupes.length > 0) {
                    showLoading(false);
                    showErrorMsg('Already registered for: ' + dupes.join(', ') + '. Please uncheck those events.');
                    return;
                }
            } catch (err) {
                console.warn('Duplicate check failed:', err);
            }
        }

        // Razorpay Payment
        if (typeof Razorpay === 'undefined') {
            showLoading(false);
            showErrorMsg('Payment gateway is loading. Please try again.');
            return;
        }

        showLoading(true);

        const eventNames = selectedEvents.map(e => e.name).join(', ');

        const options = {
            key: RAZORPAY_KEY,
            amount: totalFee * 100, // paise
            currency: "INR",
            name: "Murious 20.0",
            description: count === 1
                ? selectedEvents[0].name + " Registration"
                : count + " Events Registration",
            handler: async function (response) {

    let screenshotURL = "";

    try {

        // Upload screenshot to Firebase Storage
        if (screenshotFile && storage) {

            const fileName = Date.now() + "_" + screenshotFile.name;

            const storageRef = storage.ref("paymentScreenshots/" + fileName);

            await storageRef.put(screenshotFile);

            screenshotURL = await storageRef.getDownloadURL();
        }

        // Save registrations
        if (db) {

            const batch = db.batch();

            for (const ev of selectedEvents) {

                const docRef = db.collection("registrations").doc();

                batch.set(docRef, {
                    name: name,
                    email: email,
                    phone: phone,
                    college: college,
                    event: ev.name,
                    fee: ev.fee,
                    totalPaid: totalFee,
                    eventsInOrder: eventNames,
                    paymentId: response.razorpay_payment_id,
                    screenshot: screenshotURL,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

            }

            await batch.commit();
        }

    } catch (err) {
        console.error("Firestore save error:", err);
    }
                showLoading(false);
                regForm.reset();
                eventCheckboxes.forEach(cb => cb.checked = false);
                feeDisplay.style.display = 'none';
                registerBtn.classList.add('submitted');
                showSuccessMsg();
                setTimeout(() => { registerBtn.classList.remove('submitted'); }, 3000);
            },
            modal: {
                ondismiss: function () {
                    showLoading(false);
                    showErrorMsg('Payment was cancelled. Registration not completed.');
                }
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: "#d4a853"
            }
        };

        try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (resp) {
                showLoading(false);
                showErrorMsg('Payment failed: ' + (resp.error.description || 'Unknown error.'));
            });
            rzp.open();
        } catch (err) {
            showLoading(false);
            showErrorMsg('Could not open payment gateway. Please try again.');
            console.error('Razorpay error:', err);
        }
    });
}

// ── Admin: Export CSV ──
async function exportRegistrationsToCSV() {
    if (!db) {
        alert('Firebase is not initialized. Please check your config.');
        return;
    }
    try {
        const snapshot = await db.collection('registrations').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            alert('No registrations found.');
            return;
        }
        const rows = [['Name', 'Email', 'Phone', 'College', 'Event', 'Fee', 'Total Paid', 'All Events in Order', 'Payment ID', 'Timestamp']];
        snapshot.forEach(doc => {
            const d = doc.data();
            const ts = d.timestamp ? d.timestamp.toDate().toISOString() : '';
            rows.push([d.name, d.email, d.phone, d.college, d.event, d.fee, d.totalPaid || d.fee, d.eventsInOrder || d.event, d.paymentId, ts]);
        });
        const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'murious_registrations.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export error:', err);
        alert('Failed to export registrations: ' + err.message);
    }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    generateStars();
    generateParticles();
});
