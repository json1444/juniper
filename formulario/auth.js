// auth.js - NÃO declara supabase, usa a instância global

// Usar a instância global do Supabase
const supabase = window.supabase;

// Verificar se supabase está disponível
if (!supabase) {
    console.error('Supabase não inicializado. Verifique se auth-manager.js foi carregado primeiro!');
    // Tentar inicializar como fallback
    const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase inicializado no auth.js como fallback');
}

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
        
        // Esconder container de reenvio ao mudar de aba
        const resendContainer = document.getElementById('resendEmailContainer');
        if (resendContainer) {
            resendContainer.style.display = 'none';
        }
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

// Cadastro de usuário
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = signupForm.querySelector('.btn-primary');
    const originalText = submitButton.querySelector('.btn-text').textContent;
    submitButton.classList.add('loading');
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const avatar = document.querySelector('input[name="avatar"]:checked').value;

    try {
        // CONFIGURAÇÃO OTIMIZADA PARA ENVIO RÁPIDO
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email: email.trim().toLowerCase(), // Normaliza o email
            password: password,
            options: {
                data: {
                    nome: name,
                    avatar: avatar,
                    signup_timestamp: Date.now() // Para tracking
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
        
        signupForm.appendChild(resendContainer);
    }
    
    resendContainer.style.display = 'block';
    
    // Configurar botão de reenvio
    const resendBtn = document.getElementById('quickResendBtn');
    const timerElement = document.getElementById('resendTimer');
    
    let canResend = true;
    
    resendBtn.onclick = async function() {
        if (!canResend) return;
        
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        this.disabled = true;
        
        await resendVerificationEmail(email);
        
        // Timer de 30 segundos para próximo reenvio
        canResend = false;
        let timeLeft = 30;
        
        const timer = setInterval(() => {
            timerElement.textContent = `Próximo reenvio em ${timeLeft}s`;
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timer);
                timerElement.textContent = '';
                this.innerHTML = '<i class="fas fa-redo"></i> Reenviar Agora';
                this.disabled = false;
                canResend = true;
            }
        }, 1000);
    };
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
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="login"]').classList.add('active');
    
    authForms.forEach(form => form.classList.remove('active'));
    document.getElementById('loginForm').classList.add('active');
    
    document.getElementById('loginEmail').value = email;
}

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

// ENTRAR COMO CONVIDADO - SOLUÇÃO CORRIGIDA
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
                await loginAsGuest();
            } catch (error) {
                console.error('Erro ao entrar como convidado:', error);
                showNotification('Erro ao entrar como convidado. Tente novamente.', 'error');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// FUNÇÃO PARA LOGIN COMO CONVIDADO - VERSÃO CORRIGIDA
async function loginAsGuest() {
    try {
        // SOLUÇÃO: Usar localStorage para modo convidado sem autenticação Supabase
        const guestName = generateGuestName();
        const guestAvatar = getRandomAvatar();
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // SALVAR INFORMAÇÕES DO CONVIDADO NO LOCALSTORAGE
        localStorage.setItem('isGuest', 'true');
        localStorage.setItem('guestName', guestName);
        localStorage.setItem('guestAvatar', guestAvatar);
        localStorage.setItem('guestId', guestId);
        localStorage.setItem('guestLoginTime', new Date().toISOString());
        
        // DADOS DO "PERFIL" DO CONVIDADO
        const guestProfile = {
            id: guestId,
            nome: guestName,
            avatar: guestAvatar,
            is_guest: true,
            created_at: new Date().toISOString()
        };
        
        localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
        
        // DAR CRÉDITOS INICIAIS PARA CONVIDADO
        localStorage.setItem('userCredits', '25'); // Convidado ganha menos créditos
        localStorage.setItem('isNewUser', 'true');

        showNotification(`🎉 Bem-vindo, ${guestName}! Modo convidado ativado.`, 'success');
        
        // REDIRECIONAR PARA PÁGINA PRINCIPAL
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);

    } catch (error) {
        console.error('Erro no login como convidado:', error);
        throw error;
    }
}

