import { createBoardComponent } from "../components/boardComponent.js";
import { renderPlacedShip } from "../helpers/shipRenderer.js";
// import villain from "../../assets/hostile-admiral-neutral.png";
// import friendlySoldier from "../../assets/friendlySoldier.png";
import { createBattleDialogues } from "../components/dialogue.js";
import { delay } from "../helpers/delay.js";

export function createBattleScreen(currentGame, { onHumanFire }) {
    const battleScreen = document.createElement("div");
    battleScreen.classList.add("battle-screen", "screen");

    const zonesContainer = document.createElement("div");
    zonesContainer.id = "zones-container";

    const friendlyZone = createZone({
        gameboard: currentGame.humanPlayer.gameboard,
        type: "friendly",
        titleText: "Friendly Water",
        shouldRenderFleet: true,
    });

    const hostileZone = createZone({
        gameboard: currentGame.computerPlayer.gameboard,
        type: "hostile",
        titleText: "HOSTILE WATER",
        onHumanFire,
    });

    zonesContainer.append(friendlyZone.zoneContainer, hostileZone.zoneContainer);

    const dialoguesWrapper = document.createElement("div");
    dialoguesWrapper.classList.add("battle-dialogue-wrapper");

    const battleDialogues = createBattleDialogues({
        playerName: currentGame.humanPlayer.name,
    });

    const { friendlyDialogue, hostileDialogue } = battleDialogues;

    runBattleIntroDialogueSequence(battleDialogues, currentGame.humanPlayer.name);

    dialoguesWrapper.append(friendlyDialogue.element, hostileDialogue.element);

    battleScreen.append(zonesContainer, dialoguesWrapper);

    return {
        element: battleScreen,
        friendlyBoardComponent: friendlyZone.boardComponent,
        hostileBoardComponent: hostileZone.boardComponent,

        showAttackReaction(isHit, side) {
            battleDialogues.showAttackReaction(isHit, side);
        },

        setActiveDialogue(turn) {
            battleDialogues.setActiveDialogue(turn);
        },

        renderGameOver(winner, onRestart) {
            renderGameOver(battleScreen, winner, onRestart);
        },
    };
}

function createZone({ gameboard, type, titleText, shouldRenderFleet = false, onHumanFire = null }) {
    const zoneContainer = document.createElement("div");
    zoneContainer.classList.add("zone-container", type);

    const title = document.createElement("p");
    title.classList.add("zone-title", type);
    title.innerText = titleText;

    const boardComponent = createBoardComponent(gameboard.board);

    if (shouldRenderFleet) {
        renderFleet(boardComponent.shipOverlay, gameboard.placedShips);
    }

    if (onHumanFire) {
        enableHumanFire(boardComponent.gridMap, onHumanFire);
    }

    zoneContainer.append(title, boardComponent.gameBoardContainer);
    return {
        zoneContainer,
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

async function runBattleIntroDialogueSequence(battleDialogues, playerName) {
    const { friendlyDialogue, hostileDialogue } = battleDialogues;

    await friendlyDialogue.setMessage(
        `Commander ${playerName}! Enemy vessels have appeared on radar and are closing in on our territory!`,
    );
    friendlyDialogue.showPrompt();
    await waitForEnter();
    friendlyDialogue.hidePrompt();

    battleDialogues.setActiveDialogue("computer");
    await hostileDialogue.setMessage("Who dares stand before my path to global domination?");
    hostileDialogue.showPrompt();
    await waitForEnter();
    hostileDialogue.hidePrompt();

    await hostileDialogue.setMessage(
        `Admiral ${playerName}? How amusing. I have never heard that name in any respectable waters.`,
    );

    hostileDialogue.showPrompt();
    await waitForEnter();
    hostileDialogue.hidePrompt();

    await hostileDialogue.setMessage(
        "Go on, then. Take the first shot. I'd hate for you to lose before feeling involved.",
    );

    hostileDialogue.showPrompt();
    await waitForEnter();
    hostileDialogue.hidePrompt();

    battleDialogues.setActiveDialogue("human");
    await battleDialogues.friendlyDialogue.setMessage(
        `How dare that old fool look down on you, Commander ${playerName}!`,
    );

    friendlyDialogue.showPrompt();
    await waitForEnter();
    friendlyDialogue.hidePrompt();

    await battleDialogues.friendlyDialogue.setMessage(
        "All launch systems are online. Give the order, and we'll make him regret every word.",
    );

    friendlyDialogue.setPromptText("Click on a cell to fire")
    friendlyDialogue.showPrompt();

    function waitForEnter() {
        return new Promise((resolve) => {
            function handleKeydown(e) {
                if (e.key !== "Enter") return;

                document.removeEventListener("keydown", handleKeydown);
                resolve();
            }

            document.addEventListener("keydown", handleKeydown);
        });
    }
}
