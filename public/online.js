// Conectar ao servidor Socket.IO
const socket = io();

// Elementos do DOM
const playerNameInput = document.getElementById('playerName');
const roomCodeInput = document.getElementById('roomCode');
const enterBtn = document.getElementById('enterBtn');
const createBtn = document.getElementById('createBtn');
const copyBtn = document.getElementById('copyBtn');
const leaveBtn = document.getElementById('leaveBtn');
const startGameBtn = document.getElementById('startGameBtn');
const adminBtn = document.getElementById('adminBtn');
const generatedRoomCode = document.getElementById('generatedRoomCode');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const playerList = document.getElementById('playerList');
const playersList = document.getElementById('playersList');
const notification = document.getElementById('notification');

// Função para exibir mensagens de notificação
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.className = `notification ${type}`; // Adiciona classe para o tipo de notificação
}

// Função para atualizar a lista de jogadores na sala
function updatePlayerList(players) {
    playersList.innerHTML = '';  // Limpar a lista de jogadores
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        playersList.appendChild(li);
    });
}

// Validação de nome de jogador
function isValidName(name) {
    return name && name.trim().length > 0;
}

// Criar sala
createBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (isValidName(playerName)) {
        socket.emit('createRoom', playerName);
        playerNameInput.disabled = true;
        createBtn.disabled = true;
    } else {
        showNotification('Por favor, insira um nome de jogador válido.', 'error');
    }
});

// Entrar na sala
enterBtn.addEventListener('click', () => {
    const roomCode = roomCodeInput.value.trim();
    const playerName = playerNameInput.value.trim();
    if (roomCode && isValidName(playerName)) {
        socket.emit('joinRoom', roomCode, playerName);
        roomCodeInput.disabled = true;
        playerNameInput.disabled = true;
        enterBtn.disabled = true;
    } else {
        showNotification('Por favor, insira o código da sala e um nome de jogador válido.', 'error');
    }
});

// Iniciar o jogo
startGameBtn.addEventListener('click', () => {
    const roomCode = roomCodeDisplay.textContent;
    if (roomCode) {
        socket.emit('startGame', roomCode);
        showNotification('O jogo foi iniciado!', 'success');
    } else {
        showNotification('Erro ao iniciar o jogo. Sala não encontrada.', 'error');
    }
});

// Sair da sala
leaveBtn.addEventListener('click', () => {
    const roomCode = roomCodeDisplay.textContent;
    const playerName = playerNameInput.value.trim();
    if (roomCode && playerName) {
        socket.emit('leaveRoom', roomCode, playerName);
        resetUI();
    } else {
        showNotification('Erro ao sair. Certifique-se de estar na sala corretamente.', 'error');
    }
});

// Acessar painel de administração (apenas para o administrador)
adminBtn.addEventListener('click', () => {
    const roomCode = roomCodeDisplay.textContent;
    if (roomCode) {
        // Aqui você pode adicionar lógica para mostrar a interface de administração
        console.log(`Acessando painel de admin da sala: ${roomCode}`);
    } else {
        showNotification('Você precisa estar em uma sala para acessar o painel de administração.', 'error');
    }
});

// Copiar código da sala
copyBtn.addEventListener('click', () => {
    const roomCode = roomCodeDisplay.textContent;
    if (roomCode) {
        navigator.clipboard.writeText(roomCode).then(() => {
            showNotification('Código copiado para a área de transferência!', 'success');
        }).catch(() => {
            showNotification('Falha ao copiar o código. Tente novamente.', 'error');
        });
    } else {
        showNotification('Não há código de sala para copiar.', 'error');
    }
});

// Eventos recebidos do servidor
socket.on('roomCreated', (roomCode) => {
    generatedRoomCode.classList.remove('hidden');
    roomCodeDisplay.textContent = roomCode;
    copyBtn.classList.remove('hidden');
    leaveBtn.classList.remove('hidden');
    startGameBtn.classList.remove('hidden');
    adminBtn.classList.remove('hidden');
    showNotification(`Sala criada com sucesso! Código: ${roomCode}`, 'success');
});

socket.on('roomFull', (message) => {
    showNotification(message, 'error');
});

socket.on('playerJoined', (roomCode, players) => {
    updatePlayerList(players);
    showNotification('Novo jogador entrou na sala.', 'info');
    if (players.length === 2) {
        startGameBtn.classList.remove('hidden');
    }
});

socket.on('playerKicked', (roomCode, players) => {
    updatePlayerList(players);
    showNotification('Um jogador foi expulso da sala.', 'info');
});

socket.on('playerLeft', (roomCode, players) => {
    updatePlayerList(players);
    showNotification('Um jogador saiu da sala.', 'info');
    if (players.length < 2) {
        startGameBtn.classList.add('hidden');
    }
});

socket.on('gameStarted', (roomCode) => {
    const playerName = playerNameInput.value.trim(); // Captura o nome do jogador
    showNotification('O jogo foi iniciado!', 'success');

    // Redirecionar para a tela do jogo com o nome do jogador e código da sala
    window.location.href = `../futebol/game.html?playerName=${encodeURIComponent(playerName)}&roomCode=${encodeURIComponent(roomCode)}`;
});


// Atualizar lista de salas no painel de administração
socket.on('updateRoomList', (rooms) => {
    // Aqui você pode atualizar uma lista de salas no painel de administração, caso necessário
    console.log(rooms);
});

// Função para resetar a interface
function resetUI() {
    playerNameInput.value = '';
    roomCodeInput.value = '';
    playerNameInput.disabled = false;
    roomCodeInput.disabled = false;
    createBtn.disabled = false;
    enterBtn.disabled = false;
    generatedRoomCode.classList.add('hidden');
    copyBtn.classList.add('hidden');
    leaveBtn.classList.add('hidden');
    startGameBtn.classList.add('hidden');
    adminBtn.classList.add('hidden');
    notification.classList.add('hidden');
}

// A melhor prática seria adicionar também animações para transições de estados (por exemplo, quando o jogo é iniciado).
