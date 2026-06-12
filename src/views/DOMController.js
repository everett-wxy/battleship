import {
    createBgEffects,
    renderLucideIcons,
    createIconPanel,
} from "./appShell.js";

import { createTitle, createPregameCard } from "./startScreen.js";
import { createGameboard, createFleetSetUp } from "./fleetSetup.js";
import { createRulesDialog, createRulesBtn } from "./rulesDialog.js";

const root = document.querySelector("#root");

let app;
let iconPanel;

export function createAppShell() {
    app = document.createElement("div");
    app.id = "app";

    const bgEffects = createBgEffects();
    iconPanel = createIconPanel();

    root.append(app, bgEffects, iconPanel);

    renderLucideIcons();
}

export function renderStartScreen(handleGameStart) {
    app.replaceChildren();

    const gameTitle = createTitle();
    const pregameCard = createPregameCard(handleGameStart);

    app.append(gameTitle, pregameCard);
}

export function renderRulesDialog(game, showFleetSetup) {
    app.replaceChildren();

    const rulesDialog = createRulesDialog(game, showFleetSetup);
    root.append(rulesDialog);
    rulesDialog.showModal();

    const ruleBtn = createRulesBtn(rulesDialog);
    ruleBtn.classList.add("modal-button")
    iconPanel.append(ruleBtn);
    renderLucideIcons();
}

export function renderPlaceFleet(game) {
    app.replaceChildren();

    const gameboard = createGameboard(game);
    const fleetSetUp = createFleetSetUp(gameboard);

    app.append(gameboard, fleetSetUp);
}
