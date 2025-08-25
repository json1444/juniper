// Configuração do Supabase
const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// Verificar parâmetros de URL para confirmação de email
function checkEmailConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    // Verificar se temos tokens de autenticação na URL (redirecionamento do Supabase)
    if (accessToken && refreshToken) {
        // Extrair o tipo da URL (signup ou recovery)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const signupType = hashParams.get('type');
        
        if (signupType === 'signup') {
            // Processar o login automático com os tokens
            processAutoLogin(accessToken, refreshToken);
            return;
        }
    }
    
    if (type === 'signup') {
        // Redirecionar para página de email verificado
        window.location.href = '../email-verificado.html';
    }
}

// Processar login automático com tokens
async function processAutoLogin(accessToken, refreshToken) {
    try {
        // Definir a sessão manualmente
        const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        
        if (error) throw error;
        
        if (session) {
            // Buscar perfil do usuário
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (profileError) {
                console.error('Erro ao carregar perfil:', profileError);
                // Criar perfil padrão se não existir
                await createDefaultProfile(session.user);
            }
            
            // Redirecionar para página de email verificado
            window.location.href = '../email-verificado.html';
        }
    } catch (error) {
        console.error('Erro no login automático:', error);
        // Em caso de erro, ainda redirecionar para a página de confirmação
        window.location.href = '../email-verificado.html';
    }
}

// Criar perfil padrão se não existir
async function createDefaultProfile(user) {
    try {
        const { error } = await supabase
            .from('profiles')
            .insert([{ 
                id: user.id, 
                nome: user.email.split('@')[0], // Usar parte do email como nome
                avatar: 'cachorro', 
                nivel: 1 
            }]);
            
        if (error) throw error;
    } catch (error) {
        console.error('Erro ao criar perfil padrão:', error);
    }
}

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
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    name: name,
                    avatar: avatar
                },
                // Usar a URL atual como redirecionamento
                emailRedirectTo: `${window.location.origin}${window.location.pathname}`
            }
        });
        
        if (authError) throw authError;

        showMessage('Conta criada com sucesso! Verifique seu email para confirmar sua conta.', 'success');

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

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    checkEmailConfirmation();
});