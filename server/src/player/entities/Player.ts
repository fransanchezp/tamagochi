import { Socket } from "socket.io";

export enum Directions {
    Up = "up", 
    Down = "down",
    Left = "left",
    Right = "right",
    Idle = "idle"
}

export enum PlayerStates {
    No_Connected, Idle, Moving, Hidden, Dead
}

export interface Player {
    id: string;
    x: number;
    y: number;
    state: PlayerStates;
    direction: Directions;
    visibility: Boolean;
    isHidden: Boolean;
}
