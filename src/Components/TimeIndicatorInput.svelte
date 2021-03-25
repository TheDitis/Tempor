<script>
    import {remainingTime} from "../stores/timerState";

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


</script>

<h1 class="time">{formatTime($remainingTime)}</h1>



<style>
    .time {
        position: absolute;
        color: var(--color);
        font-size: var(--fontSize);
        font-family: var(--fontFamily);
    }
</style>