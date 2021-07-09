<script lang="ts">
    /**
     * file: MasterControls.svelte
     * author: Ryan McKay
     *
     * This file contains all of the keyboard event handling logic
     */
    import {tick, createEventDispatcher} from "svelte";
    import {
        THEMES,
        currentFavInd,
        currentFavInterval,
        FAVORITES_KEY_MAP,
        globalHue,
        hue,
        inputRef,
        intervalColors,
        intervalMode,
        settings,
        settingsOpen,
        settingsTab,
        showFavorites,
    } from "../../stores/appState";
    import type {SettingsObject} from "../../stores/appState.ts";
    import {duration, focused, intervalDurations, intervalIndex, runState, tempDuration} from "../../stores/timerState";

    const dispatch = createEventDispatcher();

    /** Changes the theme of the app to the next in the list of options (see appState.ts) */
    const cycleTheme = () => {
        const themeOptions = Object.keys(THEMES);
        const currentInd = themeOptions.indexOf($settings.theme);
        const nextTheme = themeOptions[(currentInd + 1) % themeOptions.length];
        settings.update(opts => ({...opts, theme: nextTheme}));
        if ($inputRef) $inputRef.focus();
    };

    /** Saves the current configuration to the favorites slot that corresponds to the given key code
     * @param key {string} - the char of the key pressed that has a mapping to an item in favorites (see appState.ts)
     */
    const setFavorite = async (key: string) => {
        if (!$focused) return;

        // find the index the user is trying to access
        const favoriteIndex = FAVORITES_KEY_MAP.set[key];
        focused.set(false);

        // IF IN NORMAL TIMER MODE
        if (!$intervalMode) {
            const favorites = $settings.favorites;
            // if we don't have a copy of this favorite already:
            if (!favorites.includes($tempDuration)) { // || soundsDifferent) {
                favorites[favoriteIndex] = $tempDuration > 0 ? $tempDuration : null;
                settings.set({
                    ...$settings,
                    favorites: favorites,
                } as SettingsObject);
                currentFavInd.set(favoriteIndex);
            }
        }

        // IF IN INTERVAL MODE
        else {
            const favorites = $settings.favoriteIntervals;
            const favoriteColors = $settings.favoriteIntervalColors;
            if ($intervalDurations.some(val => val > 0)) {
                favorites[favoriteIndex] = $intervalDurations;
                favoriteColors[favoriteIndex] = $intervalColors;
                currentFavInterval.set(favoriteIndex);
            }
            else {
                favorites[favoriteIndex] = null;
                favoriteColors[favoriteIndex] = null;
            }

            settings.set({
                ...$settings,
                favoriteIntervals: favorites,
                favoriteIntervalColors: favoriteColors,
            } as SettingsObject);
        }

        await tick();
        focused.set(true);
        if ($inputRef) $inputRef.focus();
    };

    /** Loads the configuration that 'key' maps to if there is one saved in that slot
     * @param key {string} - the char of the key pressed that has a mapping to an item in favorites (see appState.ts)
     */
    const loadFavorite = async (key: string) => {
        const favInd = FAVORITES_KEY_MAP.load[key];

        /// IF NOT IN INTERVAL MODE:
        if (!$intervalMode) {
            const setting = $settings.favorites[favInd];
            const favSounds = $settings.favoritesSounds[favInd];
            // loadSounds(favSounds);
            if (!!setting && setting !== $tempDuration) {
                if ($runState === "running") {
                    dispatch('pause');
                }
                focused.set(true);
                tempDuration.set(setting);
                currentFavInd.set(favInd);
            }
        }
        /// IF IN INTERVAL MODE:
        else {
            const timeSetting = $settings.favoriteIntervals[favInd];
            let colorSetting = $settings.favoriteIntervalColors[favInd];
            // const favSounds = $settings.favoriteIntervalSounds[favInd];
            if (colorSetting === null) {
                colorSetting = [null, null, null, null, null];
            }
            console.log("1: ", colorSetting)
            if (!!timeSetting) {
                focused.set(false);
                if ($runState !== "running") {
                    dispatch('pause');
                }
                intervalIndex.set(0);
                intervalDurations.set(timeSetting);
                intervalColors.set(colorSetting);
                currentFavInterval.set(favInd);
                // loadSounds(favSounds);
                await tick();
                const intervalColor = $intervalColors[$intervalIndex];
                if (intervalColor !== null) hue.set(intervalColor);
                else hue.set($globalHue);

                focused.set(true);
            }
        }
    };

    /** The primary event handler of the app. Decides what to do based on which key is pressed and in what context
     * @param e {KeyboardEvent} - the event passed by the listener
     */
    const handleKeyDown = async (e: KeyboardEvent) => {
        const key = e.key;
        if (e.repeat) {
            return;
        }
        switch (key) {
            /// MAIN PAUSE/PLAY CONTROLS
            case " ":
                if ($runState === "running") {
                    dispatch('pause');
                }

                else if (
                    (
                        // not paused or running
                        $runState === "finished"
                        // or you just selected a favorite
                        || ($currentFavInd !== null && $tempDuration !== $duration)
                    )
                    && ($intervalMode || $tempDuration)
                ) {
                    dispatch('start');
                }
                else if ($runState === "paused") {
                    dispatch('resume');
                }
                break;
            case "Enter":
                if ($focused && (($intervalMode && $intervalDurations.every(v => v)) || $tempDuration)) {
                    dispatch('start');
                }
                break;
            case "Escape":
                if ($focused) {
                    focused.set(false);
                }
                break;
            case "Tab":
                // prevents focus being shifted away from the input as soon as it renders
                e.preventDefault();
                e.stopPropagation();
                focused.set(!$focused);
                break;

            // switch to interval (or Pomodoro) mode
            case "P":
            case "p":
                if (!($runState === "running")) {
                    // set times and colors to pomodoro values (25 min, 5 min) (red, green)
                    intervalDurations.set([1500000, 300000]);
                    intervalColors.set([18.6, 77.2, null, null, null]);
                    intervalIndex.set(0);
                    if ($intervalMode) {
                        // if already in interval mode, we don't want to run the 'i' block since it will take us out of interval mode
                        // so we do the basic things we need to do to have it update here and then break.
                        focused.set(false);
                        await tick();
                        hue.set($intervalColors[$intervalIndex]);
                        focused.set(true);
                        runState.set("finished");
                        break;
                    }
                }
                break;
            case "I":
            case "i":
                if (!($runState === "running")) {
                    runState.set("finished");
                    focused.set(false);
                    if ($intervalMode) {
                        hue.set($globalHue);
                    }
                    else if ($intervalColors[$intervalIndex] !== null) {
                        hue.set($intervalColors[$intervalIndex])
                    }
                    if ($settingsTab === "intervals") {
                        settingsTab.set("style");
                    }
                    intervalMode.set(!$intervalMode);
                    currentFavInd.set(null);
                    currentFavInterval.set(null);
                    await tick();
                    focused.set(true);
                }
                break;

            /// FAVORITES CONTROLS:
            case "Shift":
                showFavorites.set(true);
                break;
            // keys for setting favorites
            case "Q":
            case "W":
            case "E":
            case "R":
            case "T":
                // prevent accidental favorite setting with caps lock on
                if (e.shiftKey) {
                    setFavorite(key);
                }
                break;
            // keys for loading favorites
            case "!":
            case "@":
            case "#":
            case "$":
            case "%":
                loadFavorite(key);
                break;

            /// WINDOW SIZING CONTROLS:
            case "-":
            case "_":
                dispatch('makeSmaller');
                break;
            case "+":
            case "=":
                dispatch('makeBigger');
                break;

            /// INTERVAL MODE CONTROLS:
            // navigating between existing cycles
            case "ArrowLeft":
            case "ArrowRight":
                e.preventDefault();
                e.stopPropagation();
                if ($intervalMode && $runState !== "running") {
                    focused.set(false);
                    const direction = key === "ArrowLeft" ? -1 : 1;
                    intervalIndex.update(ind => {
                        let newInd = (ind + direction) % $intervalDurations.length;
                        if (newInd < 0) newInd = $intervalDurations.length - 1;
                        return newInd
                    });
                    await tick();
                    const intervalColor = $intervalColors[$intervalIndex];
                    if (intervalColor !== null) {
                        hue.set(intervalColor)
                    }
                    else {
                        hue.set($globalHue)
                    }
                    focused.set(true);
                    if ($inputRef) $inputRef.focus();
                    await tick();
                }
                break;
            // adding/subtracting cycles
            case "ArrowUp":
                e.preventDefault();
                e.stopPropagation();
                if ($intervalMode && $intervalDurations.length < 5 && $runState !== "running") {
                    focused.set(false);
                    if ($currentFavInterval !== null) {
                        currentFavInterval.set(null);
                    }
                    intervalDurations.set([...$intervalDurations, 0]);
                    intervalIndex.set($intervalDurations.length - 1);
                    hue.set($globalHue);
                    await tick();
                    focused.set(true);
                    if ($inputRef) $inputRef.focus();
                }
                break;
            case "ArrowDown":
                if ($intervalMode && $intervalDurations.length > 1 && $runState !== "running") {
                    focused.set(false);
                    if ($currentFavInterval !== null) {
                        currentFavInterval.set(null);
                    }
                    if ($intervalIndex === $intervalDurations.length - 1) {
                        intervalIndex.update(ind => ind - 1);
                    }
                    intervalDurations.update(arr => {
                        arr.pop();
                        return arr;
                    });
                    await tick();
                    const intervalColor = $intervalColors[$intervalIndex];
                    if (intervalColor !== null) {
                        hue.set(intervalColor);
                    }
                    else {
                        hue.set($globalHue);
                    }
                    focused.set(true);
                    if ($inputRef) $inputRef.focus();
                }
                break;
            case "s":
            case "S":
                settingsOpen.set(!$settingsOpen);
                break;
            case "b":
            case "B":
                cycleTheme();
                break;
            case "d":
            case "D":
                if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
                    dispatch('devtools');
                    showFavorites.set(false);
                }
                break;
            default:
                break;
        }
    };

    /** Keyup listener. Currently only used to hide favorites
     * @param e {KeyboardEvent} - the event passed by the window listener
     */
    const handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const key = e.key;
        switch (key) {
            case "Shift":
                showFavorites.set(false);
                break;
            default:
                break;
        }

    }
</script>



<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp}/>