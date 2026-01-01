// guest-mode.js - Funcionalidades de modo convidado

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

// FUNÇÃO PARA LOGIN COMO CONVIDADO
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
        localStorage.setItem('userCredits', '25');
        localStorage.setItem('isNewUser', 'true');
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

// LOGOUT DO CONVIDADO
function logoutGuest() {
    const userCredits = localStorage.getItem('userCredits');
    
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestProfile');
    localStorage.removeItem('guestLoginTime');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('carrinho');
    localStorage.removeItem('favoritos');
    
    if (userCredits) {
        localStorage.setItem('userCredits', userCredits);
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Modo convidado finalizado.', 'info');
    }
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// ATUALIZAR UI PARA CONVIDADO
function updateUIForGuest() {
    const guestProfile = getGuestProfile();
    if (!guestProfile) return;
    
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
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

// CONFIGURAR LOGIN COMO CONVIDADO
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

// EXPORTAR FUNÇÕES PARA USO GLOBAL
window.GuestMode = {
    isGuestUser,
    getGuestProfile,
    loginAsGuest,
    logoutGuest,
    updateUIForGuest,
    initGuestMode,
    setupGuestLogin
};