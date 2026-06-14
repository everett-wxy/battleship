import { createBoardComponent } from "../components/boardComponent.js";
import { renderPlacedShip } from "../components/shipRenderer.js";

export function createBattleScreen(currentGame, { onHumanFire }) {
    const battleScreen = document.createElement("div");
    battleScreen.classList.add("battle-screen");

    const battleLog = createBattleLog();

    const battleWrapper = document.createElement("div");
    battleWrapper.id = "battle-wrapper";

    const friendlyWater = createFriendlyWater(currentGame.humanPlayer.gameboard);

    const hostileWater = createHostileWater(currentGame.computerPlayer.gameboard, onHumanFire);

    battleWrapper.append(friendlyWater.friendlyWrapper, hostileWater.hostileWrapper);
    battleScreen.append(battleLog.battlelogWrapper, battleWrapper);

    return {
        element: battleScreen,
        battleLog: battleLog.log,
        friendlyBoardComponent: friendlyWater.boardComponent,
        hostileBoardComponent: hostileWater.boardComponent,
        updateBattleLog(message) {
            updateBattleLog(battleLog.log, message);
        },
        renderGameOver(winner, onRestart) {
            renderGameOver(battleScreen, winner, onRestart);
        },
    };
}

function createFriendlyWater(gameboard) {
    const friendlyWrapper = document.createElement("div");
    friendlyWrapper.classList.add("water-wrapper", "friendly");

    const title = document.createElement("p");
    title.classList.add("title", "friendly");
    title.innerText = "FRIENDLY WATER";

    const boardComponent = createBoardComponent(gameboard.board);

    renderFleet(boardComponent.shipOverlay, gameboard.placedShips);

    friendlyWrapper.append(title, boardComponent.gridMapContainer);

    return {
        friendlyWrapper,
        boardComponent,
    };
}

function createHostileWater(gameboard, onHumanFire) {
    const hostileWrapper = document.createElement("div");
    hostileWrapper.classList.add("water-wrapper", "hostile");

    const title = document.createElement("p");
    title.classList.add("title", "hostile");
    title.innerText = "HOSTILE WATER";

    const boardComponent = createBoardComponent(gameboard.board);

    enableHumanFire(boardComponent.gridMap, onHumanFire);

    hostileWrapper.append(title, boardComponent.gridMapContainer);

    return {
        hostileWrapper,
        boardComponent,
    };
}

function renderFleet(shipOverlay, placedShips) {
    placedShips.forEach((shipPlacement) => {
        renderPlacedShip(shipOverlay, shipPlacement);
    });
}

function enableHumanFire(enemyGridMap, onHumanFire) {
    enemyGridMap.addEventListener("click", (e) => {
        const targetCell = e.target.closest(".grid-cell");

        if (!targetCell) {
            return;
        }

        const row = Number(targetCell.dataset.row);
        const col = Number(targetCell.dataset.col);

        onHumanFire(row, col);
    });
}

function createBattleLog() {
    const battlelogWrapper = document.createElement("div");
    battlelogWrapper.classList.add("battle-log-wrapper");

    const title = document.createElement("h1");
    title.classList.add("battle-log-title");
    title.innerText = "Battle Log";

    const log = document.createElement("div");
    log.classList.add("battle-log");

    // each time an attack happens
    // log append atk coordingate
    // log append atk result

    battlelogWrapper.append(title, log);

    return { battlelogWrapper, log };
}

function updateBattleLog(log, message) {
    const logItem = document.createElement("p");
    logItem.classList.add("battle-log-item");
    logItem.innerText = message;

    log.prepend(logItem);
}

function renderGameOver(battleScreen, winner, onRestart) {
    const existingOverlay = battleScreen.querySelector(".game-over-overlay");
    existingOverlay?.remove();

    const overlay = document.createElement("div");
    overlay.classList.add("game-over-overlay");

    const dialog = document.createElement("div");
    dialog.classList.add("game-over-dialog");

    const heading = document.createElement("h2");
    heading.innerText = "Battle Complete";

    const winnerLabel = document.createElement("p");
    winnerLabel.classList.add("winner-label");
    winnerLabel.innerText = "Winner";

    const winnerName = document.createElement("p");
    winnerName.classList.add("winner-name");
    winnerName.innerText = winner.name;

    const restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.classList.add("modal-btn", "restart-btn");
    restartBtn.innerText = "Restart";

    restartBtn.addEventListener("click", onRestart);

    dialog.append(heading, winnerLabel, winnerName, restartBtn);
    overlay.append(dialog);
    battleScreen.append(overlay);
}
