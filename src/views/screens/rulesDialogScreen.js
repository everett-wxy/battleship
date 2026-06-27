
export function createRulesDialogScreen(currentGame, onContinue) {
    let onContinueCalled = false;
    
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
    beginButton.innerText = "Begin fleet placement";

    beginButton.addEventListener("click", () => {
        rulesDialog.close();

        if (!onContinueCalled) {
            onContinueCalled = true;
            beginButton.innerText = "Close"
            onContinue();
        }
    });

    rulesDialog.append(header, rulesContainer, beginButton);

    return rulesDialog;
}

export function createRulesBtn(rulesDialog) {
    const ruleBtn = document.createElement("button");
    ruleBtn.id = "rule-btn";
    ruleBtn.classList.add("modal-button");
    ruleBtn.type = "button";
    ruleBtn.innerHTML = `<i data-lucide="file-text"></i>`;

    ruleBtn.addEventListener("click", () => {
        if (!rulesDialog.open) {
            rulesDialog.showModal();
        }
    });

    return ruleBtn;
}
