export function createRulesDialogScreen(currentGame, onContinue) {
    const rulesDialog = document.createElement("dialog");
    rulesDialog.id = "rules-modal";

    const header = document.createElement("h1");
    header.innerText = "Mission guide";

    const instructions = [
        "Position all ships on the combat grid before the battle begins",
        "Place each vessel carefully. Ships cannot overlap or extend beyond the battlefield.",
        "On your turn, select a coordinate on the enemy grid to launch an attack.",
        "A successful hit will damage an enemy ship. A miss means the shot landed in open water.",
        "Use hit and miss markers to plan your next strike.",
        "The enemy will return fire after your turn. Stay alert.",
        "Destroy every enemy ship before your own fleet is eliminated.",
        "Victory is achieved when all enemy vessels have been sunk",
    ];

    const instructionsList = document.createElement("ol");

    instructions.forEach((item) => {
        const instruction = document.createElement("li");
        instruction.innerText = item;
        instructionsList.append(instruction);
    });

    const beginButton = document.createElement("button");
    beginButton.type = "button";
    beginButton.classList.add("modal-btn");
    beginButton.innerText = "Begin fleet placement";

    beginButton.addEventListener("click", () => {
        console.log("begin button clicked");
        rulesDialog.close();
        onContinue();
    });

    rulesDialog.append(header, instructionsList, beginButton);

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
