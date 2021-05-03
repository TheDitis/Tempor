<script>
    import {focused, remainingTime, runState, time} from "../../../stores/timerState";
    import TimeInput from "./TimeInput.svelte";
    import {formatTimeMs} from "../../../utils/utils";


    /// this makes the timer blink when paused
    const blinkInterval = 1000  // one second blinks
    $: opacity = $runState === "paused" ? (
        $time % blinkInterval > blinkInterval / 3 ?
            1 : 0.3
    ) : 1

    const handleFocus = (e) => {
        focused.set(true);
    }

</script>



<div
    class="TimeIndicator"
    style="--opacity: {opacity}"
    on:click|stopPropagation={handleFocus}
>
    {#if $focused}
        <TimeInput/>
    {:else}
        <h1 class="time">{formatTimeMs($remainingTime, true)}</h1>
    {/if}
</div>



<style>
    .TimeIndicator {
        position: absolute;
        filter: blur(calc(var(--textBlur) * 1px));
        user-select: none;
        z-index: 50;
        padding: 0;
    }
    h1 {
        padding: 0;
        margin: 0;
        color: var(--color);
        font-size: var(--fontSize);
        font-family: var(--fontFamily);
    }
    .time {
        opacity: var(--opacity);
    }
</style>