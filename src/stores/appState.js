import {writable, derived} from "svelte/store";
import Color from "color";


/// COLOR STATE ITEMS
export const hue = writable(180);

export const color = derived(
    hue,
    ($hue) => {
        return Color("rgb(255, 0, 0)").rotate($hue)
    }
)



/// WINDOW SIZE ITEMS
export const size = writable(300)

export const settingsHeight = writable(200);
export const settingsOpen = writable(false);

export const width = writable(300)
export const height = derived(
    [settingsHeight, settingsOpen, size],
    ([$settingsHeight, $settingsOpen, $size]) => {
        if ($settingsOpen) return $size + $settingsHeight;
        else return $size;
    }
)

