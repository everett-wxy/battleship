import { createBoardComponent } from "../components/boardComponent.js";
import { renderPlacedShip } from "../helpers/shipRenderer.js";
import { createBattleDialogues } from "../components/dialogue.js";
import { createBattleStatusPrompt } from "../components/battleStatusPrompt.js";

export function createBattleScreen(currentGame, { onHumanFire, skipIntro = false }) {
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

    function startFiringSequence() {
        enableHumanFire(hostileZone.boardComponent.gridMap, onHumanFire);
        blinkingBattleStatusPrompt.setPromptVisible(true);
        hostileZone.zoneContainer.classList.add("active");
        hostileZone.toggleGridVisual();
    }

    if (skipIntro) {
        friendlyDialogue.setMessage(
            "Debug battle ready. Select a hostile grid cell to fire.",
            "angry",
        );
        startFiringSequence();
    } else {
        runBattleIntroDialogueSequence(
            battleDialogues,
            currentGame.humanPlayer.name,
        ).then(startFiringSequence);
    }

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

    await showMessageAndWait(
        friendlyDialogue,
        `Commander ${playerName}! Enemy vessels have appeared on radar and are closing in on our territory!`,
    );

    battleDialogues.setActiveDialogue("computer");

    await showMessageAndWait(
        hostileDialogue,
        "Who dares stand before my path to global domination?",
    );

    await showMessageAndWait(
        hostileDialogue,
        `Admiral ${playerName}? How amusing. I have never heard that name in any respectable waters.`,
        "disinterested",
    );

    await showMessageAndWait(
        hostileDialogue,
        "Go on, then. Take the first shot. I'd hate for you to lose before feeling involved.",
        "dismissive",
    );

    battleDialogues.setActiveDialogue("human");

    await showMessageAndWait(
        friendlyDialogue,
        `How dare that old fool look down on you, Commander ${playerName}!`,
        "angry",
    );

    await friendlyDialogue.setMessage(
        "All launch systems are online. Give the order, and we'll make him regret every word.",
        "angry",
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

async function showMessageAndWait(dialogue, message, expression) {
    if (expression) dialogue.setCharacterImg(expression);
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
    dialog.classList.add("game-over-dialog", "panel");

    const heading = document.createElement("h2");
    heading.innerText = "GAME OVER";

    const gameOverMessage = document.createElement("h1");
    gameOverMessage.classList.add("game-over-message");

    winner.type === "human"
        ? (gameOverMessage.innerText = "YOU WIN")
        : (gameOverMessage.innerText = "YOU LOSE");

    const restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.classList.add("modal-btn", "restart-btn");
    restartBtn.innerText = "Restart";

    restartBtn.addEventListener("click", onRestart);

    dialog.append(heading, gameOverMessage, restartBtn);
    overlay.append(dialog);
    battleScreen.append(overlay);
}
