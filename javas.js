/**
 * =============================================
 * FUNÇÕES DE INICIALIZAÇÃO E COMPORTAMENTO GERAL
 * =============================================
 */

// Inicializa a página no topo
window.onload = function() {
    window.scrollTo(0, 0);
    atualizarContadores();
};

// Efeito de parallax no cabeçalho
const cabecaSite = document.querySelector(".promo-banners");
window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    if (cabecaSite) {
        cabecaSite.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    }
});

// Carrossel Automático
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    let currentIndex = 0;
    let slideInterval;
    const slideTime = 5000; // 5 segundos
    
    // Criar dots de navegação
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Iniciar carrossel automático
    function startCarousel() {
        slideInterval = setInterval(() => {
            nextSlide();
        }, slideTime);
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetInterval();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
    }
    
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Atualizar slides
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Atualizar dots
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function resetInterval() {
        clearInterval(slideInterval);
        startCarousel();
    }
    
    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });
    
    // Iniciar
    startCarousel();
    
    // Pausar ao passar o mouse
    carousel.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    carousel.addEventListener('mouseleave', startCarousel);
});

/**
 * =============================================
 * GERENCIAMENTO DO CARRINHO DE COMPRAS E FAVORITOS
 * =============================================
 */

// Objeto que armazena todos os produtos e seus dados
const produtos = {
    // Alimentos
    morango: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Morango", preco: 6.99, img: "img/img-raçao/MorangoPet.png" },
    uva: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Uva", preco: 4.50, img: "img/img-raçao/UvaPet.png" },
    coco: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Coco", preco: 6.99, img: "img/img-raçao/CocoPet.png" },
    limao: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Limao", preco: 6.99, img: "img/img-raçao/LimaoPet.png" },
    banana: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Banana", preco: 4.50, img: "img/img-raçao/BananaPet.png" },
    mirtilo: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Mirtilo", preco: 6.99, img: "img/img-raçao/MirtiloPet.png" },
    laranja: { quantidade: 0, total: 0, tipo: "alimento", favorito: false, nome: "Raçao de Laranja", preco: 6.99, img: "img/img-raçao/LaranjaPet.png" },

    // Vestimentas
    charme: { quantidade: 0, total: 0, tipo: "vestimenta", favorito: false, nome: "Gato Charme de Natal", preco: 14.99, img: "img/CamisaPetluck.png" },
    lenço: { quantidade: 0, total: 0, tipo: "vestimenta", favorito: false, nome: "Lenço Xadrez Clássico", preco: 59.99, img: "img/CamisaPetluck2.png" },
    fantasia: { quantidade: 0, total: 0, tipo: "vestimenta", favorito: false, nome: "Fantasia Natalina Pet", preco: 45.00, img: "img/CamisaPetluck3.png" }
};

// Atualiza os contadores de carrinho e favoritos
function atualizarContadores() {
    const cartCount = Object.values(produtos).reduce((total, produto) => total + produto.quantidade, 0);
    const favoriteCount = Object.values(produtos).filter(produto => produto.favorito).length;
    
    document.getElementById('cart-count').textContent = cartCount;
    document.getElementById('favorite-count').textContent = favoriteCount;
}

/**
 * Atualiza a quantidade e total de um produto no carrinho
 * @param {string} produto - Nome do produto
 * @param {number} preco - Preço unitário do produto
 * @param {string} acao - 'adicionar' ou 'remover'
 */
function atualizarProduto(produto, preco, acao) {
    const notificacao = document.getElementById("notification");
    
    // Verifica se o produto existe
    if (!produtos[produto]) {
        console.error("Produto não encontrado:", produto);
        return;
    }

    const produtoData = produtos[produto];
    const nomeFormatado = produtoData.nome;

    // Executa a ação solicitada
    if (acao === 'adicionar') {
        notificacao.textContent = `${nomeFormatado} adicionado ao carrinho`;
        notificacao.classList.remove("error");
        produtoData.quantidade++;
        produtoData.total += parseFloat(preco);
    } else if (acao === 'remover') {
        if (produtoData.quantidade > 0) {
            notificacao.textContent = `${nomeFormatado} removido do carrinho`;
            notificacao.classList.remove("error");
            produtoData.quantidade--;
            produtoData.total -= parseFloat(preco);
        } else {
            notificacao.textContent = `Não há ${nomeFormatado} no carrinho`;
            notificacao.classList.add("error");
            notificacao.classList.add("show");
            setTimeout(() => {
                notificacao.classList.remove("show");
            }, 3000);
            return;
        }
    }

    // Corrige possíveis valores negativos próximos de zero
    if (Math.abs(produtoData.total) < 0.01) {
        produtoData.total = 0;
    }

    // Atualiza a interface
    updateProductUI(produto, produtoData);
    showNotification(notificacao);
    atualizarContadores();
}

