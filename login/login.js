function handleLogin(event) {
    event.preventDefault(); // Impede o envio do formulário padrão

    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Limpar mensagens anteriores
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // Verifica se os campos de login não estão vazios
    if (username === '' || password === '') {
        errorMessage.textContent = 'Por favor, preencha todos os campos.';
        return false; // Impede o envio do formulário se houver campos vazios
    }

    // Exibe mensagem de sucesso e redireciona para outra página
    successMessage.textContent = 'Login bem-sucedido! Redirecionando...';
    setTimeout(() => {
        window.location.href = '/public/futebol/dashboard.html'; // Redireciona para a página desejada
    }, 1000); // Aguarda 1 segundo antes de redirecionar

    return true; // Finaliza o processo após a validação
}

// Adiciona o manipulador de evento no formulário
document.getElementById('login-form').addEventListener('submit', handleLogin);
