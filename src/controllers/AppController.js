import {
    createAppShell,
    renderStartScreen,
    renderBattleScreen,
    renderRulesDialogScreen,
    renderPlaceFleetScreen,
} from "../views/screenRenderer.js";

import { Game } from "../models/GameSession.js";
import {
    playCannonFireSound,
    playExplosionSound,
    playMissedSound,
} from "./AudioController.js";
import { delay } from "../views/helpers/delay.js";

export function initialise() {
    createAppShell();
    // renderStartScreen(handleGameStart);

    const currentGame = new Game("everett");
    // showRules(currentGame);
    showFleetSetup(currentGame);
    // Game.fleet.forEach((ship, i) => {
    //     currentGame.humanPlayer.gameboard.placeShip(
    //         ship.name,
    //         ship.length,
    //         i + 1,
    //         i,
    //         "horizontal",
    //     );
    // });
    // currentGame.placeComputerFleet();
    // startBattle(currentGame);
}

function handleGameStart(playerName) {
    const currentGame = new Game(playerName);
    showRules(currentGame);
}

function showRules(currentGame) {
    renderRulesDialogScreen(currentGame, () => {
        showFleetSetup(currentGame);
    });
}

function showFleetSetup(currentGame) {
    renderPlaceFleetScreen(currentGame, () => {
        startBattle(currentGame);
    });
    currentGame.placeComputerFleet();
}

function startBattle(currentGame) {
    let isWaitingForComputer = false;

    const battleView = renderBattleScreen(currentGame, {
        onHumanFire: handleHumanFire,
        onRestart: restartGame,
    });

    async function handleHumanFire(row, col) {
        if (currentGame.isGameOver || isWaitingForComputer) {
            return;
        }

        try {
            const turnRes = currentGame.runTurn(row, col);

            isWaitingForComputer = true;

            await handleTurnFeedback(
                turnRes,
                battleView,
                "enemy",
                currentGame.computerPlayer.gameboard,
            );

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }

            await delay(1500);

            const computerTurnRes = currentGame.runTurn();

            await handleTurnFeedback(computerTurnRes, battleView, "friendly");

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }
        } catch (e) {
            console.log(e.message);
            console.log(e.stack);
        } finally {
            isWaitingForComputer = false;
        }
    }
}

function restartGame() {
    renderStartScreen(handleGameStart);
}

function getShipPlacement(gameboard, ship) {
    return gameboard.placedShips.find((shipPlacement) => {
        return shipPlacement.ship === ship;
    });
}

async function handleTurnFeedback(turnRes, battleView, markerTarget, comGameboard) {
    playCannonFireSound();

    markerTarget === "enemy"
        ? battleView.renderEnemyMarker(turnRes.atkRes)
        : battleView.renderFriendlyMarker(turnRes.atkRes);

    await delay(500);

    turnRes.atkRes.isHit ? playExplosionSound() : playMissedSound();

    if (turnRes.attacker === "human" && turnRes.atkRes.isSunk) {
        const sunkShipPlacement = getShipPlacement(comGameboard, turnRes.atkRes.ship);

        battleView.renderEnemyShip(sunkShipPlacement);
    }

    battleView.updateBattleDialogue(
        turnRes.atkRes.isHit,
        turnRes.attacker === "human" ? "friendly" : "hostile",
    );

    await delay(2000);

    if (!turnRes.isGameOver) {
        battleView.removeFirstFirePrompt();
        battleView.setActiveDialogue(turnRes.nextPlayer);
        battleView.toggleGridVisual();
        if (turnRes.nextPlayer === "human") {
            battleView.setPrompt({ side: "hostile", isVisible: false });
            battleView.setPrompt({ side: "friendly", isVisible: true });
        } else if (turnRes.nextPlayer === "computer") {
            battleView.setPrompt({ side: "hostile", isVisible: true });
            battleView.setPrompt({ side: "friendly", isVisible: false });
        }
    }
}
