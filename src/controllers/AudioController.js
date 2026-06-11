import bgMusic from "../assets/music_for_videos-pirates-163389.mp3";

const normalVolume = 0.3;
const fadeDuration = 7000; // 2 seconds

const bgAudioA = new Audio(bgMusic);
const bgAudioB = new Audio(bgMusic);

bgAudioA.volume = normalVolume;
bgAudioB.volume = 0;

bgAudioA.loop = false;
bgAudioB.loop = false;

let currentAudio = bgAudioA;
let nextAudio = bgAudioB;
let isCrossfading = false;

function fadeAudio(audio, targetVolume, duration = 1000) {
    const startVolume = audio.volume;
    const volumeDifference = targetVolume - startVolume;
    const steps = 30;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;

        audio.volume =
            startVolume + volumeDifference * (currentStep / steps);

        if (currentStep >= steps) {
            audio.volume = targetVolume;
            clearInterval(interval);
        }
    }, duration / steps);
}

function startCrossfade() {
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

function setupCrossfadeLoop() {
    setInterval(() => {
        if (!currentAudio.duration || isCrossfading) return;

        const timeLeft = currentAudio.duration - currentAudio.currentTime;

        if (timeLeft <= fadeDuration / 1000) {
            startCrossfade();
        }
    }, 500);
}

export function enableBackgroundMusic() {
    document.addEventListener(
        "click",
        async () => {
            try {
                await currentAudio.play();
                setupCrossfadeLoop();
            } catch (err) {
                console.log("Audio could not play: ", err);
            }
        },
        { once: true },
    );
}