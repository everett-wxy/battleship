import { createBoardComponent } from "../components/boardComponent.js";
import { renderPlacedShip } from "../helpers/shipRenderer.js";
import { createBattleDialogues } from "../components/dialogue.js";
import { createBattleStatusPrompt } from "../components/battleStatusPrompt.js";

export function createBattleScreen(currentGame, { onHumanFire }) {
    const battleScreen = document.createElement("div");
    battleScreen.classList.add("battle-screen", "screen");

    const blinkingBattleStatusPrompt = createBattleStatusPrompt({
        text: "Click on an enemy grid cell to fire",
        type: "friendly",
        isBlinking: true,
    });

    const friendlyBattleStatusPrompt = createBattleStatusPrompt({
        text: "Click on an enemy grid cell to fire",
        type: "friendly",
    });
    const hostileBattleStatusPrompt = createBattleStatusPrompt({
        text: "Enemy fleet retaliating",
        type: "hostile",
    });

    const zonesContainer = document.createElement("div");
    zonesContainer.id = "zones-container";

    const friendlyZone = createZone({
        gameboard: currentGame.humanPlayer.gameboard,
        type: "friendly",
        titleText: "FRIENDLY WATER",
        shouldRenderFleet: true,
    });

    const hostileZone = createZone({
        gameboard: currentGame.computerPlayer.gameboard,
        type: "hostile",
        titleText: "HOSTILE WATER",
    });

    zonesContainer.append(
        blinkingBattleStatusPrompt.element,
        friendlyBattleStatusPrompt.element,
        hostileBattleStatusPrompt.element,
        friendlyZone.zoneContainer,
        hostileZone.zoneContainer,
    );

    const dialoguesWrapper = document.createElement("div");
    dialoguesWrapper.classList.add("battle-dialogue-wrapper");

    const battleDialogues = createBattleDialogues({
        playerName: currentGame.humanPlayer.name,
    });

    const { friendlyDialogue, hostileDialogue } = battleDialogues;

    runBattleIntroDialogueSequence(battleDialogues, currentGame.humanPlayer.name).then(
        () => {
            enableHumanFire(hostileZone.boardComponent.gridMap, onHumanFire);
            blinkingBattleStatusPrompt.setPromptVisible(true);
        },
    );

    dialoguesWrapper.append(friendlyDialogue.element, hostileDialogue.element);

    battleScreen.append(zonesContainer, dialoguesWrapper);

    return {
        element: battleScreen,
        friendlyBoardComponent: friendlyZone.boardComponent,
        hostileBoardComponent: hostileZone.boardComponent,

        setPrompt({ text, isVisible, side }) {
            const prompts = {
                friendly: friendlyBattleStatusPrompt,
                hostile: hostileBattleStatusPrompt,
            };

            if (text !== undefined) {
                prompts[side].setPromptText(text);
            }
            if (isVisible !== undefined) {
                prompts[side].setPromptVisible(isVisible);
            }
        },

        removeFirstFirePrompt() {
            blinkingBattleStatusPrompt.remove();
        },

        showAttackReaction(isHit, side) {
            battleDialogues.showAttackReaction(isHit, side);
        },

        setActiveDialogue(turn) {
            battleDialogues.setActiveDialogue(turn);
        },

        toggleGridVisual() {
            friendlyZone.toggleGridVisual();
            hostileZone.toggleGridVisual();
            friendlyZone.zoneContainer.classList.toggle("active");
            hostileZone.zoneContainer.classList.toggle("active");
        },

        renderGameOver(winner, onRestart) {
            renderGameOver(battleScreen, winner, onRestart);
        },
    };
}

function createZone({
    gameboard,
    type,
    titleText,
    shouldRenderFleet = false,
    onHumanFire = null,
}) {
    const zoneContainer = document.createElement("div");
    zoneContainer.classList.add("zone-container", "active", type);

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

    if (type === "friendly") {
        boardComponent.markerOverlay.classList.toggle("visible"); // remove visible
        zoneContainer.classList.toggle("active");
    }

    zoneContainer.append(title, boardComponent.gameBoardContainer);
    return {
        zoneContainer,
        boardComponent,
        toggleGridVisual() {
            boardComponent.markerOverlay.classList.toggle("visible");
        },
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

async function runBattleIntroDialogueSequence(battleDialogues, playerName) {
    const { friendlyDialogue, hostileDialogue } = battleDialogues;

    // await showMessageAndWait(
    //     friendlyDialogue,
    //     `Commander ${playerName}! Enemy vessels have appeared on radar and are closing in on our territory!`,
    // );

    // battleDialogues.setActiveDialogue("computer");

    // await showMessageAndWait(
    //     hostileDialogue,
    //     "Who dares stand before my path to global domination?",
    // );

    // await showMessageAndWait(
    //     hostileDialogue,
    //     `Admiral ${playerName}? How amusing. I have never heard that name in any respectable waters.`,
    // );

    // await showMessageAndWait(
    //     hostileDialogue,
    //     "Go on, then. Take the first shot. I'd hate for you to lose before feeling involved.",
    // );

    // battleDialogues.setActiveDialogue("human");

    // await showMessageAndWait(
    //     friendlyDialogue,
    //     `How dare that old fool look down on you, Commander ${playerName}!`,
    // );

    await friendlyDialogue.setMessage(
        "All launch systems are online. Give the order, and we'll make him regret every word.",
    );
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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

async function showMessageAndWait(dialogue, message) {
    await dialogue.setMessage(message);

    await wait(250);
    dialogue.showPrompt();

    await waitForEnter();
    dialogue.hidePrompt();
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
