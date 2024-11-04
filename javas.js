function scrollLeft() {
    const carousel = document.querySelector('.carousel');
    carousel.scrollLeft -= 225;  // Ajuste o valor para o quanto você quer que role para a esquerda
}

function scrollRight() {
    const carousel = document.querySelector('.carousel');
    carousel.scrollLeft += 225;  // Ajuste o valor para o quanto você quer que role para a direita
}

let totalValor = 0;

    // Função para adicionar ou remover o produto e atualizar a quantidade e o valor total
    function atualizarProduto(produto, preco, acao) {
        const quantidadeElemento = document.getElementById(produto + '-quantidade');
        let quantidade = parseInt(quantidadeElemento.textContent) || 0; // Garante que a quantidade seja um número

        if (acao === 'adicionar') {
            quantidade++;
            totalValor += parseFloat(preco); // Adiciona o preço ao total
        } else if (acao === 'remover' && quantidade > 0) {
            quantidade--;
            totalValor -= parseFloat(preco); // Subtrai o preço do total
        }

        quantidadeElemento.textContent = quantidade; // Atualiza a quantidade na tela
        atualizarTotalValor(); // Atualiza o valor total na tela
    }

    // Função para atualizar o total em reais na tela
    function atualizarTotalValor() {
        document.getElementById('total-valor').textContent = totalValor.toFixed(2);
    }