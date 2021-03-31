import {writable, derived, readable, get} from "svelte/store";
import Color from "color";
import {intervalDurations} from "./timerState";

const fs = require("fs");
const path = require("path");

const audio = writable(new Audio());

export const showFavorites = writable(false);

export const settingsTab = writable("intervals");


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


export const intervalMode = writable(true);

export const settings = writable({});

export const volume = writable(0);

export const stayOnTop = derived(settings, $settings => $settings.alwaysOnTop);

export const currentFavInd = writable(null);

export const currentFavInterval = writable(null);

export const meme = writable(null);  // TODO: IT'S OVER 9000!!!

export const loadSettings = () => {
    // read settings file and set relevant stores:
    const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")));
    settings.set(settingsData);
    console.log("favs: ", settingsData.favorites)
    hue.set(settingsData.hue);
    globalHue.set(settingsData.hue);
    size.set(settingsData.size);
    blur.set(settingsData.blur);
    borderRadius.set(settingsData.frame)
    volume.set(settingsData.volume);
    lineThickness.set(settingsData.lineThickness);
}


export const saveSettings = () => {
    const tempHue = get(hue);
    const tempSize = get(size);
    const tempBlur = get(blur);
    const frame = get(borderRadius);
    const vol = get(volume);
    const lineThikniss = get(lineThickness);
    let tempSettings = get(settings);
    tempSettings = {...tempSettings, hue: tempHue, size: tempSize, blur: tempBlur, lineThickness: lineThikniss, frame, volume: vol}
    tempSettings = JSON.stringify(tempSettings, null, 2);
    fs.writeFileSync(path.join(__dirname, "./settings.json"), tempSettings)
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


export const listSoundFileNames = () => (
    fs.readdirSync(path.join(__dirname, "/sounds/"))
)