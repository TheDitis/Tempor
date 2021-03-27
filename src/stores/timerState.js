import {readable, derived, writable, get} from "svelte/store";
import {settings, intervalMode} from "./appState";


export const focused = writable(true);

// then current time, updated every 10 milliseconds
export const time = readable(Date.now(), (set) => {
    const interval = setInterval(() => {
        set(Date.now());
    }, 10);

    return () => clearInterval(interval);
})

// set when pause is hit and returned by remaining time until resumed
export const pausedRemainingTime = writable(10000);

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
export const intervalDurations = writable([25000, 5000])

// the index of the current interval duration
export const intervalIndex = writable(0)


// sets the duration, start time, and run-state of the timer
export const start = () => {
    const isIntervalMode = get(intervalMode);
    let tempDur;
    if (!isIntervalMode) {
        tempDur = get(tempDuration);
    }
    else {
        const tempIntervalDurations = get(intervalDurations);
        const intervalInd = get(intervalIndex);
        tempDur = tempIntervalDurations[intervalInd];
    }
    if (tempDur !== 0) {
        startTime.set(Date.now())
        duration.set(tempDur);
        focused.set(false);
        runState.set("running");
        const sound = new Audio("file://" + __dirname + "/sounds/sound (2).wav");
        sound.play();
    }
}

// gets the current remaining time and sets the state to 'paused'
export const pause = () => {
    const remTime = get(remainingTime)
    pausedRemainingTime.set(remTime);
    runState.set("paused");
}

// calculates the new relative start-time based on how much time is remaining and sets the state back to running
export const resume = () => {
    const dur = get(duration);
    const remTime = get(pausedRemainingTime)
    startTime.set(Date.now() - (dur - remTime));
    focused.set(false);
    runState.set("running");
}

// runs when the time runs out
export const handleEnd = () => {
    // if not in interval mode
    if (!get(intervalMode)) {
        runState.set("finished");
        const sound = new Audio("file://" + __dirname + "/sounds/sound (1).wav");
        sound.play();
        focused.set(true)
    }
    // if in interval mode
    else {
        const tempDurations = get(intervalDurations);
        const currentInd = get(intervalIndex);
        const nextInd = (currentInd + 1) % tempDurations.length;
        intervalIndex.set(nextInd)
        // if repeatIntervalCycle setting is on or we haven't reached the end of the list:
        if (get(settings).repeatIntervalCycle || nextInd > currentInd) {
            startTime.set(Date.now())
            duration.set(tempDurations[nextInd]);
            focused.set(false);
        }
    }
}



