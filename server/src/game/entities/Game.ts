import { Room } from "../../room/entities/Room";
import { Board } from "./Board";

export enum GameStates {
    WAITING, PLAYING, ENDED
}

export enum Messages {
    BOARD = "BOARD",
    NEW_PLAYER = "NEW_PLAYER"
}

export interface Game {
    id : String,
    state: GameStates,
    room: Room,
    board: Board
}