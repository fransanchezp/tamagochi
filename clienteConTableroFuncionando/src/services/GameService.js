import { Board } from "../entities/Board.js";
import { Queue } from "../Queue.js";

export class GameService {
  states = {
    WAITING: 0,
    PLAYING: 1,
    ENDED: 2,
  };
  ui = null;
  players = [];
  board = null;
  queue = null;
  state = null;
  parallel = null;
  actionsList = null;

  constructor(ui) {
    this.state = this.states.WAITING;
    this.board = new Board();
    this.queue = new Queue();
    this.parallel = null;
    this.ui = ui;

    this.actionsList = {
      NEW_PLAYER: this.do_newPlayer.bind(this),
      BOARD: this.do_newBoard.bind(this),
      GAME_UPDATE: this.do_gameUpdate.bind(this),
      GAME_END: this.do_gameEnd.bind(this),
    };

    this.checkScheduler();
  }

  checkScheduler() {
    if (!this.queue.isEmpty()) {
      if (this.parallel == null) {
        this.parallel = setInterval(async () => {
          const action = this.queue.getMessage();
          if (action != undefined) {
            if (this.actionsList[action.type]) {
              await this.actionsList[action.type](action.content);
            } else {
              console.error(
                "No se encontró la función para el tipo de acción:",
                action.type
              );
            }
          } else {
            this.stopScheduler();
          }
        });
      }
    }
  }

  stopScheduler() {
    clearInterval(this.parallel);
    this.parallel = null;
  }

  do(data) {
    this.queue.addMessage(data);
    this.checkScheduler();
  }

  async do_newPlayer(payload) {
    console.log("Nuevo jugador conectado:", payload);
    if (this.board.map) {
      this.ui.drawBoard(this.board.map, payload.players);
    }
  }

  async do_newBoard({ board, players, player }) {
    this.board.build(board);
    this.ui.drawBoard(this.board.map, players);
    console.log("Jugadores actuales:", players);
    console.log("Jugador actual:", player);

    this.players = players || [];
  }

  async do_gameUpdate({ board, players }) {
    this.board.build(board);
    this.ui.drawBoard(this.board.map, players);
    console.log("Actualización del juego recibida", players);
  }
  
  async do_gameEnd(payload) {
    console.log("El juego ha terminado:", payload.message);
    UIv1.gameEnded = true;
    this.ui.animatePlayerDisappearance();
    alert("El juego ha terminado. Gracias por jugar.");
  }
}
