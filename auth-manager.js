// Configuração do Supabase
const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Gerenciamento de autenticação e interface
class AuthManager {
    constructor() {
        this.user = null;
        this.profile = null;
        this.init();
    }

    async init() {
        // Verificar sessão ativa
        await this.checkSession();
        
        // Configurar listener para mudanças de autenticação
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.handleSignIn(session);
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            } else if (event === 'USER_UPDATED') {
                // Verificar se o email foi confirmado
                this.checkEmailVerification();
            }
        });
    }

    async checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                await this.handleSignIn(session);
            } else {
                this.handleSignOut();
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            this.handleSignOut();
        }
    }

    async checkEmailVerification() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && session.user) {
                const { data: userData, error } = await supabase.auth.getUser();
                
                if (error) throw error;
                
                // Verificar se o email foi confirmado
                if (userData.user && !userData.user.email_confirmed_at) {
                    console.log('Email não confirmado');
                    // Você pode adicionar lógica adicional aqui se necessário
                }
            }
        } catch (error) {
            console.error('Erro ao verificar email:', error);
        }
    }

    async handleSignIn(session) {
        this.user = session.user;
        
        // Verificar confirmação de email
        if (this.user && !this.user.email_confirmed_at) {
            console.log('Email não confirmado');
            // Você pode adicionar lógica para lidar com email não confirmado
        }
        
        // Buscar perfil do usuário
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', this.user.id)
            .single();
            
        if (error) {
            console.error('Erro ao carregar perfil:', error);
            return;
        }
        
        this.profile = profile;
        console.log('Perfil carregado:', profile);
        this.updateUI();
    }

    handleSignOut() {
        this.user = null;
        this.profile = null;
        this.updateUI();
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (this.user && this.profile) {
            // Usuário logado - mostrar menu de usuário
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                
                // Atualizar avatar e nome
                const avatarImg = userMenu.querySelector('.user-avatar');
                const userName = userMenu.querySelector('.user-name');
                const profileAvatar = userMenu.querySelector('.profile-avatar');
                const profileName = userMenu.querySelector('.profile-name');
                const profileLevel = userMenu.querySelector('.profile-level');
                
                // Mapeamento dos avatares baseado nos valores do formulário
                const avatarMap = {
                    'cachorro': 'ava-dog1.jpg',
                    'gato': 'ava-gato.jpg',
                    'coelho': 'ava-dog2.jpg',
                    'pássaro': 'ava-gato2.jpg'
                };
                
                const avatarFileName = avatarMap[this.profile.avatar] || 'ava-dog1.jpg';
                
                if (avatarImg) {
                    avatarImg.src = `../img/avatares/${avatarFileName}`;
                    avatarImg.alt = this.profile.nome;
                    avatarImg.onerror = function() {
                        console.error('Erro ao carregar avatar:', this.src);
                        this.src = '../img/avatares/ava-dog1.jpg';
                    }
                }
                
                if (userName) userName.textContent = this.profile.nome;
                
                if (profileAvatar) {
                    profileAvatar.src = `../img/avatares/${avatarFileName}`;
                    profileAvatar.alt = this.profile.nome;
                    profileAvatar.onerror = function() {
                        console.error('Erro ao carregar avatar do perfil:', this.src);
                        this.src = '../img/avatares/ava-dog1.jpg';
                    }
                }
                
                if (profileName) profileName.textContent = this.profile.nome;
                if (profileLevel) profileLevel.textContent = `Nível ${this.profile.nivel}`;
            }
        } else {
            // Usuário não logado - mostrar botão de login
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    
    // Configurar toggle do dropdown
    const userToggle = document.getElementById('userToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userToggle && userDropdown) {
        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.authManager.signOut();
        });
    }
});