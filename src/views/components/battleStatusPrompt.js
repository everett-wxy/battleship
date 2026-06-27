export function createBattleStatusPrompt({ text, type, isBlinking = false }) {
    const battleStatusPrompt = document.createElement("div");
    battleStatusPrompt.classList.add("prompt", type);
    if (isBlinking) battleStatusPrompt.classList.add("blink");
    battleStatusPrompt.setAttribute("role", "status");
    battleStatusPrompt.setAttribute("aria-live", "polite");
    battleStatusPrompt.setAttribute("aria-hidden", "true");

    const promptText = document.createElement("span");
    promptText.classList.add("prompt-text");
    promptText.textContent = text;
    battleStatusPrompt.append(promptText);

    let removalTimerId = null;

    function setPromptVisible(isVisible) {
        battleStatusPrompt.classList.remove("closing");

        if (isVisible) {
            battleStatusPrompt.setAttribute("aria-hidden", "false");

            if (!battleStatusPrompt.classList.contains("visible")) {
                battleStatusPrompt.classList.add("visible");
            }
            return;
        }

        if (!battleStatusPrompt.classList.contains("visible")) return;

        battleStatusPrompt.classList.remove("visible");
        battleStatusPrompt.classList.add("closing");
        battleStatusPrompt.setAttribute("aria-hidden", "true");
    }

    function setPromptText(text) {
        promptText.textContent = text;
    }

    function remove() {
        clearTimeout(removalTimerId);

        setPromptVisible(false);

        removalTimerId = setTimeout(() => {
            battleStatusPrompt.remove();
        }, 350);
    }

    return { element: battleStatusPrompt, setPromptVisible, setPromptText, remove };
}
