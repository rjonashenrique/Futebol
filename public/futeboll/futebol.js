// Variáveis de controle do jogo
let jogadorScore = 0;
let iaScore = 0;
let gameTimer = 1800;  // 30 minutos em segundos
let gameInterval;
let timerInterval;
let gameStarted = false;

// Obtendo o canvas e o contexto de desenho
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Jogador e IA
let jogador = { x: 50, y: canvas.height / 2, width: 20, height: 20, color: 'blue', speed: 5 };
let ia = { x: canvas.width - 70, y: canvas.height / 2, width: 20, height: 20, color: 'red', speed: 3 };

// Bola
let bola = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: 3, dy: 3, speed: 3 };

// Teclas pressionadas para controle do jogador
let keys = {};


// Variável para definir a dificuldade (pode ser 'easy', 'medium', 'hard')
let difficulty = 'easy'; // Começa no nível fácil

// Função para definir a dificuldade da IA
function setDifficulty(level) {
    difficulty = level;
}

// Função para desenhar o campo de futebol
function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas a cada atualização
    ctx.fillStyle = '#2ecc71'; // Cor do campo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordas do campo
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Linha do meio
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
}

// Função para desenhar o jogador, IA e a bola
function drawPlayersAndBall() {
    // Jogador
    ctx.fillStyle = jogador.color;
    ctx.fillRect(jogador.x, jogador.y, jogador.width, jogador.height);

    // IA
    ctx.fillStyle = ia.color;
    ctx.fillRect(ia.x, ia.y, ia.width, ia.height);

    // Bola
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bola.x, bola.y, bola.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Função para mover a bola
function moveBall() {
    bola.x += bola.dx;
    bola.y += bola.dy;
}

// Função para detectar colisões com os jogadores
function checkCollisions() {
    // Colisão com o jogador
    if (bola.x - bola.radius < jogador.x + jogador.width && bola.y > jogador.y && bola.y < jogador.y + jogador.height) {
        bola.dx = Math.abs(bola.dx); // A bola vai para a direita
    }

    // Colisão com a IA
    if (bola.x + bola.radius > ia.x && bola.y > ia.y && bola.y < ia.y + ia.height) {
        bola.dx = -Math.abs(bola.dx); // A bola vai para a esquerda
    }

    // Colisão com as bordas superior e inferior
    if (bola.y - bola.radius < 0 || bola.y + bola.radius > canvas.height) {
        bola.dy = -bola.dy; // A bola rebate para cima ou para baixo
    }

    // Gols
    if (bola.x - bola.radius < 0) { // Gol para a IA
        iaScore++;
        updateScore();
        resetBall();
    } else if (bola.x + bola.radius > canvas.width) { // Gol para o jogador
        jogadorScore++;
        updateScore();
        resetBall();
    }
}

// Função para reiniciar a posição da bola após um gol
function resetBall() {
    bola.x = canvas.width / 2;
    bola.y = canvas.height / 2;
    bola.dx = Math.random() > 0.5 ? 3 : -3;
    bola.dy = Math.random() > 0.5 ? 3 : -3;
}

// Função para movimentação do jogador
function movePlayer() {
    // Movimento para cima
    if (keys['w']) {
        jogador.y -= jogador.speed;
    }
    // Movimento para baixo
    if (keys['s']) {
        jogador.y += jogador.speed;
    }
    // Movimento para a direita
    if (keys['d']) {
        jogador.x += jogador.speed;
    }
    // Movimento para a esquerda
    if (keys['a']) {
        jogador.x -= jogador.speed;
    }

    // Impedir que o jogador saia da tela
    if (jogador.y < 0) jogador.y = 0;
    if (jogador.y + jogador.height > canvas.height) jogador.y = canvas.height - jogador.height;
    if (jogador.x < 0) jogador.x = 0;
    if (jogador.x + jogador.width > canvas.width) jogador.x = canvas.width - jogador.width;
}


// Função para ajustar a velocidade da IA de acordo com a dificuldade
function getIASpeed() {
    switch (difficulty) {
        case 'easy':
            return ia.speed * 0.6;  // IA mais lenta
        case 'medium':
            return ia.speed;        // IA normal
        case 'hard':
            return ia.speed * 1.5;  // IA mais rápida
        default:
            return ia.speed;
    }
}

// Função para ajustar a chance de erro da IA
function getIAErrorChance() {
    switch (difficulty) {
        case 'easy':
            return 0.3;  // 30% de chance de erro
        case 'medium':
            return 0.2;  // 20% de chance de erro
        case 'hard':
            return 0.1;  // 10% de chance de erro
        default:
            return 0.3;
    }
}

// Função para ajustar o comportamento da IA no movimento
function moveIA() {
    const speed = getIASpeed(); // Obtém a velocidade da IA com base na dificuldade
    const errorChance = getIAErrorChance(); // Obtém a chance de erro da IA com base na dificuldade

    // Caso a IA cometa erro (movimento aleatório)
    if (Math.random() < errorChance) {
        if (Math.random() < 0.5) {
            ia.y += speed * 2;  // Movimento para baixo
        } else {
            ia.y -= speed * 2;  // Movimento para cima
        }
    } else {
        // Comportamento da IA para tentar pegar a bola (mais inteligente conforme aumenta a dificuldade)
        if (difficulty === 'easy') {
            // Movimento mais aleatório e menos preciso
            if (Math.random() < 0.5) {
                ia.x += speed * 0.5;  // Movimento horizontal para a direita
            } else {
                ia.x -= speed * 0.5;  // Movimento horizontal para a esquerda
            }
        } else if (difficulty === 'medium') {
            // IA tenta se aproximar da bola, mas ainda de forma imprecisa
            if (bola.y < ia.y + ia.height / 2 && ia.y > 0) {
                ia.y -= speed * 0.8; // Movimento vertical para cima
            } else if (bola.y > ia.y + ia.height / 2 && ia.y < canvas.height - ia.height) {
                ia.y += speed * 0.8; // Movimento vertical para baixo
            }
        } else if (difficulty === 'hard') {
            // IA tenta pegar a bola com mais precisão
            if (bola.y < ia.y + ia.height / 2 && ia.y > 0) {
                ia.y -= speed; // Movimento vertical para cima
            } else if (bola.y > ia.y + ia.height / 2 && ia.y < canvas.height - ia.height) {
                ia.y += speed; // Movimento vertical para baixo
            }

            // Movimento horizontal mais preciso para interceptar a bola
            if (bola.x < ia.x && ia.x > 0) {
                ia.x -= speed;  // Movimento horizontal para a esquerda
            } else if (bola.x > ia.x && ia.x < canvas.width - ia.width) {
                ia.x += speed;  // Movimento horizontal para a direita
            }
        }
    }

    // Limita a IA dentro da área do campo
    if (ia.y < 0) ia.y = 0;
    if (ia.y + ia.height > canvas.height) ia.y = canvas.height - ia.height;
    if (ia.x < 0) ia.x = 0;
    if (ia.x + ia.width > canvas.width) ia.x = canvas.width - ia.width;
}


// Função para atualizar o placar
function updateScore() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.textContent = `Jogador: ${jogadorScore} | IA: ${iaScore}`;
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

// Função para iniciar o jogo
function startGame() {
    if (gameStarted) return;  // Não inicia se o jogo já começou

    gameStarted = true;
    jogadorScore = 0;
    iaScore = 0;
    updateScore();
    gameTimer = 1800; // 30 minutos
    updateTimer();

    // Intervalo do tempo
    timerInterval = setInterval(function() {
        gameTimer--;
        updateTimer();
        if (gameTimer <= 0) {
            clearInterval(timerInterval);
            alert('Fim do Jogo!');
        }
    }, 1000);

    // Intervalo do jogo (atualiza os elementos da tela a cada 60 FPS)
    gameInterval = setInterval(function() {
        drawField();
        drawPlayersAndBall();
        moveBall();
        movePlayer();
        moveIA();
        checkCollisions();
    }, 1000 / 60);
}

// Função para reiniciar o jogo
function restartGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    jogadorScore = 0;
    iaScore = 0;
    updateScore();
    gameTimer = 1800;
    updateTimer();
    resetBall();
    jogador.y = canvas.height / 2;
    ia.y = canvas.height / 2;
    gameStarted = false;
}

// Detectando teclas pressionadas para controle do jogador
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});
window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});
