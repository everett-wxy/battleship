import {
    mountAppShell,
    renderStartScreen,
    renderBattleScreen,
    renderPlaceFleetScreen,
} from "../views/screenRenderer.js";

import { Game } from "../models/GameSession.js";

import {
    playCannonFireSound,
    playExplosionSound,
    playMissedSound,
} from "./AudioController.js";

import { delay } from "../views/helpers/delay.js";

const DEBUG_START_IN_FIRING_SEQUENCE = true;

export function initialise() {
    const appShell = mountAppShell();

    if (DEBUG_START_IN_FIRING_SEQUENCE) {
        const debugGame = createDebugBattleGame();
        startBattle(debugGame, restartGame, { skipIntro: true });
        return;
    }

    renderStart();

    function renderStart() {
        renderStartScreen(onGameStart);
    }

    function onGameStart(playerName) {
        const currentGame = new Game(playerName);

        appShell.showRulesDialog({
            buttonText: "Begin fleet placement",
            onClose() {
                showFleetSetup(currentGame, restartGame);
            },
        });
    }

    function restartGame() {
        renderStart();
    }
}

function createDebugBattleGame() {
    const debugGame = new Game("Everett");

    const humanFleet = [
        { y: 0, x: 0, orientation: "horizontal" },
        { y: 2, x: 0, orientation: "horizontal" },
        { y: 4, x: 0, orientation: "horizontal" },
        { y: 6, x: 0, orientation: "horizontal" },
        { y: 8, x: 0, orientation: "horizontal" },
    ];

    const computerFleet = [
        { y: 0, x: 5, orientation: "horizontal" },
        { y: 2, x: 6, orientation: "horizontal" },
        { y: 4, x: 7, orientation: "horizontal" },
        { y: 6, x: 9, orientation: "vertical" },
        { y: 9, x: 0, orientation: "horizontal" },
    ];

    humanFleet.forEach((placement) => {
        debugGame.placeNextHumanPlayerShip(
            placement.y,
            placement.x,
            placement.orientation,
        );
    });

    computerFleet.forEach((placement, index) => {
        debugGame.placeFleetShip(
            debugGame.computerPlayer,
            Game.fleet[index],
            placement,
        );
    });

    return debugGame;
}

function showFleetSetup(currentGame, restartGame) {
    renderPlaceFleetScreen(currentGame, () => {
        startBattle(currentGame, restartGame);
    });

    currentGame.placeComputerFleet();
}

function startBattle(currentGame, restartGame, options = {}) {
    let isWaitingForComputer = false;

    const battleView = renderBattleScreen(currentGame, {
        onHumanFire: handleHumanFire,
        onRestart: restartGame,
        ...options,
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

            await delay(500);

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

    await delay(1400);

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
