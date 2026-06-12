import { createIcons, Volume2, VolumeX, FileText } from "lucide";
import {
    enableBackgroundMusic,
    toggleBackgroundMusic,
} from "../controllers/AudioController.js";

export function createBgEffects() {
    const bgEffects = document.createElement("div");
    bgEffects.classList.add("rain");
    return bgEffects;
}

export function createIconPanel() {
    const iconPanel = document.createElement("div");
    iconPanel.id = "icon-panel";
    const audioBtn = createAudioBtn();
    iconPanel.append(audioBtn);

    return iconPanel;
}

export function renderLucideIcons() {
    createIcons({ icons: { Volume2, VolumeX, FileText } });
}

function createAudioBtn() {
    enableBackgroundMusic();

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

