/* ════════════════════════════════════════════════════
   auth.js — Firebase Authentication
   Los Santos Command Center
════════════════════════════════════════════════════ */

const firebaseConfig = {
    apiKey: "AIzaSyB4eaCnv6tsEa9SSU5TWUfGAB300mwjbcQ",
    authDomain: "los-santos-dashboard.firebaseapp.com",
    projectId: "los-santos-dashboard",
    storageBucket: "los-santos-dashboard.firebasestorage.app",
    messagingSenderId: "419326987518",
    appId: "1:419326987518:web:fb2b2c52fbce8df77869af"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// ─── Toast (auth pages) ───────────────────────────
function showAuthMsg(msg, isError = false) {
    // Try inline error first
    const errEl = document.getElementById('formError');
    if (errEl) {
        errEl.textContent = msg;
        errEl.className = 'form-error show' + (isError ? '' : '');
        if (!isError) errEl.style.borderColor = 'rgba(0,255,136,0.4)';
        else errEl.style.borderColor = '';
        return;
    }
    // Fallback toast
    const t = document.createElement('div');
    t.className = 'auth-toast' + (isError ? ' error' : '');
    t.innerHTML = (isError ? '🚨 ' : '✅ ') + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ─── LOGIN ────────────────────────────────────────
async function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAuthMsg('Email and password are required.', true);
        return;
    }

    const btn = document.querySelector('.submit-btn');
    if (btn) { btn.textContent = 'LOGGING IN…'; btn.disabled = true; }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showAuthMsg('Access granted. Redirecting…');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
    } catch (error) {
        const msgs = {
            'auth/user-not-found': 'No account with that email.',
            'auth/wrong-password': 'Incorrect password. Try again.',
            'auth/invalid-email': 'Invalid email format.',
            'auth/too-many-requests': 'Too many attempts. Try later.',
        };
        showAuthMsg(msgs[error.code] || error.message, true);
        if (btn) { btn.textContent = 'ACCESS COMMAND CENTER'; btn.disabled = false; }
    }
}

// ─── SIGNUP ───────────────────────────────────────
async function signupUser() {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!email || !password) {
        showAuthMsg('Email and password are required.', true);
        return;
    }
    if (password.length < 6) {
        showAuthMsg('Password must be at least 6 characters.', true);
        return;
    }

    const btn = document.querySelector('.submit-btn');
    if (btn) { btn.textContent = 'CREATING ACCOUNT…'; btn.disabled = true; }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showAuthMsg('Account created. Starting your empire…');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    } catch (error) {
        const msgs = {
            'auth/email-already-in-use': 'That email is already registered.',
            'auth/invalid-email': 'Invalid email format.',
            'auth/weak-password': 'Password too weak. Use at least 6 characters.',
        };
        showAuthMsg(msgs[error.code] || error.message, true);
        if (btn) { btn.textContent = 'START YOUR EMPIRE'; btn.disabled = false; }
    }
}

// ─── LOGOUT ───────────────────────────────────────
function logoutUser() {
    auth.signOut().then(() => {
        localStorage.removeItem('ls_state');
        window.location.href = 'index.html';
    });
}

// ─── AUTH GUARD (for dashboard pages) ─────────────
// This is called by individual pages via firebase.auth().onAuthStateChanged()