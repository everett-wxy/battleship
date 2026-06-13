import { Game } from "../controllers/GameController.js";

import carrierIcon from "../assets/carrier.svg";
import battleshipIcon from "../assets/battleship.svg";
import destroyerIcon from "../assets/destroyer.svg";
import submarineIcon from "../assets/submarine.svg";
import patrolBoatIcon from "../assets/patrol-boat.svg";
import { TruckElectric } from "lucide";

let draggedShip = null;
let shipOrientation = "horizontal";
let targetRow;
let targetCol;

const shipIcons = {
    carrier: carrierIcon,
    battleship: battleshipIcon,
    destroyer: destroyerIcon,
    submarine: submarineIcon,
    "patrol-boat": patrolBoatIcon,
};

export function createMessageHeader() {
    const messageContainer = document.createElement("div");
    messageContainer.id = "message-container";

    const message = document.createElement("p");
    message.innerText =
        "Plan your formation by dragging and dropping ships on the map.";

    messageContainer.append(message);
    return messageContainer;
}

export function createAxisLabels() {
    const numAxis = document.createElement("div");
    numAxis.id = "number-axis";

    const letterAxis = document.createElement("div");
    letterAxis.id = "letter-axis";

    for (let i = 0; i < 10; i++) {
        const number = document.createElement("div");
        number.classList.add("number");
        number.innerText = `${i + 1}`;
        numAxis.append(number);

        const letter = document.createElement("div");
        letter.classList.add("letter");
        letter.innerText = String.fromCharCode(65 + i);
        letterAxis.append(letter);
    }

    return { numAxis, letterAxis };
}

export function createGridMap(game) {
    const gridMap = document.createElement("div");
    gridMap.classList.add("grid-map");

    game.humanPlayer.gameboard.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellEl = document.createElement("div");

            cellEl.classList.add("grid-cell");
            cellEl.dataset.row = rowIndex;
            cellEl.dataset.col = colIndex;

            gridMap.append(cellEl);
        });
    });

    gridMap.addEventListener("dragover", (e) => {
        e.preventDefault();

        if (!draggedShip) return;

        const targetCell = e.target.closest(".grid-cell");
        if (!targetCell) return;

        clearHighlightedCells(gridMap);

        targetRow = Number(targetCell.dataset.row);
        targetCol = Number(targetCell.dataset.col);
        console.log(targetRow, targetCol);

        const cellsToHighlight = getCellsForShip(
            gridMap,
            targetRow,
            targetCol,
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

    gridMap.addEventListener("dragleave", (e) => {
        if (!gridMap.contains(e.relatedTarget)) {
            clearHighlightedCells(gridMap);
        }
    });

    return gridMap;
}

export function createFleetContainer(game, gridMap, shipOverlay) {
    const fleetSetUp = document.createElement("div");
    fleetSetUp.classList.add("fleet-container");

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
            try {
                placeDroppedShip(
                    shipIcon,
                    game.humanPlayer.gameboard,
                    draggedShip,
                    targetRow,
                    targetCol,
                    shipOrientation,
                );

                renderPlacedShip(
                    shipOverlay,
                    draggedShip,
                    targetRow,
                    targetCol,
                    shipOrientation,
                );
            } catch (e) {
                console.log(e.message);
            }
            draggedShip = null;
            clearHighlightedCells(gridMap);
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

export function createFleetPlacementBtns(game, shipOverlay, startBattle) {
    // set vertical btn
    const changeOrientationBtn = document.createElement("button");
    changeOrientationBtn.type = "button";
    changeOrientationBtn.classList.add("change-orientation-btn");
    changeOrientationBtn.innerText = "Change Orientation";

    changeOrientationBtn.addEventListener("click", () => {
        shipOrientation =
            shipOrientation === "horizontal" ? "vertical" : "horizontal";
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.classList.add("reset-btn");
    resetBtn.innerText = "Reset";

    resetBtn.addEventListener("click", () => {
        shipOverlay.replaceChildren();

        const fleetContainer = document.querySelector(".fleet-container");
        const shipIcons = fleetContainer.querySelectorAll(".ship-icon");
        shipIcons.forEach((shipIcon) => {
            shipIcon.draggable = true;
            shipIcon.classList.remove("placed-ship");
        });

        // reset gameboard
        game.humanPlayer.gameboard.reset();
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.classList.add("confrim-btn");
    confirmBtn.innerText = "Confirm Placement"; 

    confirmBtn.addEventListener("click", ()=>{
        startBattle();
    })

    return { changeOrientationBtn, resetBtn, confirmBtn };
}

function getCellsForShip(gridMap, startRow, startCol, shipLength, orientation) {
    const cells = [];

    for (let i = 0; i < shipLength; i++) {
        const row = orientation === "vertical" ? startRow + i : startRow;
        const col = orientation === "horizontal" ? startCol + i : startCol;

        const cell = gridMap.querySelector(
            `[data-row="${row}"][data-col="${col}"]`,
        );

        if (!cell) {
            return null;
        }

        cells.push(cell);
    }

    return cells;
}

function clearHighlightedCells(gridMap) {
    gridMap
        .querySelectorAll(".ship-preview, .ship-preview-invalid")
        .forEach((cell) => {
            cell.classList.remove("ship-preview", "ship-preview-invalid");
        });
}

function placeDroppedShip(
    shipIcon,
    gameboard,
    ship,
    yAxis,
    xAxis,
    shipOrientation,
) {
    gameboard.placeShip(ship.name, ship.length, yAxis, xAxis, shipOrientation);
    shipIcon.draggable = false;
    shipIcon.classList.add("placed-ship");
}

function renderPlacedShip(
    shipOverlay,
    ship,
    targetRow,
    targetCol,
    shipOrientation,
) {
    const shipName = ship.name.toLowerCase().replaceAll(" ", "-");

    const gridShipContainer = document.createElement("div");
    gridShipContainer.classList.add("grid-ship-container");

    const startRow = targetRow + 1;
    const startCol = targetCol + 1;
    const endRow =
        shipOrientation === "horizontal"
            ? targetRow + 2
            : targetRow + 1 + ship.length;
    const endCol =
        shipOrientation === "horizontal"
            ? targetCol + 1 + ship.length
            : targetCol + 2;

    gridShipContainer.style.gridArea = `${startRow} / ${startCol} / ${endRow} / ${endCol}`;
    console.log(`${startRow} / ${startCol} / ${endRow} / ${endCol}`);

    const gridShip = document.createElement("img");
    gridShip.classList.add("grid-ship");
    gridShip.src = shipIcons[shipName];
    gridShip.alt = shipName;
    gridShip.draggable = false;

    gridShipContainer.append(gridShip);

    shipOverlay.append(gridShipContainer);
}
