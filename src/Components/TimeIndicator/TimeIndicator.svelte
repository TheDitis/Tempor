<script>
    import {remainingTime, runState, time, focused} from "../../stores/timerState";
    import TimeInput from "./TimeInput.svelte";

    // let focused = false;
    // $: focused = ($runState !== "paused") ? false : focused;

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

    /// this makes the timer blink when paused
    const blinkInterval = 1000  // one second blinks
    $: opacity = $runState === "paused" ? (
        $time % blinkInterval > blinkInterval / 3 ?
            1 : 0
    ) : 1

    const handleFocus = (e) => {
        e.stopPropagation();
        if ($runState === "paused") focused.set(true);
    }

</script>



<div class="TimeIndicator" style="--opacity: {opacity}" on:click={handleFocus}>
    {#if $focused}
        <TimeInput />
    {:else}
        <h1 class="time">{formatTime($remainingTime)}</h1>
    {/if}
</div>



<style>
    .TimeIndicator {
        position: absolute;
    }
    h1 {
        color: var(--color);
        font-size: var(--fontSize);
        font-family: var(--fontFamily);
    }
    .time {
        opacity: var(--opacity);
    }
</style>