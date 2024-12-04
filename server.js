const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {}; // Armazenamento de salas

// Rota inicial para servir o arquivo HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Rota para arquivos estáticos (CSS, JS)
app.use(express.static(__dirname + '/public'));

// Conexão do socket
io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);
    
    // Criação de sala
    socket.on('createRoom', (playerName, callback) => {
        const roomCode = generateRoomCode(); // Gera o código da sala
        rooms[roomCode] = { players: [{ id: socket.id, name: playerName }], admin: socket.id }; // Salva a sala com o jogador como o admin
        socket.join(roomCode); // Adiciona o jogador à sala
        callback(roomCode); // Retorna o código da sala para o frontend
    
        // Emite a atualização de jogadores para a sala
        io.to(socket.id).emit('updatePlayers', rooms[roomCode].players);
    
        // Notificar os jogadores que a sala foi criada
        io.to(roomCode).emit('roomCreated', `Sala criada com sucesso! Código da sala: ${roomCode}`);
    });

    // Entrada em sala
    socket.on('joinRoom', (playerName, roomCode, callback) => {
        if (rooms[roomCode]) {
            // Verificar se o nome do jogador já está na sala
            const playerExists = rooms[roomCode].players.some(player => player.name === playerName);
            if (playerExists) {
                callback(false, 'Nome de jogador já está em uso na sala.');
            } else {
                rooms[roomCode].players.push({ id: socket.id, name: playerName }); // Adiciona o jogador à sala
                socket.join(roomCode); // Coloca o jogador na sala
                io.to(roomCode).emit('updatePlayers', rooms[roomCode].players); // Atualiza a lista de jogadores
                callback(true); // Resposta de sucesso
            }
        } else {
            callback(false, 'Código de sala inválido.'); // Retorna erro
        }
    });

    // Atualizar lista de jogadores
    socket.on('updatePlayers', (roomCode) => {
        io.to(roomCode).emit('updatePlayers', rooms[roomCode].players); // Atualiza a lista de jogadores na sala
    });

    // Iniciar jogo
    socket.on('startGame', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].admin === socket.id) {
            io.to(roomCode).emit('gameStarted', 'O jogo começou!');
            console.log(`Jogo iniciado na sala ${roomCode}`);
        } else {
            socket.emit('error', 'Você não é o administrador para iniciar o jogo!');
        }
    });

    // Fechar sala (admin)
    socket.on('closeRoom', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].admin === socket.id) {
            rooms[roomCode].players.forEach(player => {
                io.to(player.id).emit('roomClosed', 'A sala foi fechada!');
            });
            delete rooms[roomCode];  // Deletar a sala
            io.to(roomCode).emit('updatePlayers', []);  // Atualizar a lista de jogadores
            console.log(`Sala ${roomCode} foi fechada.`);
        } else {
            socket.emit('error', 'Você não é o administrador para fechar a sala!');
        }
    });

    // Sair da sala
    socket.on('leaveRoom', (roomCode) => {
        if (rooms[roomCode]) {
            const playerIndex = rooms[roomCode].players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                rooms[roomCode].players.splice(playerIndex, 1); // Remove o jogador da sala
                socket.leave(roomCode); // Remove o jogador da sala
                io.to(roomCode).emit('updatePlayers', rooms[roomCode].players); // Atualiza a lista de jogadores
                console.log(`Jogador ${socket.id} saiu da sala ${roomCode}`);

                // Se for o último jogador, a sala é fechada automaticamente
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode];
                }
            }
        }
    });

    // Desconectar o jogador
    socket.on('disconnect', () => {
        // Remover o jogador de todas as salas em que está
        for (let roomCode in rooms) {
            const playerIndex = rooms[roomCode].players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                rooms[roomCode].players.splice(playerIndex, 1);
                io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
                console.log(`Jogador ${socket.id} desconectado da sala ${roomCode}`);

                // Se for o último jogador, a sala é fechada
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode];
                }
            }
        }
    });
});

// Função para gerar código de sala aleatório
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Servir arquivos estáticos (ex: CSS, JS)
app.use(express.static(__dirname + '/public'));

// Iniciar servidor
server.listen(4000, () => {
    console.log('Servidor rodando na porta 4000');
});
