import { UI_BUILDER } from "./Ui.js";
import { ConnectionHandler } from "./services/ConnectionHandler.js";

export const UIv1 = UI_BUILDER.init();

const KEYS = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  ROTATE: "r",
  SHOOT: "space",
};

UIv1.uiElements = {
  board: "board",
};

UIv1.isBoardInitialized = false;
UIv1.playerElements = {};
UIv1.gameEnded = false;


UIv1.initUI = () => {
  const base = document.getElementById(UIv1.uiElements.board);
  base.classList.add("board");

  const controls = document.createElement("div");
  controls.classList.add("controls");

  const moveButtons = document.createElement("div");
  moveButtons.classList.add("move-buttons");

  const upBtn = createButton("↑", () => handleAction("MOVE", "up"));
  const leftBtn = createButton("←", () => handleAction("MOVE", "left"));
  const downBtn = createButton("↓", () => handleAction("MOVE", "down"));
  const rightBtn = createButton("→", () => handleAction("MOVE", "right"));

  const rotateBtn = createButton("Rotar", () => rotatePlayer());
  rotateBtn.classList.add("rotate-btn");

  const shootBtn = createButton("Disparar", () => handleAction("SHOOT"));
  shootBtn.classList.add("shoot-btn");

  moveButtons.appendChild(upBtn);
  moveButtons.appendChild(leftBtn);
  moveButtons.appendChild(downBtn);
  moveButtons.appendChild(rightBtn);

  controls.appendChild(moveButtons);
  controls.appendChild(rotateBtn);
  controls.appendChild(shootBtn);

  document.body.appendChild(controls);

  document.addEventListener("keydown", handleKeyPress);
};

UIv1.animatePlayerDisappearance = () => {
  const playerElement = document.querySelector(".local-player");

  if (playerElement) {
      anime({
          targets: playerElement,
          opacity: [1, 0],
          scale: [1, 0],
          duration: 1000,
          easing: "easeInOutQuad",
          complete: () => {
              playerElement.remove();
          },
      });
  }
};

function createButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function handleAction(type, direction = null) {
  if (UIv1.gameEnded) return;
  if (ConnectionHandler.socket) {
    const action = { type };
    if (direction) action.direction = direction;
    ConnectionHandler.socket.emit("action", action);
  } else {
    console.error("Socket no está inicializado correctamente.");
  }
}

let playerRotation = 0;

function rotatePlayer() {
  playerRotation = (playerRotation + 90) % 360;

  const playerElement = document.querySelector(".local-player");

  if (playerElement) {
    playerElement.style.transform = `rotate(${playerRotation}deg)`;
  } else {
    console.error("No se encontró el elemento del jugador.");
  }
}

function handleKeyPress(e) {
  if (UIv1.gameEnded) return;
  switch (e.key) {
    case KEYS.UP:
      handleAction("MOVE", "up");
      break;
    case KEYS.DOWN:
      handleAction("MOVE", "down");
      break;
    case KEYS.LEFT:
      handleAction("MOVE", "left");
      break;
    case KEYS.RIGHT:
      handleAction("MOVE", "right");
      break;
    case KEYS.ROTATE:
      handleAction("ROTATE", getNextDirection());
      break;
    case " ":
      handleAction("SHOOT");
      break;
  }
}

let currentDirectionIndex = 0;
const directions = ["up", "right", "down", "left"];

function getNextDirection() {
  currentDirectionIndex = (currentDirectionIndex + 1) % directions.length;
  return directions[currentDirectionIndex];
}

UIv1.drawBoard = (board, players) => {
  const base = document.getElementById(UIv1.uiElements.board);

  if (board !== undefined) {
    base.innerHTML = "";

    base.style.gridTemplateColumns = `repeat(${board.length}, 100px)`;
    base.style.gridTemplateRows = `repeat(${board.length}, 100px)`;

    board.forEach((row, i) => {
      row.forEach((element, j) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        if (element === 5) {
          tile.classList.add("bush");
        }

        base.appendChild(tile);

        
        anime({
          targets: tile,
          opacity: [0, 1],
          duration: Math.random() * 8000 + 1000,
          easing: "easeInOutQuad",
        });
      });
    });

    console.log("Board recibido:", board);
    console.log("Players recibidos:", players);

    if (players && Array.isArray(players)) {
      players.forEach((player) => {
        console.log("Dibujando jugador:", player);

        let playerElement = document.querySelector(`.player[data-player-id='${player.id}']`);

        if (!playerElement) {
          playerElement = document.createElement("div");
          playerElement.classList.add("player");
          playerElement.setAttribute("data-player-id", player.id);

          if (player.id === ConnectionHandler.socket.id) {
            playerElement.classList.add("local-player");
          }

          base.appendChild(playerElement);
        }

        playerElement.style.gridColumn = `${player.y + 1}`;
        playerElement.style.gridRow = `${player.x + 1}`;

        const rotations = {
          "up": "rotate(0deg)",
          "right": "rotate(90deg)",
          "down": "rotate(180deg)",
          "left": "rotate(270deg)"
        };
        playerElement.style.transform = rotations[player.direction] || "rotate(0deg)";

        anime({
          targets: playerElement,
          opacity: [0, 1],
          scale: [0, 1],
          duration: 1000,
          easing: "easeOutElastic",
        });
      });
    }
  }
};


UIv1.drawBoard();
