<script>
    import {tick} from "svelte";
    import {
        currentFavInd,
        currentFavInterval,
        intervalMode,
        settings,
        showFavorites,
        intervalColors,
        hue,
        globalHue,
        settingsTab,
        inputRef,
        favKeyMap,
        globalSounds
    } from "../../stores/appState";
    import {
        duration,
        focused,
        intervalDurations,
        intervalIndex,
        runState,
        tempDuration
    } from "../../stores/timerState";
    import _ from "lodash";
    import {arraysEqual} from "../../utils/utils";


    export let makeBigger;
    export let makeSmaller;
    export let start, pause, resume;


    // runs when the time runs out
    export const handleEnd = () => {
        runState.set("finished");
        const sound = new Audio("file://" + __dirname + "/sounds/endSound.wav");
        sound.play();
        focused.set(true)
    }


    const setFavorite = async (key) => {
        if (!$focused) return;

        // const getFavSounds = (omitNext = false) => {
        //     console.log("globalSounds: ", $globalSounds);
        //     console.log("settings.sounds: ", $settings.sounds)
        //     if (
        //         $settings.sounds.start !== $globalSounds.start
        //         || $settings.sounds.end !== $globalSounds.end
        //         || (!omitNext && $settings.sounds.next !== $globalSounds.next)
        //     ) {
        //         const sounds = {...($settings.sounds)}
        //         if (omitNext) delete sounds.next;
        //         return sounds
        //     } else {
        //         return null;
        //     }
        // }

        const favoriteIndex = favKeyMap.set[key];
        focused.set(false);
        // IN NORMAL TIMER MODE
        if (!$intervalMode) {
            const favorites = $settings.favorites;
            // const favoritesSounds = $settings.favoritesSounds;
            // // if this value isn't already in a favorite slot
            // const soundsDifferent = favoritesSounds[favoriteIndex] !== null && (
            //     $settings.sounds.start !== favoritesSounds[favoriteIndex].start
            //     || $settings.sounds.end !== favoritesSounds[favoriteIndex].end
            // )
            // if we don't have a copy of this favorite already:
            if (!favorites.includes($tempDuration)) { // || soundsDifferent) {
                favorites[favoriteIndex] = $tempDuration > 0 ? $tempDuration : null;
                // /// set the sounds for the favorite
                // const tempSounds = getFavSounds(true);
                // console.log("tempSounds: ", tempSounds);
                // favoritesSounds[favoriteIndex] = tempSounds


                settings.set({
                    ...$settings,
                    favorites: favorites,
                    // favoritesSounds
                })
                currentFavInd.set(favoriteIndex);
            }
        }
        // IN INTERVAL MODE
        else {
            const favorites = $settings.favoriteIntervals;
            const favoriteColors = $settings.favoriteIntervalColors;
            // const favoriteSounds = $settings.favoriteIntervalSounds;
            favorites[favoriteIndex] = $intervalDurations;
            favoriteColors[favoriteIndex] = $intervalColors;
            // favoriteSounds[favoriteIndex] = getFavSounds();
            settings.set({
                ...$settings,
                favoriteIntervals: favorites,
                favoriteIntervalColors: favoriteColors,
                // favoriteIntervalSounds: favoriteSounds
            });
            currentFavInterval.set(favoriteIndex);
        }
        await tick();
        focused.set(true);
        if ($inputRef) $inputRef.focus();
    }

    const loadFavorite = async (key) => {
        const favInd = favKeyMap.load[key];

        // const loadSounds = (favSounds) => {
        //     let sounds;
        //     if (favSounds !== null) {
        //         sounds = {...($settings.sounds)};
        //         sounds.start = favSounds.start;
        //         sounds.end = favSounds.end;
        //         if ("next" in favSounds) sounds.next = favSounds.next;
        //     }
        //     else {
        //         sounds = $globalSounds;
        //     }
        //     settings.set({...$settings, sounds});
        // }

        /// IF NOT IN INTERVAL MODE:
        if (!$intervalMode) {
            const setting = $settings.favorites[favInd];
            const favSounds = $settings.favoritesSounds[favInd];
            // loadSounds(favSounds);
            if (!!setting && setting !== $tempDuration) {
                if ($runState === "running") {
                    pause();
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
            if (!!timeSetting) {
                focused.set(false);
                if ($runState !== "running") {
                    pause();
                }
                intervalIndex.set(0);
                intervalDurations.set(timeSetting);
                intervalColors.set(colorSetting);
                currentFavInterval.set(favInd);
                // loadSounds(favSounds);
                await tick();
                const intervalColor = $intervalColors[$intervalIndex];
                if (intervalColor) hue.set(intervalColor);
                else hue.set($globalHue);

                focused.set(true);
            }
        }
    }



    // $: {updateColor($intervalColors)}

    const handleKeyDown = async (e) => {
        const key = e.key;
        if (e.repeat) return;
        console.log("key event: ", key)
        switch (key) {
            /// MAIN PAUSE/PLAY CONTROLS
            case " ":
                if ($runState === "running") pause();

                else if (
                    (
                        // not paused or running
                        $runState === "finished"
                        // of you just selected a favorite
                        || ($currentFavInd !== null && $tempDuration !== $duration)
                    )
                    && ($intervalMode || $tempDuration)
                ) {
                    start();
                }
                else if ($runState === "paused") resume();
                break;
            case "Enter":
                if ($focused && (($intervalMode && $intervalDurations.every(v => v)) || $tempDuration)) {
                    start();
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
            case "p":
                if (!($runState === "running")) {
                    // set times and colors to pomodoro values (25 min, 5 min) (red, green)
                    intervalDurations.set([1500000, 300000]);
                    intervalColors.set([18.6, 77.2, null, null, null]);
                    intervalIndex.set(0)
                    if ($intervalMode) {
                        // if already in interval mode, we don't want to run the 'i' block since it will take us out of interval mode
                        // so we do the basic things we need to do to have it update here and then break.
                        focused.set(false)
                        await tick();
                        hue.set($intervalColors[$intervalIndex])
                        focused.set(true);
                        break;
                    }
                }

            case "i":
                if (!($runState === "running")) {
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
                console.log("setting favorite")
                setFavorite(key);
                break;
            // keys for loading favorites
            case "!":
            case "@":
            case "#":
            case "$":
            case "%":
                console.log("loading favorite")
                loadFavorite(key);
                break;

            /// WINDOW SIZING CONTROLS:
            case "-":
                makeSmaller();
                break;
            case "=":
                makeBigger();
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
                    })
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
                    intervalDurations.set([...$intervalDurations, 0])
                    intervalIndex.set($intervalDurations.length - 1)
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
                    })
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
            default:
                break;
        }
    }

    const handleKeyUp = (e) => {
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