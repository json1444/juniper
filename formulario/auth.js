// auth.js - Funcionalidades de login/cadastro
// Este arquivo fica na pasta formulario/

// Usar a instância global do Supabase já criada pelo auth-manager.js
const supabase = window.supabase;

// Verificar se supabase está disponível
if (!supabase) {
    console.error('Supabase não inicializado. Verifique se auth-manager.js foi carregado primeiro!');
    
    // Tentar inicializar como fallback
    const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';
    
    // Carregar a biblioteca do Supabase se não existir
    if (typeof window.supabase === 'undefined') {
        console.error('Biblioteca do Supabase não encontrada!');
    } else {
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase inicializado no auth.js como fallback');
    }
}

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const passwordStrengthBar = document.querySelector('.strength-fill');
const passwordStrengthText = document.querySelector('.strength-text');

// Função para alternar entre login e cadastro - ESTA É A FUNÇÃO IMPORTANTE!
function setupTabSwitching() {
    console.log('Configurando tabs...');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Tab clicada:', button.dataset.tab);
            
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
                console.log('Form ativado:', targetForm.id);
            } else {
                console.error('Form não encontrado:', `${tab}Form`);
            }
            
            // Esconder container de reenvio ao mudar de aba
            const resendContainer = document.getElementById('resendEmailContainer');
            if (resendContainer) {
                resendContainer.style.display = 'none';
            }
        });
    });
    
    console.log('Tabs configuradas');
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
            
            // Update strength bar
            if (passwordStrengthBar) {
                passwordStrengthBar.style.width = strength.percentage + '%';
                passwordStrengthBar.style.background = strength.color;
            }
            
            // Update strength text
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

// Cadastro de usuário
function setupSignupForm() {
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Enviando formulário de cadastro...');
        
        const submitButton = signupForm.querySelector('.btn-primary');
        const originalText = submitButton.querySelector('.btn-text').textContent;
        submitButton.classList.add('loading');
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const name = document.getElementById('signupName').value;
        const avatarInput = document.querySelector('input[name="avatar"]:checked');
        const avatar = avatarInput ? avatarInput.value : 'cachorro';

        try {
            // CONFIGURAÇÃO OTIMIZADA PARA ENVIO RÁPIDO
            const { data: authData, error: authError } = await supabase.auth.signUp({ 
                email: email.trim().toLowerCase(),
                password: password,
                options: {
                    data: {
                        nome: name,
                        avatar: avatar,
                        signup_timestamp: Date.now()
                    },
                    emailRedirectTo: `${window.location.origin}/formulario/confirmacao-email.html`
                }
            });
            
            if (authError) {
                console.error('Erro Supabase:', authError);
                
                if (authError.message.includes('rate limit') || authError.message.includes('429')) {
                    throw new Error('Muitas tentativas. Aguarde 15 minutos.');
                }
                if (authError.message.includes('already registered')) {
                    // TENTAR LOGIN AUTOMÁTICO SE JÁ EXISTIR
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
                    
                    if (!signInError) {
                        showNotification('✅ Login realizado! Conta já existente.', 'success');
                        setTimeout(() => window.location.href = '../index.html', 2000);
                        return;
                    }
                    throw new Error('Email já cadastrado. Recupere sua senha se necessário.');
                }
                if (authError.message.includes('email')) {
                    throw new Error('Email inválido. Verifique e tente novamente.');
                }
                throw new Error('Erro ao criar conta: ' + authError.message);
            }

            // VERIFICAÇÃO INSTANTÂNEA
            if (authData.user) {
                if (authData.user.identities && authData.user.identities.length === 0) {
                    throw new Error('Este email já está cadastrado.');
                }
                
                // FEEDBACK IMEDIATO E AÇÕES RÁPIDAS
                showNotification('🎉 Conta criada com sucesso! Enviando email de confirmação...', 'success');
                
                // BOTÃO DE REENVIO RÁPIDO
                showResendButton(email);
                
                // VERIFICAÇÃO AUTOMÁTICA (para casos de email instantâneo)
                setTimeout(() => checkEmailConfirmationStatus(authData.user.id), 3000);
                
                // REDIRECIONAMENTO INTELIGENTE
                setTimeout(() => {
                    switchToLoginTab(email);
                }, 4000);
            }

            // Limpar formulário
            signupForm.reset();

        } catch (error) {
            console.error('Erro no cadastro:', error);
            showNotification(error.message, 'error');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.querySelector('.btn-text').textContent = originalText;
        }
    });
}

