import { Game } from "../controllers/GameController.js";

import carrierIcon from "../assets/carrier.svg";
import battleshipIcon from "../assets/battleship.svg";
import destroyerIcon from "../assets/destroyer.svg";
import submarineIcon from "../assets/submarine.svg";
import patrolBoatIcon from "../assets/patrol-boat.svg";

const root = document.querySelector("#root");
const app = document.createElement("div");
app.id = "app";
root.append(app);

let draggedShip = null;
let shipOrientation = "horizontal";

export function renderStartScreen(handleGameStart) {
    app.replaceChildren();

    const {gameTitle, rain} = renderTitle();
    const pregameCard = createPregameCard(handleGameStart);

    app.append(gameTitle, rain, pregameCard);
}

export function renderPlaceFleet(game) {
    app.replaceChildren();

    const gameboard = createGameboard(game);
    const fleetSetUp = createFleetSetUp(gameboard);

    app.append(gameboard, fleetSetUp);
}

function renderTitle() {
    const gameTitle = document.createElement("h1");
    gameTitle.id = "game-title";
    gameTitle.classList.add("matrix-text");
    gameTitle.innerText = "BATTLESHIP";
    gameTitle.dataset.text = "BATTLESHIP";

    const rain = document.createElement("div");
    rain.classList.add("rain"); 
    return {gameTitle, rain};
}

function createPregameCard(handleGameStart) {
    const pregameCard = document.createElement("div");
    pregameCard.classList.add("pregame-card");

    const form = document.createElement("form");

    const nameInput = document.createElement("input");
    nameInput.id = "player-name";
    nameInput.name = "player-name";
    nameInput.placeholder = "Captain name";

    const startBtn = document.createElement("button");
    startBtn.innerText = "Enter Combat";

    form.append(nameInput, startBtn);
    pregameCard.append(form);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const playerName = nameInput.value.trim();

        if (!playerName) return;

        handleGameStart(playerName);
    });

    return pregameCard;
}

function createGameboard(game) {
    const gameboard = document.createElement("div");
    gameboard.classList.add("gameboard");

    game.humanPlayer.gameboard.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellEl = document.createElement("div");

            cellEl.classList.add("grid-cell");
            cellEl.dataset.row = rowIndex;
            cellEl.dataset.col = colIndex;

            gameboard.append(cellEl);
        });
    });

    gameboard.addEventListener("dragover", (e) => {
        e.preventDefault();

        if (!draggedShip) return;

        const targetCell = e.target.closest(".grid-cell");
        if (!targetCell) return;

        clearHighlightedCells(gameboard);

        const row = Number(targetCell.dataset.row);
        const col = Number(targetCell.dataset.col);

        const cellsToHighlight = getCellsForShip(
            gameboard,
            row,
            col,
            draggedShip.length,
            shipOrientation,
        );

        if (!cellsToHighlight) {
            targetCell.classList.add("ship-preview-invalid");
            return;
        }

        cellsToHighlight.forEach((cell) => {
            cell.classList.add("ship-preview");
        });
    });

    gameboard.addEventListener("dragleave", (e) => {
        if (!gameboard.contains(e.relatedTarget)) {
            clearHighlightedCells(gameboard);
        }
    });

    return gameboard;
}

function createFleetSetUp(gameboard) {
    const fleetSetUp = document.createElement("div");
    fleetSetUp.classList.add("fleet-setup");

    const shipIcons = {
        carrier: carrierIcon,
        battleship: battleshipIcon,
        destroyer: destroyerIcon,
        submarine: submarineIcon,
        "patrol-boat": patrolBoatIcon,
    };

    Game.fleet.forEach((ship) => {
        const shipName = ship.name.toLowerCase().replaceAll(" ", "-");

        const shipCard = document.createElement("div");
        shipCard.classList.add("ship-card");

        const shipIconWrapper = document.createElement("div");
        shipIconWrapper.classList.add("ship-icon-wrapper");

        const shipIcon = document.createElement("img");
        shipIcon.classList.add("ship-icon");
        shipIcon.id = shipName;
        shipIcon.src = shipIcons[shipName];
        shipIcon.alt = ship.name;
        shipIcon.draggable = true;

        shipIcon.addEventListener("dragstart", (e) => {
            draggedShip = ship;
            e.dataTransfer.setData("text/plain", shipName);
        });

        shipIcon.addEventListener("dragend", () => {
            draggedShip = null;
            clearHighlightedCells(gameboard);
        });

        const shipNameEl = document.createElement("p");
        shipNameEl.classList.add("ship-name");
        shipNameEl.innerText = ship.name;

        shipIconWrapper.append(shipIcon);
        shipCard.append(shipIconWrapper, shipNameEl);
        fleetSetUp.append(shipCard);
    });

    return fleetSetUp;
}

function getCellsForShip(
    gameboard,
    startRow,
    startCol,
    shipLength,
    orientation,
) {
    const cells = [];

    for (let i = 0; i < shipLength; i++) {
        const row = orientation === "vertical" ? startRow + i : startRow;
        const col = orientation === "horizontal" ? startCol + i : startCol;

        const cell = gameboard.querySelector(
            `[data-row="${row}"][data-col="${col}"]`,
        );

        if (!cell) {
            return null;
        }

        cells.push(cell);
    }

    return cells;
}

function clearHighlightedCells(gameboard) {
    gameboard
        .querySelectorAll(".ship-preview, .ship-preview-invalid")
        .forEach((cell) => {
            cell.classList.remove("ship-preview", "ship-preview-invalid");
        });
}
