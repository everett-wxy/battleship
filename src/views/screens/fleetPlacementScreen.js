import { Game } from "../../controllers/GameController.js";
import { createBoardComponent } from "../components/boardComponent.js";

import carrierIcon from "../../assets/carrier.svg";
import battleshipIcon from "../../assets/battleship.svg";
import destroyerIcon from "../../assets/destroyer.svg";
import submarineIcon from "../../assets/submarine.svg";
import patrolBoatIcon from "../../assets/patrol-boat.svg";

let draggedShip = null;
let draggedShipIcon = null;
let shipOrientation = "horizontal";
let placedShips = new Set();

const shipIcons = {
    carrier: carrierIcon,
    battleship: battleshipIcon,
    destroyer: destroyerIcon,
    submarine: submarineIcon,
    "patrol-boat": patrolBoatIcon,
};

export function createFleetPlacementScreen(currentGame, onContinue) {
    const fleetPlacementScreen = document.createElement("div");
    fleetPlacementScreen.id = "fleet-placement-screen";
    fleetPlacementScreen.classList.add("screen");

    const messageHeader = createMessageHeader();

    const gridFleetContainer = document.createElement("div");
    gridFleetContainer.id = "grid-fleet-container";

    const boardComponent = createBoardComponent(currentGame.humanPlayer.gameboard.board);

    const fleetContainer = createFleetContainer(boardComponent.gridMap);

    gridFleetContainer.append(boardComponent.gridMapContainer, fleetContainer);

    const buttonPanel = document.createElement("div");
    buttonPanel.classList.add("button-panel");

    const { changeOrientationBtn, resetBtn, confirmBtn } = createFleetPlacementBtns(
        currentGame,
        fleetContainer,
        boardComponent.gridMap,
        boardComponent.shipOverlay,
        onContinue,
    );

    enableFleetPlacementDrag(boardComponent.gridMap, boardComponent.shipOverlay, currentGame, confirmBtn);

    buttonPanel.append(changeOrientationBtn, resetBtn, confirmBtn);

    fleetPlacementScreen.append(messageHeader, gridFleetContainer, buttonPanel);

    return fleetPlacementScreen;
}

function createMessageHeader() {
    const messageContainer = document.createElement("div");
    messageContainer.id = "message-container";

    const message = document.createElement("p");
    message.innerText = "Plan your formation by dragging and dropping ships on the map.";

    messageContainer.append(message);

    return messageContainer;
}

