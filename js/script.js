function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Simples verificação de usuário e senha
    if (username === 'cliente' && password === 'atec7') {
        // Armazena a sessão de login no localStorage
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'index.html'; // Redireciona para a página inicial
    } else {
        errorMessage.textContent = 'Usuário ou senha incorretos.';
    }
}

function checkLogin() {
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html'; // Redireciona para a página de login se não estiver logado
    }
}

// Chame checkLogin() no início do script na página inicial
if (window.location.pathname.endsWith('index.html')) {
    checkLogin();
}
