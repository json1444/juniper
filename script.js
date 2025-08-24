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

let carrinho = {};
let favoritos = {};
let currentSlide = 0;
let carouselInterval;

// ===== FUNÇÕES DE INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrinho e favoritos do localStorage
    try {
        carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};
        favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage:", e);
        carrinho = {};
        favoritos = {};
    }
    
    // Inicializar componentes
    initCarousel();
    initModals();
    initEventListeners();
    initScrollAnimations();
    initSearch();
    updateCounters();
    renderCart();
    renderWishlist();
    
    // Scroll para o topo
    window.scrollTo(0, 0);
});

// ===== ANIMAÇÕES DE SCROLL =====
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    // Verificar se as seções já estão visíveis no carregamento
    checkVisibility();
    
    // Adicionar o event listener para scroll
    window.addEventListener('scroll', checkVisibility);
    
    function checkVisibility() {
        const triggerBottom = window.innerHeight * 0.85;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            
            if (sectionTop < triggerBottom) {
                section.classList.add('visible');
            }
        });
    }
}

// ===== SCROLL SUAVE PARA SEÇÕES =====
function initSmoothScroll() {
    // Adicionar evento de clique para as categorias
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== SISTEMA DE CARRINHO =====
function addToCart(productId, price) {
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
    
    // Atualizar localStorage
    try {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
    }
    
    // Atualizar interface
    updateCounters();
    renderCart();
    
    // Mostrar notificação
    showNotification(`${produtos[productId].nome} adicionado ao carrinho!`);
}

function removeFromCart(productId, price) {
    if (carrinho[productId]) {
        if (carrinho[productId].quantidade > 1) {
            carrinho[productId].quantidade--;
            carrinho[productId].total = carrinho[productId].quantidade * price;
        } else {
            delete carrinho[productId];
        }
        
        // Atualizar localStorage
        try {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        // Atualizar interface
        updateCounters();
        renderCart();
        
        // Mostrar notificação
        showNotification(`${produtos[productId].nome} removido do carrinho!`, true);
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (Object.keys(carrinho).length === 0) {
        cartItems.innerHTML = '<p class="wishlist-empty">Seu carrinho está vazio</p>';
        cartTotal.textContent = 'Subtotal: R$ 0,00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    for (const [id, item] of Object.entries(carrinho)) {
        total += item.total;
        
        html += `
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
    }
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `Subtotal: R$ ${total.toFixed(2)}`;
}

function removeAllFromCart(productId) {
    if (carrinho[productId]) {
        delete carrinho[productId];
        
        // Atualizar localStorage
        try {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        // Atualizar interface
        updateCounters();
        renderCart();
        
        // Mostrar notificação
        showNotification(`${produtos[productId].nome} removido do carrinho!`, true);
    }
}

// ===== SISTEMA DE FAVORITOS =====
function toggleWishlist(productId) {
    if (!produtos[productId]) {
        showNotification("Produto não encontrado!", true);
        return;
    }
    
    if (favoritos[productId]) {
        delete favoritos[productId];
        showNotification(`${produtos[productId].nome} removido dos favoritos!`, true);
    } else {
        favoritos[productId] = produtos[productId];
        showNotification(`${produtos[productId].nome} adicionado aos favoritos!`);
    }
    
    // Atualizar localStorage
    try {
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
    }
    
    // Atualizar interface
    updateCounters();
    renderWishlist();
    updateWishlistButtons();
}

function renderWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    const wishlistEmpty = document.getElementById('wishlistEmpty');
    
    if (!wishlistItems || !wishlistEmpty) return;
    
    if (Object.keys(favoritos).length === 0) {
        wishlistItems.innerHTML = '';
        wishlistEmpty.classList.remove('hidden');
        return;
    }
    
    wishlistEmpty.classList.add('hidden');
    
    let html = '';
    
    for (const [id, item] of Object.entries(favoritos)) {
        html += `
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
        `;
    }
    
    wishlistItems.innerHTML = html;
}

function updateWishlistButtons() {
    document.querySelectorAll('.product-wishlist, .btn-wishlist').forEach(btn => {
        const productId = btn.dataset.product;
        if (favoritos[productId]) {
            btn.classList.add('active');
            btn.querySelector('i').className = 'fas fa-heart';
        } else {
            btn.classList.remove('active');
            btn.querySelector('i').className = 'far fa-heart';
        }
    });
}

// ===== CONTADORES =====
function updateCounters() {
    // Contador do carrinho
    const cartCount = Object.values(carrinho).reduce((total, item) => total + item.quantidade, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) cartCountElement.textContent = cartCount;
    
    // Contador de favoritos
    const wishlistCount = Object.keys(favoritos).length;
    const wishlistCountElement = document.getElementById('wishlistCount');
    if (wishlistCountElement) wishlistCountElement.textContent = wishlistCount;
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// ===== CARROSSEL =====
function initCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const carouselItems = carouselInner ? carouselInner.querySelectorAll('.carousel-item') : [];
    const carouselDots = document.getElementById('carouselDots');
    
    if (!carouselInner || carouselItems.length === 0) return;
    
    // Criar dots de navegação
    if (carouselDots) {
        carouselItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            carouselDots.appendChild(dot);
        });
    }
    
    // Iniciar autoplay
    startCarousel();
}

function startCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarousel() {
    clearInterval(carouselInterval);
}

function goToSlide(index) {
    const carouselInner = document.getElementById('carouselInner');
    const carouselItems = carouselInner ? carouselInner.querySelectorAll('.carousel-item') : [];
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (carouselItems.length === 0) return;
    
    if (index >= carouselItems.length) index = 0;
    if (index < 0) index = carouselItems.length - 1;
    
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
    
    // Atualizar dots
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    currentSlide = index;
    
    // Reiniciar o carousel ao interagir manualmente
    stopCarousel();
    startCarousel();
}

function nextSlide() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

// ===== SISTEMA DE PESQUISA =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput || !searchBtn || !searchSuggestions) return;
    
    // Função para mostrar sugestões
    function showSuggestions() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            searchSuggestions.classList.remove('active');
            return;
        }
        
        // Filtrar produtos
        const results = Object.entries(produtos).filter(([id, product]) => {
            return product.nome.toLowerCase().includes(searchTerm) || 
                   product.tipo.toLowerCase().includes(searchTerm);
        });
        
        if (results.length === 0) {
            searchSuggestions.innerHTML = '<div class="search-suggestion">Nenhum produto encontrado</div>';
            searchSuggestions.classList.add('active');
            return;
        }
        
        // Limitar a 5 sugestões
        const limitedResults = results.slice(0, 5);
        
        let html = '';
        limitedResults.forEach(([id, product]) => {
            html += `
                <div class="search-suggestion" data-product="${id}">
                    <div>${product.nome}</div>
                    <small>R$ ${product.preco.toFixed(2)}</small>
                </div>
            `;
        });
        
        searchSuggestions.innerHTML = html;
        searchSuggestions.classList.add('active');
        
        // Adicionar eventos de clique nas sugestões
        document.querySelectorAll('.search-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const productId = this.getAttribute('data-product');
                if (productId && produtos[productId]) {
                    searchInput.value = produtos[productId].nome;
                    searchSuggestions.classList.remove('active');
                    
                    // Scroll para a seção de produtos
                    const modaPetSection = document.getElementById('moda-pet');
                    if (modaPetSection) {
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = modaPetSection.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
    
    // Event listeners
    searchInput.addEventListener('input', showSuggestions);
    
    searchInput.addEventListener('focus', function() {
        if (this.value.length >= 2) {
            showSuggestions();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchBtn.addEventListener('click', performSearch);
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            showNotification('Digite pelo menos 2 caracteres para pesquisar', true);
            return;
        }
        
        // Filtrar produtos
        const results = Object.entries(produtos).filter(([id, product]) => {
            return product.nome.toLowerCase().includes(searchTerm) || 
                   product.tipo.toLowerCase().includes(searchTerm);
        });
        
        if (results.length === 0) {
            showNotification('Nenhum produto encontrado para: ' + searchTerm, true);
            return;
        }
        
        showNotification(`Encontrados ${results.length} produtos para: ${searchTerm}`);
        searchSuggestions.classList.remove('active');
        
        // Scroll para a seção de produtos
        const modaPetSection = document.getElementById('moda-pet');
        if (modaPetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = modaPetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ===== MODAIS =====
function initModals() {
    // Modal do carrinho
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            document.getElementById('cartModal').classList.add('active');
        });
    }
    
    const closeCartModal = document.getElementById('closeCartModal');
    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => {
            document.getElementById('cartModal').classList.remove('active');
        });
    }
    
    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('cartModal').classList.add('active');
        });
    }
    
    // Modal de favoritos
    const wishlistIcon = document.getElementById('wishlistIcon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.add('active');
        });
    }
    
    const closeWishlistModal = document.getElementById('closeWishlistModal');
    if (closeWishlistModal) {
        closeWishlistModal.addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.remove('active');
        });
    }
    
    // Modal de agendamento
    document.querySelectorAll('[data-service]').forEach(btn => {
        btn.addEventListener('click', () => {
            const service = btn.dataset.service;
            document.getElementById('serviceType').value = service;
            document.getElementById('bookingModal').classList.add('active');
        });
    });
    
    const closeBookingModal = document.getElementById('closeBookingModal');
    if (closeBookingModal) {
        closeBookingModal.addEventListener('click', () => {
            document.getElementById('bookingModal').classList.remove('active');
        });
    }
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ===== FORMULÁRIOS =====
function initForms() {
    // Formulário de agendamento
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const serviceType = document.getElementById('serviceType').value;
            const petType = document.getElementById('petType').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            
            if (!serviceType || !petType || !date || !time) {
                showNotification('Por favor, preencha todos os campos', true);
                return;
            }
            
            showNotification(`Agendamento confirmado para ${serviceType} (${petType}) em ${date} às ${time}`);
            document.getElementById('bookingModal').classList.remove('active');
            bookingForm.reset();
        });
    }
    
    // Formulário de feedback
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userName = document.getElementById('userName').value;
            const userComment = document.getElementById('userComment').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            
            if (!userName || !rating) {
                showNotification('Por favor, preencha pelo menos o nome e a avaliação', true);
                return;
            }
            
            showNotification('Obrigado pela sua avaliação!');
            feedbackForm.reset();
            
            // Reset stars
            document.querySelectorAll('input[name="rating"]').forEach(input => {
                input.checked = false;
            });
        });
    }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Botões de carrinho
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.dataset.product;
            const price = parseFloat(btn.dataset.price);
            addToCart(productId, price);
        });
    });
    
    // Botões de favoritos
    document.querySelectorAll('.product-wishlist, .btn-wishlist').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.dataset.product;
            toggleWishlist(productId);
        });
    });
    
    // Controles do carrossel
    const carouselPrev = document.getElementById('carouselPrev');
    if (carouselPrev) {
        carouselPrev.addEventListener('click', prevSlide);
    }
    
    const carouselNext = document.getElementById('carouselNext');
    if (carouselNext) {
        carouselNext.addEventListener('click', nextSlide);
    }
    
    // Pausar carrossel ao passar o mouse
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', stopCarousel);
        heroCarousel.addEventListener('mouseleave', startCarousel);
    }
    
    // Inicializar sistemas
    initSmoothScroll();
    initForms();
    updateWishlistButtons();
}