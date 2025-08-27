// ===== INICIALIZAÇÃO DO AUTH MANAGER =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o gerenciador de autenticação
    if (typeof AuthManager !== 'undefined') {
        window.authManager = new AuthManager();
    }
});

// ===== DADOS E INICIALIZAÇÃO =====
const produtos = {
    racao1: { nome: "Ração Premium Canina", preco: 129.99, tipo: "alimento", img: "img/racao/racao1.jpg" },
    racao2: { nome: "Ração Premium Felina", preco: 89.90, tipo: "alimento", img: "img/racao/racao3.jpg" },
    racao3: { nome: "Ração para Filhotes", preco: 99.99, tipo: "alimento", img: "img/racao/racao2.jpg" },
    racao4: { nome: "Ração Light", preco: 139.99, tipo: "alimento", img: "img/racao/racao4.jpg" },
    racao5: { nome: "Ração Júnior Ossinho", preco: 99.99, tipo: "alimento", img: "img/racao/racao5.jpg" },
    racao6: { nome: "Ração Júnior Vitality", preco: 99.99, tipo: "alimento", img: "img/racao/racao6.jpg" },
    roupa1: { nome: "Conjunto Esportivo", preco: 79.99, tipo: "vestimenta", img: "img/roupas/cachorro-roupa.jpg" },
    roupa2: { nome: "Casaco Acolchoado", preco: 89.99, tipo: "vestimenta", img: "img/roupas/fantasia.jpg" },
    roupa3: { nome: "Fantasia Divertida", preco: 65.00, tipo: "vestimenta", img: "img/roupas/img-cat.jpg" }
};

// Conteúdos do site para a busca
const conteudosSite = {
    secoes: [
        { id: "saude-pet", nome: "Saúde Pet", tipo: "secao", descricao: "Planos de saúde e cuidados veterinários" },
        { id: "moda-pet", nome: "Moda Pet", tipo: "secao", descricao: "Roupas e acessórios para seu pet" },
        { id: "nutricao-pet", nome: "Nutrição", tipo: "secao", descricao: "Alimentos e rações de qualidade" },
        { id: "curiosidades", nome: "Curiosidades", tipo: "secao", descricao: "Fatos interessantes sobre pets" },
        { id: "servicos", nome: "Serviços", tipo: "secao", descricao: "Banho, tosa e consultas veterinárias" }
    ],
    servicos: [
        { id: "banho", nome: "Banho Completo", tipo: "servico", descricao: "Banho higiênico e secagem profissional" },
        { id: "tosa", nome: "Tosa Premium", tipo: "servico", descricao: "Tosa na máquina e modelagem personalizada" },
        { id: "consulta", nome: "Consulta Veterinária", tipo: "servico", descricao: "Check-up completo e vacinação" }
    ],
    planos: [
        { id: "plano-basico", nome: "Plano Básico", tipo: "plano", descricao: "Consulta mensal e vacinação anual", preco: "R$ 99,90/mês" },
        { id: "plano-essencial", nome: "Plano Essencial", tipo: "plano", descricao: "Exames laboratoriais incluídos", preco: "R$ 179,90/mês" },
        { id: "plano-premium", nome: "Plano Premium", tipo: "plano", descricao: "Banho e tosa mensal gratuitos", preco: "R$ 299,90/mês" }
    ],
    curiosidades: [
        { id: "curiosidade1", nome: "Audição Canina", tipo: "curiosidade", descricao: "Cães ouvem sons 4 vezes mais distantes que humanos" },
        { id: "curiosidade2", nome: "Salto Felino", tipo: "curiosidade", descricao: "Gatos pulam até 6 vezes a altura do corpo" },
        { id: "curiosidade3", nome: "Olfato Canino", tipo: "curiosidade", descricao: "Cachorros têm olfato 10.000 vezes mais forte" }
    ]
};

const categorias = {
    alimento: "Alimentos",
    vestimenta: "Roupas e Acessórios",
    servico: "Serviços",
    plano: "Planos de Saúde",
    curiosidade: "Curiosidades"
};

let carrinho = {};
let favoritos = {};
let currentSlide = 0;
let carouselInterval;

