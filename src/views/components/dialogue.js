import hostileAdmiralNeutral from "../../assets/hostile-admiral-neutral.png";
import hostileAdmiralBoisterous from "../../assets/hostile-admiral-lol.png";
import hostileAdmiralAnnoyed from "../../assets/hostile-admiral-annoyed.png";
import hostileAdmiralArrogant from "../../assets/hostile-admiral-arrogant.png";
import hostileAdmiralDismissive from "../../assets/hostile-admiral-bored.png";
import hostileAdmiralFrustrated from "../../assets/hostile-admiral-frustrated.png";
import hostileAdmiralBored from "../../assets/hostile-admiral-dismissive.png";
import hostileAdmiralDisinterested from "../../assets/hostile-admiral-digging-ear.png";
import friendlySoldierNeutral from "../../assets/friendly-soldier-neutral.png";
import friendlySoldierEmbarrassed from "../../assets/friendly-soldier-embarrassed.png";
import friendlySoldierSalute from "../../assets/friendly-soldier-salute.png";
import friendlySoldierRegretful from "../../assets/friendly-soldier-regretful.png";
import friendlySoldierEnthusiastic from "../../assets/friendly-soldier-enthusiastic.png";
import friendlySoldierEncouraging from "../../assets/friendly-soldier-encouraging.png";
import friendlySoldierDetermined from "../../assets/friendly-soldier-determined.png";
import friendlySoldierAngry from "../../assets/friendly-soldier-angry.png";

const characterAssets = {
    friendly: {
        neutral: friendlySoldierNeutral,
        encouraging: friendlySoldierEncouraging,
        enthusiastic: friendlySoldierEnthusiastic,
        serious: friendlySoldierSalute,
        embarrassed: friendlySoldierEmbarrassed,
        regretful: friendlySoldierRegretful,
        determined: friendlySoldierDetermined,
        angry: friendlySoldierAngry,
    },
    hostile: {
        neutral: hostileAdmiralNeutral,
        boisterous: hostileAdmiralBoisterous,
        arrogant: hostileAdmiralArrogant,
        bored: hostileAdmiralBored,
        frustrated: hostileAdmiralFrustrated,
        annoyed: hostileAdmiralAnnoyed,
        dismissive: hostileAdmiralDismissive,
        disinterested: hostileAdmiralDisinterested,
    },
};

export function createDialogue({
    side, // friendly vs hostile
    expression = "neutral",
    message = "...",
    isActive = true,
}) {
    const dialoguePanel = document.createElement("div");
    dialoguePanel.classList.add("dialogue-panel", "panel", side);

    const dialogueBgEffect = createDialogueBgEffects(side);

    const characterImg = document.createElement("img");
    characterImg.classList.add("character", side);
    characterImg.src = characterAssets[side][expression];

    const dialogueMessage = document.createElement("p");
    dialogueMessage.classList.add("dialogue-message", side);

    const continuePrompt = document.createElement("p");
    continuePrompt.id = "continue-prompt";
    continuePrompt.textContent = "Press Enter to continue";
    continuePrompt.hidden = true;

    let typingIntervalId = null;

    function typeMessage(message) {
        clearInterval(typingIntervalId);

        dialogueMessage.textContent = "";

        const characters = [...message];
        if (characters.length === 0) return Promise.resolve();

        let index = 0;

        return new Promise((resolve) => {
            typingIntervalId = setInterval(() => {
                dialogueMessage.textContent += characters[index];
                index++;

                if (index >= characters.length) {
                    clearInterval(typingIntervalId);
                    typingIntervalId = null;
                    resolve();
                }
            }, 12);
        });
    }

    function setCharacterImg(expression) {
        characterImg.src = characterAssets[side][expression];
    }

    function setActive(isActive) {
        dialoguePanel.classList.toggle("active", isActive);
        dialoguePanel.classList.toggle("inactive", !isActive);
        dialoguePanel.setAttribute("aria-hidden", isActive ? "false" : "true");
    }

    function showPrompt() {
        continuePrompt.hidden = false;
    }

    function hidePrompt() {
        continuePrompt.hidden = true;
    }

    function setPromptText(text) {
        continuePrompt.textContent = text;
    }

    dialoguePanel.append(characterImg, dialogueMessage, continuePrompt, dialogueBgEffect);
    setActive(isActive);
    typeMessage(message);

    return {
        element: dialoguePanel,
        setMessage: typeMessage,
        setCharacterImg,
        setActive,
        showPrompt,
        hidePrompt,
        setPromptText,
    };
}

export function createBattleDialogues({
    playerName,
    friendlyMessage = "...",
    hostileMessage = "...",
}) {
    const dialogueLines = generateDialogueLines(playerName);

    const friendlyDialogue = createDialogue({
        side: "friendly",
        message: friendlyMessage,
        isActive: true,
    });

    const hostileDialogue = createDialogue({
        side: "hostile",
        message: hostileMessage,
        isActive: false,
    });

    function showAttackReaction(isHit, attacker) {
        const { message, expression } = pickDialogueLine(dialogueLines, isHit, attacker);

        const dialogue = attacker === "friendly" ? friendlyDialogue : hostileDialogue;

        dialogue.setMessage(message);
        dialogue.setCharacterImg(expression);
    }

    function setActiveDialogue(turn) {
        const { activeBattleDialogue, inactiveBattleDialogue } = getDialogueByTurn(
            turn,
            friendlyDialogue,
            hostileDialogue,
        );

        activeBattleDialogue.setActive(true);
        inactiveBattleDialogue.setActive(false);

        friendlyDialogue.setMessage("All launch systems are green, Commander.");
        hostileDialogue.setMessage("...");
        friendlyDialogue.setCharacterImg("neutral");
        hostileDialogue.setCharacterImg("neutral");
    }

    return {
        friendlyDialogue,
        hostileDialogue,
        showAttackReaction,
        setActiveDialogue,
    };
}

