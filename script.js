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
    // Seções e páginas
    secoes: [
        { id: "saude-pet", nome: "Saúde Pet", tipo: "secao", descricao: "Planos de saúde e cuidados veterinários" },
        { id: "moda-pet", nome: "Moda Pet", tipo: "secao", descricao: "Roupas e acessórios para seu pet" },
        { id: "nutricao-pet", nome: "Nutrição", tipo: "secao", descricao: "Alimentos e rações de qualidade" },
        { id: "curiosidades", nome: "Curiosidades", tipo: "secao", descricao: "Fatos interessantes sobre pets" },
        { id: "servicos", nome: "Serviços", tipo: "secao", descricao: "Banho, tosa e consultas veterinárias" }
    ],
    
    // Serviços oferecidos
    servicos: [
        { id: "banho", nome: "Banho Completo", tipo: "servico", descricao: "Banho higiênico e secagem profissional" },
        { id: "tosa", nome: "Tosa Premium", tipo: "servico", descricao: "Tosa na máquina e modelagem personalizada" },
        { id: "consulta", nome: "Consulta Veterinária", tipo: "servico", descricao: "Check-up completo e vacinação" }
    ],
    
    // Planos de saúde
    planos: [
        { id: "plano-basico", nome: "Plano Básico", tipo: "plano", descricao: "Consulta mensal e vacinação anual", preco: "R$ 99,90/mês" },
        { id: "plano-essencial", nome: "Plano Essencial", tipo: "plano", descricao: "Exames laboratoriais incluídos", preco: "R$ 179,90/mês" },
        { id: "plano-premium", nome: "Plano Premium", tipo: "plano", descricao: "Banho e tosa mensal gratuitos", preco: "R$ 299,90/mês" }
    ],
    
    // Curiosidades
    curiosidades: [
        { id: "curiosidade1", nome: "Audição Canina", tipo: "curiosidade", descricao: "Cães ouvem sons 4 vezes mais distantes que humanos" },
        { id: "curiosidade2", nome: "Salto Felino", tipo: "curiosidade", descricao: "Gatos pulam até 6 vezes a altura do corpo" },
        { id: "curiosidade3", nome: "Olfato Canino", tipo: "curiosidade", descricao: "Cachorros têm olfato 10.000 vezes mais forte" }
    ]
};

// Categorias para sugestões de pesquisa
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

// ===== VERIFICAÇÃO DE LOGIN PARA FAVORITOS E CARRINHO =====
function checkAuthBeforeAction(actionType, callback) {
    if (window.authManager && window.authManager.user) {
        // Usuário está logado, executar a ação
        if (typeof callback === 'function') {
            callback();
        }
    } else {
        // Usuário não está logado, mostrar alerta e redirecionar
        showLoginAlert(actionType);
    }
}

