<script>
    import {remainingTime, runState, time, focused} from "../../../stores/timerState";
    import TimeInput from "./TimeInput.svelte";
    import {formatTimeMs} from "../../../utils/utils";




    /// this makes the timer blink when paused
    const blinkInterval = 1000  // one second blinks
    $: opacity = $runState === "paused" ? (
        $time % blinkInterval > blinkInterval / 3 ?
            1 : 0
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
        <TimeInput />
    {:else}
        <h1 class="time">{formatTimeMs($remainingTime)}</h1>
    {/if}
</div>



<style>
    .TimeIndicator {
        position: absolute;
        filter: blur(calc(var(--textBlur) * 1px));
        user-select: none;
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