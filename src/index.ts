import WebSocket, { WebSocketServer } from 'ws';

import { PlayerInfo } from './types/PlayerInfo';

const wss: WebSocketServer = new WebSocket.Server({ port: 9999 });

let playersOnline: PlayerInfo[] = [];

wss.on('connection', (ws: WebSocket) => {
    const id = new Date().getTime().toString(36);
    playersOnline.push({
        id: id,
        x: 0,
        y: 0,
        z: 0
    });
    
    ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            const player = playersOnline.find((player) => player.id === id);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.z = data.z;
            }
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'move', player: player }));
                }
            });
        }
    });
    
    ws.send(JSON.stringify({ type: 'init', id: id, players: playersOnline }));

    ws.on('close', () => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'leave', id: id }));
            }
        });
        playersOnline = playersOnline.filter((player) => player.id !== id);
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'join', player: playersOnline.find((player) => player.id === id) }));
        }
    });
    }
);