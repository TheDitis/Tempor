/**
 * file: utils.ts
 * author: Ryan McKay
 *
 * This file contains miscellaneous functions used throughout the app
 *
 * TYPES:
 *      @type DurationObject - object representing a duration of time, with 'hours', 'minutes', & 'seconds' fields
 *
 * FUNCTIONS:
 *      ----- GENERAL -----
 *      cloneObject (obj: object){object} - returns a true, deep clone of obj
 *      compareNumericStrings = (a: string, b: string){number} - compares numeric strings which contain numbers, so that
 *          arrays of filenames can be sorted by the numbers, rather than having 1, 10, and 100 all next to each other
 *      arraysEqual (arr1: [], arr2: []{boolean} - shallow, element-wise equality checking for 2 arrays
 *
 *      ----- TIME -----
 *      msToHrsMinsSecs (msTime: number){DurationObject} - converts time in ms into a DurationObject (see above)
 *      formatTime (duration: DurationObject){string} - converts duration into string representation in 'hh:mm:ss' form
 *      formatTimeMs (msTime: number, roundUpFormat: boolean){string} - converts time in ms into a string representation
 *          of the time to be displayed on the timer UI in the format of 'hh:mm:ss'
 */

import {Duration} from "luxon";
const v8 = require("v8");


//----------------------------------------------------------------------------------------------------------------------
//   INTERFACES & TYPES
//----------------------------------------------------------------------------------------------------------------------

export interface DurationObject {
    hours: number,
    minutes: number,
    seconds: number
}



//----------------------------------------------------------------------------------------------------------------------
//   GENERAL UTILITY FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/**
 * Deep clone an object
 * @param obj {object} - the object you want a deep copy of
 * @return {object} - a true, deep clone of the object
 */
export const cloneObject = (obj: object): object => (
    v8.deserialize(v8.serialize(obj))
);

/**
 * Compares strings containing numbers. Passed to sort function for filenames
 * so that the numbers are sorted correctly, rather than by starting character
 * @param a {string} - the string to compare with string b
 * @param b {string} - the other string, to be compared with string a
 * @return {number} - negative if b should go before a, positive if a should go
 *      before b, or 0 if they are equivalent
 */
export const compareNumericStrings = (a: string, b: string): number => (
    a.localeCompare(
        b,
        navigator.languages[0] || navigator.language,
        {numeric: true, ignorePunctuation: true}
    )
)

/**
 * Shallow equality checking for 2 arrays. Checks shallow equality of each
 * element of arr1 and arr2 and returns false if any pair is not equal (using
 * strict equality)
 * @param arr1 {[]} - array 1, to be compared element-wise with arr2
 * @param arr2 {[]} - array 2, to be compared element-wise with arr1
 * @return {boolean} - true if equal length & arr1[i] === arr2[i] for each i
 */
export const arraysEqual = (arr1: any[], arr2: any[]): boolean => {
    if (!(arr1.length === arr2.length)) return false;
    for (let i in arr1) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}



//----------------------------------------------------------------------------------------------------------------------
//   TIME UTILITY FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/**
 * Converts time in ms into a luxon Duration object, normalizes it, and then
 * returns a DurationObject (contains 'hours', 'minutes', and 'seconds')
 * @param msTime {number} - the time in milliseconds to convert
 * @return {DurationObject} - msTime converted to hours, minutes, & seconds
 */
export const msToHrsMinsSecs = (msTime: number): DurationObject => {
    let duration = Duration.fromObject({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: msTime
    }).normalize();
    return  duration.toObject();
}

/**
 * Converts duration into a string representation in 'hh:mm:ss' format
 * @param duration {DurationObject} - time you want a string representation of
 * @return {string} a string representation of 'duration' in 'hh:mm:ss' format
 */
export const formatTime = (duration: DurationObject): string => {
    const {hours, minutes, seconds} = duration;
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

/**
 * Converts time in ms into a string representation of the time to be displayed
 * on the timer UI in the format of 'hh:mm:ss'
 * @param msTime {number} - time in milliseconds to convert
 * @param roundUpFormat {boolean} - if true, the time will be rounded up rather
 *      than down so that 0 time isn't displayed until the time runs out fully
 * @return {string} - the formatted time in the form of 'hh:mm:ss'
 */
export const formatTimeMs = (
    msTime: number,
    roundUpFormat: boolean = false
): string => {
    if (msTime <= 0) {
        return "00:00:00";
    }
    if (roundUpFormat) {
        msTime += 995  // 5ms less to prevent higher number flashing on start
    }
    const duration = msToHrsMinsSecs(msTime)
    return formatTime(duration)
}


