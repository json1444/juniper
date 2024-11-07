// Objeto para armazenar quantidades e valores totais de cada produto //
let produtos = {
    morango: { quantidade: 0, total: 0},
    uva: { quantidade: 0, total: 0},
    coco: { quantidade: 0, total: 0},
    limao: { quantidade: 0, total: 0},
    banana: { quantidade: 0, total: 0},
    pessego: { quantidade: 0, total: 0},
    mirtilo: { quantidade: 0, total: 0},
    abacaxi: { quantidade: 0, total: 0 },
    maca: { quantidade: 0, total: 0 }
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
        notificacao.classList.remove("remover");
        produtoData.quantidade++;
        produtoData.total += parseFloat(preco);
    } else if (acao === 'remover' && produtoData.quantidade > 0) {
        notificacao.textContent = `${produto.charAt(0).toUpperCase() + produto.slice(1)} removido do carrinho`;
        notificacao.classList.add("remover");
        produtoData.quantidade--;
        produtoData.total -= parseFloat(preco);
    }

    // Exibe a notificação
    notificacao.classList.add("show");

    // Oculta a notificação após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove("show");
    }, 3000);

    // Atualize a quantidade e o total na interface para o produto específico
    document.getElementById(produto + '-quantidade').textContent = "Unidades: " + produtoData.quantidade;
    document.getElementById(produto + '-total-valor').textContent = "Total: R$ " + produtoData.total.toFixed(2);
}

function abrirCarrinho() {
    let conteudoCarrinho = "<ul>";
    let subtotal = 0;

    for (let produto in produtos) {
        let produtoData = produtos[produto];
        if (produtoData.quantidade > 0) {
            conteudoCarrinho += `<li>${produto.charAt(0).toUpperCase() + produto.slice(1)}: 
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