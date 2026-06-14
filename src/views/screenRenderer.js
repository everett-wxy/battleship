import { createBgEffects, renderLucideIcons, createIconPanel } from "./appShell.js";
import { createStartScreen } from "./screens/startScreen.js";
import { createFleetPlacementScreen } from "./screens/fleetPlacementScreen.js";
import { createRulesDialogScreen, createRulesBtn } from "./screens/rulesDialogScreen.js";

const root = document.querySelector("#root");

let app; // main screen wrapper
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

    const startScreen = createStartScreen(handleGameStart);

    app.append(startScreen);
}

export function renderRulesDialogScreen(currentGame, onContinue) {
    app.replaceChildren();

    const rulesDialogScreen = createRulesDialogScreen(currentGame, onContinue);
    root.append(rulesDialogScreen);
    rulesDialogScreen.showModal();

    const ruleBtn = createRulesBtn(rulesDialogScreen);
    iconPanel.append(ruleBtn);
    renderLucideIcons();
}

export function renderPlaceFleetScreen(currentGame, onContinue) {
    app.replaceChildren();
    const fleetPlacementScreen = createFleetPlacementScreen(currentGame, onContinue);
    app.append(fleetPlacementScreen);
}

export function renderBattleScreen(game) {
    app.replaceChildren();

    const battleWrapper = document.createElement("div");
    battleWrapper.id = "battle-wrapper";

    const friendlyWater = createFriendlyWater(game);
    const hostileWater = createHostileWater(game);
    const battleLog = createBattleLog(game);
    const battleDialogBox = document.createElement("div");

    battleWrapper.append(friendlyWater, hostileWater, battleDialogBox, battleLog);
}
