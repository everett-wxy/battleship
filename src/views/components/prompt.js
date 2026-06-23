export function createPrompt(message) {
    const prompt = document.createElement("div");
    prompt.classList.add("prompt");
    prompt.textContent = message;

    function togglePrompt() {
        prompt.classList.toggle("visible");
        console.log("triggered")
    }

    return { element: prompt, togglePrompt };
}
