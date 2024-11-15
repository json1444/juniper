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




// Função para carregar avaliações
async function carregarAvaliacoes() {
    const response = await fetch('http://10.0.0.150:3000/avaliacoes');
    const avaliacoes = await response.json();
    const listaAvaliacoes = document.getElementById('lista-avaliacoes');
    
    listaAvaliacoes.innerHTML = avaliacoes.map(avaliacao => `
        <div>
            <strong>${avaliacao.nome_cliente}</strong> - Nota: ${avaliacao.nota}
            <p>${avaliacao.comentario}</p>
            <small>${new Date(avaliacao.data).toLocaleString()}</small>
        </div>
    `).join('');
}

// Evento para enviar a avaliação
document.getElementById('form-avaliacao').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);

    const response = await fetch('http://10.0.0.150:3000/avaliacoes', {
        method: 'POST',
        body: JSON.stringify({
            nome_cliente: formData.get('nome_cliente'),
            comentario: formData.get('comentario'),
            nota: formData.get('nota')
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    const mensagem = await response.text();
    document.getElementById('mensagem').innerText = mensagem;
    
    this.reset();
    carregarAvaliacoes();
});

// Carrega as avaliações ao abrir a página
carregarAvaliacoes();