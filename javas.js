function scrollLeft() {
    const carousel = document.querySelector('.carousel');
    carousel.scrollLeft -= 225;  // Ajuste o valor para o quanto você quer que role para a esquerda
}

function scrollRight() {
    const carousel = document.querySelector('.carousel');
    carousel.scrollLeft += 225;  // Ajuste o valor para o quanto você quer que role para a direita
}