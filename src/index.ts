import WebSocket, { WebSocketServer } from 'ws';
import { WEBSOCKETS_PORT } from './config';

import { PlayerInfo } from './types/PlayerInfo';
import { WebSocketMessage } from './types/WebsocketMessage';

const wss: WebSocketServer = new WebSocket.Server({ port: WEBSOCKETS_PORT });

let playersOnline: PlayerInfo[] = [];

wss.on('connection', (ws: WebSocket) => {

    const id = new Date().getTime().toString(36);

    const loggedInPlayer: PlayerInfo = {
        id: id,
        x: 0,
        y: 0,
        z: 0
    };

    playersOnline.push(loggedInPlayer);

    const initMessage: WebSocketMessage = {
        type: 'playerInit',
        player: loggedInPlayer,
        playersOnline: playersOnline
    };

    ws.send(JSON.stringify(initMessage));
    
    ws.on('message', (message: string) => {
        const data = JSON.parse(message) as WebSocketMessage;
        if (data.type === 'playerMove') {
            const player = playersOnline.find((player) => player.id === data.player.id);
            if (player) {
                player.x = data.player.x;
                player.y = data.player.y;
                player.z = data.player.z;

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        const playerMoveMessage: WebSocketMessage = {
                            type: 'playerMove',
                            player: player
                        };
                        client.send(JSON.stringify(playerMoveMessage));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                const playerLeaveMessage: WebSocketMessage = {
                    type: 'playerLeave',
                    player: loggedInPlayer
                };
                client.send(JSON.stringify(playerLeaveMessage));
            }
        });
        playersOnline = playersOnline.filter((player) => player.id !== id);
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const playerJoinMessage: WebSocketMessage = {
                type: 'playerJoin',
                player: loggedInPlayer
            };
            client.send(JSON.stringify(playerJoinMessage));
        }
    });
    }
);