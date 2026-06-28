import {
    enableBackgroundMusic,
    enableButtonClickSound,
    enablePauseWhenTabHidden,
    toggleBackgroundMusic,
} from "../controllers/AudioController.js";

export function createAppShell() {
    const rulesDialog = createRulesDialog();
    const bgEffects = createBgEffects();
    const iconPanel = createIconPanel(rulesDialog.show);

    const appShell = document.createElement("div");
    appShell.append(rulesDialog.element, bgEffects, iconPanel);

    return {
        element: appShell,
        showRulesDialog(options) {
            rulesDialog.show(options);
        },
    };
}

function createRulesDialog() {
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
        console.log('show');
        beginButton.innerText = buttonText;
        currentOnClose = onClose;
        rulesDialog.showModal();
    }

    return {
        element: rulesDialog,
        show,
    };
}

function createBgEffects() {
    const bgEffects = document.createElement("div");
    bgEffects.classList.add("rain");
    return bgEffects;
}

function createIconPanel(showRules) {
    const iconPanel = document.createElement("div");
    iconPanel.id = "icon-panel";
    const audioBtn = createAudioBtn();
    const rulesBtn = createRulesBtn(showRules);
    const githubLink = createGithubLink();
    iconPanel.append(audioBtn, rulesBtn, githubLink);

    return iconPanel;
}

function createAudioBtn() {
    enableBackgroundMusic();
    enableButtonClickSound();
    enablePauseWhenTabHidden();

    const audioBtn = document.createElement("button");

    audioBtn.id = "audio-btn";
    audioBtn.classList.add("modal-btn")
    audioBtn.type = "button";
    audioBtn.innerText = "Music On"

    audioBtn.addEventListener("click", async () => {
        const isMuted = await toggleBackgroundMusic();

        audioBtn.innerHTML = isMuted
            ? "Music off"
            : `Music on`;
    });

    return audioBtn;
}

function createRulesBtn(showRules) {
    const ruleBtn = document.createElement("button");
    ruleBtn.classList.add("modal-btn");
    ruleBtn.type = "button";
    ruleBtn.innerText = "Rules";

    ruleBtn.addEventListener("click", () => {
        showRules();
    });

    return ruleBtn;
}

function createGithubLink() {
    const githubLink = document.createElement("a");
    githubLink.classList.add("modal-btn");
    githubLink.href = "https://github.com/everett-wxy/battleship";
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
    githubLink.innerText = "Github";

    return githubLink;
}
