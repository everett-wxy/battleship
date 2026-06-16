import { createBoardComponent } from "../components/boardComponent.js";
import { renderPlacedShip } from "../helpers/shipRenderer.js";
import villain from "../../assets/villain.png";
import friendlySoldier from "../../assets/friendlySoldier.png";
import { playCannonFireSound } from "../../controllers/AudioController.js";

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
    battleDialogueContainer.classList.add("battle-dialogue-container", "panel");
    if (type === "hostile") battleDialogueContainer.classList.add("hidden");

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

// function createFriendlyBattleDialogue() {
//     const battleDialogueContainer = document.createElement("div");
//     battleDialogueContainer.classList.add("battle-dialogue-container", "panel");

//     const character = document.createElement("img");
//     character.classList.add("character", "friendly");
//     character.src = villain;

//     const dialogue = document.createElement("p");
//     dialogue.classList.add("dialogue", "friendly");
//     dialogue.innerText = "Enemy fleet spotted! Awaiting orders, commander!";

//     battleDialogueContainer.append(character, dialogue);

//     return {
//         battleDialogueContainer,
//         dialogue,
//     };
// }

// function createHostileBattleDialogue() {
//     const battleDialogueContainer = document.createElement("div");
//     battleDialogueContainer.classList.add("battle-dialogue-container", "panel", "hidden");

//     const character = document.createElement("img");
//     character.classList.add("character", "hostile");
//     character.src = villain;

//     const dialogue = document.createElement("p");
//     dialogue.classList.add("dialogue", "hostile");
//     dialogue.innerText = "You're going down!";

//     battleDialogueContainer.append(character, dialogue);

//     return {
//         battleDialogueContainer,
//         dialogue,
//     };
// }

function updateBattleDialogue(turn, message, friendlyDialogue, hostileDialogue) {
    console.log(`Turn: ${turn}`);
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
    pastDialogue.battleDialogueContainer.classList.add("hidden");
    currentDialogue.battleDialogueContainer.classList.remove("hidden");
    currentDialogue.dialogueMessage.innerText = message;
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

