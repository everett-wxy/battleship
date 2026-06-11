import { renderPlaceFleet, renderStartScreen } from "../views/DOMController.js";
import { Game } from "../controllers/GameController.js";

export function initialise() {
    renderStartScreen(handleGameStart);
    // handleGameStart("Everett");
}

export function handleGameStart(playerName) {
    const game = new Game(playerName);
    renderPlaceFleet(game);
}
