import {
    createAppShell,
    renderStartScreen,
    renderBattleScreen,
    renderRulesDialogScreen,
    renderPlaceFleetScreen,
} from "../views/screenRenderer.js";

import { Game } from "../models/GameSession.js";
import { playCannonFireSound, playExplosionSound, playMissedSound } from "./AudioController.js";
import { delay } from "../views/helpers/delay.js";

export function initialise() {
    createAppShell();
    // renderStartScreen(handleGameStart);

    const currentGame = new Game("everett");
    // showFleetSetup(currentGame);
    Game.fleet.forEach((ship, i) => {
        currentGame.humanPlayer.gameboard.placeShip(ship.name, ship.length, i + 1, i, "horizontal");
    });
    currentGame.placeComputerFleet();
    startBattle(currentGame);
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

            await handleTurnFeedback(turnRes, battleView, "enemy");

            if (turnRes.atkRes.isSunk) {
                const sunkShipPlacement = getShipPlacement(currentGame.computerPlayer.gameboard, turnRes.atkRes.ship);

                battleView.renderEnemyShip(sunkShipPlacement);
            }

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

async function handleTurnFeedback(turnRes, battleView, markerTarget) {
    playCannonFireSound();

    markerTarget === "enemy"
        ? battleView.renderEnemyMarker(turnRes.atkRes)
        : battleView.renderFriendlyMarker(turnRes.atkRes);

    await delay(500);

    turnRes.atkRes.isHit ? playExplosionSound() : playMissedSound();

    // update dialogue based on hitRes
    battleView.updateBattleDialogue(turnRes.atkRes.isHit, turnRes.attacker === "human" ? "friendly" : "hostile");
    // wait 1.5 sec
    await delay(2000);
    // swap dialogue active

    if (!turnRes.isGameOver) {
        console.log("running ," + turnRes.nextPlayer);
        battleView.setActiveDialogue(turnRes.nextPlayer);
        battleView.toggleGridVisual();
    }
}
