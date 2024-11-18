window.onload = function () {
    window.scrollTo(0, 0); // Força a página para o topo ao carregar
};

const cabecaSite = document.querySelector("#cabecasite");
window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    cabecaSite.style.backgroundPositionY = `${scrollPosition * 0.5}px`; // Ajusta o fator de deslocamento
});



// Define o tempo em milissegundos para o carregamento (aqui 3 segundos)
const tempoDeCarregamento = 3000;

setTimeout(() => {
    document.getElementById("loading").style.display = "none"; // Esconde a mensagem de carregamento
    document.querySelector(".carousel-container").style.display = "block"; // Exibe o carousel
}, tempoDeCarregamento);



let produtos = {
    morango: { quantidade: 0, total: 0, tipo: "alimento" },
    uva: { quantidade: 0, total: 0, tipo: "alimento" },
    coco: { quantidade: 0, total: 0, tipo: "alimento" },
    limao: { quantidade: 0, total: 0, tipo: "alimento" },
    banana: { quantidade: 0, total: 0, tipo: "alimento" },
    cereja: { quantidade: 0, total: 0, tipo: "alimento" },
    mirtilo: { quantidade: 0, total: 0, tipo: "alimento" },
    laranja: { quantidade: 0, total: 0, tipo: "alimento" },

    blusa: { quantidade: 0, total: 0, tipo: "vestimenta" },
    colete: { quantidade: 0, total: 0, tipo: "vestimenta" },
    moletom: { quantidade: 0, total: 0, tipo: "vestimenta" }
};

function atualizarProduto(produto, preco, acao) {
    const notificacao = document.getElementById("notificacao"); // Corrigido o ID
    if (!produtos[produto]) {
        console.error("Produto não encontrado:", produto);
        return;
    }

    let produtoData = produtos[produto];

    if (acao === 'adicionar') {
        notificacao.textContent = `${produto.charAt(0).toUpperCase() + produto.slice(1)} adicionado ao carrinho`;
        produtoData.quantidade++;
        produtoData.total += parseFloat(preco);
    } else if (acao === 'remover' && produtoData.quantidade > 0) {
        notificacao.textContent = `${produto.charAt(0).toUpperCase() + produto.slice(1)} removido do carrinho`;
        produtoData.quantidade--;
        produtoData.total -= parseFloat(preco);
    }

       // Evita que o total fique negativo próximo de zero
       if (produtoData.total < 0.01 && produtoData.total > -0.01) {
        produtoData.total = 0;}


        
    // Exibe a notificação
    notificacao.classList.add("show");

    // Oculta a notificação após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove("show");
    }, 3000);

    // Atualize a quantidade e o total na interface para o produto específico
    document.getElementById(produto + '-quantidade').textContent = "Unid: " + produtoData.quantidade;
    document.getElementById(produto + '-total-valor').textContent = "R$ " + produtoData.total.toFixed(2);
}

function abrirCarrinho() {
    let conteudoCarrinho = "<ul>";
    let subtotal = 0;

    for (let produto in produtos) {
        let produtoData = produtos[produto];
        if (produtoData.quantidade > 0) {
            // Define a cor baseada no tipo do produto
            let cor = produtoData.tipo === "alimento" ? "darkorange" : "darkblue";
            conteudoCarrinho += `<li style="color: ${cor};">${produto.charAt(0).toUpperCase() + produto.slice(1)}: 
            ${produtoData.quantidade} unidades - Total: R$ ${produtoData.total.toFixed(2)}</li>`;
            subtotal += produtoData.total;
        }
    }
    conteudoCarrinho += "</ul>";

    if (conteudoCarrinho === "<ul></ul>") {
        conteudoCarrinho = "<p>O carrinho está vazio.</p>";
    }

    document.getElementById("conteudo-carrinho").innerHTML = conteudoCarrinho;
    document.getElementById("subtotal").textContent = "Subtotal: R$ " + subtotal.toFixed(2);
    document.getElementById("modal-carrinho").style.display = "block";
}

function fecharCarrinho() {
    document.getElementById("modal-carrinho").style.display = "none";
}

window.onclick = function(event) {
    let modal = document.getElementById("modal-carrinho");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

let currentIndex = 0;
const items = document.querySelectorAll('.carousel-item');

function showNextImage() {
    items[currentIndex].classList.remove('active'); // Oculta a imagem atual
    currentIndex = (currentIndex + 1) % items.length; // Avança para o próximo índice
    items[currentIndex].classList.add('active'); // Exibe a nova imagem
}

setInterval(showNextImage, 3000); // Muda a imagem a cada 3 segundos




   // Função para armazenar e exibir a média das avaliações
   function displayAverageRating() {
    const reviews = JSON.parse(localStorage.getItem('lista-avaliacoes')) || [];
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        document.getElementById('average-rating').innerHTML = `Avaliação média: ${averageRating} estrelas`;
    }
}

// Função para exibir as avaliações paginadas
const reviewsPerPage = 5;
let currentPage = 1;

function displayPagedReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;

    const reviewsToShow = reviews.slice(startIndex, endIndex);

    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = "<h2>Avaliações:</h2>";

    reviewsToShow.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');
        reviewElement.innerHTML = `
            <strong>${review.name}</strong> - ${'★'.repeat(review.rating)} ${'☆'.repeat(5 - review.rating)}
            `;
            reviewsContainer.appendChild(reviewElement);
        });

        // Exibe navegação de páginas
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">Anterior</button>
            <span>Página ${currentPage}</span>
            <button ${currentPage * reviewsPerPage >= reviews.length ? 'disabled' : ''} onclick="changePage(1)">Próxima</button>
        `;
    }

    // Função para alterar a página
    function changePage(direction) {
        currentPage += direction;
        displayPagedReviews();
    }

    // Função para salvar a avaliação no LocalStorage
    document.getElementById('review-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const text = document.getElementById('text').value;
        const rating = parseInt(document.getElementById('rating').value);

        const review = { name, text, rating };

        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        reviews.push(review);

        localStorage.setItem('reviews', JSON.stringify(reviews));

        // Limpa o formulário após o envio
        document.getElementById('name').value = '';
        document.getElementById('text').value = '';
        document.getElementById('rating').value = '1';

        // Atualiza as exibições
        displayAverageRating();
        displayPagedReviews();
    });

    // Exibe as informações ao carregar a página
    displayAverageRating();
    displayPagedReviews();
