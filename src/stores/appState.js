import {writable, derived, readable, get} from "svelte/store";
import Color from "color";
import {intervalDurations} from "./timerState";

const v8 = require("v8");
const fs = require("fs");
const path = require("path");

const cloneObj = obj => v8.deserialize(v8.serialize(obj));

export const inputRef = writable(null);

const audio = writable(new Audio());

export const showFavorites = writable(false);

export const settingsTab = writable("style");


/// COLOR STATE ITEMS
export const hue = writable(180);

export const globalHue = writable(180);

export const color = derived(
    hue,
    ($hue) => {
        return Color("rgb(255, 0, 0)").rotate($hue)
    }
)

export const intervalColors = writable([null, null, null, null, null])

/// Timer Size
export const size = writable(300);

export const blur = writable(0);
// so that the blur stays consistent in style when the window is resized:
export const scaledBlur = derived(
    [blur, size],
    ([$blur, $size]) => $blur * ($size / 300)
);

// the roundness of the corners of the frame is (if there is a frame)
export const borderRadius = writable(0);

// how thick the timer circle is
export const lineThickness = writable(1);


export const maxSize = readable(Math.min(window.screen.height, window.screen.width))

export const settingsHeight = writable(0);

export const settingsOpen = writable(true);

export const width = derived(
    [size, scaledBlur, lineThickness],
    ([$size, $scaledBlur, $lineThickness]) => {
        return Math.round($size + ($scaledBlur * 7)) + 20// + ($lineThickness / 4))
    }
);


export const height = derived(
    [settingsHeight, settingsOpen, size, scaledBlur],
    ([$settingsHeight, $settingsOpen, $size, $scaledBlur]) => {
        // main area height is size + blur + draggable-bar
        const mainSectionSize = Math.round($size + ($scaledBlur * 7)) + 20;
        if ($settingsOpen) return mainSectionSize + $settingsHeight + 20;
        else return mainSectionSize
    }
)


export const intervalMode = writable(false);

export const settings = writable({});

export const volume = writable(0);

export const stayOnTop = derived(settings, $settings => $settings.alwaysOnTop);

export const favKeyMap = {
    set: {
        Q: 0,
        W: 1,
        E: 2,
        R: 3,
        T: 4
    },
    load: {
        "!": 0,
        "@": 1,
        "#": 2,
        "$": 3,
        "%": 4
    }
}

export const currentFavInd = writable(null);

export const currentFavInterval = writable(null);

export const meme = writable(null);


export const loadSettings = () => {
    // read settings file and set relevant stores:
    const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")));
    hue.set(settingsData.hue);
    globalHue.set(settingsData.hue);
    size.set(settingsData.size);
    blur.set(settingsData.blur);
    borderRadius.set(settingsData.frame);
    volume.set(settingsData.volume);
    lineThickness.set(settingsData.lineThickness);

    // HANDLE MISSING SOUND FILES
    const soundFiles = listSoundFileNames();
    for (let soundName of Object.keys(settingsData.sounds)) {
        const sound = settingsData.sounds[soundName];
        const found = soundFiles.includes(settingsData.sounds[soundName]);
        console.log("sound: ", sound, " found: ", found);
        if (!found) {
            settingsData.sounds[soundName] = soundFiles[0];
            console.log("setting default sound for ", soundName, " sound: ", soundFiles[0]);
        }
    }
    const settingsClone = cloneObj({...settingsData});
    settings.set(settingsClone);
}


export const saveSettings = async () => {
    const tempHue = get(globalHue);
    const tempSize = get(size);
    const tempBlur = get(blur);
    const frame = get(borderRadius);
    const vol = get(volume);
    const lineThikniss = get(lineThickness);
    let tempSettings = get(settings);
    /// so that not too much space is taken up by arrays full of null
    const tempFavIntervalColors = tempSettings.favoriteIntervalColors.map( item => {
        return (item !== null && item.length && item.some(val => val !== null)) ? item : null;
    })
    tempSettings = {
        ...tempSettings,
        hue: tempHue,
        size: tempSize,
        blur: tempBlur,
        lineThickness: lineThikniss,
        frame,
        volume: vol,
        favoriteIntervalColors: tempFavIntervalColors
    };
    tempSettings = JSON.stringify(tempSettings, null, 2);

    try {
        return await fs.writeFileSync(path.join(__dirname, "./settings.json"), tempSettings)
    } catch (e) {
        console.error(e)
    }
}


export const playSound = (filename) => {
    if (filename && filename.includes(".wav")) {
        const sound = get(audio)
        sound.pause();
        sound.src = "file://" + __dirname + "/sounds/" + filename;
        sound.volume = get(volume);
        sound.play();
    }
}


export const listSoundFileNames = () => {
    const files = fs.readdirSync(path.join(__dirname, "/sounds/")).filter(name => name.includes(".wav") || name.includes(".mp3"))
    files.sort((a, b) => a.localeCompare(b, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true}));
    return files
}