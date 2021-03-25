export const formatTimeMs = (msTime) => {
    if (msTime <= 0) {
        return "00:00:00";
    }
    const date = new Date(msTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return formatTime(hours, minutes, seconds)
}

export const formatTime = (hours, minutes, seconds) => {
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}