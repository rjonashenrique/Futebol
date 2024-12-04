const socket = io();

// Elementos do DOM
const roomList = document.getElementById('roomList');
const playersInRoom = document.getElementById('playersInRoom');
const currentRoomCode = document.getElementById('currentRoomCode');
const playersList = document.getElementById('playersList');
const notification = document.getElementById('notification');
const startGameBtn = document.getElementById('startGameBtn');
const kickPlayerBtn = document.getElementById('kickPlayerBtn');

// Função para mostrar notificações
function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Ouvir eventos do servidor
socket.on('updateRoomList', (rooms) => {
    roomList.innerHTML = '';
    rooms.forEach(room => {
        const roomItem = document.createElement('li');
        roomItem.textContent = `Sala: ${room.roomCode}`;
        roomItem.addEventListener('click', () => viewPlayersInRoom(room.roomCode));
        roomList.appendChild(roomItem);
    });
});

socket.on('playerJoined', (roomCode, players) => {
    if (currentRoomCode.textContent === roomCode) {
        updatePlayersList(players);
    }
});

socket.on('gameStarted', (roomCode) => {
    if (currentRoomCode.textContent === roomCode) {
        showNotification('Jogo iniciado!');
        startGameBtn.disabled = true;
    }
});

socket.on('playerKicked', (roomCode, players) => {
    if (currentRoomCode.textContent === roomCode) {
        updatePlayersList(players);
        showNotification('Jogador expulso!');
    }
});

// Exibir jogadores na sala
function viewPlayersInRoom(roomCode) {
    currentRoomCode.textContent = roomCode;
    playersInRoom.classList.remove('hidden');
    socket.emit('getPlayersInRoom', roomCode);
}

// Atualizar lista de jogadores
function updatePlayersList(players) {
    playersList.innerHTML = '';
    players.forEach(player => {
        const playerItem = document.createElement('li');
        playerItem.textContent = player.name;
        playersList.appendChild(playerItem);
    });
}

// Iniciar o jogo
startGameBtn.addEventListener('click', () => {
    const roomCode = currentRoomCode.textContent;
    socket.emit('startGame', roomCode);
});

// Expulsar um jogador
kickPlayerBtn.addEventListener('click', () => {
    const playerName = prompt('Digite o nome do jogador a ser expulso:');
    const roomCode = currentRoomCode.textContent;
    socket.emit('kickPlayer', roomCode, playerName);
});

// Solicitar lista de salas ao carregar a página
window.onload = () => {
    socket.emit('requestRoomList');
};

// Ouvir quando um jogador deixar a sala
socket.on('playerLeft', (roomCode, players) => {
    if (currentRoomCode.textContent === roomCode) {
        updatePlayersList(players);
        showNotification('Jogador saiu da sala!');
    }
});
