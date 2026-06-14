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
    renderBattleScreen(currentGame);
}

// function showResultPage(result) {
//     renderResultPage(currentGame, result);
// }

// currentGame = new Game("Everett");

// for (let i = 0; i < Game.fleet.length; i++) {
//     const ship = Game.fleet[i];
//     currentGame.humanPlayer.gameboard.placeShip(
//         ship.name,
//         ship.length,
//         i + 1,
//         1,
//         "horizontal",
//     );
// }

// currentGame.placeComputerFleet();

// startBattle();
// renderRulesDialog(currentGame, showFleetSetup)