/**
 * Alterna o status de favorito de um produto
 * @param {string} produto - Nome do produto
 */
function toggleFavorite(produto) {
    const notificacao = document.getElementById("notification");
    
    if (!produtos[produto]) {
        console.error("Produto não encontrado:", produto);
        return;
    }

    const produtoData = produtos[produto];
    produtoData.favorito = !produtoData.favorito;
    
    // Atualiza o botão de favorito
    const favoriteButtons = document.querySelectorAll(`[onclick="toggleFavorite('${produto}')"]`);
    favoriteButtons.forEach(button => {
        button.classList.toggle('favorited', produtoData.favorito);
    });
    
    // Mostra notificação
    notificacao.textContent = produtoData.favorito 
        ? `${produtoData.nome} adicionado aos favoritos` 
        : `${produtoData.nome} removido dos favoritos`;
    notificacao.classList.remove("error");
    showNotification(notificacao);
    
    atualizarContadores();
}

/**
 * Atualiza a interface do usuário para um produto específico
 * @param {string} produto - Nome do produto
 * @param {object} produtoData - Dados do produto
 */
function updateProductUI(produto, produtoData) {
    const quantidadeElement = document.getElementById(`${produto}-quantidade`);
    const totalElement = document.getElementById(`${produto}-total-valor`);

    if (quantidadeElement) {
        quantidadeElement.textContent = `Unid: ${produtoData.quantidade}`;
    }
    if (totalElement) {
        totalElement.textContent = `R$ ${produtoData.total.toFixed(2)}`;
    }
}

/**
 * Mostra a notificação na tela
 * @param {HTMLElement} notificacao - Elemento da notificação
 */
function showNotification(notificacao) {
    notificacao.classList.add("show");
    setTimeout(() => {
        notificacao.classList.remove("show");
    }, 3000);
}

/**
 * Abre o modal do carrinho e exibe os itens
 */
function abrirCarrinho() {
    const conteudoCarrinho = document.getElementById("cart-content");
    const subtotalElement = document.getElementById("cart-subtotal");
    let htmlContent = "<ul>";
    let subtotal = 0;

    // Itera sobre todos os produtos no carrinho
    for (const [produto, produtoData] of Object.entries(produtos)) {
        if (produtoData.quantidade > 0) {
            // Define a cor baseada no tipo do produto
            const cor = produtoData.tipo === "alimento" ? "darkorange" : "darkblue";
            const nomeFormatado = produtoData.nome;
            
            htmlContent += `
                <li style="color: ${cor}">
                    ${nomeFormatado}: ${produtoData.quantidade} un - R$ ${produtoData.total.toFixed(2)}
                </li>`;
            
            subtotal += produtoData.total;
        }
    }

    htmlContent += "</ul>";

    // Verifica se o carrinho está vazio
    if (subtotal === 0) {
        htmlContent = '<p class="empty-cart">O carrinho está vazio</p>';
    }

    // Atualiza o conteúdo do modal
    conteudoCarrinho.innerHTML = htmlContent;
    subtotalElement.textContent = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    
    // Exibe o modal
    document.getElementById("cart-modal").style.display = "block";
}

/**
 * Fecha o modal do carrinho
 */
function fecharCarrinho() {
    document.getElementById("cart-modal").style.display = "none";
}

/**
 * Abre o modal de favoritos e exibe os itens
 */
function abrirFavoritos() {
    const conteudoFavoritos = document.getElementById("favorites-content");
    let htmlContent = "<ul>";
    let hasFavorites = false;

    // Itera sobre todos os produtos favoritados
    for (const [produto, produtoData] of Object.entries(produtos)) {
        if (produtoData.favorito) {
            hasFavorites = true;
            htmlContent += `
                <li class="favorite-item">
                    <img src="${produtoData.img}" alt="${produtoData.nome}">
                    <div class="favorite-item-info">
                        <strong>${produtoData.nome}</strong>
                        <p>R$ ${produtoData.preco.toFixed(2)}</p>
                    </div>
                    <button class="remove-favorite" onclick="toggleFavorite('${produto}'); abrirFavoritos()">
                        Remover
                    </button>
                </li>`;
        }
    }

    htmlContent += "</ul>";

    // Verifica se há favoritos
    if (!hasFavorites) {
        htmlContent = '<p class="empty-favorites">Você ainda não tem favoritos</p>';
    }

    // Atualiza o conteúdo do modal
    conteudoFavoritos.innerHTML = htmlContent;
    
    // Exibe o modal
    document.getElementById("favorites-modal").style.display = "block";
}

