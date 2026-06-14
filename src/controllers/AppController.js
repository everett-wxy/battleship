import {
    createAppShell,
    renderStartScreen,
    renderBattleScreen,
    renderRulesDialogScreen,
    renderPlaceFleetScreen,
} from "../views/screenRenderer.js";

import { Game } from "../controllers/GameController.js";

let currentGame;

export function initialise() {
    createAppShell();
    renderStartScreen(handleGameStart);
}

function handleGameStart(playerName) {
    currentGame = new Game(playerName);
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
            const humanAtkRes = currentGame.runTurn(row, col);

            battleView.renderEnemyMarker(humanAtkRes);
            battleView.renderBattleLog(
                `You fired at (${row}, ${col}) - ${humanAtkRes.isHit ? "Hit" : "Miss"}`,
            );

            if (humanAtkRes.isSunk) {
                const sunkShipPlacement = getShipPlacement(
                    currentGame.computerPlayer.gameboard,
                    humanAtkRes.ship,
                );

                battleView.renderEnemyShip(sunkShipPlacement);
                battleView.renderBattleLog(
                    `Enemy ${humanAtkRes.ship.name} has been sunk!`,
                );
            }

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }

            isWaitingForComputer = true;

            await delay(500);

            const comAtkRes = currentGame.runTurn();

            battleView.renderFriendlyMarker(comAtkRes);
            battleView.renderBattleLog(
                `Enemy fired at (${comAtkRes.coord.y}, ${comAtkRes.coord.x}) - ${comAtkRes.isHit ? "Hit" : "Miss"}`,
            );

            if (comAtkRes.isSunk) {
                battleView.renderBattleLog(
                    `Your ${comAtkRes.ship.name} has been sunk!`,
                );
            }

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }
        } catch (error) {
            battleView.renderBattleLog(error.message);
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

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
