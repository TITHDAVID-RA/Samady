lucide.createIcons();

// --- 1. Define DOM Elements ---
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email'); // <--- THIS IS LIKELY MISSING
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');
const loginCard = document.getElementById('loginCard');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');
// 1. Define your single allowed account here
const VALID_CREDENTIALS = {
    email: 'admin@example.com',
    password: '123'
};

// If already logged in, skip login page
if (localStorage.getItem('auth_token')) {
    window.location.href = 'home.html';
}
function hideError() {
    errorToast.classList.add('hidden');
    errorToast.classList.remove('flex');
}

function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    if (isLoading) {
        btnText.innerText = 'Verifying...';
        btnIcon.setAttribute('data-lucide', 'loader-2');
        btnIcon.classList.add('animate-spin');
    } else {
        btnText.innerText = 'Login';
        btnIcon.setAttribute('data-lucide', 'arrow-right');
        btnIcon.classList.remove('animate-spin');
    }
    // Re-render icons so the loader/arrow shows up
    if (window.lucide) {
        lucide.createIcons();
    }
}

function setSuccess() {
    btnText.innerText = 'Success!';
    btnIcon.setAttribute('data-lucide', 'check');
    btnIcon.classList.remove('animate-spin');
    loginBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    loginBtn.classList.add('bg-green-600', 'hover:bg-green-700');
    lucide.createIcons();
}

function showError(message) {
    errorMessage.textContent = message;
    errorToast.classList.remove('hidden');
    errorToast.classList.add('flex', 'error-toast');
}
// Handle form submission
loginForm.addEventListener('submit', (e) => { // Removed 'async' as we aren't using await fetch
    e.preventDefault();
    hideError();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Client-side validation for empty fields
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    setLoading(true);

    // 2. Simulate a short delay to show the loading animation
    setTimeout(() => {
        // 3. Local check against our hardcoded account
        if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
            
            // Store dummy data in localStorage to simulate a real login
            localStorage.setItem('auth_token', 'local_demo_token_xyz');
            localStorage.setItem('user', JSON.stringify({ email: email, name: 'Admin User' }));
            
            setSuccess();
            
            // Redirect after success animation
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 800);
            
        } else {
            // Handle incorrect credentials
            setLoading(false);
            showError('Invalid email or password');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }, 1000); // 1-second delay
});