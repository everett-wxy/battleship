import { createIcons, Volume2, VolumeX, FileText } from "lucide";
import {
    enableBackgroundMusic,
    enableButtonClickSound,
    toggleBackgroundMusic,
} from "../controllers/AudioController.js";

export function createRulesDialog() {
    const rulesDialog = document.createElement("dialog");
    rulesDialog.id = "rules-modal";
    rulesDialog.classList.add("friendly", "panel");

    const header = document.createElement("div");
    header.classList.add("header");

    const missionObjective = document.createElement("h1");
    missionObjective.innerText = "Mission Objective";

    const objective = document.createElement("p");
    objective.classList.add("objective");
    objective.innerText = "Be the first to sink all 5 of your opponent's ships.";

    header.append(missionObjective, objective);

    const rulesContainer = document.createElement("div");
    rulesContainer.classList.add("rules-container");

    const rules = document.createElement("h1");
    rules.innerText = "Rules";
    rules.classList.add("header", "rules");

    const instructions = [
        "Each player is given a fleet of 5 ships, each with a different length.",
        "Place each vessel carefully within your 10x10 grid.",
        "Each player takes turns firing at the opponent's grid.",
        "A successful strike on a coordinate containing a ship will damage that ship.",
        "A ship will be sunk once every part of it has been hit.",
    ];

    const instructionsList = document.createElement("ol");

    instructions.forEach((item) => {
        const instruction = document.createElement("li");
        instruction.innerText = item;
        instructionsList.append(instruction);
    });

    rulesContainer.append(rules, instructionsList);

    const beginButton = document.createElement("button");
    beginButton.type = "button";
    beginButton.classList.add("modal-btn");

    beginButton.addEventListener("click", () => {
        rulesDialog.close();
    });

    let currentOnClose = null;

    rulesDialog.addEventListener("close", () => {
        const callback = currentOnClose;
        currentOnClose = null;
        if (callback) {
            callback();
        }
    });

    rulesDialog.append(header, rulesContainer, beginButton);

    function show({ buttonText = "Close", onClose = null } = {}) {
        beginButton.innerText = buttonText;
        currentOnClose = onClose;
        rulesDialog.showModal();
    }

    return {
        element: rulesDialog,
        show,
    };
}

export function createBgEffects() {
    const bgEffects = document.createElement("div");
    bgEffects.classList.add("rain");
    return bgEffects;
}

export function createIconPanel(showRules) {
    const iconPanel = document.createElement("div");
    iconPanel.id = "icon-panel";
    const audioBtn = createAudioBtn();
    const rulesBtn = createRulesBtn(showRules);
    iconPanel.append(audioBtn, rulesBtn);

    return iconPanel;
}

export function renderLucideIcons() {
    createIcons({ icons: { Volume2, VolumeX, FileText } });
}

function createAudioBtn() {
    enableBackgroundMusic();
    enableButtonClickSound();

    const audioBtn = document.createElement("button");

    audioBtn.id = "audio-btn";
    audioBtn.type = "button";
    audioBtn.innerHTML = `<i data-lucide="volume-2"></i>`;

    audioBtn.addEventListener("click", async () => {
        const isMuted = await toggleBackgroundMusic();

        audioBtn.innerHTML = isMuted
            ? `<i data-lucide="volume-x"></i>`
            : `<i data-lucide="volume-2"></i>`;

        renderLucideIcons();
    });

    return audioBtn;
}

function createRulesBtn(showRules) {
    const ruleBtn = document.createElement("button");
    ruleBtn.classList.add("rules");
    ruleBtn.type = "button";
    ruleBtn.innerText = "Rules";

    ruleBtn.addEventListener("click", () => {
        showRules();
    });

    return ruleBtn;
}
