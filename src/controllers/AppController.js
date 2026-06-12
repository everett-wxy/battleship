import {
    createAppShell,
    renderStartScreen,
    renderRulesDialog,
    renderPlaceFleet,
} from "../views/DOMController.js";

import { Game } from "../controllers/GameController.js";

let game;

export function initialise() {
    createAppShell();
    // renderStartScreen(handleGameStart);
    game = new Game("Everett")
    renderRulesDialog(game, showFleetSetup)
}

function handleGameStart(playerName) {
    game = new Game(playerName);
    showRules();
}

function showRules() {
    renderRulesDialog(game, showFleetSetup);
}

function showFleetSetup() {
    renderPlaceFleet(game);
}

// function startBattle() {
//     renderBattleScreen(game, showResultPage);
// }

// function showResultPage(result) {
//     renderResultPage(game, result);
// }
