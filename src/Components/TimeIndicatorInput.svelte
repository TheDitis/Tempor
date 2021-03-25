<script>
    import {remainingTime, runState, time} from "../stores/timerState";

    const formatTime = (msTime) => {
        if (msTime <= 0) {
            return "00:00";
        }
        const date = new Date(msTime);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const hoursStr = hours > 0 ? hours.toString() + ":" : "";
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
        const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
        return `${hoursStr}${minutesStr}:${secondsStr}`;
    }

    const blinkInterval = 1000  // one second blinks
    $: opacity = $runState === "paused" ? (
        $time % blinkInterval > blinkInterval / 3 ?
            1 : 0
    ) : 1




</script>

<div class="TimeIndicatorInput" style="--opacity: {opacity}">
    <h1 class="time">{formatTime($remainingTime)}</h1>
</div>

<style>
    .TimeIndicatorInput {
        position: absolute;
    }
    .time {
        /*position: absolute;*/
        color: var(--color);
        font-size: var(--fontSize);
        font-family: var(--fontFamily);
        opacity: var(--opacity);
        /*filter: blur(1px);*/
    }
</style>