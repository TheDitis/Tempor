

import {derived, get, readable, writable} from "svelte/store";
import {globalHue, hue, intervalColors, intervalMode, playSound, settings} from "./appState";


export const focused = writable(true);

// then current time, updated every 10 milliseconds
export const time = readable(Date.now(), (set) => {
    const interval = setInterval(() => {
        set(Date.now());
    }, 10);

    return () => clearInterval(interval);
})

// set when pause is hit and returned by remaining time until resumed
export const pausedRemainingTime = writable(0);

// running, paused, stopped, finished
export const runState = writable("finished");

// set to the time that the counter starts counting down
export const startTime = writable(Date.now());


// this is set when a new time value is entered, so that it is ready to go when play is hit
export const tempDuration = writable(0);

// the desired duration of the timer
export const duration = writable(0);

// calculates the amount of time left if running, the time remaining when paused if paused, or 0 otherwise
export const remainingTime = derived(
    [time, duration, startTime, runState, pausedRemainingTime],
    ([$time, $duration, $start, $runState, $pausedRemainingTime]) => {
        if ($runState === "running") {
            const remTime = $duration - ($time - $start);
            if (remTime <= 0) handleEnd()
            return remTime;
        }
        else if ($runState === "paused") return $pausedRemainingTime;
        else return 0;
    }
);


/// USED IN INTERVAL MODE
// this is used for the temporary durations in interval mode
export const intervalDurations = writable([0, 0])

// the index of the current interval duration
export const intervalIndex = writable(0);

export const playingIntervalIndex = writable(0);


// runs when the time runs out
export const handleEnd = () => {
    const curSettings = get(settings);
    // if not in interval mode
    if (!get(intervalMode)) {
        runState.set("finished");
        playSound(curSettings.sounds.end);
        focused.set(true);
    }
    // if in interval mode
    else {
        const tempDurations = get(intervalDurations);
        const currentInd = get(intervalIndex);
        const nextInd = (currentInd + 1) % tempDurations.length;
        intervalIndex.set(nextInd)
        const intervalColor = get(intervalColors)[nextInd];
        if (intervalColor !== null) {
            hue.set(intervalColor)
        }
        else {
            hue.set(get(globalHue))
        }
        // if repeatIntervalCycle setting is on or we haven't reached the end of the list:
        if (curSettings.repeatIntervalCycle || nextInd > currentInd) {
            startTime.set(Date.now())
            duration.set(tempDurations[nextInd]);
            focused.set(false);
            playSound(curSettings.sounds[nextInd === 0 ? "end" : "next"] )
        }
        else {
            runState.set("finished");
            playSound(curSettings.sounds.end);
            focused.set(true);
        }
    }
}


