// ===== CONFIGURAÇÃO DO SUPABASE =====
const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== ELEMENTOS DO DOM =====
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const passwordStrengthBar = document.querySelector('.strength-fill');
const passwordStrengthText = document.querySelector('.strength-text');
const notificationToast = document.getElementById('notificationToast');

// ===== TAB LOGIN/CADASTRO =====
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        authForms.forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');
    });
});

// ===== TOGGLE PASSWORD =====
togglePasswordButtons.forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        const input = btn.closest('.input-with-icon').querySelector('input');
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// ===== PASSWORD STRENGTH =====
if (document.getElementById('signupPassword')) {
    document.getElementById('signupPassword').addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        passwordStrengthBar.style.width = strength.percentage + '%';
        passwordStrengthBar.style.background = strength.color;
        passwordStrengthText.textContent = strength.text;
        passwordStrengthText.style.color = strength.color;
    });
}

function calculatePasswordStrength(password) {
    let strength = 0, color = '', feedback = '';
    if (!password) return { percentage: 0, text: 'Força da senha', color: 'transparent' };
    if (password.length > 5) strength += 20;
    if (password.length > 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    if (strength < 40) { feedback = 'Fraca'; color = '#DC3545'; }
    else if (strength < 80) { feedback = 'Média'; color = '#FFC107'; }
    else { feedback = 'Forte'; color = '#28A745'; }
    return { percentage: strength, text: feedback, color };
}

// ===== CADASTRO =====
signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = signupForm.querySelector('.btn-primary');
    submitButton.classList.add('loading');

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const avatar = document.querySelector('input[name="avatar"]:checked')?.value || '';

    try {
        // Signup com emailRedirectTo para confirmacao-email.html
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: { nome: name, avatar: avatar },
                emailRedirectTo: 'https://projeto-luckpet.vercel.app/formulario/confirmacao-email.html'
            }
        });
        if (authError) throw authError;

        showNotification('Conta criada com sucesso! Verifique seu email para confirmar. 📧', 'success');
        signupForm.reset();

    } catch (error) {
        console.error('Erro no cadastro:', error);
        showNotification(error.message, 'error');
    } finally {
        submitButton.classList.remove('loading');
    }
});

// ===== LOGIN =====
loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = loginForm.querySelector('.btn-primary');
    submitButton.classList.add('loading');

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showNotification('Login realizado com sucesso! Redirecionando...', 'success');
        setTimeout(() => window.location.href = 'https://projeto-luckpet.vercel.app/', 1500);
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification(error.message, 'error');
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    } finally {
        submitButton.classList.remove('loading');
    }
});

// ===== NOTIFICAÇÕES =====
function showNotification(message, type) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    toast.className = `notification-toast toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 5000);
}

// ===== CHECK AUTH =====
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'https://projeto-luckpet.vercel.app/';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
