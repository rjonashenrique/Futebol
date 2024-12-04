// Função para tratar o envio do formulário de registro
function handleRegister(event) {
    event.preventDefault(); // Impede o envio do formulário padrão

    const username = document.querySelector('input[name="username"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Limpar mensagens anteriores
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // Validação de senha e confirmação de senha
    if (password !== confirmPassword) {
        errorMessage.textContent = 'As senhas não coincidem!';
        return false; // Impede o envio do formulário se as senhas não coincidirem
    }

    // Mensagem de sucesso
    successMessage.textContent = 'Usuário registrado com sucesso! Redirecionando para a página de login...';

    // Redireciona para a página de login após 2 segundos
    setTimeout(() => {
        window.location.href = './login/login.html'; // Redireciona para a página de login
    }, 2000); // Aguarda 2 segundos para o redirecionamento

    return true; // Permite o envio do formulário após a validação
}

// Adiciona o manipulador de evento no formulário
document.getElementById('register-form').addEventListener('submit', handleRegister);
