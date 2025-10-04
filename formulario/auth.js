// Configuração do Supabase
const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const passwordInputs = document.querySelectorAll('input[type="password"]');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const passwordStrengthBar = document.querySelector('.strength-fill');
const passwordStrengthText = document.querySelector('.strength-text');
const notificationToast = document.getElementById('notificationToast');

// Alternar entre login e cadastro
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        authForms.forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');
    });
});

// Toggle password visibility
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

// Password strength indicator
if (document.getElementById('signupPassword')) {
    document.getElementById('signupPassword').addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Update strength bar
        passwordStrengthBar.style.width = strength.percentage + '%';
        passwordStrengthBar.style.background = strength.color;
        
        // Update strength text
        passwordStrengthText.textContent = strength.text;
        passwordStrengthText.style.color = strength.color;
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    let color = '';
    
    if (password.length > 0) {
        document.querySelector('.password-strength').style.display = 'block';
    } else {
        document.querySelector('.password-strength').style.display = 'none';
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

// Cadastro de usuário - VERSÃO CORRIGIDA
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = signupForm.querySelector('.btn-primary');
    submitButton.classList.add('loading');
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const avatar = document.querySelector('input[name="avatar"]:checked').value;

    try {
        // ✅ CORREÇÃO: Configuração correta para envio de email
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    nome: name,
                    avatar: avatar
                },
                emailRedirectTo: `${window.location.origin}/formulario/confirmacao-email.html`
            }
        });
        
        if (authError) {
            // Tratamento de erros específicos
            if (authError.message.includes('rate limit') || authError.message.includes('429')) {
                throw new Error('Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
            }
            if (authError.message.includes('already registered')) {
                throw new Error('Este email já está cadastrado. Tente fazer login.');
            }
            throw authError;
        }

        // ✅ VERIFICAÇÃO SE O EMAIL FOI ENVIADO
        if (authData.user && !authData.user.email_confirmed_at) {
            if (authData.user.identities && authData.user.identities.length === 0) {
                throw new Error('Este email já está cadastrado. Tente fazer login.');
            }
            
            // ✅ MENSAGEM MELHORADA COM INFORMAÇÕES SOBRE SPAM
            showNotification('✅ Conta criada! Verifique seu email (incluindo a pasta SPAM) para confirmar sua conta. O email pode levar alguns minutos para chegar.', 'success');
            
            // ✅ TENTAR REENVIAR EMAIL APÓS 30 SEGUNDOS SE O USUÁRIO NÃO CONFIRMAR
            setTimeout(async () => {
                try {
                    const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email: email
                    });
                    if (!resendError) {
                        console.log('Email de verificação reenviado');
                    }
                } catch (resendErr) {
                    console.log('Não foi possível reenviar o email:', resendErr);
                }
            }, 30000);
            
        } else if (authData.user && authData.user.email_confirmed_at) {
            showNotification('✅ Conta criada e email já confirmado! Faça login para continuar.', 'success');
        }

        // ✅ REDIRECIONAR PARA LOGIN APÓS 5 SEGUNDOS
        setTimeout(() => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-tab="login"]').classList.add('active');
            
            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById('loginForm').classList.add('active');
            
            document.getElementById('loginEmail').value = email;
        }, 5000);

        // Limpar formulário
        signupForm.reset();

    } catch (error) {
        console.error('Erro no cadastro:', error);
        showNotification(error.message, 'error');
    } finally {
        submitButton.classList.remove('loading');
    }
});


// Login de usuário
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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

// Mostrar notificações
function showNotification(message, type) {
    const toast = document.getElementById('notificationToast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
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
    toast.classList.remove('show');
}

// Close notification when close button is clicked
document.querySelector('.toast-close').addEventListener('click', hideNotification);

// Verificar se é uma confirmação de email
async function checkEmailConfirmation() {
    // ✅ CORRIGIDO: Usar hash em vez de search
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
                
                // ✅ SALVAR NO LOCALSTORAGE PARA SINCRONIZAÇÃO ENTRE DISPOSITIVOS
                localStorage.setItem('emailConfirmed', 'true');
                localStorage.setItem('userEmail', data.user.email);
                
                // Mostrar mensagem de sucesso
                showNotification('Email confirmado com sucesso! Redirecionando...', 'success');
                
                // Limpar a URL para remover os tokens
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // ✅ REDIRECIONAMENTO PARA PÁGINA DE CONFIRMAÇÃO (SEM REDIRECIONAMENTO AUTOMÁTICO)
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

// ✅ NOVA FUNÇÃO: Verificar confirmação entre dispositivos
async function checkCrossDeviceConfirmation() {
    // Verificar se há indicação de que o email foi confirmado em outro dispositivo
    const emailConfirmed = localStorage.getItem('emailConfirmed');
    const userEmail = localStorage.getItem('userEmail');
    
    if (emailConfirmed === 'true' && userEmail) {
        console.log('Email confirmado em outro dispositivo, tentando login automático...');
        
        try {
            // Tentar obter a sessão atual
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (!session) {
                // Se não há sessão, tentar fazer login com o email (usuário precisará digitar senha)
                showNotification(`Email ${userEmail} confirmado. Faça login para continuar.`, 'info');
            } else {
                // Se já está logado, limpar o flag
                localStorage.removeItem('emailConfirmed');
                localStorage.removeItem('userEmail');
            }
        } catch (error) {
            console.error('Erro ao verificar sessão cross-device:', error);
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

// Função para verificar e processar tokens de autenticação
async function processAuthTokens() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const tokenType = urlParams.get('token_type');
    const expiresIn = urlParams.get('expires_in');
    
    if (accessToken && refreshToken) {
        try {
            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (!error) {
                // Limpar a URL para remover os tokens
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Redirecionar para página de confirmação
                setTimeout(() => {
                    window.location.href = 'confirmacao-email.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Erro ao processar tokens:', error);
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    checkEmailConfirmation();
    checkCrossDeviceConfirmation(); // ✅ NOVA VERIFICAÇÃO
    processAuthTokens();
    
    // Verificar se há mensagens de sucesso na URL
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message === 'email_confirmed') {
        showNotification('Email confirmado com sucesso!', 'success');
    }
});

// Função auxiliar para extrair parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Função para reenviar email de verificação
async function resendVerificationEmail(email) {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/formulario/confirmacao-email.html`
            }
        });
        
        if (error) throw error;
        
        showNotification('📧 Email de verificação reenviado! Verifique sua caixa de entrada.', 'success');
    } catch (error) {
        console.error('Erro ao reenviar email:', error);
        showNotification('Erro ao reenviar email. Tente novamente mais tarde.', 'error');
    }
}

// Adicionar evento para o botão de reenvio
document.addEventListener('DOMContentLoaded', function() {
    const resendBtn = document.getElementById('resendEmailBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', function() {
            const email = document.getElementById('signupEmail').value || 
                         document.getElementById('loginEmail').value;
            if (email) {
                resendVerificationEmail(email);
            } else {
                showNotification('Digite seu email para reenviar a verificação.', 'error');
            }
        });
    }
});