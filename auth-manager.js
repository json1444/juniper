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
            console.log('Auth state changed:', event, session);
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                this.handleSignIn(session);
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });

        // Verificar também tokens na URL (para confirmação de email)
        this.checkUrlTokens();
    }

    async checkUrlTokens() {
        // Verificar tokens na URL (comum após confirmação de email)
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        if (accessToken && refreshToken) {
            try {
                console.log('Tokens encontrados na URL, processando...');
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (!error) {
                    // Limpar a URL para remover os tokens
                    window.history.replaceState({}, document.title, window.location.pathname);
                    console.log('Sessão configurada com sucesso a partir dos tokens da URL');
                }
            } catch (error) {
                console.error('Erro ao processar tokens da URL:', error);
            }
        }
    }

    async checkSession() {
        try {
            console.log('Verificando sessão...');
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Erro ao obter sessão:', error);
                this.handleSignOut();
                return;
            }
            
            if (session) {
                console.log('Sessão encontrada:', session.user.email);
                await this.handleSignIn(session);
            } else {
                console.log('Nenhuma sessão encontrada');
                this.handleSignOut();
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            this.handleSignOut();
        }
    }

    async handleSignIn(session) {
        try {
            this.user = session.user;
            console.log('Usuário autenticado:', this.user.email);
            
            // Buscar perfil do usuário
            await this.loadUserProfile();
            
            this.updateUI();
            
            // Se estiver na página de confirmação, redirecionar para home após login
            if (window.location.pathname.includes('confirmacao-email.html')) {
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 3000);
            }
            
        } catch (error) {
            console.error('Erro no handleSignIn:', error);
        }
    }

    async loadUserProfile() {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();
                
            if (error) {
                console.error('Erro ao carregar perfil:', error);
                
                // Tentar criar perfil se não existir
                await this.createUserProfile();
                return;
            }
            
            this.profile = profile;
            console.log('Perfil carregado:', profile);
            
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    async createUserProfile() {
        try {
            // Usar metadata do usuário ou valores padrão
            const userMetadata = this.user.user_metadata || {};
            const { error } = await supabase
                .from('profiles')
                .insert([{ 
                    id: this.user.id, 
                    nome: userMetadata.nome || this.user.email.split('@')[0],
                    avatar: userMetadata.avatar || 'cachorro',
                    nivel: 1,
                    created_at: new Date().toISOString()
                }]);
            
            if (error) {
                console.error('Erro ao criar perfil:', error);
                return;
            }
            
            // Recarregar perfil após criação
            await this.loadUserProfile();
            
        } catch (error) {
            console.error('Erro ao criar perfil:', error);
        }
    }

    handleSignOut() {
        this.user = null;
        this.profile = null;
        console.log('Usuário deslogado');
        this.updateUI();
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Redirecionar para página inicial após logout
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        
        console.log('Atualizando UI - Usuário:', this.user ? 'Logado' : 'Deslogado');
        
        if (this.user && this.profile) {
            // Usuário logado - mostrar menu de usuário
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                
                // Atualizar avatar e nome
                this.updateUserAvatar();
                this.updateUserName();
            }
        } else {
            // Usuário não logado - mostrar botão de login
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateUserAvatar() {
        const avatarImg = document.querySelector('.user-avatar');
        const profileAvatar = document.querySelector('.profile-avatar');
        
        if (!this.profile) return;
        
        // Mapeamento dos avatares
        const avatarMap = {
            'cachorro': 'cachorro.jpg',
            'gato': 'gato.jpg',
            'coelho': 'coelho.jpg',
            'pássaro': 'passaro.jpg'
        };
        
        const avatarFileName = avatarMap[this.profile.avatar] || 'cachorro.jpg';
        const avatarPath = `../img/avatares/${avatarFileName}`;
        
        if (avatarImg) {
            avatarImg.src = avatarPath;
            avatarImg.alt = this.profile.nome;
            avatarImg.onerror = function() {
                console.error('Erro ao carregar avatar:', this.src);
                this.src = '../img/avatares/ava-dog1.jpg';
            }
        }
        
        if (profileAvatar) {
            profileAvatar.src = avatarPath;
            profileAvatar.alt = this.profile.nome;
            profileAvatar.onerror = function() {
                console.error('Erro ao carregar avatar do perfil:', this.src);
                this.src = '../img/avatares/cachorro.jpg';
            }
        }
    }

    updateUserName() {
        const userName = document.querySelector('.user-name');
        const profileName = document.querySelector('.profile-name');
        const profileLevel = document.querySelector('.profile-level');
        
        if (!this.profile) return;
        
        if (userName) userName.textContent = this.profile.nome;
        if (profileName) profileName.textContent = this.profile.nome;
        if (profileLevel) profileLevel.textContent = `Nível ${this.profile.nivel}`;
    }

    // Método para forçar atualização da UI
    forceUpdate() {
        this.updateUI();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando AuthManager...');
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
        document.addEventListener('click', (e) => {
            if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
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

    // Verificar se há mudanças de autenticação a cada 2 segundos (para garantir)
    setInterval(() => {
        if (window.authManager) {
            window.authManager.checkSession();
        }
    }, 2000);
});

// Função global para forçar atualização do auth
window.refreshAuth = function() {
    if (window.authManager) {
        window.authManager.checkSession();
    }
};