// GERAR NOME ALEATÓRIO PARA CONVIDADO
function generateGuestName() {
    const names = [
        'Amigo Pet', 'Explorador', 'Aventureiro', 'Curioso', 'Visitante',
        'Amigo dos Bichos', 'PetLover', 'Mimi', 'Tobby', 'Luna', 'Thor', 'Mel',
        'Bob', 'Lucky', 'Charlie', 'Bella', 'Max', 'Lucy', 'Buddy', 'Daisy'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return `${randomName}#${Math.floor(Math.random() * 1000)}`;
}

// OBTER AVATAR ALEATÓRIO
function getRandomAvatar() {
    const avatars = ['cachorro', 'gato', 'coelho', 'pássaro'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

// VERIFICAR SE USUÁRIO É CONVIDADO
function isGuestUser() {
    return localStorage.getItem('isGuest') === 'true';
}

// OBTER PERFIL DO CONVIDADO
function getGuestProfile() {
    const guestProfile = localStorage.getItem('guestProfile');
    return guestProfile ? JSON.parse(guestProfile) : null;
}

// FAZER LOGOUT DO MODO CONVIDADO
function logoutGuest() {
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestName');
    localStorage.removeItem('guestAvatar');
    localStorage.removeItem('guestId');
    localStorage.removeItem('guestProfile');
    localStorage.removeItem('guestLoginTime');
    
    // Manter créditos se quiser, ou remover:
    // localStorage.removeItem('userCredits');
    
    showNotification('Modo convidado finalizado.', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

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

// NOVA FUNÇÃO: Verificar confirmação entre dispositivos
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
        // VERIFICAR SE É CONVIDADO PRIMEIRO
        if (isGuestUser()) {
            showNotification(`Você está no modo convidado como ${localStorage.getItem('guestName')}.`, 'info');
            return;
        }

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
    checkCrossDeviceConfirmation(); // NOVA VERIFICAÇÃO
    processAuthTokens();
    setupGuestLogin(); // CONFIGURAR LOGIN COMO CONVIDADO
    
    // Verificar se há mensagens de sucesso na URL
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message === 'email_confirmed') {
        showNotification('Email confirmado com sucesso!', 'success');
    }
    
    // SUGERIR EMAIL TEMPORÁRIO PARA TESTES
    suggestTempEmail();
});

// FUNÇÃO PARA SUGERIR EMAIL TEMPORÁRIO
function suggestTempEmail() {
    const emailInput = document.getElementById('signupEmail');
    if (emailInput && !emailInput.value) {
        const tempEmail = `test${Math.floor(Math.random() * 10000)}@tempmail.com`;
        emailInput.placeholder = `Ex: ${tempEmail} (para testes)`;
    }
}

// Função auxiliar para extrair parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// EXPORTAR FUNÇÕES PARA USO EM OUTROS ARQUIVOS
window.AuthUtils = {
    isGuestUser,
    getGuestProfile,
    logoutGuest,
    generateGuestName,
    getRandomAvatar
};

// SISTEMA DE CONVIDADO COMPLETO
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
                await loginAsGuest();
            } catch (error) {
                console.error('Erro ao entrar como convidado:', error);
                showNotification('Erro ao entrar como convidado. Tente novamente.', 'error');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// FUNÇÃO PARA LOGIN COMO CONVIDADO - VERSÃO COMPLETA
async function loginAsGuest() {
    try {
        const guestName = generateGuestName();
        const guestAvatar = getRandomAvatar();
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // SALVAR INFORMAÇÕES COMPLETAS DO CONVIDADO
        const guestProfile = {
            id: guestId,
            nome: guestName,
            avatar: guestAvatar,
            is_guest: true,
            created_at: new Date().toISOString(),
            nivel: 1,
            email: `${guestId}@guest.luckpet.com`
        };
        
        localStorage.setItem('isGuest', 'true');
        localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
        localStorage.setItem('guestLoginTime', new Date().toISOString());
        
        // DADOS INICIAIS PARA CONVIDADO
        localStorage.setItem('userCredits', '25');
        localStorage.setItem('isNewUser', 'true');
        
        // INICIALIZAR CARRINHO E FAVORITOS PARA CONVIDADO
        localStorage.setItem('carrinho', JSON.stringify({}));
        localStorage.setItem('favoritos', JSON.stringify({}));

        showNotification(`🎉 Bem-vindo, ${guestName}! Modo convidado ativado.`, 'success');
        
        // REDIRECIONAR PARA PÁGINA PRINCIPAL
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);

    } catch (error) {
        console.error('Erro no login como convidado:', error);
        throw error;
    }
}

// VERIFICAR SE USUÁRIO É CONVIDADO
function isGuestUser() {
    return localStorage.getItem('isGuest') === 'true';
}

// OBTER PERFIL DO CONVIDADO
function getGuestProfile() {
    const guestProfile = localStorage.getItem('guestProfile');
    return guestProfile ? JSON.parse(guestProfile) : null;
}

// ATUALIZAR UI PARA CONVIDADO
function updateUIForGuest() {
    const guestProfile = getGuestProfile();
    if (!guestProfile) return;
    
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userToggle = document.getElementById('userToggle');
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-name');
    const profileLevel = document.querySelector('.profile-level');
    const userCreditsElement = document.getElementById('userCredits');
    
    // OCULTAR BOTÃO DE LOGIN E MOSTRAR MENU DO USUÁRIO
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    
    // ATUALIZAR AVATAR E NOME
    if (userAvatar) {
        userAvatar.src = `../img/avatares/${guestProfile.avatar}.jpg`;
        userAvatar.alt = guestProfile.nome;
        userAvatar.onerror = function() {
            this.src = '../img/avatares/cachorro.jpg';
        };
    }
    
    if (userName) userName.textContent = guestProfile.nome;
    
    if (profileAvatar) {
        profileAvatar.src = `../img/avatares/${guestProfile.avatar}.jpg`;
        profileAvatar.alt = guestProfile.nome;
        profileAvatar.onerror = function() {
            this.src = '../img/avatares/cachorro.jpg';
        };
    }
    
    if (profileName) profileName.textContent = guestProfile.nome;
    if (profileLevel) profileLevel.textContent = `Nível ${guestProfile.nivel}`;
    
    // ATUALIZAR CRÉDITOS
    if (userCreditsElement) {
        const userCredits = localStorage.getItem('userCredits') || '25';
        userCreditsElement.textContent = userCredits;
    }
    
    console.log('UI atualizada para modo convidado:', guestProfile.nome);
}

// LOGOUT DO CONVIDADO
function logoutGuest() {
    // Manter apenas os créditos, limpar o resto
    const userCredits = localStorage.getItem('userCredits');
    
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestProfile');
    localStorage.removeItem('guestLoginTime');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('carrinho');
    localStorage.removeItem('favoritos');
    
    // Restaurar créditos se existirem
    if (userCredits) {
        localStorage.setItem('userCredits', userCredits);
    }
    
    showNotification('Modo convidado finalizado.', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// GERAR NOME ALEATÓRIO PARA CONVIDADO
function generateGuestName() {
    const names = [
        'Amigo Pet', 'Explorador', 'Aventureiro', 'Curioso', 'Visitante',
        'Amigo dos Bichos', 'PetLover', 'Mimi', 'Tobby', 'Luna', 'Thor', 'Mel',
        'Bob', 'Lucky', 'Charlie', 'Bella', 'Max', 'Lucy', 'Buddy', 'Daisy'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return `${randomName}#${Math.floor(Math.random() * 1000)}`;
}

// OBTER AVATAR ALEATÓRIO
function getRandomAvatar() {
    const avatars = ['cachorro', 'gato', 'coelho', 'pássaro'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

// VERIFICAR E INICIALIZAR CONVIDADO NA PÁGINA PRINCIPAL
function initGuestMode() {
    if (isGuestUser()) {
        console.log('Modo convidado detectado, inicializando...');
        updateUIForGuest();
        setupGuestEventListeners();
    }
}

// CONFIGURAR EVENT LISTENERS PARA CONVIDADO
function setupGuestEventListeners() {
    // Configurar logout para convidado
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            logoutGuest();
        };
    }
    
    // Configurar dropdown do usuário
    const userToggle = document.getElementById('userToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userToggle && userDropdown) {
        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
}

// EXPORTAR FUNÇÕES PARA USO EM OUTROS ARQUIVOS
window.GuestMode = {
    isGuestUser,
    getGuestProfile,
    logoutGuest,
    updateUIForGuest,
    initGuestMode
};