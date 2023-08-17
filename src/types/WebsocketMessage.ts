import { PlayerInfo } from "./PlayerInfo"

export type WebSocketMessage = {
    type: 'playerJoin' | 'playerLeave' | 'playerMove' | 'playerInit',
    player: PlayerInfo,
    playersOnline?: PlayerInfo[]
}