// Configuração do Supabase
const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

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

// Cadastro de usuário
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const avatar = document.querySelector('input[name="avatar"]:checked').value;

    try {
        // Criar usuário no Supabase Auth com redirecionamento personalizado
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    nome: name,
                    avatar: avatar
                },
                emailRedirectTo: 'https://projeto-luckpet.vercel.app/formulario/confirmacao-email.html'
            }
        });
        
        if (authError) throw authError;

        // Criar perfil do usuário na tabela profiles
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ 
                    id: authData.user.id, 
                    nome: name, 
                    avatar: avatar, 
                    nivel: 1 
                }]);
            
            if (profileError) {
                console.error('Erro ao criar perfil:', profileError);
                // Não lançar erro aqui para não interromper o fluxo
            }
        }

        showMessage('Conta criada com sucesso! Verifique seu email para confirmar. 📧', 'success');

        // Limpar formulário
        signupForm.reset();

    } catch (error) {
        console.error('Erro no cadastro:', error);
        showMessage(error.message, 'error');
    }
});

// Login de usuário
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        showMessage('Login realizado com sucesso! Redirecionando...', 'success');

        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);

    } catch (error) {
        console.error('Erro no login:', error);
        showMessage(error.message, 'error');
    }
});

// Mostrar mensagens de erro/sucesso
function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;

    const activeForm = document.querySelector('.auth-form.active');
    activeForm.insertBefore(messageEl, activeForm.firstChild);

    setTimeout(() => messageEl.remove(), 5000);
}

// Verificar se é uma confirmação de email
async function checkEmailConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // Verificar se há erro na URL
    if (error) {
        showMessage(`Erro: ${errorDescription || error}`, 'error');
        return;
    }
    
    // Verificar se é um redirecionamento de confirmação de email
    if (accessToken && refreshToken) {
        try {
            // Tentar fazer login com os tokens
            const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (sessionError) throw sessionError;
            
            if (data && data.user) {
                // Mostrar mensagem de sucesso
                showMessage('Email confirmado com sucesso! Redirecionando...', 'success');
                
                // Redirecionar para página de confirmação após breve delay
                setTimeout(() => {
                    window.location.href = 'confirmacao-email.html';
                }, 2000);
            }
            
        } catch (error) {
            console.error('Erro ao processar confirmação:', error);
            
            // Se der erro mas tiver tokens, tenta redirecionar diretamente
            if (accessToken && refreshToken) {
                setTimeout(() => {
                    window.location.href = 'confirmacao-email.html';
                }, 1000);
            } else {
                showMessage('Erro ao confirmar email. Tente fazer login manualmente.', 'error');
            }
        }
    }
    
    // Verificar também pelo parâmetro type (fallback)
    const confirmationType = urlParams.get('type');
    if (confirmationType === 'signup' || confirmationType === 'email') {
        // Redirecionar para página de confirmação
        setTimeout(() => {
            window.location.href = 'confirmacao-email.html';
        }, 1000);
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
                showMessage(`Você já está logado como ${profile.nome}. Redirecionando em 3 segundos...`, 'success');

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
    processAuthTokens();
    
    // Verificar se há mensagens de sucesso na URL
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message === 'email_confirmed') {
        showMessage('Email confirmado com sucesso!', 'success');
    }
});

// Função auxiliar para extrair parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}