// Cache para elementos DOM
const domCache = {
    header: null,
    searchInput: null,
    searchBtn: null,
    searchSuggestions: null,
    notification: null,
    cartModal: null,
    wishlistModal: null,
    bookingModal: null
};

// Debounce para otimizar eventos frequentes
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para eventos de scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Cache de elementos DOM
function cacheDOM() {
    domCache.header = document.querySelector('.header');
    domCache.searchInput = document.getElementById('searchInput');
    domCache.searchBtn = document.getElementById('searchBtn');
    domCache.searchSuggestions = document.getElementById('searchSuggestions');
    domCache.notification = document.getElementById('notification');
    domCache.cartModal = document.getElementById('cartModal');
    domCache.wishlistModal = document.getElementById('wishlistModal');
    domCache.bookingModal = document.getElementById('bookingModal');
}

// ===== VERIFICAÇÃO DE LOGIN OTIMIZADA =====
function checkAuthBeforeAction(actionType, callback) {
    if (window.authManager?.user) {
        callback();
    } else {
        showLoginAlert(actionType);
    }
}

function showLoginAlert(actionType) {
    // Verificar se o alerta já existe
    if (document.querySelector('.login-alert-overlay')) return;
    
    const alertOverlay = document.createElement('div');
    alertOverlay.className = 'login-alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'login-alert-box';
    
    alertBox.innerHTML = `
        <div class="login-alert-icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3>Acesso Restrito</h3>
        <p>Você precisa estar logado para usar essa função. Crie sua conta grátis e aproveite todos os benefícios!</p>
        <div class="login-alert-buttons">
            <button class="btn-secondary" id="loginAlertCancel">Cancelar</button>
            <a href="formulario/login.html" class="btn-primary">Fazer Login</a>
        </div>
    `;
    
    alertOverlay.appendChild(alertBox);
    document.body.appendChild(alertOverlay);
    
    // Estilos inline para evitar criar estilos múltiplas vezes
    if (!document.querySelector('#loginAlertStyles')) {
        const styles = document.createElement('style');
        styles.id = 'loginAlertStyles';
        styles.textContent = `
            .login-alert-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:10000;padding:20px}
            .login-alert-box{background:white;border-radius:16px;padding:30px;text-align:center;max-width:400px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,0.2)}
            .login-alert-icon{font-size:48px;color:#ff9800;margin-bottom:15px}
            .login-alert-box h3{margin:0 0 15px 0;color:#2c3e50;font-size:22px}
            .login-alert-box p{color:#7f8c8d;margin-bottom:25px;line-height:1.5}
            .login-alert-buttons{display:flex;gap:10px;justify-content:center}
            @media (max-width:480px){.login-alert-buttons{flex-direction:column}}
        `;
        document.head.appendChild(styles);
    }
    
    // Event listeners otimizados
    const cancelBtn = alertBox.querySelector('#loginAlertCancel');
    const closeAlert = () => alertOverlay.remove();
    
    cancelBtn.addEventListener('click', closeAlert, { once: true });
    alertOverlay.addEventListener('click', (e) => {
        if (e.target === alertOverlay) closeAlert();
    }, { once: true });
}

