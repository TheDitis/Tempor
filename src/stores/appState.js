import {writable, derived, readable, get} from "svelte/store";
import Color from "color";
const fs = require("fs");
const path = require("path");


export const showFavorites = writable(false);


/// COLOR STATE ITEMS
export const hue = writable(180);

export const color = derived(
    hue,
    ($hue) => {
        return Color("rgb(255, 0, 0)").rotate($hue)
    }
)

/// Timer Size
export const size = writable(300);

export const blur = writable(0);
// so that the blur stays consistent in style when the window is resized:
export const scaledBlur = derived(
    [blur, size],
    ([$blur, $size]) => $blur * ($size / 300)
);


export const maxSize = readable(Math.min(window.screen.height, window.screen.width))

// export const settingsHeight = derived([size], $size => {
//     if ($size >= 200) return Math.round($size / 1.2);
//     else return Math.round(150)
// });
export const settingsHeight = writable(0);

export const settingsOpen = writable(false);

export const width = derived(
    [size, scaledBlur],
    ([$size, $scaledBlur]) => {
        return Math.round($size + ($scaledBlur * 7))
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

export const settings = writable({})

export const stayOnTop = derived(settings, $settings => $settings.alwaysOnTop);

export const currentFavInd = writable(null);

export const loadSettings = () => {
    // read settings file:
    const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")));
    settings.set(settingsData);
    console.log("favs: ", settingsData.favorites)
    hue.set(settingsData.hue);
    size.set(settingsData.size);
    blur.set(settingsData.blur);
}


export const saveSettings = () => {
    const tempHue = get(hue);
    const tempSize = get(size);
    const tempBlur = get(blur);
    let tempSettings = get(settings)
    tempSettings = {...tempSettings, hue: tempHue, size: tempSize, blur: tempBlur}
    tempSettings = JSON.stringify(tempSettings, null, 2);
    fs.writeFileSync(path.join(__dirname, "./settings.json"), tempSettings)
}


export const playSound = (filename) => {
    const sound = new Audio();
    sound.src = "file://" + __dirname + "/sounds/" + filename;
    sound.volume = get(settings).volume;
    sound.play();
}
