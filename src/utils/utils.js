import {Duration} from "luxon";

export const msToHrsMinsSecs = (msTime) => {
    let duration = Duration.fromObject({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: msTime
    }).normalize();
    duration = duration.toObject()
    return duration
}

export const formatTimeMs = (msTime) => {
    if (msTime <= 0) {
        return "00:00:00";
    }
    const duration = msToHrsMinsSecs(msTime)
    return formatTime(duration.hours, duration.minutes, duration.seconds)
}

export const formatTime = (hours, minutes, seconds) => {
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}


export const arraysEqual = (arr1, arr2) => {
    if (!(arr1.length === arr2.length)) return false;
    for (let i in arr1) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}