// ===== SISTEMA DE PESQUISA OTIMIZADO =====
function initSearch() {
    if (!domCache.searchInput || !domCache.searchBtn || !domCache.searchSuggestions) return;
    
    // Debounce para otimizar a busca
    const debouncedSearch = debounce(showSuggestions, 300);
    
    function showSuggestions() {
        const searchTerm = domCache.searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length === 0) {
            domCache.searchSuggestions.classList.remove('active');
            return;
        }
        
        // Otimizar busca com early return
        if (searchTerm.length < 2) return;
        
        const results = performOptimizedSearch(searchTerm);
        renderSearchResults(results, searchTerm);
    }
    
    function performOptimizedSearch(searchTerm) {
        const allResults = [];
        
        // Busca otimizada em produtos
        for (const [id, product] of Object.entries(produtos)) {
            if (product.nome.toLowerCase().includes(searchTerm) || 
                product.tipo.toLowerCase().includes(searchTerm)) {
                allResults.push({
                    id,
                    nome: product.nome,
                    tipo: product.tipo,
                    preco: `R$ ${product.preco.toFixed(2)}`,
                    categoria: 'produto'
                });
            }
        }
        
        // Busca em outros conteúdos (limitada para performance)
        const searchInArray = (array, categoria) => {
            return array.filter(item => 
                item.nome.toLowerCase().includes(searchTerm) ||
                (item.descricao && item.descricao.toLowerCase().includes(searchTerm))
            ).slice(0, 3).map(item => ({ ...item, categoria }));
        };
        
        allResults.push(
            ...searchInArray(conteudosSite.secoes, 'secao'),
            ...searchInArray(conteudosSite.servicos, 'servico'),
            ...searchInArray(conteudosSite.planos, 'plano'),
            ...searchInArray(conteudosSite.curiosidades, 'curiosidade')
        );
        
        return allResults;
    }
    
    function renderSearchResults(results, searchTerm) {
        if (results.length === 0) {
            domCache.searchSuggestions.innerHTML = '<div class="search-suggestion">Nenhum resultado encontrado</div>';
            domCache.searchSuggestions.classList.add('active');
            return;
        }
        
        // Agrupar e limitar resultados
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.categoria]) grouped[result.categoria] = [];
            if (grouped[result.categoria].length < 3) {
                grouped[result.categoria].push(result);
            }
        });
        
        let html = '';
        const icons = {
            secao: 'fas fa-folder',
            servico: 'fas fa-concierge-bell',
            plano: 'fas fa-heartbeat',
            curiosidade: 'fas fa-lightbulb',
            produto: 'fas fa-shopping-bag'
        };
        
        Object.entries(grouped).forEach(([categoria, items]) => {
            const categoryTitle = {
                secao: 'Seções do Site',
                servico: 'Serviços',
                plano: 'Planos de Saúde',
                curiosidade: 'Curiosidades',
                produto: 'Produtos'
            };
            
            html += `<div class="search-category-title">${categoryTitle[categoria]}</div>`;
            
            items.forEach(item => {
                const icon = icons[categoria];
                const subtitle = categoria === 'produto' 
                    ? `${item.preco} • ${categorias[item.tipo] || item.tipo}`
                    : item.descricao || '';
                
                html += `
                    <div class="search-suggestion" data-${categoria}="${item.id}">
                        <div><i class="${icon}"></i> ${item.nome}</div>
                        <small>${subtitle}</small>
                    </div>
                `;
            });
        });
        
        domCache.searchSuggestions.innerHTML = html;
        domCache.searchSuggestions.classList.add('active');
        attachSearchEvents();
    }
    
    function attachSearchEvents() {
        // Event delegation otimizada
        domCache.searchSuggestions.addEventListener('click', handleSearchClick, { once: true });
    }
    
    function handleSearchClick(e) {
        const suggestion = e.target.closest('.search-suggestion');
        if (!suggestion) return;
        
        const productId = suggestion.getAttribute('data-produto');
        const sectionId = suggestion.getAttribute('data-secao');
        const serviceId = suggestion.getAttribute('data-servico');
        
        domCache.searchSuggestions.classList.remove('active');
        
        if (productId) {
            domCache.searchInput.value = produtos[productId].nome;
            scrollToSection('nutricao-pet');
            setTimeout(() => highlightProduct(productId), 800);
        } else if (sectionId) {
            scrollToSection(sectionId);
        } else if (serviceId) {
            const serviceSelect = document.getElementById('serviceType');
            if (serviceSelect) serviceSelect.value = serviceId;
            domCache.bookingModal?.classList.add('active');
        }
    }
    
    // Event listeners otimizados
    domCache.searchInput.addEventListener('input', debouncedSearch);
    domCache.searchInput.addEventListener('focus', () => {
        if (domCache.searchInput.value.length > 0) showSuggestions();
    });
    
    domCache.searchBtn.addEventListener('click', performSearch);
    domCache.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Click fora otimizado
    document.addEventListener('click', (e) => {
        if (!domCache.searchInput.contains(e.target) && 
            !domCache.searchSuggestions.contains(e.target)) {
            domCache.searchSuggestions.classList.remove('active');
        }
    });
    
    function performSearch() {
        const searchTerm = domCache.searchInput.value.trim();
        if (searchTerm.length < 1) {
            showNotification('Digite algo para pesquisar', true);
            return;
        }
        
        const results = performOptimizedSearch(searchTerm.toLowerCase());
        
        if (results.length === 0) {
            showNotification('Nenhum resultado encontrado para: ' + searchTerm, true);
            return;
        }
        
        showNotification(`Encontrados ${results.length} resultados para: ${searchTerm}`);
        domCache.searchSuggestions.classList.remove('active');
        
        // Navegação otimizada para o melhor resultado
        const bestMatch = results.find(r => r.categoria === 'produto') || results[0];
        
        if (bestMatch.categoria === 'produto') {
            scrollToSection('nutricao-pet');
            setTimeout(() => highlightProduct(bestMatch.id), 800);
        } else {
            scrollToSection(bestMatch.id);
        }
    }
}

