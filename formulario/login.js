document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        message.textContent = data.message;

        if (response.status === 201) {
            message.style.color = 'green';
            setTimeout(() => {
                window.location.href = '/'; // Redireciona para a página inicial
            }, 2000);
        } else {
            message.style.color = 'red';
        }
    } catch (error) {
        message.textContent = 'Erro ao conectar com o servidor.';
        message.style.color = 'red';
    }
});