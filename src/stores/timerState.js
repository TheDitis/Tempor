import {readable, derived, writable, get} from "svelte/store";

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


// sets the duration, start time, and run-state of the timer
export const start = () => {
    const tempDur = get(tempDuration);
    if (tempDur !== 0) {
        startTime.set(Date.now())
        duration.set(tempDur);
        // tempDuration.set(0);
        focused.set(false);
        runState.set("running");
        const sound = new Audio("file://" + __dirname + "/sounds/startSound.wav");
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
    runState.set("running");
}

// runs when the time runs out
export const handleEnd = () => {
    runState.set("finished");
    const sound = new Audio("file://" + __dirname + "/sounds/endSound.wav");
    sound.play();
    // tempDuration.set()
    focused.set(true)
}



