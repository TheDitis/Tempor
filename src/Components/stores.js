import {readable, derived, writable, get} from "svelte/store";
const fs = require("fs");
const path = require("path");


// const createTimerState = () => {
//     const { subscribe, set, update } = writable({
//         running: false,
//         startTime: Date.now(),
//         duration: 10000
//     });
//
//     return {
//         subscribe,
//         play:
//     }
// }


const time = readable(Date.now(), (set) => {
    const interval = setInterval(() => {
        set(Date.now());
    }, 10);

    return () => clearInterval(interval);
})

export const pausedRemainingTime = writable(10000);

export const runState = writable("running");

export const startTime = writable(Date.now());

export const duration = writable(100000);


export const remainingTime = derived(
    [time, duration, startTime, runState, pausedRemainingTime],
    ([$time, $duration, $start, $runState, $pausedRemainingTime]) => {
        if ($runState === "running") {
            return $duration - ($time - $start);
        }
        else if ($runState === "paused") return $pausedRemainingTime;
        else return 0;
    }
);


export const start = (dur) => {
    startTime.set(Date.now())
    duration.set(dur);
    runState.set("running");
}


export const pause = () => {
    const remTime = get(remainingTime)
    pausedRemainingTime.set(remTime);
    runState.set("paused");
}

export const resume = () => {
    const dur = get(duration);
    const remTime = get(pausedRemainingTime)
    startTime.set(Date.now() - (dur - remTime));
    runState.set("running");
}



pause()

resume()


// export const playing = derived(
//     [remainingTime],
//     ($remainingTime) => $remainingTime > 0
// )

export const circleAngle = derived(
    [remainingTime, duration],
    ([$remainingTime, $duration]) => (
        $remainingTime > 0 ? ($remainingTime * 360 / $duration) % 360 : 0
    )
)


// read settings file:
const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, "./settings.json")))
console.log("settingsData: ", settingsData)
export const settings = writable(settingsData)