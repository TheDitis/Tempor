import {Duration} from "luxon";

export const formatTimeMs = (msTime) => {
    if (msTime <= 0) {
        return "00:00:00";
    }
    let duration = Duration.fromObject({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: msTime
    }).normalize();
    duration = duration.toObject()
    return formatTime(duration.hours, duration.minutes, duration.seconds)
}

export const formatTime = (hours, minutes, seconds) => {
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

// export const msToHoursMinsSeconds