// FUNÇÃO PARA MOSTRAR BOTÃO DE REENVIO RÁPIDO
function showResendButton(email) {
    let resendContainer = document.getElementById('resendEmailContainer');
    
    if (!resendContainer) {
        resendContainer = document.createElement('div');
        resendContainer.id = 'resendEmailContainer';
        resendContainer.className = 'resend-email-container';
        resendContainer.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #e9ecef;
        `;
        
        resendContainer.innerHTML = `
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                <i class="fas fa-envelope"></i> 
                Não recebeu o email? Verifique a pasta SPAM!
            </p>
            <button type="button" id="quickResendBtn" class="btn-secondary" style="padding: 10px 20px;">
                <i class="fas fa-redo"></i> Reenviar Agora
            </button>
            <div id="resendTimer" style="margin-top: 8px; font-size: 12px; color: #999;"></div>
        `;
        
        if (signupForm) {
            signupForm.appendChild(resendContainer);
        }
    }
    
    resendContainer.style.display = 'block';
    
    // Configurar botão de reenvio
    const resendBtn = document.getElementById('quickResendBtn');
    const timerElement = document.getElementById('resendTimer');
    
    let canResend = true;
    
    if (resendBtn) {
        resendBtn.onclick = async function() {
            if (!canResend) return;
            
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            this.disabled = true;
            
            await resendVerificationEmail(email);
            
            // Timer de 30 segundos para próximo reenvio
            canResend = false;
            let timeLeft = 30;
            
            const timer = setInterval(() => {
                if (timerElement) {
                    timerElement.textContent = `Próximo reenvio em ${timeLeft}s`;
                }
                timeLeft--;
                
                if (timeLeft < 0) {
                    clearInterval(timer);
                    if (timerElement) {
                        timerElement.textContent = '';
                    }
                    this.innerHTML = '<i class="fas fa-redo"></i> Reenviar Agora';
                    this.disabled = false;
                    canResend = true;
                }
            }, 1000);
        };
    }
}

// FUNÇÃO DE REENVIO ULTRA RÁPIDO
async function resendVerificationEmail(email) {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/formulario/confirmacao-email.html`
            }
        });
        
        if (error) {
            if (error.message.includes('rate limit')) {
                throw new Error('Aguarde 60 segundos antes de reenviar.');
            }
            throw error;
        }
        
        showNotification('📧 Email reenviado! Verifique sua caixa de entrada e SPAM.', 'success');
        
    } catch (error) {
        console.error('Erro ao reenviar:', error);
        showNotification(error.message || 'Erro ao reenviar email.', 'error');
    }
}

// VERIFICAÇÃO AUTOMÁTICA DE STATUS
async function checkEmailConfirmationStatus(userId) {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!error && user && user.email_confirmed_at) {
            showNotification('✅ Email confirmado automaticamente! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        }
    } catch (error) {
        // Ignora erros na verificação automática
    }
}

// FUNÇÃO AUXILIAR PARA MUDAR DE ABA
function switchToLoginTab(email) {
    console.log('Mudando para aba de login...');
    
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

// Login de usuário
function setupLoginForm() {
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Enviando formulário de login...');
        
        const submitButton = loginForm.querySelector('.btn-primary');
        submitButton.classList.add('loading');

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            showNotification('Login realizado com sucesso! Redirecionando...', 'success');

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);

        } catch (error) {
            console.error('Erro no login:', error);
            showNotification(error.message, 'error');
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        } finally {
            submitButton.classList.remove('loading');
        }
    });
}

// Mostrar notificações
function showNotification(message, type) {
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
    
    // Set message and type
    toastMessage.textContent = message;
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

// Verificar se é uma confirmação de email
async function checkEmailConfirmation() {
    // CORRIGIDO: Usar hash em vez de search
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // Verificar se há erro na URL
    if (error) {
        showNotification(`Erro: ${errorDescription || error}`, 'error');
        // Limpar a URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    // Verificar se é um redirecionamento de confirmação de email
    if (accessToken && refreshToken) {
        try {
            console.log('Processando tokens de confirmação de email...');
            
            // Tentar fazer login com os tokens
            const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (sessionError) throw sessionError;
            
            if (data && data.user) {
                console.log('Sessão configurada com sucesso para:', data.user.email);
                
                // SALVAR NO LOCALSTORAGE PARA SINCRONIZAÇÃO ENTRE DISPOSITIVOS
                localStorage.setItem('emailConfirmed', 'true');
                localStorage.setItem('userEmail', data.user.email);
                
                // Mostrar mensagem de sucesso
                showNotification('Email confirmado com sucesso! Redirecionando...', 'success');
                
                // Limpar a URL para remover os tokens
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // REDIRECIONAMENTO PARA PÁGINA DE CONFIRMAÇÃO (SEM REDIRECIONAMENTO AUTOMÁTICO)
                window.location.href = 'confirmacao-email.html';
            }
            
        } catch (error) {
            console.error('Erro ao processar confirmação:', error);
            
            // Se der erro mas tiver tokens, tenta redirecionar para confirmação
            if (accessToken && refreshToken) {
                window.location.href = 'confirmacao-email.html';
            } else {
                showNotification('Erro ao confirmar email. Tente fazer login manualmente.', 'error');
            }
        }
    }
}

// Verificar se usuário já está logado
async function checkAuth() {
    if (!window.location.pathname.includes('login.html')) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!error && profile) {
                showNotification(`Você já está logado como ${profile.nome}. Redirecionando em 3 segundos...`, 'success');

                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 3000);

                const loginHeader = document.querySelector('.auth-header');
                if (loginHeader && !document.getElementById('logoutButton')) {
                    const logoutBtn = document.createElement('button');
                    logoutBtn.id = 'logoutButton';
                    logoutBtn.className = 'btn-primary';
                    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Fazer Logout';
                    logoutBtn.style.marginTop = '10px';
                    logoutBtn.onclick = async (e) => {
                        e.preventDefault();
                        await supabase.auth.signOut();
                        window.location.reload();
                    };
                    loginHeader.appendChild(logoutBtn);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

// SUGERIR EMAIL TEMPORÁRIO PARA TESTES
function suggestTempEmail() {
    const emailInput = document.getElementById('signupEmail');
    if (emailInput && !emailInput.value) {
        const tempEmail = `test${Math.floor(Math.random() * 10000)}@tempmail.com`;
        emailInput.placeholder = `Ex: ${tempEmail} (para testes)`;
    }
}

// Inicialização COMPLETA
function initAuth() {
    console.log('Inicializando auth.js...');
    
    // 1. Configurar tabs (IMPORTANTE!)
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
    
    // 6. Verificar autenticação
    checkAuth();
    
    // 7. Verificar confirmação de email
    checkEmailConfirmation();
    
    // 8. Sugerir email temporário
    suggestTempEmail();
    
    console.log('auth.js inicializado com sucesso!');
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initAuth);