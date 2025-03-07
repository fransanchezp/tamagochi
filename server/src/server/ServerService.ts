import { DefaultEventsMap, Server, Socket } from "socket.io";
import http from "http";
import { GameService } from "../game/GameService";
import { AnyTxtRecord } from "dns";
import { PlayerHandler } from "../player/PlayerHandler";
import { Game, GameStates } from "../game/entities/Game";
import { Player } from "../player/entities/Player";


export class ServerService {
  private io: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  > | null;
  private active: boolean;
  static messages = {
    out: {
      new_player: "NEW_PLAYER",
      game_start: "GAME_START",
      game_update: "GAME_UPDATE",
      game_end: "GAME_END",
      player_move: "PLAYER_MOVE",
      player_rotate: "PLAYER_ROTATE",
      player_shoot: "PLAYER_SHOOT",
    },
  };

  public inputMessage = [
    {
      type: "HELLO",
      do: this.doHello,
    },
    {
      type: "BYE",
      do: this.doBye,
    },
  ];

  private static instance: ServerService;
  private constructor() {
    this.io = null;
    this.active = false;
  }

  static getInstance(): ServerService {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ServerService();
    return this.instance;
  }

  public init(
    httpServer: http.Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >
  ) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.active = true;

    this.io.on("connection", (socket) => {
      socket.emit("connectionStatus", { status: true });
      GameService.getInstance().addPlayer(
        GameService.getInstance().buildPlayer(socket)
      );

      // socket.on("message", (data)=>{
      //     const doType = this.inputMessage.find(item => item.type == data.type);
      //     if (doType !== undefined) {
      //         doType.do(data);
      //     }
      // })
      socket.on("action", (data) => {
        const player = GameService.getInstance().findPlayerBySocketId(
          socket.id
        );
        const game = GameService.getInstance().findGameByPlayer(player);

        if (!player || !game) return;

        switch (data.type) {
          case "MOVE":
            if (
              PlayerHandler.getInstance().canMove(game, player, data.direction)
            ) {
              PlayerHandler.getInstance().movePlayer(player, data.direction);
              this.broadcastGameState(game.room.name, game);
            }
            break;
          case "ROTATE":
            PlayerHandler.getInstance().rotatePlayer(player, data.direction);
            this.broadcastGameState(game.room.name, game);
            break;
          case "SHOOT":
            PlayerHandler.getInstance().handleShoot(player);
            this.broadcastGameState(game.room.name, game);
            this.endGame(game);
            break;
        }
      });

      socket.on("disconnect", () => {
        console.log("Un cliente se ha desconectado:", socket.id);
      });
    });
  }

  public endGame(game: Game): void {
    game.state = GameStates.ENDED;

    this.sendMessage(game.room.name, ServerService.messages.out.game_end, {
      message: "El juego ha terminado",
      winner: null, 
    });
    this.io?.sockets.sockets.get(game.room.name)?.leave(game.room.name);

    game.room.players.forEach((player) => {
      this.io?.sockets.sockets.get(player.id)?.leave(game.room.name);
    });
  }

  public addPlayerToRoom(player: string, room: string) {
    this.io?.sockets.sockets.get(player)?.join(room);
  }

  public sendMessage(room: String | null, type: String, content: any) {
    console.log(content);
    if (this.active && this.io != null) {
      if (room != null) {
        this.io?.to(room.toString()).emit("message", {
          type,
          content,
        });
      }
    }
  }

  public gameStartMessage() {}

  public isActive() {
    return this.active;
  }

  private doHello(data: String) {
    console.log("Hola");
    console.log(data);
  }

  private doBye(data: String) {
    console.log("Adios");
    console.log(data);
  }

  public sendMessageToPlayer(player: string, type: string, content: any) {
    //coge el socket a partir de un id y le envia el message
    this.io?.sockets.sockets.get(player)?.emit("message", {
      type,
      content,
    });
  }
  private broadcastGameState(room: string, game: Game) {
    this.sendMessage(room, ServerService.messages.out.game_update, {
      players: game.room.players,
      board: game.board,
    });
  }

  private findTargetPlayer(game: Game, shooter: Player): Player | null {
    return game.room.players.find((p) => p.id !== shooter.id) || null;
  }
}
