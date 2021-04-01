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
        favKeyMap
    } from "../../stores/appState";
    import {
        duration,
        focused,
        intervalDurations,
        intervalIndex,
        runState,
        tempDuration
    } from "../../stores/timerState";

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
        if (!$focused) return
        focused.set(false);
        if (!$intervalMode) {
            const tempFavorites = $settings.favorites;
            // if this value isn't already in a favorite slot
            if (!tempFavorites.includes($tempDuration)) {
                tempFavorites[favKeyMap.set[key]] = $tempDuration > 0 ? $tempDuration : null;
                settings.set({...$settings, favorites: tempFavorites})
                currentFavInd.set(favKeyMap.set[key]);
            }
        }
        // in interval mode
        else {
            const tempFavorites = $settings.favoriteIntervals;
            const tempFavoriteColors = $settings.favoriteIntervalColors;
            tempFavorites[favKeyMap.set[key]] = $intervalDurations;
            tempFavoriteColors[favKeyMap.set[key]] = $intervalColors;
            settings.set({
                ...$settings,
                favoriteIntervals: tempFavorites,
                favoriteIntervalColors: tempFavoriteColors
            });
            currentFavInterval.set(favKeyMap.set[key]);
        }
        await tick();
        focused.set(true);
        if ($inputRef) $inputRef.focus();
    }

    const loadFavorite = async (key) => {
        const favInd = favKeyMap.load[key];
        /// IF NOT IN INTERVAL MODE:
        if (!$intervalMode) {
            const setting = $settings.favorites[favInd]
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
            case "i":
            case "p":
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