function pickDialogueLine(dialogueLines, isHit, side) {
    const result = isHit ? "hit" : "miss";

    const tones = Object.keys(dialogueLines[side][result]);
    const expression = getRandomItem(tones);

    const dialogueOptions = dialogueLines[side][result][expression];
    const message = getRandomItem(dialogueOptions);

    return {
        message,
        expression,
    };
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateDialogueLines(playerName) {
    if (!playerName) {
        throw new Error("playerName is undefined");
    }

    return {
        friendly: {
            hit: {
                encouraging: [
                    `Good strike, Commander ${playerName}! We've punched through their defenses!`,
                    `Clean impact, Commander ${playerName}! Keep the pressure on!`,
                    `Excellent shot, Commander ${playerName}! Enemy ship has sustained damage!`,
                ],
                enthusiastic: [
                    `That one landed, Commander ${playerName}! Enemy vessel is damaged!`,
                    "Strike successful! Their fleet won't hold for long!",
                    "Enemy ship hit! Awaiting your next firing command!",
                    "Target struck! Enemy crew is scrambling to respond!",
                ],
                serious: [
                    `Direct hit, Commander ${playerName}! Enemy hull integrity compromised!`,
                    "Confirmed hit! Enemy vessel is taking damage!",
                ],
            },
            miss: {
                embarrassed: [
                    "The shot missed. Recalculating trajectory.",
                    "Shot went wide. We'll correct the firing solution.",
                ],
                regretful: [
                    `No impact, Commander ${playerName}. The round landed wide.`,
                    `Shot missed, Commander ${playerName}. Enemy vessel remains untouched.`,
                ],
                determined: [
                    `Missed, Commander ${playerName}. We'll get them on the next salvo.`,
                    "No damage dealt. Arming missile in preparation for your next command.",
                ],
            },
        },
        hostile: {
            hit: {
                boisterous: [
                    `HAHAHA! Did you hear that, ${playerName}? That was the sound of competence!`,
                    "Your fleet trembles! My moustache would be proud if I had one!",
                    "To tell you the truth, I didn't even aim for that one!",
                    "Your fleet is not sinking. It is simply kneeling before experience!",
                    "HAHAHA! I am not attacking your fleet, I am editing it!",
                    "You call that a formation? I have spilled soup with more strategy!",
                ],
                arrogant: [
                    `I've sunk better captains before breakfast, ${playerName}.`,
                    `Your tactics are bold, ${playerName}. Boldly terrible, but bold.`,
                    `Go back to your toy boats, ${playerName}. These waters are no place for pretend admirals.`,
                    "I do hope your crew brought towels.",
                ],
                bored: [
                    `This is tooooooooo easy, ${playerName}.`,
                    "I suppose I should pretend that required effort.",
                    "Yawn. Try not to make this too easy.",
                ],
                disinterested: [
                    "Please do try to add some suspense.",
                    "Try to make this interesting.",
                    "Is that all you got? Ptff.",
                ],
            },
            miss: {
                frustrated: [
                    "WHAT?! Impossible! That shot was personally approved by my ego!",
                    "The sea moved. I saw it. Cowardly ocean!",
                    "The waves have betrayed me! I shall remember this insult!",
                    `Hold still, you floating inconvenience, ${playerName}!`,
                    "That shell had one job. One!",
                ],
                annoyed: [
                    `Your survival is becoming theatrically annoying, ${playerName}.`,
                    `Fine. Enjoy your accidental survival, ${playerName}!`,
                    "Missed?! No, no, no — the target simply failed to be where genius expected it.",
                ],
                dismissive: [
                    `A rare miscalculation, ${playerName}. Do not mistake it for mercy.`,
                    "A minor error. Your fleet remains doomed all the same.",
                    "The shot drifted wide. Your survival remains accidental.",
                    "I meant to miss. It builds suspense. Obviously.",
                ],
            },
        },
    };
}

function getDialogueByTurn(turn, friendlyDialogue, hostileDialogue) {
    if (turn === "human") {
        return {
            activeBattleDialogue: friendlyDialogue,
            inactiveBattleDialogue: hostileDialogue,
        };
    }

    if (turn === "computer") {
        return {
            activeBattleDialogue: hostileDialogue,
            inactiveBattleDialogue: friendlyDialogue,
        };
    }

    throw new Error(`Invalid turn: ${turn}`);
}

function createDialogueBgEffects(side) {
    const dialogueBgEffect = document.createElement("div");
    dialogueBgEffect.classList.add("dialogue-bg-effect", side);

    const monitorGrid = document.createElement("div");
    monitorGrid.classList.add("dialogue-monitor-grid");

    const monitorSweep = document.createElement("div");
    monitorSweep.classList.add("dialogue-monitor-sweep");

    const monitorHud = document.createElement("div");
    monitorHud.classList.add("dialogue-monitor-hud");

    const monitorSignal = document.createElement("div");
    monitorSignal.classList.add("dialogue-monitor-signal");

    dialogueBgEffect.append(monitorGrid, monitorSweep, monitorHud, monitorSignal);

    return dialogueBgEffect;
}
