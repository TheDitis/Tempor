/**
 * file: appState.ts
 * author: Ryan McKay
 *
 * This file contains the svelte stores for all app-related state that isn't relevant to time.
 *
 * TYPES:
 *      @type SoundSelectionSetting - the 3 currently selected sound files by trigger type: 'start', 'next', & 'end'
 *      @type SettingsTabLabel - ('style' | 'sound' | 'intervals'), representing the settings tab currently selected
 *      @type SettingsObject - object containing all settings saved to & loaded from settings.json
 *
 * STORES:
 *      inputRef {HTMLElement} - that is bound to the time input
 *      showFavorites {boolean} - whether or not the favorites numbers on the ui should be visible
 *      intervalMode {boolean} - whether or not the timer is in interval mode
 *      settingsTab {'style' | 'sound' | 'intervals'} - the label of the settings page currently selected
 *      settingsHeight {number} - the height of the settings window (bound to the settings container)
 *      settingsOpen {boolean} - whether the settings tray is open or not
 *      hue {number} - the hue value (0 - 360) that should represent what is currently visible
 *      globalHue {number} - the main app color, which is retained even when the visible color changes between intervals
 *      color {Color} - color object of max saturation, derived from the hue store
 *      intervalColors {number[]} - a list of hue values for each of the 5 possible intervals (null if not set by user)
 *      size {number} - the size of the timer circle itself
 *      blur {number} - the amount of stylistic blur applied to the UI
 *      scaledBlur {number} - the blur value scaled with size, so it remains visually consistent when the app is resized
 *      borderRadius {number} - percentage of borderRadius to apply (100% equivalent to 50vw in css)
 *      lineThickness: {number} - the thickness of the countdown circle line
 *      width {number} - width of the app window, derived from 'size', 'scaledBlur', and 'lineThickness'
 *      height {number} - height of the app window derived from 'size', 'settingsOpen', 'settingsHeight', & 'scaledBlur'
 *      volume {number} - volume level of the sounds (between 0 and 1)
 *      settings {SettingsObject} - object loaded and saved to settings.json, populating values for all relevant stores
 *      stayOnTop {boolean} - whether or not the app should stay on top of all other windows
 *      currentFavInd {number} - index of the favorite setting currently selected, or null of none is
 *      currentFavInterval {number} - same as 'currentFavInd' but for interval mode
 *
 * FUNCTIONS:
 *
 */


import {derived, get, Readable, Writable, writable} from "svelte/store";
import {cloneObject, compareNumericStrings} from "../utils/utils"
import Color from "color";

const fs = require("fs");
const path = require("path");


/// INTERFACES USED IN THIS FILE:
interface SoundSelectionSetting {
    start: string,
    next: string,
    end: string
}

type SettingsTabLabel = ('style' | 'sound' | 'intervals');

interface SettingsObject {
    hue: number,
    size: number,
    blur: number,
    lineThickness: number,
    fontWeight: string,
    alwaysOnTop: boolean,
    theme: string,
    frame: number,
    volume: number,
    sounds: SoundSelectionSetting,
    favorites: (number | null)[],
    favoritesSounds: (SoundSelectionSetting | null)[],
    favoriteIntervals: (number[] | null)[],
    favoriteIntervalColors: (number[] | null)[],
    favoriteIntervalSounds: (SoundSelectionSetting | null)[],
    repeatIntervalCycle: boolean
}



const audio = new Audio();


export const inputRef: Writable<HTMLElement> = writable(null);

export const showFavorites: Writable<boolean> = writable(false);


export const intervalMode: Writable<boolean> = writable(false);


export const settingsTab: Writable<SettingsTabLabel> = writable("style");

// Height of the settings tray
export const settingsHeight: Writable<number> = writable(0);

// Whether or not the settings tray is opened
export const settingsOpen: Writable<boolean> = writable(false);


/// COLOR STATE ITEMS
export const hue: Writable<number> = writable(180);

export const globalHue: Writable<number> = writable(180);

export const color: Readable<Color> = derived(
    hue,
    ($hue) => {
        return Color("rgb(255, 0, 0)").rotate($hue)
    }
)

export const intervalColors: Writable<number[]> = writable([null, null, null, null, null])


// SIZE-RELATED STORES
// maximum size of the window based off the user's screen size
export const maxSize: number = Math.min(window.screen.height, window.screen.width)

/// Timer Size (circle itself)
export const size: Writable<number> = writable(300);

export const blur: Writable<number> = writable(0);
// keeps the blur consistent in style when the window is resized:
export const scaledBlur: Readable<number> = derived(
    [blur, size],
    ([$blur, $size]) => $blur * ($size / 300)
);

// the roundness of the corners of the frame is (if there is a frame)
export const borderRadius: Writable<number> = writable(0);

// how thick the timer circle is
export const lineThickness: Writable<number> = writable(20);





// Width of the entire window
export const width: Readable<number> = derived(
    [size, scaledBlur, lineThickness],
    ([$size, $scaledBlur, $lineThickness]) => {
        return Math.round($size + ($scaledBlur * 7)) + 20// + ($lineThickness / 4))
    }
);

// Height of the entire window
export const height: Readable<number> = derived(
    [settingsHeight, settingsOpen, size, scaledBlur],
    ([$settingsHeight, $settingsOpen, $size, $scaledBlur]) => {
        // main area height is size + blur + draggable-bar
        const mainSectionSize = Math.round($size + ($scaledBlur * 7)) + 20;
        if ($settingsOpen) return mainSectionSize + $settingsHeight + 20;
        else return mainSectionSize
    }
)

// Volume of the app
export const volume = writable(0);


export const listSoundFileNames = (): string[] => {
    const files = fs.readdirSync(path.join(__dirname, "/sounds/"))
        .filter(name => name.includes(".wav") || name.includes(".mp3"))
    files.sort(compareNumericStrings);
    return files
}

const getSettings = (): SettingsObject => {
    const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")));
    hue.set(settingsData.hue);
    globalHue.set(settingsData.hue);
    size.set(settingsData.size);
    blur.set(settingsData.blur);
    borderRadius.set(settingsData.frame);
    volume.set(settingsData.volume);
    lineThickness.set(settingsData.lineThickness);

    // HANDLING MISSING SOUND FILES
    const soundFiles = listSoundFileNames();
    for (let soundName of Object.keys(settingsData.sounds)) {
        const found = soundFiles.includes(settingsData.sounds[soundName]);
        if (!found) {
            settingsData.sounds[soundName] = soundFiles[0];
        }
    }
    return cloneObject(settingsData) as SettingsObject;
}

export const settings: Writable<SettingsObject> = writable(getSettings());


export const stayOnTop = derived(settings, $settings => $settings.alwaysOnTop);

export const favoritesKeyMap = {
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

export const currentFavInd: Writable<number> = writable(null);

export const currentFavInterval: Writable<number> = writable(null);

export const meme: Writable<string> = writable(null);

export const loadSettings = () => {
    settings.set(getSettings());
}

export const saveSettings = async (): Promise<boolean> => {
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
    const stringSettings = JSON.stringify(tempSettings, null, 2);

    try {
        await fs.writeFileSync(path.join(__dirname, "./settings.json"), stringSettings)
    } catch (e) {
        console.error(e)
        return false
    }
    return true
}


export const playSound = (filename: string) => {
    if (filename && filename.includes(".wav")) {
        audio.pause();
        audio.src = "file://" + __dirname + "/sounds/" + filename;
        audio.volume = get(volume);
        audio.play();
    }
}


