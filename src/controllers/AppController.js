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
    game = new Game("Everett");
    // renderRulesDialog(game, showFleetSetup)
    showFleetSetup();
}

function handleGameStart(playerName) {
    game = new Game(playerName);
    showRules();
}

function showRules() {
    renderRulesDialog(game, showFleetSetup);
}

function showFleetSetup() {
    renderPlaceFleet(game, startBattle);
}

function startBattle() {
    console.log("Start Battle!")
}


// function showResultPage(result) {
//     renderResultPage(game, result);
// }