function showLoginAlert(actionType) {
    // Criar elemento de alerta estilizado
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
    
    // Adicionar estilos dinamicamente se não existirem
    if (!document.querySelector('#loginAlertStyles')) {
        const styles = document.createElement('style');
        styles.id = 'loginAlertStyles';
        styles.textContent = `
            .login-alert-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .login-alert-box {
                background: white;
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .login-alert-icon {
                font-size: 48px;
                color: #ff9800;
                margin-bottom: 15px;
            }
            
            .login-alert-box h3 {
                margin: 0 0 15px 0;
                color: #2c3e50;
                font-size: 22px;
            }
            
            .login-alert-box p {
                color: #7f8c8d;
                margin-bottom: 25px;
                line-height: 1.5;
            }
            
            .login-alert-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            @media (max-width: 480px) {
                .login-alert-buttons {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Fechar o alerta ao clicar no botão Cancelar
    document.getElementById('loginAlertCancel').addEventListener('click', function() {
        document.body.removeChild(alertOverlay);
    });
    
    // Fechar o alerta ao clicar fora da caixa
    alertOverlay.addEventListener('click', function(e) {
        if (e.target === alertOverlay) {
            document.body.removeChild(alertOverlay);
        }
    });
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
        
        if (searchTerm.length === 0) {
            searchSuggestions.classList.remove('active');
            return;
        }
        
        // Buscar produtos
        const productResults = Object.entries(produtos).filter(([id, product]) => {
            return product.nome.toLowerCase().includes(searchTerm) || 
                   product.tipo.toLowerCase().includes(searchTerm);
        });
        
        // Buscar seções do site
        const sectionResults = conteudosSite.secoes.filter(section => {
            return section.nome.toLowerCase().includes(searchTerm) || 
                   section.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Buscar serviços
        const serviceResults = conteudosSite.servicos.filter(service => {
            return service.nome.toLowerCase().includes(searchTerm) || 
                   service.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Buscar planos
        const planResults = conteudosSite.planos.filter(plan => {
            return plan.nome.toLowerCase().includes(searchTerm) || 
                   plan.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Buscar curiosidades
        const curiosityResults = conteudosSite.curiosidades.filter(curiosity => {
            return curiosity.nome.toLowerCase().includes(searchTerm) || 
                   curiosity.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Combinar todos os resultados
        const allResults = [
            ...sectionResults.map(item => ({ ...item, categoria: 'secao' })),
            ...serviceResults.map(item => ({ ...item, categoria: 'servico' })),
            ...planResults.map(item => ({ ...item, categoria: 'plano' })),
            ...curiosityResults.map(item => ({ ...item, categoria: 'curiosidade' })),
            ...productResults.map(([id, product]) => ({ 
                id, 
                nome: product.nome, 
                tipo: product.tipo, 
                descricao: product.descricao, 
                preco: `R$ ${product.preco.toFixed(2)}`,
                categoria: 'produto'
            }))
        ];
        
        if (allResults.length === 0) {
            searchSuggestions.innerHTML = '<div class="search-suggestion">Nenhum resultado encontrado</div>';
            searchSuggestions.classList.add('active');
            return;
        }
        
        // Agrupar resultados por categoria
        const groupedResults = {};
        allResults.forEach(result => {
            if (!groupedResults[result.categoria]) {
                groupedResults[result.categoria] = [];
            }
            groupedResults[result.categoria].push(result);
        });
        
        // Limitar a 3 resultados por categoria
        Object.keys(groupedResults).forEach(key => {
            groupedResults[key] = groupedResults[key].slice(0, 3);
        });
        
        let html = '';
        
        // Seções do site
        if (groupedResults['secao'] && groupedResults['secao'].length > 0) {
            html += '<div class="search-category-title">Seções do Site</div>';
            groupedResults['secao'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-section="${item.id}">
                        <div><i class="fas fa-folder"></i> ${item.nome}</div>
                        <small>${item.descricao}</small>
                    </div>
                `;
            });
        }
        
        // Serviços
        if (groupedResults['servico'] && groupedResults['servico'].length > 0) {
            html += '<div class="search-category-title">Serviços</div>';
            groupedResults['servico'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-service="${item.id}">
                        <div><i class="fas fa-concierge-bell"></i> ${item.nome}</div>
                        <small>${item.descricao}</small>
                    </div>
                `;
            });
        }
        
        // Planos de saúde
        if (groupedResults['plano'] && groupedResults['plano'].length > 0) {
            html += '<div class="search-category-title">Planos de Saúde</div>';
            groupedResults['plano'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-plano="${item.id}">
                        <div><i class="fas fa-heartbeat"></i> ${item.nome}</div>
                        <small>${item.descricao} - ${item.preco}</small>
                    </div>
                `;
            });
        }
        
        // Curiosidades
        if (groupedResults['curiosidade'] && groupedResults['curiosidade'].length > 0) {
            html += '<div class="search-category-title">Curiosidades</div>';
            groupedResults['curiosidade'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-curiosidade="${item.id}">
                        <div><i class="fas fa-lightbulb"></i> ${item.nome}</div>
                        <small>${item.descricao}</small>
                    </div>
                `;
            });
        }
        
        // Produtos
        if (groupedResults['produto'] && groupedResults['produto'].length > 0) {
            html += '<div class="search-category-title">Produtos</div>';
            groupedResults['produto'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-product="${item.id}">
                        <div><i class="fas fa-shopping-bag"></i> ${item.nome}</div>
                        <small>${item.preco} • ${categorias[item.tipo] || item.tipo}</small>
                    </div>
                `;
            });
        }
        
        searchSuggestions.innerHTML = html;
        searchSuggestions.classList.add('active');
        
        // Adicionar eventos de clique nas sugestões
        document.querySelectorAll('.search-suggestion[data-product]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const productId = this.getAttribute('data-product');
                if (productId && produtos[productId]) {
                    searchInput.value = produtos[productId].nome;
                    searchSuggestions.classList.remove('active');
                    
                    // Scroll para a seção de produtos
                    scrollParaSecao('nutricao-pet');
                    
                    // Destacar o produto após um pequeno delay
                    setTimeout(() => {
                        highlightProduct(productId);
                    }, 800);
                }
            });
        });
        
        // Adicionar eventos para seções
        document.querySelectorAll('.search-suggestion[data-section]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                scrollParaSecao(sectionId);
            });
        });
        
        // Adicionar eventos para serviços
        document.querySelectorAll('.search-suggestion[data-service]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const serviceId = this.getAttribute('data-service');
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                
                // Abrir modal de agendamento
                document.getElementById('serviceType').value = serviceId;
                document.getElementById('bookingModal').classList.add('active');
            });
        });
        
        // Adicionar eventos para planos
        document.querySelectorAll('.search-suggestion[data-plano]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                scrollParaSecao('saude-pet');
            });
        });
        
        // Adicionar eventos para curiosidades
        document.querySelectorAll('.search-suggestion[data-curiosidade]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                scrollParaSecao('curiosidades');
            });
        });
    }
    
    // Função para scroll suave até uma seção
    function scrollParaSecao(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Função para destacar um produto
    function highlightProduct(productId) {
        const productElement = document.querySelector(`[data-product="${productId}"]`);
        if (productElement) {
            // Encontrar o card pai do produto
            const productCard = productElement.closest('.product-card');
            if (productCard) {
                productCard.classList.add('highlight-product');
                
                // Scroll para o produto
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remover o destaque após 3 segundos
                setTimeout(() => {
                    productCard.classList.remove('highlight-product');
                }, 3000);
            }
        }
    }
    
    // Event listeners
    searchInput.addEventListener('input', showSuggestions);
    
    searchInput.addEventListener('focus', function() {
        if (this.value.length > 0) {
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
        
        if (searchTerm.length < 1) {
            showNotification('Digite algo para pesquisar', true);
            return;
        }
        
        // Buscar em todos os conteúdos
        const allResults = [
            ...conteudosSite.secoes,
            ...conteudosSite.servicos,
            ...conteudosSite.planos,
            ...conteudosSite.curiosidades,
            ...Object.entries(produtos).map(([id, product]) => ({ 
                id,
                nome: product.nome, 
                tipo: product.tipo, 
                descricao: product.descricao,
                categoria: 'produto'
            }))
        ];
        
        const results = allResults.filter(item => {
            return item.nome.toLowerCase().includes(searchTerm) || 
                   (item.descricao && item.descricao.toLowerCase().includes(searchTerm)) ||
                   item.tipo.toLowerCase().includes(searchTerm);
        });
        
        if (results.length === 0) {
            showNotification('Nenhum resultado encontrado para: ' + searchTerm, true);
            return;
        }
        
        showNotification(`Encontrados ${results.length} resultados para: ${searchTerm}`);
        searchSuggestions.classList.remove('active');
        
        // Encontrar o melhor resultado para navegação
        let bestMatch = null;
        
        // Priorizar produtos primeiro
        const productResults = results.filter(result => result.categoria === 'produto');
        if (productResults.length > 0) {
            bestMatch = productResults[0];
        } 
        // Depois seções
        else {
            const sectionResults = results.filter(result => 
                result.id && document.getElementById(result.id)
            );
            if (sectionResults.length > 0) {
                bestMatch = sectionResults[0];
            }
            // Se não encontrar nada específico, ir para a seção de produtos
            else {
                bestMatch = { id: 'nutricao-pet' };
            }
        }
        
        // Navegar para o melhor resultado
        if (bestMatch.id) {
            // Se for um produto, mostrar na seção de produtos
            if (bestMatch.categoria === 'produto') {
                scrollParaSecao('nutricao-pet');
                
                // Destacar o produto após um pequeno delay
                setTimeout(() => {
                    highlightProduct(bestMatch.id);
                }, 800);
            } 
            // Se for uma seção, serviço, plano ou curiosidade
            else {
                scrollParaSecao(bestMatch.id);
                
                // Se for um serviço, abrir o modal de agendamento
                if (bestMatch.tipo === 'servico') {
                    setTimeout(() => {
                        document.getElementById('serviceType').value = bestMatch.id;
                        document.getElementById('bookingModal').classList.add('active');
                    }, 1000);
                }
            }
        }
    }
}

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
    initSearch(); // Sistema de busca melhorado
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
    checkAuthBeforeAction('cart', function() {
        // Código original da função addToCart
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
    });
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
    checkAuthBeforeAction('wishlist', function() {
        // Código original da função toggleWishlist
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
    });
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
    
    // Iniciar autoplay (sem botões de navegação)
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

// ===== MODAIS =====
function initModals() {
    // Modal do carrinho - MODIFICADO para verificar autenticação
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.authManager || !window.authManager.user) {
                showLoginAlert('cart');
            } else {
                document.getElementById('cartModal').classList.add('active');
            }
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
            if (!window.authManager || !window.authManager.user) {
                showLoginAlert('cart');
            } else {
                document.getElementById('cartModal').classList.add('active');
            }
        });
    }
    
    // Modal de favoritos - MODIFICADO para verificar autenticação
    const wishlistIcon = document.getElementById('wishlistIcon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.authManager || !window.authManager.user) {
                showLoginAlert('wishlist');
            } else {
                document.getElementById('wishlistModal').classList.add('active');
            }
        });
    }
    
    const closeWishlistModal = document.getElementById('closeWishlistModal');
    if (closeWishlistModal) {
        closeWishlistModal.addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.remove('active');
        });
    }
    
    // Modal de agendamento (não precisa de autenticação para visualizar)
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