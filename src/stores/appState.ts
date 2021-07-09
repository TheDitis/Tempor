/**
 * file: appState.ts
 * author: Ryan McKay
 *
 * This file contains the svelte stores for all app-related state that isn't specifically relevant to time.
 *
 * TYPES:
 *      @type SoundSelectionSetting - selection of 3 sound files by trigger type: 'start', 'next', & 'end'
 *      @type SettingsTabLabel ('style' | 'sound' | 'intervals') - valid settings tab labels
 *      @type SettingsObject - object containing all fields saved to & loaded from settings.json
 *
 *
 * CONSTANTS:
 *      @const MAX_SIZE {number} - the maximum size of the app (smaller of the screens width and height)
 *      @const FAVORITES_KEY_MAP {{set: object, load: object}} - Keyboard characters that map to the index of the
 *          corresponding in item in favorites. Each object has 5 characters, each mapped to a number 0 - 4
 *      @const THEMES {{transparent: string, dark: string, light: string}} - the mapping of theme labels to the color
 *          string representing the desired color of the background div
 *
 *
 * STORES:
 *      ----- INTERFACE -----
 *      inputRef {HTMLElement} - the input element for the timer
 *      showFavorites {boolean} - whether or not the favorites numbers on the ui should be visible
 *      intervalMode {boolean} - whether or not the timer is in interval mode
 *      settingsTab {'style' | 'sound' | 'intervals'} - the label of the settings page currently selected
 *      settingsHeight {number} - the height of the settings tray (bound to the settings container)
 *      settingsOpen {boolean} - whether the settings tray is open or not
 *      currentFavInd {number} - index of the favorite setting currently selected, or null of none is
 *      currentFavInterval {number} - same as 'currentFavInd' but for interval mode
 *      volume {number} - volume level of the sounds (between 0 and 1)
 *
 *      ----- COLOR -----
 *      hue {number} - the hue value (0 - 360) that should represent what is currently visible
 *      globalHue {number} - the main app color, which is retained even when the visible color changes between intervals
 *      color {Color} - color object of max saturation, derived from the hue store
 *      intervalColors {number[]} - a list of hue values for each of the 5 possible intervals (null if not set by user)
 *
 *      ----- SIZE & SHAPE -----
 *      size {number} - the size of the timer circle itself
 *      blur {number} - the amount of stylistic blur applied to the UI
 *      scaledBlur {number} - the blur value scaled with size, so it remains visually consistent when the app is resized
 *      borderRadius {number} - percentage of borderRadius to apply (100% equivalent to 50vw in css) if frame is visible
 *      lineThickness: {number} - the thickness of the countdown circle line
 *      width {number} - width of the app window, derived from 'size', & 'scaledBlur'
 *      height {number} - height of the app window derived from 'size', 'settingsOpen', 'settingsHeight', & 'scaledBlur'
 *
 *      ----- GENERAL -----
 *      settings {SettingsObject} - object loaded and saved to settings.json, populating values for all relevant stores
 *      stayOnTop {boolean} - whether or not the app should stay on top of all other windows
 *
 *
 * FUNCTIONS:
 *      listSoundFileNames (){string[]} - returns array of file names of all .mp3 and .wav files in the sounds folder
 *      loadSettings (){SettingsObject} - loads and returns settings.json file and sets individual stores accordingly
 *      saveSettings (){Promise<boolean>} - saves settings and returns resulting status
 *      playSound (fileName: string){} - plays the sound file given if valid
 */

import {derived, get, Readable, Writable, writable} from "svelte/store";
import {cloneObject, compareNumericStrings} from "../utils/utils"
import Color from "color";

const fs = require("fs");
const path = require("path");


//----------------------------------------------------------------------------------------------------------------------
//   INTERFACES & TYPES
//----------------------------------------------------------------------------------------------------------------------

// Selection of 3 sound files by trigger type: 'start', 'next', & 'end'
export interface SoundSelectionSetting {
    start: string,
    next: string,
    end: string
}

// Valid settings tab labels
export type SettingsTabLabel = ('style' | 'sound' | 'intervals');

