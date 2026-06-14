export function createStartScreen(handleGameStart) {
    const startScreen = document.createElement("main");
    startScreen.id = "start-screen";
    startScreen.classList.add("screen");

    const gameTitle = createTitle();
    const playerNameForm = createPlayerNameForm(handleGameStart);

    startScreen.append(gameTitle, playerNameForm);
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

function createPlayerNameForm(handleGameStart) {
    const playerNameForm = document.createElement("div");
    playerNameForm.classList.add("pregame-card");

    const form = document.createElement("form");

    const nameInput = document.createElement("input");
    nameInput.id = "player-name";
    nameInput.name = "player-name";
    nameInput.placeholder = "Captain name";

    const startBtn = document.createElement("button");
    startBtn.type = "submit";
    startBtn.classList.add("modal-btn");
    startBtn.innerText = "Enter Combat";

    form.append(nameInput, startBtn);
    playerNameForm.append(form);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const playerName = nameInput.value.trim();
        handleGameStart(playerName);
    });

    return playerNameForm;
}
