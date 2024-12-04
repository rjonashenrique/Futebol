// Conexão com o servidor via socket.io
const socket = io();

// Elementos do DOM
const playerNameInput = document.getElementById('playerName');
const roomCodeInput = document.getElementById('roomCode');
const enterBtn = document.getElementById('enterBtn');
const createBtn = document.getElementById('createBtn');
const generatedRoomCodeDiv = document.getElementById('generatedRoomCode');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const notificationDiv = document.getElementById('notification');
const startGameBtn = document.getElementById('startGameBtn');
const entryForm = document.getElementById('entryForm');
const playerListDiv = document.getElementById('playerListDiv');
const playersList = document.getElementById('playersList');

// Função para exibir o botão de "Iniciar Partida"
function showStartButton() {
    startGameBtn.classList.remove("hidden");
}

// Função para ocultar o botão de "Iniciar Partida"
function hideStartButton() {
    startGameBtn.classList.add("hidden");
}

// Evento de clique no botão "Criar Sala"
createBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        socket.emit('createRoom', playerName, (roomCode) => {
            // Exibe a notificação com o código da sala gerado
            roomCodeDisplay.textContent = roomCode;
            generatedRoomCodeDiv.classList.remove('hidden');  // Exibe o div com o código da sala

            // Exibe uma notificação personalizada na tela
            showNotification(`Sala criada com sucesso! Código da sala: ${roomCode}`);
            showStartButton(); // Mostra o botão de iniciar partida

            // Redireciona para a página do jogo
            window.location.href = '/game.html';
        });
    } else {
        showNotification('Por favor, insira um nome de jogador.');
    }
});

// Evento de clique no botão "Entrar na Sala"
enterBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim();
    if (playerName && roomCode) {
        socket.emit('joinRoom', playerName, roomCode, (success, message) => {
            if (success) {
                entryForm.classList.add('hidden'); // Ocultar o formulário de entrada
                playerListDiv.classList.remove('hidden'); // Exibir lista de jogadores
                showNotification(`Você entrou na sala: ${roomCode}`);
            } else {
                showNotification(message, 'error');
            }
        });
    } else {
        showNotification('Por favor, insira seu nome e o código da sala.', 'error');
    }
});

// Copiar código da sala para a área de transferência
copyBtn.addEventListener('click', () => {
    const roomCode = roomCodeDisplay.textContent;
    navigator.clipboard.writeText(roomCode)
        .then(() => {
            showNotification('Código copiado para a área de transferência!');
        })
        .catch(() => {
            showNotification('Falha ao copiar o código.', 'error');
        });
});

// Atualizar lista de jogadores
socket.on('updatePlayers', (players) => {
    playersList.innerHTML = ''; // Limpar lista antes de atualizar
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        playersList.appendChild(li);
    });
});

// Exibir notificação
function showNotification(message, type = 'success') {
    notificationDiv.textContent = message;
    notificationDiv.classList.remove('hidden');
    notificationDiv.classList.add(type === 'error' ? 'error' : 'success');

    // Adicionando animação de fade-in e fade-out para as notificações
    notificationDiv.style.opacity = 1;
    setTimeout(() => {
        notificationDiv.style.opacity = 0;
    }, 4500);  // Duração total da notificação (inclusive a animação)
    
    setTimeout(() => {
        notificationDiv.classList.add('hidden');
    }, 5000);  // A notificação desaparece após 5 segundos
}

// Escutar evento de início de jogo
socket.on('gameStarted', (message) => {
    showNotification(message);
    hideStartButton(); // Esconde o botão após o início do jogo
});

// Exibir quando a sala for fechada
socket.on('roomClosed', (message) => {
    showNotification(message, 'error');
    entryForm.classList.remove('hidden');
    playerListDiv.classList.add('hidden');
    hideStartButton(); // Esconde o botão se a sala for fechada
});

// Função para mostrar notificação na tela
function showNotification(message) {
    notificationDiv.textContent = message;
    notificationDiv.classList.remove('hidden');
    setTimeout(() => {
        notificationDiv.classList.add('hidden');
    }, 5000); // A notificação desaparecerá após 5 segundos
}

// Ouvir a criação da sala e exibir a notificação
socket.on('roomCreated', (message) => {
    showNotification(message);
});
