/**
 * =============================================
 * FUNÇÕES DE INICIALIZAÇÃO E COMPORTAMENTO GERAL
 * =============================================
 */

// Inicializa a página no topo
window.onload = function() {
    window.scrollTo(0, 0);
};

// Efeito de parallax no cabeçalho
const cabecaSite = document.querySelector(".promo-banners");
window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    if (cabecaSite) {
        cabecaSite.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    }
});

/**
 * =============================================
 * CARROSSEL DE IMAGENS
 * =============================================
 */
document.addEventListener("DOMContentLoaded", function() {
    // Inicializa o carrossel principal
    const carouselItems = document.querySelectorAll(".carousel-item");
    if (carouselItems.length > 0) {
        let currentIndex = 0;
        carouselItems[0].classList.add("active");

        function rotateCarousel() {
            carouselItems[currentIndex].classList.remove("active");
            currentIndex = (currentIndex + 1) % carouselItems.length;
            carouselItems[currentIndex].classList.add("active");
        }

        setInterval(rotateCarousel, 3000);
    }
});

/**
 * =============================================
 * GERENCIAMENTO DO CARRINHO DE COMPRAS
 * =============================================
 */

// Objeto que armazena todos os produtos e seus dados
const produtos = {
    // Alimentos
    morango: { quantidade: 0, total: 0, tipo: "alimento" },
    uva: { quantidade: 0, total: 0, tipo: "alimento" },
    coco: { quantidade: 0, total: 0, tipo: "alimento" },
    limao: { quantidade: 0, total: 0, tipo: "alimento" },
    banana: { quantidade: 0, total: 0, tipo: "alimento" },
    cereja: { quantidade: 0, total: 0, tipo: "alimento" },
    mirtilo: { quantidade: 0, total: 0, tipo: "alimento" },
    laranja: { quantidade: 0, total: 0, tipo: "alimento" },

    // Vestimentas
    charme: { quantidade: 0, total: 0, tipo: "vestimenta" },
    lenço: { quantidade: 0, total: 0, tipo: "vestimenta" },
    fantasia: { quantidade: 0, total: 0, tipo: "vestimenta" }
};

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
    const nomeFormatado = produto.charAt(0).toUpperCase() + produto.slice(1);

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
            const nomeFormatado = produto.charAt(0).toUpperCase() + produto.slice(1);
            
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

// Fecha o modal ao clicar fora dele
window.addEventListener("click", function(event) {
    const modal = document.getElementById("cart-modal");
    if (event.target === modal) {
        fecharCarrinho();
    }
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