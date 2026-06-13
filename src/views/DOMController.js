import {
    createBgEffects,
    renderLucideIcons,
    createIconPanel,
} from "./appShell.js";

import { createTitle, createPregameCard } from "./startScreen.js";
import {
    createMessageHeader,
    createAxisLabels,
    createGridMap,
    createFleetContainer,
} from "./fleetSetup.js";
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
    ruleBtn.classList.add("modal-button");
    iconPanel.append(ruleBtn);
    renderLucideIcons();
}

export function renderPlaceFleet(game) {
    app.replaceChildren();

    // fleetPlacement main container
    const fleetSetupMainContainer = document.createElement("div");
    fleetSetupMainContainer.id = "fleet-setup-main-container";

    // message container
    const messageHeader = createMessageHeader();

    // gridFleetContainer
    const gridFleetContainer = document.createElement("div");
    gridFleetContainer.id = "grid-fleet-container";

    // gridMapContainer
    const gridMapContainer = document.createElement("div");
    gridMapContainer.id = "grid-map-container";

    const { numAxis, letterAxis } = createAxisLabels();

        // board wrapper 
    const boardWrapper = document.createElement("div");
    boardWrapper.classList.add("board-wrapper");

    const gridMap = createGridMap(game);

    const shipOverlay = document.createElement("div");
    shipOverlay.classList.add("ship-overlay");

    boardWrapper.append(gridMap, shipOverlay);

    gridMapContainer.append(numAxis, letterAxis, boardWrapper);

    // fleetContainer
    const fleetContainer = createFleetContainer(game, gridMap, shipOverlay);

    gridFleetContainer.append(gridMapContainer, fleetContainer);

    fleetSetupMainContainer.append(messageHeader, gridFleetContainer);

    app.append(fleetSetupMainContainer);
}
