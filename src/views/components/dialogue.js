import hostileAdmiralNeutral from "../../assets/hostile-admiral-neutral.png";
import hostileAdmiralBoisterous from "../../assets/hostile-admiral-lol.png";
import hostileAdmiralAnnoyed from "../../assets/hostile-admiral-annoyed.png";
import hostileAdmiralArrogant from "../../assets/hostile-admiral-arrogant.png";
import hostileAdmiralDismissive from "../../assets/hostile-admiral-dismissive.png";
import hostileAdmiralFrustrated from "../../assets/hostile-admiral-frustrated.png";
import hostileAdmiralBored from "../../assets/hostile-admiral-bored.png";
import friendlySoldierNeutral from "../../assets/friendly-soldier-neutral.png";
import friendlySoldierEmbarrassed from "../../assets/friendly-soldier-embarrassed.png";
import friendlySoldierSalute from "../../assets/friendly-soldier-salute-cropped.png";
import friendlySoldierRegretful from "../../assets/friendly-soldier-regretful.png";
import friendlySoldierEnthusiastic from "../../assets/friendly-soldier-enthusiastic.png";
import friendlySoldierEncouraging from "../../assets/friendly-soldier-encouraging.png";
import friendlySoldierDetermined from "../../assets/friendly-soldier-determined.png";

const characterAssets = {
    friendly: {
        neutral: friendlySoldierNeutral,
        encouraging: friendlySoldierEncouraging,
        enthusiastic: friendlySoldierEnthusiastic,
        serious: friendlySoldierSalute,
        embarrassed: friendlySoldierEmbarrassed,
        regretful: friendlySoldierRegretful,
        determined: friendlySoldierDetermined,
    },
    hostile: {
        neutral: hostileAdmiralNeutral,
        boisterous: hostileAdmiralBoisterous,
        arrogant: hostileAdmiralArrogant,
        bored: hostileAdmiralBored,
        frustrated: hostileAdmiralFrustrated,
        annoyed: hostileAdmiralAnnoyed,
        dismissive: hostileAdmiralDismissive,
    },
};

export function createDialogue({ side, message = "...", isActive = true }) {
    const battleDialogueContainer = document.createElement("div");
    battleDialogueContainer.classList.add("battle-dialogue-container", "panel", side);
    battleDialogueContainer.classList.add(isActive ? "active" : "inactive");
    battleDialogueContainer.setAttribute("aria-hidden", side === "friendly" ? "false" : "true");

    const characterImg = document.createElement("img");
    characterImg.classList.add("character", side);
    characterImg.src = characterAssets[side].neutral;

    const dialogueMessage = document.createElement("p");
    dialogueMessage.classList.add("dialogue", side);
    dialogueMessage.innerText = message;

    battleDialogueContainer.append(characterImg, dialogueMessage);

    function setMessage(message) {
        dialogueMessage.innerText = message;
    }

    function setCharacterImg(expression) {
        characterImg.src = characterAssets[side][expression];
    }

    function setActive(isActive) {
        battleDialogueContainer.classList.toggle("active", isActive);
        battleDialogueContainer.classList.toggle("inactive", !isActive);
        battleDialogueContainer.setAttribute("aria-hidden", isActive ? "false" : "true");
    }

    return {
        battleDialogueContainer,
        setMessage,
        setCharacterImg,
        setActive,
    };
}

export function createBattleDialogue(side, playerName) {
    const dialogues = generateDialoguesDict(playerName);

    const dialogue = createDialogue({ side, message: "...", isActive: side === "friendly" });

    function generateBattleDialogueMessage(isHit) {
        if (!dialogues[side]) {
            throw new Error(`Invalid side: ${side}`);
        }

        const result = isHit ? "hit" : "miss";

        if (!dialogues[side][result]) {
            throw new Error(`Invalid result: ${result}`);
        }

        const tones = Object.keys(dialogues[side][result]);
        const tone = getRandomItem(tones);
        const dialogueOptions = dialogues[side][result][tone];
        const message = getRandomItem(dialogueOptions);
        return {
            message,
            tone,
        };
    }

    function changeCharacterImage(tone) {
        if (!tone) {
            characterImg.src = side === "friendly" ? friendlySoldierNeutral : hostileAdmiralNeutral;
            return;
        }

        const src = characterAssets[side]?.[tone];

        if (!src) {
            throw new Error(`Invalid character asset: side=${side}, tone=${tone}`);
        }

        characterImg.src = src;
    }

    function showAttackReaction(isHit) {
        const { message, tone } = generateBattleDialogueMessage(isHit);
        dialogueMessage.innerText = message;
        changeCharacterImage(tone);
    }
    return {
        ...dialogue,
        generateBattleDialogueMessage,
        showAttackReaction,
    };
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateDialoguesDict(playerName) {
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
                    "Is that all you got? Ptff.",
                    "Yawn. Try not to make this too easy.",
                    "I suppose I should pretend that required effort.",
                    "Please do try to add some suspense.",
                    "Try to make this interesting.",
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

function setActiveDialogue(turn, friendlyBattleDialogue, hostileBattleDialogue) {
    const { activeBattleDialogue, inactiveBattleDialogue } = getDialogueByTurn(
        turn,
        friendlyBattleDialogue,
        hostileBattleDialogue,
    );

    activeBattleDialogue.battleDialogueContainer.classList.add("active");
    activeBattleDialogue.battleDialogueContainer.classList.remove("inactive");
    activeBattleDialogue.battleDialogueContainer.setAttribute("aria-hidden", "false");

    inactiveBattleDialogue.battleDialogueContainer.classList.add("inactive");
    inactiveBattleDialogue.battleDialogueContainer.classList.remove("active");
    inactiveBattleDialogue.battleDialogueContainer.setAttribute("aria-hidden", "true");
}

function getDialogueByTurn(turn, friendlyBattleDialogue, hostileBattleDialogue) {
    if (turn === "human") {
        return {
            activeBattleDialogue: friendlyBattleDialogue,
            inactiveBattleDialogue: hostileBattleDialogue,
        };
    }

    if (turn === "computer") {
        return {
            activeBattleDialogue: hostileBattleDialogue,
            inactiveBattleDialogue: friendlyBattleDialogue,
        };
    }

    throw new Error(`Invalid turn: ${turn}`);
}

// function updateBattleDialogue(turn, message, friendlyDialogue, hostileDialogue) {
//     let currentDialogue;
//     let pastDialogue;

//     if (turn === "human") {
//         currentDialogue = friendlyDialogue;
//         pastDialogue = hostileDialogue;
//     }
//     if (turn === "computer") {
//         currentDialogue = hostileDialogue;
//         pastDialogue = friendlyDialogue;
//     }

//     pastDialogue.battleDialogueContainer.classList.remove("active");
//     pastDialogue.battleDialogueContainer.classList.add("inactive");
//     pastDialogue.battleDialogueContainer.setAttribute("aria-hidden", "true");

//     currentDialogue.battleDialogueContainer.classList.remove("inactive");
//     currentDialogue.battleDialogueContainer.classList.add("active");
//     currentDialogue.battleDialogueContainer.setAttribute("aria-hidden", "false");

//     currentDialogue.dialogueMessage.innerText = message;
// }
