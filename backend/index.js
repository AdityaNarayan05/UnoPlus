const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);

const server = app.listen(5000, () => {
    console.log("Server started on PORT 5000");
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log("Connected to Socket.io");

    // For Making the Card Played Functionality
    socket.on('card played', (game) => {
        // Notify all players in the game that a card has been played
        game.players.forEach(player => {
            socket.in(player.user._id).emit('state changed');
        });
    });
    // Completed

    // When a user joins a game
    socket.on('join game', ({ user, data }) => {
        socket.join(user._id);
        socket.join(data._id);
        // Notify all players in the game that the state has changed
        data.players.map(player => {
            socket.in(player.user._id).emit('state changed');
        });
    });

    // When a new game is created
    socket.on('create game', (game) => {
        const user = game.creator;
        socket.join(user._id);
        socket.join(game._id);
    });

    // For setup (joining rooms)
    socket.on('setup', ({ userInfo, firstItem }) => {
        socket.join(userInfo._id);
        socket.join(firstItem._id);
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log("User Disconnected");
    });
});