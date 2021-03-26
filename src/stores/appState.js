import {writable, derived, readable} from "svelte/store";
import Color from "color";
const fs = require("fs");
const path = require("path");


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

export const settingsHeight = writable(200);
export const settingsOpen = writable(false);

export const width = derived(
    [size, blur],
    ([$size, $blur]) => {
        return $size + ($blur * 5)
    }
);


export const height = derived(
    [settingsHeight, settingsOpen, size, blur],
    ([$settingsHeight, $settingsOpen, $size, $blur]) => {
        if ($settingsOpen) return $size + $settingsHeight  + ($blur * 5);
        else return $size + ($blur * 5);
    }
)







export const settings = writable({})

export const loadSettings = () => {
    // read settings file:
    const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")));
    settings.set(settingsData);
    hue.set(settingsData.hue);
    size.set(settingsData.size);
    blur.set(settingsData.blur);

}

export const stayOnTop = derived(settings, $settings => $settings.alwaysOnTop);