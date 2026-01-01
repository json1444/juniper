// auth.js - FUNCIONANDO 100%

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const passwordStrengthBar = document.querySelector('.strength-fill');
const passwordStrengthText = document.querySelector('.strength-text');

// Função para alternar entre login e cadastro
function setupTabSwitching() {
    console.log('Configurando tabs...');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const tab = button.dataset.tab;
            
            // Remover classe active de todos os botões
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Remover classe active de todos os forms
            authForms.forEach(form => {
                form.classList.remove('active');
            });
            
            // Adicionar classe active ao form correspondente
            const targetForm = document.getElementById(`${tab}Form`);
            if (targetForm) {
                targetForm.classList.add('active');
                console.log('✅ Form ativado:', targetForm.id);
            }
        });
    });
}

// Toggle password visibility
function setupPasswordVisibility() {
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const input = button.closest('.input-with-icon').querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Password strength indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            if (passwordStrengthBar) {
                passwordStrengthBar.style.width = strength.percentage + '%';
                passwordStrengthBar.style.background = strength.color;
            }
            
            if (passwordStrengthText) {
                passwordStrengthText.textContent = strength.text;
                passwordStrengthText.style.color = strength.color;
            }
        });
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    let color = '';
    
    if (password.length > 0) {
        const strengthElement = document.querySelector('.password-strength');
        if (strengthElement) {
            strengthElement.style.display = 'block';
        }
    } else {
        const strengthElement = document.querySelector('.password-strength');
        if (strengthElement) {
            strengthElement.style.display = 'none';
        }
        return { percentage: 0, text: 'Força da senha', color: 'transparent' };
    }
    
    // Length check
    if (password.length > 5) strength += 20;
    if (password.length > 8) strength += 20;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // Determine feedback and color
    if (strength < 40) {
        feedback = 'Fraca';
        color = '#DC3545';
    } else if (strength < 80) {
        feedback = 'Média';
        color = '#FFC107';
    } else {
        feedback = 'Forte';
        color = '#28A745';
    }
    
    return { percentage: strength, text: feedback, color: color };
}

// Login de usuário
function setupLoginForm() {
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Enviando formulário de login...');
        
        const submitButton = loginForm.querySelector('.btn-primary');
        submitButton.classList.add('loading');

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            // Usar o AuthManager para login
            if (!window.authManager) {
                showNotification('Sistema de autenticação não carregado', 'error');
                return;
            }
            
            const result = await window.authManager.signIn(email, password);
            
            if (result.success) {
                showNotification('✅ Login realizado com sucesso! Redirecionando...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'https://projeto-luckpet.vercel.app/';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }

        } catch (error) {
            console.error('❌ Erro no login:', error);
            showNotification('Erro ao fazer login. Tente novamente.', 'error');
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        } finally {
            submitButton.classList.remove('loading');
        }
    });
}

// Cadastro de usuário
function setupSignupForm() {
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Enviando formulário de cadastro...');
        
        const submitButton = signupForm.querySelector('.btn-primary');
        const originalText = submitButton.querySelector('.btn-text').textContent;
        submitButton.classList.add('loading');
        
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const name = document.getElementById('signupName').value.trim();
        const avatarInput = document.querySelector('input[name="avatar"]:checked');
        const avatar = avatarInput ? avatarInput.value : 'cachorro';

        try {
            // Usar o AuthManager para cadastro
            if (!window.authManager) {
                showNotification('Sistema de autenticação não carregado', 'error');
                return;
            }
            
            const result = await window.authManager.signUp(email, password, name, avatar);
            
            if (result.success) {
                showNotification('🎉 Conta criada com sucesso! Você ganhou 50 LuckCoins!', 'success');
                
                // Mudar para aba de login
                setTimeout(() => {
                    switchToLoginTab(email);
                }, 2000);
                
                signupForm.reset();
            } else {
                showNotification(result.error, 'error');
            }

        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            showNotification('Erro ao criar conta. Tente novamente.', 'error');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.querySelector('.btn-text').textContent = originalText;
        }
    });
}

// FUNÇÃO AUXILIAR PARA MUDAR DE ABA
function switchToLoginTab(email) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    const loginTab = document.querySelector('[data-tab="login"]');
    if (loginTab) {
        loginTab.classList.add('active');
    }
    
    authForms.forEach(form => form.classList.remove('active'));
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.classList.add('active');
    }
    
    const loginEmailInput = document.getElementById('loginEmail');
    if (loginEmailInput) {
        loginEmailInput.value = email;
    }
}

// Mostrar notificações
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    if (!toast) {
        console.log('Toast não encontrado');
        return;
    }
    
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (!toastMessage) {
        console.log('Toast message não encontrado');
        return;
    }
    
    // Definir ícone baseado no tipo
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
    
    // Set message and type
    toastMessage.textContent = message;
    if (toastIcon) {
        toastIcon.className = `toast-icon ${iconClass}`;
    }
    toast.className = `notification-toast toast-${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Close notification when close button is clicked
function setupNotificationClose() {
    const closeBtn = document.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideNotification);
    }
}

// Configurar login como convidado
function setupGuestLogin() {
    const guestBtn = document.getElementById('guestLoginBtn');
    if (guestBtn) {
        guestBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const submitButton = this;
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            submitButton.disabled = true;
            
            try {
                // Usar o AuthManager para login como convidado
                if (!window.authManager) {
                    showNotification('Sistema de autenticação não carregado', 'error');
                    return;
                }
                
                const result = await window.authManager.signInAsGuest();
                
                if (result.success) {
                    showNotification(`🎉 Bem-vindo, ${result.user.nome}! Modo convidado ativado. Você ganhou 25 LuckCoins!`, 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'https://projeto-luckpet.vercel.app/';
                    }, 1500);
                } else {
                    showNotification(result.error, 'error');
                }
                
            } catch (error) {
                console.error('❌ Erro ao entrar como convidado:', error);
                showNotification('Erro ao entrar como convidado. Tente novamente.', 'error');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// Inicialização COMPLETA
function initAuth() {
    console.log('🚀 Inicializando auth.js...');
    
    // 1. Configurar tabs
    setupTabSwitching();
    
    // 2. Configurar visibilidade de senhas
    setupPasswordVisibility();
    
    // 3. Configurar força da senha
    setupPasswordStrength();
    
    // 4. Configurar formulários
    setupLoginForm();
    setupSignupForm();
    
    // 5. Configurar notificações
    setupNotificationClose();
    
    // 6. Configurar login como convidado
    setupGuestLogin();
    
    console.log('✅ auth.js inicializado com sucesso!');
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initAuth);

// Exportar função de notificação para uso global
window.showNotification = showNotification;