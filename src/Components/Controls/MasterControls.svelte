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
    } from "../../stores/appState";
    import {
        duration,
        focused,
        intervalDurations,
        intervalIndex,
        pausedRemainingTime,
        remainingTime,
        // pause,
        // resume,
        runState,
        startTime,
        // start,
        tempDuration
    } from "../../stores/timerState";
    // import {get} from "svelte/store";

    export let makeBigger;
    export let makeSmaller;
    export let start, pause, resume;


    const updateColor = (deps) => {
        if ($intervalMode && $intervalColors && intervalColors[$intervalIndex]) {
            hue.set($intervalColors[$intervalIndex]);
        }
        else {
            hue.set($globalHue);
        }
    }


    // runs when the time runs out
    export const handleEnd = () => {
        runState.set("finished");
        const sound = new Audio("file://" + __dirname + "/sounds/endSound.wav");
        sound.play();
        focused.set(true)
    }

    const favKeyMap = {
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

    const setFavorite = (key) => {
        if (!$focused) return
        // in normal mode:
        if (!$intervalMode) {
            console.log("setting favorite: ", favKeyMap.set[key], " to ", $tempDuration)
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

    }

    const loadFavorite = async (key) => {
        console.log("loadFavorite called")
        const favInd = favKeyMap.load[key];
        /// IF NOT IN INTERVAL MODE:
        if (!$intervalMode) {
            console.log("loading non-interval setting.")
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
            console.log("loading interval setting ")
            const timeSetting = $settings.favoriteIntervals[favInd];
            let colorSetting = $settings.favoriteIntervalColors[favInd];
            if (colorSetting === null) {
                colorSetting = [null, null, null, null, null];
            }
            console.log("fav setting: ", timeSetting)
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
                // updateColor(null)
                focused.set(true);
            }
        }
    }



    // $: {updateColor($intervalColors)}

    const handleKeyDown = async (e) => {
        const key = e.key;
        if (e.repeat) return;
        // console.log(key)
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
                setFavorite(key);
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
                makeSmaller();
                break;
            case "=":
                makeBigger();
                break;

            /// INTERVAL MODE CONTROLS:
            // navigating between existing cycles
            case "ArrowLeft":
            case "ArrowRight":
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
                }
                break;
            // adding/subtracting cycles
            case "ArrowUp":
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
                        hue.set(intervalColor)
                    }
                    else {
                        hue.set($globalHue)
                    }
                    focused.set(true);
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