import {readable, derived, writable, get} from "svelte/store";

export const focused = writable(false);

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
export const runState = writable("running");

// set to the time that the counter starts counting down
export const startTime = writable(Date.now());

// the desired duration of the timer
export const duration = writable(120000);

// calculates the amount of time left if running, the time remaining when paused if paused, or 0 otherwise
export const remainingTime = derived(
    [time, duration, startTime, runState, pausedRemainingTime],
    ([$time, $duration, $start, $runState, $pausedRemainingTime]) => {
        if ($runState === "running") {
            const remTime = $duration - ($time - $start);
            if (remTime <= 0) runState.set("finished")
            return remTime;
        }
        else if ($runState === "paused") return $pausedRemainingTime;
        else return 0;
    }
);


// sets the duration, start time, and run-state of the timer
export const start = (dur) => {
    startTime.set(Date.now())
    duration.set(dur);
    runState.set("running");
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






