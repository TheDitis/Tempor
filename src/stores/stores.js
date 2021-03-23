import {readable, derived, writable} from "svelte/store";
import fs from "fs";
fs.watch("./state.json", (event, filename) => {
    console.log("event: ", event)
})


const time = readable(Date.now(), (set) => {
    const interval = setInterval(() => {
        set(Date.now());
    }, 10);

    return () => clearInterval(interval);
})


export const start = writable(Date.now());

export const duration = writable(10000);


export const remainingTime = derived(
    [time, duration, start],
    ([$time, $duration, $start]) => (
        $duration - ($time - $start)
    )
);

// export const finished = derived()

export const circleAngle = derived(
    [remainingTime, duration],
    ([$remainingTime, $duration]) => (
        $remainingTime > 0 ? ($remainingTime * 360 / $duration) % 360 : 0
    )
)