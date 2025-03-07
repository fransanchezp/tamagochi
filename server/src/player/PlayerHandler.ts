import { Player, Directions, PlayerStates } from "./entities/Player";
import { Game } from "../game/entities/Game";

export class PlayerHandler {
    private static instance: PlayerHandler;
    
    private constructor() {}

    static getInstance(): PlayerHandler {
        if (!this.instance) {
            this.instance = new PlayerHandler();
        }
        return this.instance;
    }

    public canMove(game: Game, player: Player, direction: Directions): boolean {
        let newX = player.x;
        let newY = player.y;

        switch(direction) {
            case Directions.Up:
                newX--;
                break;
            case Directions.Down:
                newX++;
                break;
            case Directions.Left:
                newY--;
                break;
            case Directions.Right:
                newY++;
                break;
        }

        if (newX < 0 || newX >= game.board.size || newY < 0 || newY >= game.board.size) {
            return false;
        }

        
        const isOccupiedByPlayer = game.room.players.some(p => p.x === newX && p.y === newY && p.id !== player.id);
    if (isOccupiedByPlayer) {
        return false;
    }

    return true;
    }

    public canShoot(game: Game, shooter: Player, target: Player): boolean {
        const dx = Math.abs(shooter.x - target.x);
        const dy = Math.abs(shooter.y - target.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    public movePlayer(player: Player, direction: Directions): void {
        switch(direction) {
            case Directions.Up:
                player.x--;
                break;
            case Directions.Down:
                player.x++;
                break;
            case Directions.Left:
                player.y--;
                break;
            case Directions.Right:
                player.y++;
                break;
        }
        
        player.state = PlayerStates.Moving;
        player.direction = direction;
    }

    public rotatePlayer(player: Player, direction: Directions): void {
        player.direction = direction;
        player.state = PlayerStates.Idle;
    }

    // public handleShoot(shooter: Player, target: Player): void {
    //     if (this.isValidShot(shooter, target)) {
    //         target.state = PlayerStates.Dead;
    //         target.visibility = false;
    //     }
    // }
    public handleShoot(shooter: Player): void {
        shooter.state = PlayerStates.Dead;
        shooter.visibility = false;
    }

    private isValidShot(shooter: Player, target: Player): boolean {
        switch(shooter.direction) {
            case Directions.Up:
                return shooter.x - 1 === target.x && shooter.y === target.y;
            case Directions.Down:
                return shooter.x + 1 === target.x && shooter.y === target.y;
            case Directions.Left:
                return shooter.x === target.x && shooter.y - 1 === target.y;
            case Directions.Right:
                return shooter.x === target.x && shooter.y + 1 === target.y;
            default:
                return false;
        }
    }
}