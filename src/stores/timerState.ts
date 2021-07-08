/**
 * file: timerState.ts
 * author: Ryan McKay
 *
 * This file contains the svelte stores relevant to timekeeping.
 *
 * TYPES:
 *      @type RunState ('running' | 'paused' | 'stopped' | 'finished') - represents the state of the timer
 *          'running' - the timer is (or should be) actively counting down
 *          'paused' - the timer was running, but has been interrupted by the user
 *          'stopped' - the initial state, there is no remaining time pending
 *          'finished' - the timer has run and reached 0, and is ready to run again with the same duration(s)
 *
 *
 * STORES:
 *      ----- CORE -----
 *      focused {boolean} - whether the time input is selected or not
 *      runState {RunState} - the current state of the timer. See options above
 *      time {number} - the current time in ms, updated every 10ms
 *      pausedRemainingTime {number} - set and displayed when runState is set to 'paused'
 *      startTime {number} - set to the value of 'time' at the point the timer starts counting down
 *      tempDuration {number} - set by the input of the time input ref as an intermediary to 'duration'
 *      duration {number} - total duration of the timer. Set to value of tempDuration when timer is started
 *      remainingTime {number} - the time left on the timer, which is displayed on the UI
 *
 *      ----- INTERVAL MODE -----
 *      intervalDurations {number[]} - list of durations for timer intervals. takes place of 'tempDuration'
 *      intervalIndex {number} - the index of the currently displayed/selected interval
 *      playingIntervalIndex {number} - the index of the currently playing interval
 *
 *
 * FUNCTIONS:
 *      handleEnd - called in the 'remainingTime' update handler when the remaining duration reaches 0. Handles cases
 *          for both standard and interval modes, and dictates what happens next based on the relevant store values
 */

import {derived, get, readable, writable, Readable, Writable} from "svelte/store";
import {globalHue, hue, intervalColors, intervalMode, playSound, settings} from "./appState";


//----------------------------------------------------------------------------------------------------------------------
//   INTERFACES & TYPES
//----------------------------------------------------------------------------------------------------------------------

// Represents the state of the timer. See entry at top of file for details on each option
type RunState = ('running' | 'paused' | 'stopped' | 'finished')



//----------------------------------------------------------------------------------------------------------------------
//   CORE TIMER STATE
//----------------------------------------------------------------------------------------------------------------------

// Whether the time input is selected
export const focused: Writable<boolean> = writable(true);

// The string representation of the current state of the timer (running, paused, stopped, or finished)
export const runState: Writable<RunState> = writable("finished");

// The current time in ms, updated every 10 ms
export const time: Readable<number> = readable(
    Date.now(),
    (set) => {
        const interval = setInterval(() => {
            set(Date.now());
        }, 10);

        return () => clearInterval(interval);
    }
)

// Set and displayed when timer is in paused state
export const pausedRemainingTime: Writable<number> = writable(0);

// Set to the time that the counter starts counting down
export const startTime: Writable<number> = writable(Date.now());

// Set when a new time value is entered, so that it is ready to go when the user hits play
export const tempDuration: Writable<number> = writable(0);

// Total duration of the timer
export const duration: Writable<number> = writable(0);

// Time displayed on UI
export const remainingTime: Readable<number> = derived(
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



//----------------------------------------------------------------------------------------------------------------------
//   INTERVAL MODE STORES
//----------------------------------------------------------------------------------------------------------------------

// List of 'tempDuration' values for set timer intervals
export const intervalDurations: Writable<number[]> = writable([0, 0])

// Index of the currently displayed/selected interval
export const intervalIndex: Writable<number> = writable(0);

// Index of the currently playing interval
export const playingIntervalIndex: Writable<number> = writable(0);



//----------------------------------------------------------------------------------------------------------------------
//   STATE CHANGE HANDLERS
//----------------------------------------------------------------------------------------------------------------------

// Runs when remainingTime reaches 0
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


