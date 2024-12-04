// Variáveis de controle do jogo
let jogador1Score = 0;
let jogador2Score = 0;
let gameTimer = 120; // tempo inicial em segundos
let gameInterval;
let timerInterval;
let gameStarted = false;

// Variáveis do Canvas e contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Jogadores e bola
let jogador1 = { x: 50, y: canvas.height / 2, width: 20, height: 20, color: 'blue', speed: 5 };
let jogador2 = { x: canvas.width - 70, y: canvas.height / 2, width: 20, height: 20, color: 'red', speed: 5 };
let bola = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: 3, dy: 3, speed: 3 };

// Função para desenhar o campo de futebol
function drawField() {
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhando o campo
    ctx.fillStyle = '#2ecc71'; // Cor do campo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar as linhas de campo
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Centro do campo
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
}

// Função para desenhar os jogadores e a bola
function drawPlayersAndBall() {
    // Desenhando jogador 1
    ctx.fillStyle = jogador1.color;
    ctx.fillRect(jogador1.x, jogador1.y, jogador1.width, jogador1.height);

    // Desenhando jogador 2
    ctx.fillStyle = jogador2.color;
    ctx.fillRect(jogador2.x, jogador2.y, jogador2.width, jogador2.height);

    // Desenhando a bola
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bola.x, bola.y, bola.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Função para detectar colisões entre os jogadores e a bola
function checkCollisions() {
    // Colisão com jogador 1
    if (bola.x - bola.radius < jogador1.x + jogador1.width && bola.y > jogador1.y && bola.y < jogador1.y + jogador1.height) {
        bola.dx = Math.abs(bola.dx); // Bola vai para a direita
    }

    // Colisão com jogador 2
    if (bola.x + bola.radius > jogador2.x && bola.y > jogador2.y && bola.y < jogador2.y + jogador2.height) {
        bola.dx = -Math.abs(bola.dx); // Bola vai para a esquerda
    }

    // Colisão com as bordas
    if (bola.y - bola.radius < 0 || bola.y + bola.radius > canvas.height) {
        bola.dy = -bola.dy; // Bola rebate para cima ou para baixo
    }

    // Gols
    if (bola.x - bola.radius < 0) { // Gol para jogador 2
        jogador2Score++;
        updateScore();
        resetBall();
    } else if (bola.x + bola.radius > canvas.width) { // Gol para jogador 1
        jogador1Score++;
        updateScore();
        resetBall();
    }
}

// Função para mover a bola
function moveBall() {
    bola.x += bola.dx;
    bola.y += bola.dy;
}

// Função para controlar o movimento dos jogadores
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
}

// Função para atualizar o placar
function updateScore() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.textContent = `Jogador 1: ${jogador1Score} | Jogador 2: ${jogador2Score}`;
}

// Função para formatar o tempo no formato MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Função para atualizar o timer
function updateTimer() {
    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `Tempo: ${formatTime(gameTimer)}`;
}

// Função para reiniciar a posição da bola
function resetBall() {
    bola.x = canvas.width / 2;
    bola.y = canvas.height / 2;
    bola.dx = Math.random() > 0.5 ? 3 : -3;
    bola.dy = Math.random() > 0.5 ? 3 : -3;
}

// Função para iniciar o jogo
function startGame() {
    if (gameStarted) return; // Não inicia se o jogo já começou

    gameStarted = true;

    // Resetando o placar
    jogador1Score = 0;
    jogador2Score = 0;
    updateScore();

    // Resetando o timer
    gameTimer = 120;
    updateTimer();

    // Iniciar o intervalo do timer
    timerInterval = setInterval(function() {
        gameTimer--;
        updateTimer();

        if (gameTimer <= 0) {
            clearInterval(timerInterval); // Para o timer quando chegar a zero
            alert('Fim do Jogo!');
        }
    }, 1000); // Atualiza o timer a cada segundo

    // Iniciar o intervalo do jogo (movimento da bola e jogadores)
    gameInterval = setInterval(function() {
        drawField();
        drawPlayersAndBall();
        moveBall();
        movePlayers();
        checkCollisions();
    }, 1000 / 60); // Redesenha o campo e atualiza a cada 60 FPS
}

// Função para reiniciar o jogo
function restartGame() {
    // Reiniciar o estado do jogo
    clearInterval(gameInterval);  // Para o jogo (intervalo do campo)
    clearInterval(timerInterval); // Para o timer

    // Resetando o placar
    jogador1Score = 0;
    jogador2Score = 0;
    updateScore();

    // Resetando o timer
    gameTimer = 120;
    updateTimer();

    // Redesenha o campo vazio
    drawField();

    // Resetando jogadores e bola
    jogador1.y = canvas.height / 2;
    jogador2.y = canvas.height / 2;
    resetBall();

    gameStarted = false; // Jogo não iniciado
}

// Detectando teclas pressionadas para movimento
let keys = {};
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});
window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});
