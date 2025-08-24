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

    async handleSignIn(session) {
        this.user = session.user;
        
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
                
                if (avatarImg) {
                    avatarImg.src = `../img/avatars/${this.profile.avatar}.png`;
                    avatarImg.alt = this.profile.nome;
                }
                
                if (userName) userName.textContent = this.profile.nome;
                
                if (profileAvatar) {
                    profileAvatar.src = `../img/avatars/${this.profile.avatar}.png`;
                    profileAvatar.alt = this.profile.nome;
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