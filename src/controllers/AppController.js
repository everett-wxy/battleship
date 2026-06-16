import {
    createAppShell,
    renderStartScreen,
    renderBattleScreen,
    renderRulesDialogScreen,
    renderPlaceFleetScreen,
} from "../views/screenRenderer.js";

import { Game } from "../models/GameSession.js";

export function initialise() {
    createAppShell();
    // renderStartScreen(handleGameStart);

    // generalte random placement
    const currentGame = new Game("everett");
    // set up fleet
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
            let currentPlayer = currentGame.currentPlayer === currentGame.humanPlayer ? "human" : "computer";

            const humanAtkRes = currentGame.runTurn(row, col);

            battleView.updateDialogue(currentPlayer, generateDialogueMessage(currentGame, humanAtkRes));
            currentPlayer = currentGame.currentPlayer === currentGame.humanPlayer ? "human" : "computer";

            battleView.renderEnemyMarker(humanAtkRes);
            // battleView.renderBattleLog(
            //     `You fired at (${row}, ${col}) - ${humanAtkRes.isHit ? "Hit" : "Miss"}`,
            // );

            if (humanAtkRes.isSunk) {
                const sunkShipPlacement = getShipPlacement(currentGame.computerPlayer.gameboard, humanAtkRes.ship);

                battleView.renderEnemyShip(sunkShipPlacement);
                // battleView.renderBattleLog(
                //     `Enemy ${humanAtkRes.ship.name} has been sunk!`,
                // );
            }

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }

            isWaitingForComputer = true;

            await delay(1500);

            
            const comAtkRes = currentGame.runTurn();
            
            battleView.updateDialogue(currentPlayer, generateDialogueMessage(currentGame, comAtkRes));

            battleView.renderFriendlyMarker(comAtkRes);
            // battleView.renderBattleLog(
            //     `Enemy fired at (${comAtkRes.coord.y}, ${comAtkRes.coord.x}) - ${comAtkRes.isHit ? "Hit" : "Miss"}`,
            // );

            if (comAtkRes.isSunk) {
                // battleView.renderBattleLog(
                //     `Your ${comAtkRes.ship.name} has been sunk!`,
                // );
            }

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

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateDialogueMessage(currentGame, atkRes) {
    let message;

    if (!atkRes.isHit) {
        message = "Target missed! Better aim next time";
    } else {
        message = "Target hit!";
    }

    return message;
}
