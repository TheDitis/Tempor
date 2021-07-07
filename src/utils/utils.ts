import {Duration} from "luxon";
const v8 = require("v8");

interface DurationObject {
    hours: number,
    minutes: number,
    seconds: number
}

export const cloneObject = (obj) => v8.deserialize(v8.serialize(obj));

export const compareNumericStrings = (a: string, b: string): number => (
    a.localeCompare(
        b,
        navigator.languages[0] || navigator.language,
        {numeric: true, ignorePunctuation: true}
    )
)

export const msToHrsMinsSecs = (msTime: number): DurationObject => {
    let duration = Duration.fromObject({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: msTime
    }).normalize();
    return  duration.toObject();
}

export const formatTimeMs = (msTime: number, roundUpFormat: boolean = false): string => {
    if (msTime <= 0) {
        return "00:00:00";
    }
    if (roundUpFormat) {
        msTime += 1000
    }
    const duration = msToHrsMinsSecs(msTime)
    return formatTime(duration.hours, duration.minutes, duration.seconds)
}

export const formatTime = (hours: number, minutes: number, seconds: number): string => {
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}


export const arraysEqual = (arr1: any[], arr2: any[]): boolean => {
    if (!(arr1.length === arr2.length)) return false;
    for (let i in arr1) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}