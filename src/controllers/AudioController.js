import bgMusicWaves from "../assets/waves.mp3";
import bgMusicBattle from "../assets/bg-music-small.mp3";
import missedSound from "../assets/missed.mp3";
import canonFireSound from "../assets/cannon-fire.mp3";
import explosionSound from "../assets/explosion.mp3";
import gridCellHoverSound from "../assets/hover-1.mp3";
import shipCardHoverSound from "../assets/hover-5.wav";
import buttonClickSound from "../assets/click-2.wav";
import shipPlacedSound from "../assets/ship-placed.wav";

const normalVolume = 0.3;
const fadeDuration = 7000;

const bgAudioA = new Audio(bgMusicWaves);
const bgAudioB = new Audio(bgMusicWaves);

bgAudioA.volume = normalVolume;
bgAudioB.volume = 0;

bgAudioA.preload = "auto";
bgAudioB.preload = "auto";

bgAudioA.loop = false;
bgAudioB.loop = false;

let currentAudio = bgAudioA;
let nextAudio = bgAudioB;
let isCrossfading = false;
let isMuted = false;
let hasStarted = false;
let crossfadeIntervalId = null;
let crossfadeTimeoutId = null;
let wasPlayingBeforeTabHidden = false;
let isTabVisibilityHandlerEnabled = false;
const fadeIntervalIds = new Set();

export function enableBackgroundMusic() {
    document.addEventListener(
        "click",
        async () => {
            if (isMuted) return;

            try {
                await currentAudio.play();
                hasStarted = true;
                setupCrossfadeLoop();
            } catch (err) {
                console.log("Audio could not play: ", err);
            }
        },
        { once: true },
    );
}

export async function swapMusic() {
    const shouldResume = hasStarted && !isMuted;

    resetCrossfadeState();

    bgAudioA.src = bgMusicBattle;
    bgAudioB.src = bgMusicBattle;

    bgAudioA.currentTime = 0;
    bgAudioB.currentTime = 0;

    bgAudioA.volume = normalVolume;
    bgAudioB.volume = 0;

    currentAudio = bgAudioA;
    nextAudio = bgAudioB;

    if (shouldResume) {
        try {
            await currentAudio.play();
            setupCrossfadeLoop();
        } catch (err) {
            console.log("Audio could not play:", err);
        }
    }
}

export function enableButtonClickSound() {
    const buttonClickSoundEffect = new Audio(buttonClickSound);

    document.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");

        if (!clickedButton) return;
        if (clickedButton.disabled) return;

        buttonClickSoundEffect.currentTime = 0;
        buttonClickSoundEffect.play();
    });
}

export async function toggleBackgroundMusic() {
    isMuted = !isMuted;

    if (isMuted) {
        resetCrossfadeState();
    } else {
        currentAudio.volume = normalVolume;
        nextAudio.volume = 0;

        if (!hasStarted) {
            await currentAudio.play();
            hasStarted = true;
            setupCrossfadeLoop();
        } else {
            await currentAudio.play();
        }
    }

    return isMuted;
}

export function enablePauseWhenTabHidden() {
    if (isTabVisibilityHandlerEnabled) return;

    isTabVisibilityHandlerEnabled = true;

    document.addEventListener("visibilitychange", async () => {
        if (document.hidden) {
            wasPlayingBeforeTabHidden =
                hasStarted && !isMuted && (!bgAudioA.paused || !bgAudioB.paused);

            if (wasPlayingBeforeTabHidden) {
                resetCrossfadeState();
            }

            return;
        }

        if (!wasPlayingBeforeTabHidden || isMuted) return;

        currentAudio.volume = normalVolume;
        nextAudio.volume = 0;

        try {
            await currentAudio.play();
            setupCrossfadeLoop();
        } catch (err) {
            console.log("Audio could not resume after tab became visible:", err);
        } finally {
            wasPlayingBeforeTabHidden = false;
        }
    });
}

function setupCrossfadeLoop() {
    if (crossfadeIntervalId) return;

    crossfadeIntervalId = setInterval(() => {
        if (isMuted) return; // stops interval user muted audio
        if (!currentAudio.duration || isCrossfading) return; // do nothing if audio is not ready or already crossfading

        const timeLeft = currentAudio.duration - currentAudio.currentTime; // compute remaining audio duration

        if (timeLeft <= fadeDuration / 1000) {
            // start cross fade is time remaining is less than fadeDuration
            startCrossfade();
        }
    }, 500); // run every .5 second
}

function resetCrossfadeState() {
    if (crossfadeTimeoutId) {
        clearTimeout(crossfadeTimeoutId);
        crossfadeTimeoutId = null;
    }

    fadeIntervalIds.forEach((intervalId) => {
        clearInterval(intervalId);
    });
    fadeIntervalIds.clear();

    bgAudioA.pause();
    bgAudioB.pause();

    isCrossfading = false;
}

async function startCrossfade() {
    if (isMuted) return;

    isCrossfading = true;

    nextAudio.currentTime = 0;
    nextAudio.volume = 0;

    try {
        await nextAudio.play();
    } catch (err) {
        isCrossfading = false;
        console.log("Audio could not crossfade:", err);
        return;
    }

    fadeAudio(currentAudio, 0, fadeDuration);
    fadeAudio(nextAudio, normalVolume, fadeDuration);

    crossfadeTimeoutId = setTimeout(() => {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.volume = 0;

        const oldAudio = currentAudio;
        currentAudio = nextAudio;
        nextAudio = oldAudio;

        isCrossfading = false;
        crossfadeTimeoutId = null;
    }, fadeDuration);
}

function fadeAudio(audio, targetVolume, duration = 1000) {
    const startVolume = audio.volume;
    const volumeDifference = targetVolume - startVolume;
    const steps = 30;
    let currentStep = 0;

    const intervalId = setInterval(() => {
        currentStep++;

        audio.volume = startVolume + volumeDifference * (currentStep / steps);

        if (currentStep >= steps) {
            audio.volume = targetVolume;
            clearInterval(intervalId);
            fadeIntervalIds.delete(intervalId);
        }
    }, duration / steps);

    fadeIntervalIds.add(intervalId);
}

export function playCannonFireSound() {
    const canonFire = new Audio(canonFireSound);
    canonFire.volume = .7;
    canonFire.play();
}

export function playMissedSound() {
    const waterSplash = new Audio(missedSound);
    waterSplash.volume = 1;
    waterSplash.play();
}

export function playExplosionSound() {
    const explosion = new Audio(explosionSound);
    explosion.volume = 0.5;
    explosion.play();
}

export function playGridCellHoverSound() {
    const hoverSoundEffect = new Audio(gridCellHoverSound);
    hoverSoundEffect.volume = 0.8;
    hoverSoundEffect.play();
}

export function playHoverSoundShipCard() {
    const hoverSoundShipCardEffect = new Audio(shipCardHoverSound);
    hoverSoundShipCardEffect.volume = 0.6;
    hoverSoundShipCardEffect.play();
}

export function playShipPlacedSound() {
    const shipPlacedSoundEffect = new Audio(shipPlacedSound);
    shipPlacedSoundEffect.play();
}