/**
 * Fecha o modal de favoritos
 */
function fecharFavoritos() {
    document.getElementById("favorites-modal").style.display = "none";
}

// Fecha os modais ao clicar fora deles
window.addEventListener("click", function(event) {
    const cartModal = document.getElementById("cart-modal");
    const favoritesModal = document.getElementById("favorites-modal");
    
    if (event.target === cartModal) {
        fecharCarrinho();
    }
    
    if (event.target === favoritesModal) {
        fecharFavoritos();
    }
});

// Menu Hamburguer
const menuToggle = document.createElement('button');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = `
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
`;

document.querySelector('.header-container').prepend(menuToggle);
const categoryNav = document.querySelector('.category-nav');

menuToggle.addEventListener('click', () => {
    categoryNav.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Sistema de Agendamento
let currentService = '';

function abrirAgendamento(service) {
    currentService = service;
    document.getElementById('service-type').value = service;
    document.getElementById('booking-modal').style.display = 'block';
}

function fecharAgendamento() {
    document.getElementById('booking-modal').style.display = 'none';
    document.getElementById('booking-form').reset();
}

document.getElementById('booking-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceType = document.getElementById('service-type').value;
    const petType = document.getElementById('pet-type').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    
    if (!serviceType || !petType || !date || !time) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const notification = document.getElementById('notification');
    notification.textContent = `✅ Agendamento para ${serviceType} (${petType}) confirmado em ${date} às ${time}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        fecharAgendamento();
    }, 3000);
});

/**
 * =============================================
 * PROCESSAMENTO DE PAGAMENTO
 * =============================================
 */

/**
 * Prepara e redireciona para a página de pagamento
 */
function carregarPagamento() {
    // Verifica se há itens no carrinho
    const subtotal = Object.values(produtos).reduce(
        (total, produto) => total + produto.total, 0
    );

    if (subtotal <= 0) {
        const notificacao = document.getElementById("notification");
        notificacao.textContent = "Adicione itens ao carrinho antes de prosseguir";
        notificacao.classList.add("error");
        notificacao.classList.add("show");
        
        setTimeout(() => {
            notificacao.classList.remove("show");
        }, 3000);
        return;
    }

    // Salva o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(produtos));

    // Exibe a tela de carregamento
    showLoadingScreen();
    
    // Redireciona após 2 segundos (simulando processamento)
    setTimeout(() => {
        window.location.href = "pagamento.html";
    }, 2000);
}

/**
 * Mostra a tela de carregamento
 */
function showLoadingScreen() {
    const body = document.body;
    body.innerHTML = `
        <div class="loading-screen">
            <div class="loading-content">
                <h2>Processando seu pedido...</h2>
                <div class="loading-spinner"></div>
                <p>Aguarde enquanto redirecionamos para o pagamento</p>
            </div>
        </div>
    `;
}

/**
 * =============================================
 * INICIALIZAÇÃO DO FORMULÁRIO DE AVALIAÇÃO
 * =============================================
 */
document.addEventListener("DOMContentLoaded", function() {
    const feedbackForm = document.getElementById("feedback-form");
    
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const nome = document.getElementById("user-name").value;
            const comentario = document.getElementById("user-comment").value;
            const avaliacao = document.getElementById("user-rating").value;
            
            // Aqui você pode adicionar o código para enviar os dados
            console.log("Avaliação enviada:", { nome, comentario, avaliacao });
            
            // Mostra mensagem de sucesso
            const notificacao = document.getElementById("notification");
            notificacao.textContent = "Avaliação enviada com sucesso! Obrigado.";
            notificacao.classList.remove("error");
            notificacao.classList.add("show");
            
            setTimeout(() => {
                notificacao.classList.remove("show");
            }, 3000);
            
            // Limpa o formulário
            feedbackForm.reset();
        });
    }
});