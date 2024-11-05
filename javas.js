function scrollLeft() {
    const carousel = document.querySelector('.carousel');
    carousel.scrollLeft -= 225;  // Ajuste o valor para o quanto você quer que role para a esquerda
}

function scrollRight() {
    const carousel = document.querySelector('.carousel');
    carousel.scrollLeft += 225;  // Ajuste o valor para o quanto você quer que role para a direita
}



// Objeto para armazenar quantidades e valores totais de cada produto
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
    // Verifique se o produto existe no objeto produtos
    if (!produtos[produto]) {
        console.error("Produto não encontrado:", produto);
        return;
    }

    let produtoData = produtos[produto];

    if (acao === 'adicionar') {
        produtoData.quantidade++;
        produtoData.total += parseFloat(preco);
    } else if (acao === 'remover' && produtoData.quantidade > 0) {
        produtoData.quantidade--;
        produtoData.total -= parseFloat(preco);
    }

    // Atualize a quantidade e o total na interface para o produto específico
    document.getElementById(produto + '-quantidade').textContent = "Unidades: " + produtoData.quantidade;
    document.getElementById(produto + '-total-valor').textContent = "Total: R$ " + produtoData.total.toFixed(2);
}



function abrirCarrinho() {
    let conteudoCarrinho = "Ração de:";
    conteudoCarrinho += "<br> -----------------------------------";
    let subtotal = 0;

    // Itera sobre os produtos e verifica se a quantidade é maior que 0
    for (let produto in produtos) {
        let produtoData = produtos[produto];
        if (produtoData.quantidade > 0) {
            conteudoCarrinho += `<li>${produto.charAt(0).toUpperCase() + produto.slice(1)}: 
            ${produtoData.quantidade} unidades - Total: R$ ${produtoData.total.toFixed(2)}</li>`;
            subtotal += produtoData.total;
        }
    }

    conteudoCarrinho += "</ul>";

    // Verifica se o carrinho está vazio
    if (conteudoCarrinho === "<ul></ul>") {
        conteudoCarrinho = "<p>O carrinho está vazio.</p>";
    }

    // Atualiza o conteúdo do modal com os itens do carrinho
    document.getElementById("conteudo-carrinho").innerHTML = conteudoCarrinho;
    document.getElementById("subtotal").textContent = "Subtotal: R$ " + subtotal.toFixed(2);


    // Exibe o modal
    document.getElementById("modal-carrinho").style.display = "block";
}

function fecharCarrinho() {
    document.getElementById("modal-carrinho").style.display = "none";
}

// Fecha o modal se o usuário clicar fora dele
window.onclick = function(event) {
    let modal = document.getElementById("modal-carrinho");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}