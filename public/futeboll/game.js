// Conexão com o servidor usando Socket.io
const socket = io();

// Elementos do DOM
const playerNameDisplay = document.getElementById('playerNameDisplay');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const scoreboard = document.getElementById('scoreboard');
const timerDisplay = document.getElementById('timerDisplay');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d'); // Para desenhar no canvas
const restartBtn = document.getElementById('restartBtn');
const startGameBtn = document.getElementById('startGameBtn');
const notificationDiv = document.getElementById('notification');
const multiplayerLink = document.querySelector('.btn-link');

// Variáveis do jogo
let playerName = 'Jogador';
let roomCode = 'XXXX';
let playerScore = 0;
let opponentScore = 0;
let gameTimer = 30; // Tempo do jogo em segundos
let gameInterval;
let gameStarted = false;

// Dimensões do campo e jogadores
const fieldWidth = gameCanvas.width;
const fieldHeight = gameCanvas.height;
const playerWidth = 20;
const playerHeight = 60;
const ballRadius = 10;

// Posições iniciais dos jogadores
let player1 = { x: 50, y: fieldHeight / 2 - playerHeight / 2, color: 'blue', speed: 4 };
let player2 = { x: fieldWidth - 50 - playerWidth, y: fieldHeight / 2 - playerHeight / 2, color: 'red', speed: 4 };

// Bola
let ball = {
    x: fieldWidth / 2,
    y: fieldHeight / 2,
    radius: ballRadius,
    dx: 4,
    dy: 4,
    color: 'white',
};

// Função para atualizar o placar
function updateScore() {
    scoreboard.textContent = `Jogador 1: ${playerScore} | Jogador 2: ${opponentScore}`;
}

// Função para atualizar o tempo
function updateTimer() {
    timerDisplay.textContent = `Tempo: ${gameTimer < 10 ? '0' + gameTimer : gameTimer}`;
    if (gameTimer > 0) {
        gameTimer--;
    } else {
        clearInterval(gameInterval);
        gameStarted = false;
        alert('Fim de Jogo!');
    }
}

// Função para iniciar o jogo
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameInterval = setInterval(updateTimer, 1000);
        startGameBtn.disabled = true;
        restartBtn.disabled = false;
    }
}

// Função para reiniciar o jogo
function restartGame() {
    gameTimer = 30; // Reseta o tempo
    playerScore = 0; // Reseta o placar
    opponentScore = 0;
    updateScore(); // Atualiza o placar na tela
    gameStarted = false;
    startGameBtn.disabled = false;
    restartBtn.disabled = true;
    ball.x = fieldWidth / 2; // Reseta a posição da bola
    ball.y = fieldHeight / 2;
    ball.dx = 4;
    ball.dy = 4;
}

// Enviar dados de jogador ao entrar na sala
function sendPlayerData() {
    socket.emit('joinRoom', { playerName, roomCode });
}

// Atualizando a posição dos jogadores e a bola de forma sincronizada
socket.on('gameData', (data) => {
    playerName = data.playerName;
    roomCode = data.roomCode;
    playerNameDisplay.textContent = playerName;
    roomCodeDisplay.textContent = roomCode;
});

// Função principal do jogo
function gameLoop() {
    ctx.clearRect(0, 0, fieldWidth, fieldHeight);
    drawField();
    drawPlayers();
    drawBall();
    moveBall();
    movePlayers();
    ballCollision();
}

// Configuração do intervalo para a animação do jogo
setInterval(gameLoop, 1000 / 60);

// Funções de Desenho
function drawField() {
    ctx.fillStyle = 'green'; // Cor do campo
    ctx.fillRect(0, 0, fieldWidth, fieldHeight); // Desenha o campo

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, fieldWidth, fieldHeight); // Limite do campo
}

function drawPlayers() {
    ctx.fillStyle = player1.color;
    ctx.fillRect(player1.x, player1.y, playerWidth, playerHeight); // Desenha jogador 1

    ctx.fillStyle = player2.color;
    ctx.fillRect(player2.x, player2.y, playerWidth, playerHeight); // Desenha jogador 2
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisão com as paredes
    if (ball.y + ball.radius > fieldHeight || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    if (ball.x + ball.radius > fieldWidth || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
}

function movePlayers() {
    // Jogador 1 (movimento com teclas W, A, S, D)
    if (keys['w'] && jogador1.y > 0) {
        jogador1.y -= jogador1.speed; // Move para cima
    }
    if (keys['s'] && jogador1.y < canvas.height - jogador1.height) {
        jogador1.y += jogador1.speed; // Move para baixo
    }
    if (keys['a'] && jogador1.x > 0) {
        jogador1.x -= jogador1.speed; // Move para a esquerda
    }
    if (keys['d'] && jogador1.x < canvas.width - jogador1.width) {
        jogador1.x += jogador1.speed; // Move para a direita
    }

    // Jogador 2 (movimento com teclas de seta para cima, para baixo, para esquerda e para direita)
    if (keys['ArrowUp'] && jogador2.y > 0) {
        jogador2.y -= jogador2.speed; // Move para cima
    }
    if (keys['ArrowDown'] && jogador2.y < canvas.height - jogador2.height) {
        jogador2.y += jogador2.speed; // Move para baixo
    }
    if (keys['ArrowLeft'] && jogador2.x > 0) {
        jogador2.x -= jogador2.speed; // Move para a esquerda
    }
    if (keys['ArrowRight'] && jogador2.x < canvas.width - jogador2.width) {
        jogador2.x += jogador2.speed; // Move para a direita
    }

    // Limitar os jogadores para não saírem do campo
    player1.y = Math.max(0, Math.min(player1.y, fieldHeight - playerHeight));
    player2.y = Math.max(0, Math.min(player2.y, fieldHeight - playerHeight));
}

function ballCollision() {
    // Colisão da bola com os jogadores
    if (ball.x - ball.radius < player1.x + playerWidth && ball.y > player1.y && ball.y < player1.y + playerHeight) {
        ball.dx = -ball.dx;
        playerScore++;
        updateScore();
    }
    if (ball.x + ball.radius > player2.x && ball.y > player2.y && ball.y < player2.y + playerHeight) {
        ball.dx = -ball.dx;
        opponentScore++;
        updateScore();
    }
}

// Captura de teclas
let keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Enviar dados do jogador para o servidor
socket.on('connect', () => {
    sendPlayerData();
});

// Iniciar o jogo após o clique do botão
startGameBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