// Contains all fields saved to & loaded from settings.json
export interface SettingsObject {
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



//----------------------------------------------------------------------------------------------------------------------
//   CONSTANTS
//----------------------------------------------------------------------------------------------------------------------

// Maximum size of the window based off the user's screen size
export const MAX_SIZE = Math.min(window.screen.height, window.screen.width);

// Keyboard characters that map to an item in favorites
export const FAVORITES_KEY_MAP = {
    set: {
        'Q': 0,
        'W': 1,
        'E': 2,
        'R': 3,
        'T': 4
    },
    load: {
        "!": 0,
        "@": 1,
        "#": 2,
        "$": 3,
        "%": 4
    }
};

export const THEMES = {
    "transparent": "transparent",
    "dark": "#202020",
    "light": "white",
};



//----------------------------------------------------------------------------------------------------------------------
//   INTERFACE STORES
//----------------------------------------------------------------------------------------------------------------------

// Input element for the timer
export const inputRef: Writable<HTMLElement> = writable(null);

// Whether or not the favorites numbers on the ui should be visible
export const showFavorites: Writable<boolean> = writable(false);

// Whether or not the timer is in interval mode
export const intervalMode: Writable<boolean> = writable(false);

// Label of the settings page currently selected
export const settingsTab: Writable<SettingsTabLabel> = writable("style");

// Height of the settings tray (bound to the settings container)
export const settingsHeight: Writable<number> = writable(0);

// Whether the settings tray is open or not
export const settingsOpen: Writable<boolean> = writable(false);

// Index of the favorite setting currently selected, or null of none is
export const currentFavInd: Writable<number> = writable(null);

// index of the favorite interval setting currently selected, or null of none is
export const currentFavInterval: Writable<number> = writable(null);

// Shhhhh... its for the easter eggs
export const meme: Writable<string> = writable(null);



//----------------------------------------------------------------------------------------------------------------------
//   APP AUDIO
//----------------------------------------------------------------------------------------------------------------------

// Global app audio instance
const audio = new Audio();

// Volume of the app
export const volume = writable(0);

/** Returns array of file names of all mp3 and wav files in the sounds folder */
export const listSoundFileNames = (): string[] => {
    const files = fs.readdirSync(path.join(__dirname, "/sounds/"))
        .filter(name => name.includes(".wav") || name.includes(".mp3"));
    files.sort(compareNumericStrings);
    return files
};

/** Plays the sound file given if valid */
export const playSound = (filename: string) => {
    if (filename && (filename.includes(".wav") || filename.includes(".mp3"))) {
        audio.pause();
        audio.src = "file://" + __dirname + "/sounds/" + filename;
        audio.volume = get(volume);
        audio.play();
    }
    else {
        console.error("cannot play sound '", filename, "', it must be a valid .wav or .mp3 file.")
    }
};



//----------------------------------------------------------------------------------------------------------------------
//   COLOR STORES
//----------------------------------------------------------------------------------------------------------------------

// Hue value (0 - 360) that should represent what is currently visible
export const hue: Writable<number> = writable(180);

// Main app color, which is retained even when the visible color changes between intervals
export const globalHue: Writable<number> = writable(180);

// Color object of max saturation, derived from the hue store
export const color: Readable<Color> = derived(
    hue, $hue => Color("rgb(255, 0, 0)").rotate($hue)
);

// List of hue values for each of the 5 possible intervals (null if not set by user)
export const intervalColors: Writable<number[]> = writable(
    [null, null, null, null, null]
);



//----------------------------------------------------------------------------------------------------------------------
//   SIZE & SHAPE STORES
//----------------------------------------------------------------------------------------------------------------------

// Size of the timer circle itself
export const size: Writable<number> = writable(300);

// Amount of stylistic blur applied to the UI
export const blur: Writable<number> = writable(0);

// Blur value scaled with size, so it remains visually consistent when the app is resized
export const scaledBlur: Readable<number> = derived(
    [blur, size],
    ([$blur, $size]) => $blur * ($size / 300)
);

// Percentage of borderRadius to apply (100% equivalent to 50vw in css) if frame is visible
export const borderRadius: Writable<number> = writable(0);

// The thickness of the countdown circle line
export const lineThickness: Writable<number> = writable(20);

// Width of the entire window
export const width: Readable<number> = derived(
    [size, scaledBlur],
    ([$size, $scaledBlur]) => Math.round($size + ($scaledBlur * 7)) + 20
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
);



//----------------------------------------------------------------------------------------------------------------------
//   GENERAL STORES + LOADING & SAVING FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/** Loads & returns settings.json file and sets individual stores accordingly
 * @return {SettingsObject} - object containing all settings items
 */
const loadSettings = (): SettingsObject => {
    const settingsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "./settings.json"))
    );

    // Handling missing sound files
    const soundFiles = listSoundFileNames();
    for (let soundName of Object.keys(settingsData.sounds)) {
        const found = soundFiles.includes(settingsData.sounds[soundName]);
        if (!found) {
            settingsData.sounds[soundName] = soundFiles[0];
        }
    }

    const cloned = cloneObject(settingsData) as SettingsObject;

    // set all individual stores with loaded values
    hue.set(cloned.hue);
    globalHue.set(cloned.hue);
    size.set(cloned.size);
    blur.set(cloned.blur);
    borderRadius.set(cloned.frame);
    volume.set(cloned.volume);
    lineThickness.set(cloned.lineThickness);

    return cloned;
};

export const settings: Writable<SettingsObject> = writable(loadSettings());

export const stayOnTop: Readable<boolean> = derived(
    settings,
        $settings => $settings.alwaysOnTop
);

/** Saves settings and returns resulting status
 * @return {Promise<boolean>} - status of save attempt
 */
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
    });
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
        await fs.writeFileSync(
            path.join(__dirname, "./settings.json"), stringSettings
        );
    } catch (e) {
        console.error(e);
        return false;
    }
    return true
};



