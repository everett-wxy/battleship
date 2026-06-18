import bgMusic from "../assets/music_for_videos-pirates-163389.mp3";
import missedSound from "../assets/missed.mp3";
import canonFireSound from "../assets/canon-fire.mp3";
import explosionSound from "../assets/explosion.mp3";
import hoverSound from "../assets/hover-1.mp3";

const normalVolume = 0.3;
const fadeDuration = 7000;

const bgAudioA = new Audio(bgMusic);
const bgAudioB = new Audio(bgMusic);

bgAudioA.volume = normalVolume;
bgAudioB.volume = 0;

bgAudioA.loop = false;
bgAudioB.loop = false;

let currentAudio = bgAudioA;
let nextAudio = bgAudioB;
let isCrossfading = false;
let isMuted = false;
let hasStarted = false;
let crossfadeIntervalId = null;

export function enableBackgroundMusic() {
    document.addEventListener(
        "click",
        async () => {
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

export async function toggleBackgroundMusic() {
    isMuted = !isMuted;

    if (isMuted) {
        bgAudioA.pause();
        bgAudioB.pause();
    } else {
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

function startCrossfade() {
    if (isMuted) return;

    isCrossfading = true;

    nextAudio.currentTime = 0;
    nextAudio.volume = 0;
    nextAudio.play();

    fadeAudio(currentAudio, 0, fadeDuration);
    fadeAudio(nextAudio, normalVolume, fadeDuration);

    setTimeout(() => {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.volume = 0;

        const oldAudio = currentAudio;
        currentAudio = nextAudio;
        nextAudio = oldAudio;

        isCrossfading = false;
    }, fadeDuration);
}

function fadeAudio(audio, targetVolume, duration = 1000) {
    const startVolume = audio.volume;
    const volumeDifference = targetVolume - startVolume;
    const steps = 30;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;

        audio.volume = startVolume + volumeDifference * (currentStep / steps);

        if (currentStep >= steps) {
            audio.volume = targetVolume;
            clearInterval(interval);
        }
    }, duration / steps);
}

export function playCannonFireSound() {
    const canonFire = new Audio(canonFireSound);
    canonFire.volume = 0.1;
    canonFire.play();
}

export function playMissedSound() {
    const waterSplash = new Audio(missedSound);
    waterSplash.volume = 0.1;
    waterSplash.play();
}

export function playExplosionSound() {
    const explosion = new Audio(explosionSound);
    explosion.volume = 0.1;
    explosion.play();
}

export function playHoverSound() {
    const hoverSoundEffect = new Audio(hoverSound);
    hoverSoundEffect.volume = 0.1;
    hoverSoundEffect.play();
}
