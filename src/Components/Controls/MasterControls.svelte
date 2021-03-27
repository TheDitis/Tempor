<script>
    import {tick} from "svelte";
    import {
        currentFavInd,
        intervalMode,
        settings,
        showFavorites,
    } from "../../stores/appState";
    import {
        duration,
        focused,
        intervalDurations, intervalIndex, pausedRemainingTime, remainingTime,
        // pause,
        // resume,
        runState, startTime,
        // start,
        tempDuration
    } from "../../stores/timerState";
    // import {get} from "svelte/store";

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
        if ($focused) {
            console.log("setting favorite: ", favKeyMap.set[key], " to ", $tempDuration)
            const tempFavorites = $settings.favorites;
            // if this value isn't already in a favorite slot
            if (!tempFavorites.includes($tempDuration)) {
                tempFavorites[favKeyMap.set[key]] = $tempDuration > 0 ? $tempDuration : null;
                settings.set({...$settings, favorites: tempFavorites})
                currentFavInd.set(favKeyMap.set[key]);
            }
        }
    }

    const loadFavorite = (key) => {
        const favInd = favKeyMap.load[key];
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

    const handleKeyDown = async (e) => {
        const key = e.key;
        if (e.repeat) return;
        console.log(key)
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
                intervalMode.set(!$intervalMode);
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
                        let newInd = ind + direction % ($intervalDurations.length);
                        if (newInd < 0) newInd = $intervalDurations.length - 1;
                        return newInd
                    })
                    await tick();
                    focused.set(true);
                }
                break;
            // adding/subtracting cycles
            case "ArrowUp":
                if ($intervalMode && $intervalDurations.length <= 5 && $runState !== "running") {
                    focused.set(false);
                    intervalDurations.set([...$intervalDurations, 0])
                    intervalIndex.set($intervalDurations.length - 1)
                    await tick();
                    focused.set(true);
                }
                break;
            case "ArrowDown":
                if ($intervalMode && $intervalDurations.length > 1 && $runState !== "running") {
                    focused.set(false);
                    if ($intervalIndex === $intervalDurations.length - 1) {
                        intervalIndex.update(ind => ind - 1);
                    }
                    intervalDurations.update(arr => {
                        arr.pop();
                        return arr;
                    })
                    await tick();
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