// ===== FUNÇÕES AUXILIARES OTIMIZADAS =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const headerHeight = domCache.header?.offsetHeight || 0;
    const targetPosition = section.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function highlightProduct(productId) {
    const productElement = document.querySelector(`[data-product="${productId}"]`);
    if (!productElement) return;
    
    const productCard = productElement.closest('.product-card');
    if (productCard) {
        productCard.classList.add('highlight-product');
        productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => productCard.classList.remove('highlight-product'), 3000);
    }
}

// ===== INICIALIZAÇÃO OTIMIZADA =====
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements primeiro
    cacheDOM();
    
    // Inicializar dados do usuário se logado
    initUserData();
    
    // Inicializar componentes com ordem otimizada
    requestAnimationFrame(() => {
        initCarousel();
        initModals();
        initEventListeners();
        initSearch();
        updateCounters();
        renderCart();
        renderWishlist();
    });
    
    // Inicializar animações de scroll com throttle
    const throttledScrollCheck = throttle(checkScrollAnimations, 100);
    window.addEventListener('scroll', throttledScrollCheck);
    checkScrollAnimations(); // Check inicial
    
    window.scrollTo(0, 0);
});

function initUserData() {
    try {
        if (window.authManager?.user) {
            carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};
            favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
        } else {
            carrinho = {};
            favoritos = {};
        }
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
        carrinho = {};
        favoritos = {};
    }
}

// ===== ANIMAÇÕES DE SCROLL OTIMIZADAS =====
let animationFrameId;

function checkScrollAnimations() {
    if (animationFrameId) return;
    
    animationFrameId = requestAnimationFrame(() => {
        const sections = document.querySelectorAll('.section:not(.visible)');
        const triggerBottom = window.innerHeight * 0.85;
        
        sections.forEach(section => {
            if (section.getBoundingClientRect().top < triggerBottom) {
                section.classList.add('visible');
            }
        });
        
        animationFrameId = null;
    });
}

// ===== SISTEMA DE CARRINHO OTIMIZADO =====
function addToCart(productId, price) {
    checkAuthBeforeAction('cart', () => {
        if (!produtos[productId]) {
            showNotification("Produto não encontrado!", true);
            return;
        }
        
        if (!carrinho[productId]) {
            carrinho[productId] = {
                quantidade: 1,
                total: price,
                ...produtos[productId]
            };
        } else {
            carrinho[productId].quantidade++;
            carrinho[productId].total = carrinho[productId].quantidade * price;
        }
        
        saveToLocalStorage('carrinho', carrinho);
        updateCounters();
        renderCart();
        showNotification(`${produtos[productId].nome} adicionado ao carrinho!`);
    });
}

function removeFromCart(productId, price) {
    if (!carrinho[productId]) return;
    
    if (carrinho[productId].quantidade > 1) {
        carrinho[productId].quantidade--;
        carrinho[productId].total = carrinho[productId].quantidade * price;
    } else {
        delete carrinho[productId];
    }
    
    saveToLocalStorage('carrinho', carrinho);
    updateCounters();
    renderCart();
    showNotification(`Produto removido do carrinho!`, true);
}

function removeAllFromCart(productId) {
    if (!carrinho[productId]) return;
    
    const productName = carrinho[productId].nome;
    delete carrinho[productId];
    
    saveToLocalStorage('carrinho', carrinho);
    updateCounters();
    renderCart();
    showNotification(`${productName} removido do carrinho!`, true);
}

