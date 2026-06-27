import { createBattleStatusPrompt } from "../components/battleStatusPrompt.js";

export function createStartScreen(handleGameStart) {
    const startScreen = document.createElement("main");
    startScreen.id = "start-screen";
    startScreen.classList.add("screen");

    const titleFormWrapper = document.createElement("div");
    titleFormWrapper.classList.add("title-form-wrapper")

    const gameTitle = createTitle();

    const errorPrompt = createBattleStatusPrompt({
        text: "",
        type: "friendly",
    });

    const playerNameForm = createPlayerNameForm(handleGameStart, errorPrompt);

    titleFormWrapper.append(errorPrompt.element, gameTitle, playerNameForm);

    startScreen.append(titleFormWrapper);
    return startScreen;
}

function createTitle() {
    const gameTitle = document.createElement("h1");
    gameTitle.id = "game-title";
    gameTitle.classList.add("matrix-text");
    gameTitle.innerText = "BATTLESHIP";
    gameTitle.dataset.text = "BATTLESHIP";

    return gameTitle;
}

function createPlayerNameForm(handleGameStart, errorPrompt) {
    const playerNameForm = document.createElement("div");
    playerNameForm.classList.add("pregame-card", "panel");

    const form = document.createElement("form");

    const nameInput = document.createElement("input");
    nameInput.id = "player-name";
    nameInput.name = "player-name";
    nameInput.required = true;
    nameInput.maxLength = 15;

    nameInput.placeholder = "Admiral name";

    const startBtn = document.createElement("button");
    startBtn.type = "submit";
    startBtn.classList.add("modal-btn");
    startBtn.innerText = "Enter Combat";

    form.append(nameInput, startBtn);

    playerNameForm.append(form);

    form.noValidate = true;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const playerName = nameInput.value.trim();

        if (playerName === "") {
            errorPrompt.setPromptText("Commander name is required.");
            errorPrompt.setPromptVisible(true);
            nameInput.focus();
            return;
        }

        if (playerName.length > 15) {
            errorPrompt.setPromptText("Commander name must be 15 characters or less.");
            errorPrompt.setPromptVisible(true);
            nameInput.focus();
            return;
        }

        errorPrompt.setPromptVisible(false);

        handleGameStart(playerName);
    });

    return playerNameForm;
}
