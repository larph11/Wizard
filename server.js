const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", socket => {

    socket.on("joinRoom", room => {
        socket.join(room);

        if (!rooms[room]) rooms[room] = {players: [], state: null};

        rooms[room].players.push(socket.id);

        if (rooms[room].players.length === 2) {
            rooms[room].state = {
                turn: 1,
                hp: [100, 100],
                pos: [[3,7],[4,0]],
                cooldowns: [{spear:0,rook:0,bishop:0,queen:0},{spear:0,rook:0,bishop:0,queen:0}],
                dodge: [2,2]
            };
            io.to(room).emit("startGame", rooms[room].state);
        }
    });

    socket.on("action", data => {
        const room = data.room;
        const state = rooms[room].state;

        if(data.type === "move"){
            state.pos[data.player] = data.pos;
        }
        if(data.type === "damage"){
            state.hp[data.target] -= data.amount;
        }
        if(data.type === "cooldown"){
            state.cooldowns[data.player][data.skill] = data.value;
        }
        if(data.type === "dodge"){
            state.dodge[data.player] = data.value;
        }

        // Switch turn
        state.turn = state.turn === 1 ? 2 : 1;

        io.to(room).emit("update", state);
    });

});

server.listen(3000, ()=>console.log("Server running"));