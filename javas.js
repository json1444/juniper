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