// auth-manager.js - ÚNICA instância do Supabase

// Configuração do Supabase (APENAS UMA VEZ)
if (typeof window.supabase === 'undefined') {
    const SUPABASE_URL = 'https://drbukxyfvbpcqfzykose.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';

    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase inicializado no auth-manager.js');
}

// Usar a instância global
const supabase = window.supabase;

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

        // Verificar tokens na URL
        this.checkUrlTokens();
        
        // Verificar confirmação de email entre dispositivos
        this.checkCrossDeviceEmailConfirmation();
    }

    async checkUrlTokens() {
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
                    window.history.replaceState({}, document.title, window.location.pathname);
                    console.log('Sessão configurada com sucesso a partir dos tokens da URL');
                    
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        localStorage.setItem('emailConfirmed', 'true');
                        localStorage.setItem('userEmail', user.email);
                    }
                }
            } catch (error) {
                console.error('Erro ao processar tokens da URL:', error);
            }
        }
    }
    
    async checkCrossDeviceEmailConfirmation() {
        const emailConfirmed = localStorage.getItem('emailConfirmed');
        const userEmail = localStorage.getItem('userEmail');
        
        if (emailConfirmed === 'true' && userEmail) {
            console.log('Email confirmado em outro dispositivo:', userEmail);
            
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (!session) {
                    this.showEmailConfirmedMessage(userEmail);
                } else {
                    localStorage.removeItem('emailConfirmed');
                    localStorage.removeItem('userEmail');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão cross-device:', error);
            }
        }
    }
    
    showEmailConfirmedMessage(email) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'cross-device-message';
        messageDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Email ${email} confirmado com sucesso! Faça login para continuar.
        `;
        
        if (!document.querySelector('#crossDeviceStyles')) {
            const styles = document.createElement('style');
            styles.id = 'crossDeviceStyles';
            styles.textContent = `
                .cross-device-message {
                    background: #e3f2fd;
                    border: 1px solid #bbdefb;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: center;
                    color: #0d47a1;
                }
                
                .cross-device-message i {
                    color: #2196f3;
                    margin-right: 10px;
                }
            `;
            document.head.appendChild(styles);
        }
        
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.insertBefore(messageDiv, authCard.firstChild);
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
            
            const urlParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = urlParams.get('access_token');
            
            if (accessToken) {
                await this.handleEmailConfirmation(session);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                await this.loadUserProfile();
                this.updateUI();
            }
            
            await this.checkAndAwardCredits();
            localStorage.removeItem('emailConfirmed');
            localStorage.removeItem('userEmail');
            
        } catch (error) {
            console.error('Erro no handleSignIn:', error);
        }
    }
    
    async checkAndAwardCredits() {
        try {
            const hasCredits = localStorage.getItem('userCredits');
            
            if (!hasCredits && this.user) {
                localStorage.setItem('userCredits', '50');
                localStorage.setItem('isNewUser', 'true');
                
                console.log('50 LuckCoins concedidos ao novo usuário:', this.user.email);
                
                if (typeof showNotification === 'function') {
                    showNotification('🎉 Parabéns! Você ganhou 50 LuckCoins de boas-vindas!', 'success');
                }
                
                this.showWelcomeSection();
            }
        } catch (error) {
            console.error('Erro ao conceder créditos:', error);
        }
    }
    
    showWelcomeSection() {
        const welcomeSection = document.getElementById('welcome-credits');
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
            
            setTimeout(() => {
                welcomeSection.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }
    }
    
    async handleEmailConfirmation(session) {
        try {
            this.user = session.user;
            console.log('Usuário confirmado via email:', this.user.email);
            
            localStorage.setItem('emailConfirmed', 'true');
            localStorage.setItem('userEmail', this.user.email);
            
            await this.loadUserProfile();
            this.updateUI();
            await this.checkAndAwardCredits();
            
            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    const channel = new BroadcastChannel('auth_channel');
                    channel.postMessage({ 
                        type: 'USER_CONFIRMED', 
                        email: this.user.email 
                    });
                } catch (e) {
                    console.log('BroadcastChannel não suportado');
                }
            }
            
        } catch (error) {
            console.error('Erro no handleEmailConfirmation:', error);
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
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                this.updateUserAvatar();
                this.updateUserName();
                this.updateUserCredits();
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateUserAvatar() {
        const avatarImg = document.querySelector('.user-avatar');
        const profileAvatar = document.querySelector('.profile-avatar');
        
        if (!this.profile) return;
        
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
    
    updateUserCredits() {
        const userCreditsElement = document.getElementById('userCredits');
        if (userCreditsElement) {
            const userCredits = localStorage.getItem('userCredits') || '0';
            userCreditsElement.textContent = userCredits;
        }
    }

    forceUpdate() {
        this.updateUI();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando AuthManager...');
    
    if (typeof supabase === 'undefined') {
        console.error('ERRO: Supabase não está disponível. Verifique se a biblioteca foi carregada.');
        return;
    }
    
    window.authManager = new AuthManager();
    
    // Configurar toggle do dropdown
    const userToggle = document.getElementById('userToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userToggle && userDropdown) {
        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
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

// Função para fechar a seção de boas-vindas
window.closeWelcome = function() {
    const welcomeSection = document.getElementById('welcome-credits');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }
};