function createFleetContainer(gridMap) {
    const fleetSetUp = document.createElement("div");
    fleetSetUp.classList.add("fleet-container");

    Game.fleet.forEach(function (ship) {
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

        shipIcon.addEventListener("dragstart", function (event) {
            draggedShip = ship;
            draggedShipIcon = shipIcon;

            event.dataTransfer.setData("text/plain", shipName);
        });

        shipIcon.addEventListener("dragend", function () {
            draggedShip = null;
            draggedShipIcon = null;

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

function enableFleetPlacementDrag(gridMap, shipOverlay, game, confirmBtn) {
    gridMap.addEventListener("dragover", (event) => {
        event.preventDefault();

        if (!draggedShip) {
            return;
        }

        const targetCell = event.target.closest(".grid-cell");

        if (!targetCell) {
            return;
        }

        clearHighlightedCells(gridMap);

        const targetRow = Number(targetCell.dataset.row);
        const targetCol = Number(targetCell.dataset.col);

        const cellsToHighlight = getCellsForShip(gridMap, targetRow, targetCol, draggedShip.length, shipOrientation);

        const isValidPlacement =
            cellsToHighlight &&
            canPlaceShipOnBoard(game.humanPlayer.gameboard, targetRow, targetCol, draggedShip.length, shipOrientation);

        if (!isValidPlacement) {
            const cellsToMark = cellsToHighlight || [targetCell];

            cellsToMark.forEach((cell) => {
                cell.classList.add("ship-preview-invalid");
            });

            return;
        }

        cellsToHighlight.forEach((cell) => {
            cell.classList.add("ship-preview");
        });
    });

    gridMap.addEventListener("dragleave", (event) => {
        if (!gridMap.contains(event.relatedTarget)) {
            clearHighlightedCells(gridMap);
        }
    });

    gridMap.addEventListener("drop", (event) => {
        event.preventDefault();

        if (!draggedShip || !draggedShipIcon) {
            return;
        }

        const targetCell = event.target.closest(".grid-cell");

        if (!targetCell) {
            return;
        }

        const targetRow = Number(targetCell.dataset.row);
        const targetCol = Number(targetCell.dataset.col);

        const isValidPlacement = canPlaceShipOnBoard(
            game.humanPlayer.gameboard,
            targetRow,
            targetCol,
            draggedShip.length,
            shipOrientation,
        );

        if (!isValidPlacement) {
            clearHighlightedCells(gridMap);
            return;
        }

        try {
            placeDroppedShip(
                draggedShipIcon,
                game.humanPlayer.gameboard,
                draggedShip,
                targetRow,
                targetCol,
                shipOrientation,
            );

            renderPlacedShip(shipOverlay, draggedShip, targetRow, targetCol, shipOrientation);
            placedShips.add(draggedShip.name);
            updateConfirmBtn(confirmBtn);
        } catch (error) {
            console.log(error.message);
        }

        draggedShip = null;
        draggedShipIcon = null;

        clearHighlightedCells(gridMap);
    });
}

function createFleetPlacementBtns(game, fleetContainer, gridMap, shipOverlay, startBattle) {
    const changeOrientationBtn = document.createElement("button");
    changeOrientationBtn.type = "button";
    changeOrientationBtn.classList.add("change-orientation-btn");
    changeOrientationBtn.innerText = "Change Orientation";

    changeOrientationBtn.addEventListener("click", () => {
        shipOrientation = shipOrientation === "horizontal" ? "vertical" : "horizontal";
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.classList.add("reset-btn");
    resetBtn.innerText = "Reset";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.disabled = true;
    confirmBtn.classList.add("confirm-btn");
    confirmBtn.innerText = "Confirm Placement";

    confirmBtn.addEventListener("click", () => {
        const placedShips = fleetContainer.querySelectorAll(".ship-icon.placed-ship");

        if (placedShips.length !== Game.fleet.length) {
            console.log("Place all ships before starting the battle.");
            return;
        }

        startBattle();
    });

    resetBtn.addEventListener("click", () => {
        shipOverlay.replaceChildren();
        clearHighlightedCells(gridMap);

        const shipIconEls = fleetContainer.querySelectorAll(".ship-icon");

        shipIconEls.forEach((shipIcon) => {
            shipIcon.draggable = true;
            shipIcon.classList.remove("placed-ship");
        });

        draggedShip = null;
        draggedShipIcon = null;
        shipOrientation = "horizontal";
        placedShips.clear();
        confirmBtn.disabled = true;

        game.humanPlayer.gameboard.reset();
    });

    return { changeOrientationBtn, resetBtn, confirmBtn };
}

function getCellsForShip(gridMap, startRow, startCol, shipLength, orientation) {
    const cells = [];

    for (let i = 0; i < shipLength; i += 1) {
        const row = orientation === "vertical" ? startRow + i : startRow;
        const col = orientation === "horizontal" ? startCol + i : startCol;

        const cell = gridMap.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (!cell) {
            return null;
        }

        cells.push(cell);
    }

    return cells;
}

function canPlaceShipOnBoard(gameboard, startRow, startCol, shipLength, orientation) {
    const boardSize = gameboard.board.length;

    for (let i = 0; i < shipLength; i += 1) {
        const row = orientation === "vertical" ? startRow + i : startRow;
        const col = orientation === "horizontal" ? startCol + i : startCol;

        const isOutOfBounds = row < 0 || row >= boardSize || col < 0 || col >= boardSize;

        if (isOutOfBounds) {
            return false;
        }

        const cellAlreadyHasShip = gameboard.board[row][col].ship !== null;

        if (cellAlreadyHasShip) {
            return false;
        }
    }

    return true;
}

function clearHighlightedCells(gridMap) {
    gridMap.querySelectorAll(".ship-preview, .ship-preview-invalid").forEach((cell) => {
        cell.classList.remove("ship-preview", "ship-preview-invalid");
    });
}

function placeDroppedShip(shipIcon, gameboard, ship, yAxis, xAxis, orientation) {
    gameboard.placeShip(ship.name, ship.length, yAxis, xAxis, orientation);

    shipIcon.draggable = false;
    shipIcon.classList.add("placed-ship");
}

function renderPlacedShip(shipOverlay, ship, targetRow, targetCol, orientation) {
    const shipName = ship.name.toLowerCase().replaceAll(" ", "-");

    const gridShipContainer = document.createElement("div");
    gridShipContainer.classList.add("grid-ship-container");
    gridShipContainer.classList.add(orientation);

    const startRow = targetRow + 1;
    const startCol = targetCol + 1;

    const endRow = orientation === "horizontal" ? targetRow + 2 : targetRow + 1 + ship.length;

    const endCol = orientation === "horizontal" ? targetCol + 1 + ship.length : targetCol + 2;

    gridShipContainer.style.gridArea = `${startRow} / ${startCol} / ${endRow} / ${endCol}`;

    const gridShip = document.createElement("img");
    gridShip.classList.add("grid-ship");
    gridShip.src = shipIcons[shipName];
    gridShip.alt = shipName;
    gridShip.draggable = false;

    gridShipContainer.append(gridShip);
    shipOverlay.append(gridShipContainer);
}

function updateConfirmBtn(confirmBtn) {
    confirmBtn.disabled = placedShips.size !== Game.fleet.length;
}
