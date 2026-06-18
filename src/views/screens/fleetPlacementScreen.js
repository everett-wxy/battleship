import { Game } from "../../models/GameSession.js";
import { createBoardComponent } from "../components/boardComponent.js";
import { createDialogue } from "../components/dialogue.js";
import { renderPlacedShip, shipIcons } from "../helpers/shipRenderer.js";

let draggedShip = null;
let draggedShipCard = null;
let shipOrientation = "horizontal";
let placedShips = new Set();

export function createFleetPlacementScreen(currentGame, onContinue) {
    const fleetPlacementScreen = document.createElement("div");
    fleetPlacementScreen.id = "fleet-placement-screen";
    fleetPlacementScreen.classList.add("screen");

    const dialogue = createDialogue({
        side: "friendly",
        message: `Welcome aboard Commander ${currentGame.humanPlayer.name}!`,
    });

    setTimeout(() => {
        dialogue.setMessage("Plan our formation by dragging and dropping ships on the map.");
    }, 3000);

    dialogue.setCharacterImg("serious");

    const gridFleetContainer = document.createElement("div");
    gridFleetContainer.id = "grid-fleet-container";

    const boardComponent = createBoardComponent(currentGame.humanPlayer.gameboard.board);

    const fleetContainer = createFleetContainer(boardComponent.gridMap);

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

    const boardAndButtonsWrapper = document.createElement("div");
    boardAndButtonsWrapper.classList.add("board-and-buttons-wrapper");
    boardAndButtonsWrapper.append(boardComponent.gameBoardContainer, buttonPanel);

    gridFleetContainer.append(boardAndButtonsWrapper, fleetContainer);

    fleetPlacementScreen.append(gridFleetContainer, dialogue.battleDialogueContainer);

    return fleetPlacementScreen;
}

function createFleetContainer(gridMap) {
    const fleetSetUp = document.createElement("div");
    fleetSetUp.classList.add("fleet-container");

    Game.fleet.forEach(function (ship) {
        const shipName = ship.name.toLowerCase().replaceAll(" ", "-");

        const shipCard = document.createElement("div");
        shipCard.classList.add("ship-card");

        const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];

        corners.forEach((position) => {
            const corner = document.createElement("span");
            corner.classList.add("corner", position);
            shipCard.append(corner);
        });

        const shipIconWrapper = document.createElement("div");
        shipIconWrapper.classList.add("ship-icon-wrapper");

        const shipIcon = document.createElement("img");
        shipIcon.classList.add("ship-icon");
        shipIcon.id = shipName;
        shipIcon.src = shipIcons[shipName];
        shipIcon.alt = ship.name;
        shipIcon.draggable = false;
        shipCard.draggable = true;

        shipCard.addEventListener("dragstart", function (event) {
            draggedShip = ship;
            draggedShipCard = shipCard;

            event.dataTransfer.setData("text/plain", shipName);
        });

        shipCard.addEventListener("dragend", function () {
            draggedShip = null;
            draggedShipCard = null;

            clearHighlightedCells(gridMap);
        });

        const shipNameEl = document.createElement("p");
        shipNameEl.classList.add("ship-name");
        shipNameEl.innerText = ship.name;

        shipIconWrapper.append(shipIcon, shipNameEl);
        shipCard.append(shipIconWrapper);
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

        if (!draggedShip || !draggedShipCard) {
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
            const shipPlacement = placeDroppedShip(
                draggedShipCard,
                game.humanPlayer.gameboard,
                draggedShip,
                targetRow,
                targetCol,
                shipOrientation,
            );

            renderPlacedShip(shipOverlay, shipPlacement);
            placedShips.add(draggedShip.name);
            updateConfirmBtn(confirmBtn);
        } catch (error) {
            console.log(error.message);
        }

        draggedShip = null;
        draggedShipCard = null;

        clearHighlightedCells(gridMap);
    });
}

function createFleetPlacementBtns(game, fleetContainer, gridMap, shipOverlay, startBattle) {
    const changeOrientationBtn = document.createElement("button");
    changeOrientationBtn.type = "button";
    changeOrientationBtn.classList.add("change-orientation-btn");
    changeOrientationBtn.innerText = `Change Orientation: ${shipOrientation[0].toUpperCase(1) + shipOrientation.slice(1)}`;

    changeOrientationBtn.addEventListener("click", () => {
        shipOrientation = shipOrientation === "horizontal" ? "vertical" : "horizontal";
        changeOrientationBtn.innerText = `Change Orientation: ${shipOrientation[0].toUpperCase(1) + shipOrientation.slice(1)}`;
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

        const shipCards = fleetContainer.querySelectorAll(".ship-card");

        shipCards.forEach((shipCard) => {
            shipCard.draggable = true;
            shipCard.classList.remove("placed-ship");
        });

        draggedShip = null;
        draggedShipCard = null;
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

function placeDroppedShip(shipCard, gameboard, ship, yAxis, xAxis, orientation) {
    gameboard.placeShip(ship.name, ship.length, yAxis, xAxis, orientation);

    shipCard.draggable = false;
    shipCard.classList.add("placed-ship");

    return gameboard.placedShips.at(-1);
}

function updateConfirmBtn(confirmBtn) {
    confirmBtn.disabled = placedShips.size !== Game.fleet.length;
}
