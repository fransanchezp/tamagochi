import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates, Messages } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService";
import { genRanHex } from "../util/util";
export class GameService {
  private games: Game[];

  private static instance: GameService;
  private constructor() {
    this.games = [];
  }

  static getInstance(): GameService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new GameService();
    return this.instance;
  }

  public buildPlayer(socket: Socket): Player {
    return {
      id: socket.id,
      x: 0,
      y: 0,
      state: PlayerStates.Idle,
      direction: Directions.Up,
      visibility: true,
      isHidden: false,
    };
  }

  public addPlayer(player: Player): boolean {
    const room: Room = RoomService.getInstance().addPlayer(player);
    ServerService.getInstance().sendMessage(
      room.name,
      Messages.NEW_PLAYER,
      "new player"
    );

    if (room.players.length == 1 && room.game == null) {
      const board = new BoardBuilder().getBoard();
      const game: Game = {
        id: "game" + genRanHex(128),
        state: GameStates.WAITING,
        room: room,
        board: board,
      };

      const playerPosition = board.elements.find(
        (element) => element.type === 6
      );
      if (playerPosition) {
        player.x = playerPosition.x;
        player.y = playerPosition.y;
      }

      room.game = game;
      this.games.push(game);
    }

    if (room.occupied) {
      if (room.game) {
        room.game.state = GameStates.PLAYING;

        const usedPosition = room.players[0];
        const playerPosition = room.game.board.elements.find(
          (element) =>
            element.type === 6 &&
            (element.x !== usedPosition.x || element.y !== usedPosition.y)
        );

        if (playerPosition) {
          player.x = playerPosition.x;
          player.y = playerPosition.y;
        }

        if (ServerService.getInstance().isActive()) {
          ServerService.getInstance().sendMessage(room.name, Messages.BOARD, {
            players: room.players,
            board: room.game.board,
          });
        }
      }
      return true;
    }
    return false;
  }

  public findPlayerBySocketId(socketId: string): Player | null {
    for (const game of this.games) {
      const player = game.room.players.find((p) => p.id === socketId);
      if (player) return player;
    }
    return null;
  }

  public findGameByPlayer(player: Player | null): Game | null {
    if (!player) return null;
    return (
      this.games.find((game) =>
        game.room.players.some((p) => p.id === player.id)
      ) || null
    );
  }
}