// ===== SISTEMA DE FAVORITOS OTIMIZADO =====
function toggleWishlist(productId) {
    checkAuthBeforeAction('wishlist', () => {
        if (!produtos[productId]) {
            showNotification("Produto não encontrado!", true);
            return;
        }
        
        const isInWishlist = !!favoritos[productId];
        
        if (isInWishlist) {
            delete favoritos[productId];
            showNotification(`${produtos[productId].nome} removido dos favoritos!`, true);
        } else {
            favoritos[productId] = produtos[productId];
            showNotification(`${produtos[productId].nome} adicionado aos favoritos!`);
        }
        
        saveToLocalStorage('favoritos', favoritos);
        updateCounters();
        renderWishlist();
        updateWishlistButtons();
    });
}

// ===== FUNÇÕES DE RENDERIZAÇÃO OTIMIZADAS =====
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (!window.authManager?.user) {
        cartItems.innerHTML = '<p class="wishlist-empty">Faça login para ver seu carrinho</p>';
        cartTotal.textContent = 'Subtotal: R$ 0,00';
        return;
    }
    
    const cartEntries = Object.entries(carrinho);
    
    if (cartEntries.length === 0) {
        cartItems.innerHTML = '<p class="wishlist-empty">Seu carrinho está vazio</p>';
        cartTotal.textContent = 'Subtotal: R$ 0,00';
        return;
    }
    
    const { html, total } = cartEntries.reduce((acc, [id, item]) => {
        acc.total += item.total;
        acc.html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.img}" alt="${item.nome}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-price">R$ ${item.total.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="removeFromCart('${id}', ${item.preco})">-</button>
                        <span>${item.quantidade}</span>
                        <button class="quantity-btn" onclick="addToCart('${id}', ${item.preco})">+</button>
                    </div>
                    <div class="remove-btn" onclick="removeAllFromCart('${id}')">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
        return acc;
    }, { html: '', total: 0 });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `Subtotal: R$ ${total.toFixed(2)}`;
}

function renderWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    const wishlistEmpty = document.getElementById('wishlistEmpty');
    
    if (!wishlistItems || !wishlistEmpty) return;
    
    if (!window.authManager?.user) {
        wishlistItems.innerHTML = '';
        wishlistEmpty.classList.remove('hidden');
        wishlistEmpty.textContent = 'Faça login para ver seus favoritos';
        return;
    }
    
    const wishlistEntries = Object.entries(favoritos);
    
    if (wishlistEntries.length === 0) {
        wishlistItems.innerHTML = '';
        wishlistEmpty.classList.remove('hidden');
        wishlistEmpty.textContent = 'Você ainda não tem favoritos';
        return;
    }
    
    wishlistEmpty.classList.add('hidden');
    
    const html = wishlistEntries.map(([id, item]) => `
        <div class="wishlist-item">
            <div class="wishlist-item-image">
                <img src="${item.img}" alt="${item.nome}" loading="lazy">
            </div>
            <div class="wishlist-item-info">
                <div class="wishlist-item-title">${item.nome}</div>
                <div class="wishlist-item-price">R$ ${item.preco.toFixed(2)}</div>
            </div>
            <div class="wishlist-item-actions">
                <button class="btn-cart" onclick="addToCart('${id}', ${item.preco})">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <div class="remove-btn" onclick="toggleWishlist('${id}')">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        </div>
    `).join('');
    
    wishlistItems.innerHTML = html;
}

