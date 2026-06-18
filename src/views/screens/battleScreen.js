import { createBoardComponent } from "../components/boardComponent.js";
import { renderPlacedShip } from "../helpers/shipRenderer.js";
import villain from "../../assets/hostile-admiral-neutral.png";
import friendlySoldier from "../../assets/friendlySoldier.png";

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

    const friendlyBattleDialogue = createDialogue(currentGame, "friendly");
    const hostileBattleDialogue = createDialogue(currentGame, "hostile");

    dialoguesWrapper.append(
        friendlyBattleDialogue.battleDialogueContainer,
        hostileBattleDialogue.battleDialogueContainer,
    );

    battleScreen.append(zonesContainer, dialoguesWrapper);

    return {
        element: battleScreen,
        friendlyBoardComponent: friendlyZone.boardComponent,
        hostileBoardComponent: hostileZone.boardComponent,
        setActiveDialogue(turn) {
            setActiveDialogue(turn, friendlyBattleDialogue, hostileBattleDialogue);
        },
        updateDialogueMessage(turn, message) {
            updateDialogueMessage(turn, message, friendlyBattleDialogue, hostileBattleDialogue);
        },
        updateBattleDialogue(turn, message) {
            updateBattleDialogue(turn, message, friendlyBattleDialogue, hostileBattleDialogue);
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

function createDialogue(currentGame, type) {
    const battleDialogueContainer = document.createElement("div");
    battleDialogueContainer.classList.add("battle-dialogue-container", "panel", type);
    battleDialogueContainer.classList.add(type === "friendly" ? "active" : "inactive");
    battleDialogueContainer.setAttribute("aria-hidden", type === "friendly" ? "false" : "true");

    const characterImg = document.createElement("img");
    characterImg.classList.add("character", type);
    characterImg.src = type === "friendly" ? friendlySoldier : villain;

    const dialogueMessage = document.createElement("p");
    dialogueMessage.classList.add("dialogue", type);
    dialogueMessage.innerText = `Commander ${currentGame.humanPlayer.name}, enemy fleet spotted in hostile waters, awaiting your command!`;

    battleDialogueContainer.append(characterImg, dialogueMessage);

    return {
        battleDialogueContainer,
        dialogueMessage,
    };
}

function updateDialogueMessage(turn, message, friendlyBattleDialogue, hostileBattleDialogue) {
    const { activeBattleDialogue } = getDialogueByTurn(turn, friendlyBattleDialogue, hostileBattleDialogue);

    activeBattleDialogue.dialogueMessage.innerText = message;
}

function getDialogueByTurn(turn, friendlyBattleDialogue, hostileBattleDialogue) {
    if (turn === "human") {
        return {
            activeBattleDialogue: friendlyBattleDialogue,
            inactiveBattleDialogue: hostileBattleDialogue,
        };
    }

    if (turn === "computer") {
        return {
            activeBattleDialogue: hostileBattleDialogue,
            inactiveBattleDialogue: friendlyBattleDialogue,
        };
    }

    throw new Error(`Invalid turn: ${turn}`);
}

function updateBattleDialogue(turn, message, friendlyDialogue, hostileDialogue) {
    let currentDialogue;
    let pastDialogue;

    if (turn === "human") {
        currentDialogue = friendlyDialogue;
        pastDialogue = hostileDialogue;
    }
    if (turn === "computer") {
        currentDialogue = hostileDialogue;
        pastDialogue = friendlyDialogue;
    }

    pastDialogue.battleDialogueContainer.classList.remove("active");
    pastDialogue.battleDialogueContainer.classList.add("inactive");
    pastDialogue.battleDialogueContainer.setAttribute("aria-hidden", "true");

    currentDialogue.battleDialogueContainer.classList.remove("inactive");
    currentDialogue.battleDialogueContainer.classList.add("active");
    currentDialogue.battleDialogueContainer.setAttribute("aria-hidden", "false");

    currentDialogue.dialogueMessage.innerText = message;
}

function setActiveDialogue(turn, friendlyBattleDialogue, hostileBattleDialogue) {
    const { activeBattleDialogue, inactiveBattleDialogue } = getDialogueByTurn(
        turn,
        friendlyBattleDialogue,
        hostileBattleDialogue,
    );

    activeBattleDialogue.battleDialogueContainer.classList.add("active");
    activeBattleDialogue.battleDialogueContainer.classList.remove("inactive");
    activeBattleDialogue.battleDialogueContainer.setAttribute("aria-hidden", "false");

    inactiveBattleDialogue.battleDialogueContainer.classList.add("inactive");
    inactiveBattleDialogue.battleDialogueContainer.classList.remove("active");
    inactiveBattleDialogue.battleDialogueContainer.setAttribute("aria-hidden", "true");
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
