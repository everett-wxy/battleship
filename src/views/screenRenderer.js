import { createAppShell } from "./appShell.js";
import { createStartScreen } from "./screens/startScreen.js";
import { createFleetPlacementScreen } from "./screens/fleetPlacementScreen.js";
import { createBattleScreen } from "./screens/battleScreen.js";
import { renderAttackMarker } from "./helpers/attackMarkerRenderer.js";
import { renderPlacedShip } from "./helpers/shipRenderer.js";
import { swapMusic } from "../controllers/AudioController.js";

const root = document.querySelector("#root");

let app;

export function mountAppShell() {
    app = document.createElement("div");
    app.id = "app";

    const appShell = createAppShell();

    root.append(appShell.element, app);

    return {
        showRulesDialog: appShell.showRulesDialog,
    };
}

export function renderStartScreen(handleGameStart) {
    app.replaceChildren();

    const startScreen = createStartScreen(handleGameStart);

    app.append(startScreen);
}

export function renderPlaceFleetScreen(currentGame, onContinue) {
    app.replaceChildren();
    const fleetPlacementScreen = createFleetPlacementScreen(currentGame, onContinue);
    app.append(fleetPlacementScreen);
}

export function renderBattleScreen(currentGame, handlers) {
    swapMusic();
    app.replaceChildren();

    const battleScreenView = createBattleScreen(currentGame, handlers);

    app.append(battleScreenView.element);

    return {
        removeFirstFirePrompt() {
            battleScreenView.removeFirstFirePrompt();
        },

        setPrompt(options) {
            battleScreenView.setPrompt(options);
        },

        renderEnemyMarker(atkRes) {
            renderAttackMarker(
                battleScreenView.hostileBoardComponent.markerOverlay,
                atkRes,
            );
        },

        renderFriendlyMarker(atkRes) {
            renderAttackMarker(
                battleScreenView.friendlyBoardComponent.markerOverlay,
                atkRes,
            );
        },

        renderEnemyShip(shipPlacement) {
            renderPlacedShip(
                battleScreenView.hostileBoardComponent.shipOverlay,
                shipPlacement,
            );
        },

        setActiveDialogue(turn) {
            battleScreenView.setActiveDialogue(turn);
        },

        updateBattleDialogue(isHit, side) {
            battleScreenView.showAttackReaction(isHit, side);
        },

        toggleGridVisual() {
            battleScreenView.toggleGridVisual();
        },

        renderGameOver(winner) {
            battleScreenView.renderGameOver(winner, handlers.onRestart);
        },
    };
}

export function renderGameOverDialog(){
    
}