// ===== FUNÇÕES AUXILIARES =====
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Erro ao salvar ${key}:`, e);
    }
}

function updateCounters() {
    if (!window.authManager?.user) {
        const cartCount = document.getElementById('cartCount');
        const wishlistCount = document.getElementById('wishlistCount');
        
        if (cartCount) cartCount.textContent = '0';
        if (wishlistCount) wishlistCount.textContent = '0';
        return;
    }
    
    const cartCount = Object.values(carrinho).reduce((sum, item) => sum + item.quantidade, 0);
    const wishlistCount = Object.keys(favoritos).length;
    
    const cartCountElement = document.getElementById('cartCount');
    const wishlistCountElement = document.getElementById('wishlistCount');
    
    if (cartCountElement) cartCountElement.textContent = cartCount;
    if (wishlistCountElement) wishlistCountElement.textContent = wishlistCount;
}

function updateWishlistButtons() {
    document.querySelectorAll('.product-wishlist, .btn-wishlist').forEach(btn => {
        const productId = btn.dataset.product;
        const isActive = !!favoritos[productId];
        
        btn.classList.toggle('active', isActive);
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fas fa-heart' : 'far fa-heart';
        }
    });
}

// ===== NOTIFICAÇÕES OTIMIZADAS =====
function showNotification(message, isError = false) {
    if (!domCache.notification) return;
    
    domCache.notification.textContent = message;
    domCache.notification.classList.toggle('error', isError);
    domCache.notification.classList.add('active');
    
    setTimeout(() => {
        domCache.notification.classList.remove('active');
    }, 3000);
}

// ===== CARROSSEL OTIMIZADO =====
function initCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const carouselItems = carouselInner?.querySelectorAll('.carousel-item');
    const carouselDots = document.getElementById('carouselDots');
    
    if (!carouselInner || !carouselItems?.length) return;
    
    // Criar dots apenas se não existirem
    if (carouselDots && carouselDots.children.length === 0) {
        const dotsFragment = document.createDocumentFragment();
        carouselItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsFragment.appendChild(dot);
        });
        carouselDots.appendChild(dotsFragment);
    }
    
    startCarousel();
}

function goToSlide(index) {
    const carouselInner = document.getElementById('carouselInner');
    const carouselItems = carouselInner?.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!carouselItems?.length) return;
    
    if (index >= carouselItems.length) index = 0;
    if (index < 0) index = carouselItems.length - 1;
    
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
    stopCarousel();
    startCarousel();
}

function nextSlide() {
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

function startCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarousel() {
    clearInterval(carouselInterval);
}

// ===== MODAIS OTIMIZADOS =====
function initModals() {
    // Event delegation otimizada para modais
    document.addEventListener('click', handleModalEvents);
    
    // Fechar modais com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

function handleModalEvents(e) {
    const target = e.target;
    
    // Modal do carrinho
    if (target.id === 'cartIcon' || target.id === 'viewCartBtn') {
        e.preventDefault();
        if (!window.authManager?.user) {
            showLoginAlert('cart');
        } else {
            domCache.cartModal?.classList.add('active');
        }
        return;
    }
    
    // Modal de favoritos
    if (target.id === 'wishlistIcon') {
        e.preventDefault();
        if (!window.authManager?.user) {
            showLoginAlert('wishlist');
        } else {
            domCache.wishlistModal?.classList.add('active');
        }
        return;
    }
    
    // Fechar modais
    if (target.id === 'closeCartModal') {
        domCache.cartModal?.classList.remove('active');
        return;
    }
    
    if (target.id === 'closeWishlistModal') {
        domCache.wishlistModal?.classList.remove('active');
        return;
    }
    
    if (target.id === 'closeBookingModal') {
        domCache.bookingModal?.classList.remove('active');
        return;
    }
    
    // Serviços
    const serviceBtn = target.closest('[data-service]');
    if (serviceBtn) {
        const service = serviceBtn.dataset.service;
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect) serviceSelect.value = service;
        domCache.bookingModal?.classList.add('active');
        return;
    }
    
    // Fechar modal ao clicar no overlay
    if (target.classList.contains('modal')) {
        target.classList.remove('active');
    }
}

// ===== FORMULÁRIOS OTIMIZADOS =====
function initForms() {
    const bookingForm = document.getElementById('bookingForm');
    const feedbackForm = document.getElementById('feedbackForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const serviceType = form.querySelector('#serviceType').value;
    const petType = form.querySelector('#petType').value;
    const date = form.querySelector('#bookingDate').value;
    const time = form.querySelector('#bookingTime').value;
    
    if (!serviceType || !petType || !date || !time) {
        showNotification('Por favor, preencha todos os campos', true);
        return;
    }
    
    showNotification(`Agendamento confirmado para ${serviceType} (${petType}) em ${date} às ${time}`);
    domCache.bookingModal?.classList.remove('active');
    form.reset();
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const userName = form.querySelector('#userName').value;
    const userComment = form.querySelector('#userComment').value;
    const rating = form.querySelector('input[name="rating"]:checked');
    
    if (!userName || !rating) {
        showNotification('Por favor, preencha pelo menos o nome e a avaliação', true);
        return;
    }
    
    showNotification('Obrigado pela sua avaliação!');
    form.reset();
}

// ===== EVENT LISTENERS OTIMIZADOS =====
function initEventListeners() {
    // Event delegation para botões de produtos
    document.addEventListener('click', handleProductActions);
    
    // Carrossel hover events
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', stopCarousel);
        heroCarousel.addEventListener('mouseleave', startCarousel);
    }
    
    // Inicializar outros sistemas
    initSmoothScroll();
    initForms();
    updateWishlistButtons();
}

function handleProductActions(e) {
    const target = e.target;
    const btn = target.closest('.btn-cart, .product-wishlist, .btn-wishlist');
    
    if (!btn) return;
    
    const productId = btn.dataset.product;
    const price = parseFloat(btn.dataset.price);
    
    if (btn.classList.contains('btn-cart')) {
        addToCart(productId, price);
    } else if (btn.classList.contains('product-wishlist') || btn.classList.contains('btn-wishlist')) {
        toggleWishlist(productId);
    }
}

// ===== SCROLL SUAVE OTIMIZADO =====
function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const categoryItem = e.target.closest('.category-item');
        if (categoryItem) {
            e.preventDefault();
            const sectionId = categoryItem.dataset.section;
            scrollToSection(sectionId);
        }
    });
}

// ===== FUNÇÕES DE LIMPEZA DE DADOS =====
function clearUserData() {
    carrinho = {};
    favoritos = {};
    updateCounters();
    renderCart();
    renderWishlist();
    
    // Limpar localStorage
    try {
        localStorage.removeItem('carrinho');
        localStorage.removeItem('favoritos');
    } catch (e) {
        console.error("Erro ao limpar localStorage:", e);
    }
}

// ===== MONITORAMENTO DE AUTENTICAÇÃO OTIMIZADO =====
let authCheckInterval;

function initAuthMonitoring() {
    // Verificar estado de autenticação apenas quando necessário
    if (window.authManager) {
        const originalHandleSignOut = window.authManager.handleSignOut;
        if (originalHandleSignOut) {
            window.authManager.handleSignOut = function() {
                originalHandleSignOut.call(this);
                clearUserData();
            };
        }
        
        // Verificação periódica mais eficiente (apenas se houver dados)
        authCheckInterval = setInterval(() => {
            const hasUserData = Object.keys(carrinho).length > 0 || Object.keys(favoritos).length > 0;
            
            if (hasUserData && (!window.authManager || !window.authManager.user)) {
                clearUserData();
            }
        }, 5000); // Reduzido para 5 segundos ao invés de 1
    }
}

// ===== CLEANUP AO SAIR DA PÁGINA =====
window.addEventListener('beforeunload', () => {
    clearInterval(carouselInterval);
    clearInterval(authCheckInterval);
    
    // Cancelar qualquer animation frame pendente
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

// ===== LAZY LOADING PARA IMAGENS =====
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        // Observar imagens com data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== PERFORMANCE MONITORING =====
function initPerformanceMonitoring() {
    // Monitorar performance apenas em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Modo desenvolvimento: monitoramento ativo');
        
        // Observer para detectar layouts grandes
        if ('LayoutShiftAttribution' in window) {
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.value > 0.1) {
                        console.warn('Layout shift detectado:', entry.value);
                    }
                }
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }
}

// ===== INICIALIZAÇÃO FINAL =====
// Atualizar o DOMContentLoaded para incluir os novos sistemas
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements primeiro
    cacheDOM();
    
    // Inicializar dados do usuário
    initUserData();
    
    // Inicializar componentes principais
    requestAnimationFrame(() => {
        initCarousel();
        initModals();
        initEventListeners();
        initSearch();
        initLazyLoading();
        initAuthMonitoring();
        
        // Atualizar interface
        updateCounters();
        renderCart();
        renderWishlist();
        
        // Performance monitoring apenas em desenvolvimento
        initPerformanceMonitoring();
    });
    
    // Scroll animations com throttle
    const throttledScrollCheck = throttle(checkScrollAnimations, 100);
    window.addEventListener('scroll', throttledScrollCheck, { passive: true });
    checkScrollAnimations();
    
    // Scroll inicial
    window.scrollTo(0, 0);
});