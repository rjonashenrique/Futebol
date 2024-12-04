// Função para lidar com o logout
document.getElementById('logout').addEventListener('click', function(event) {
    // Impede o link de ser seguido, se necessário
    event.preventDefault();
    
    // Você pode adicionar lógica de logout aqui, como limpar o sessionStorage ou localStorage
    // Exemplo: Limpar dados de login (se você estiver usando sessionStorage ou localStorage)
    localStorage.removeItem('userLoggedIn'); // Se você estiver armazenando o status de login no localStorage
    sessionStorage.clear(); // Para limpar a sessão, caso esteja usando sessionStorage
    
    // Redireciona para a página de login ou página inicial
    window.location.href = '/login/login.html'; // Redireciona para a página de login
});

// Funcionalidade de navegação (se necessário, caso queira adicionar alguma ação interativa nos cards)
document.querySelectorAll('.btn-link').forEach(button => {
    button.addEventListener('click', function(event) {
        // Aqui você pode adicionar lógicas adicionais para o clique nos botões
        console.log(`Navegando para ${event.target.textContent}...`);
    });
});
