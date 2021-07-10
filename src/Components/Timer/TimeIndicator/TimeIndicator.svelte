<script lang="ts">
    /**
     * TimeIndicator.svelte
     * author: Ryan McKay
     *
     * This is the displayed time, which contains TimeInput component
     */
    import {intervalMode, size} from "../../../stores/appState";
    import {focused, remainingTime, runState, time} from "../../../stores/timerState";
    import TimeInput from "./TimeInput.svelte";
    import {formatTimeMs} from "../../../utils/utils";

    /// this makes the timer blink when paused
    const blinkInterval = 1000;  // one second blinks
    let opacity: number;
    $: opacity = $runState === "paused" ? (
        ($time % blinkInterval) > (blinkInterval / 3) ? 1 : 0.3
    ) : 1;

    let timeString: string;
    $: timeString = formatTimeMs($remainingTime, true, !$intervalMode);

    /**
     * Returns optimal font-size, dependent on how many units are showing
     * @param timeStr {string} - string representation of the time
     * @param appSize {number} - the size of the app (width)
     * @return {number} the target font size of the time-text
     */
    const calculateTextSize = (timeStr: string, appSize: number): number => {
        const numSegments = (timeStr.match(/:/g) || []).length + 1;
        switch (numSegments) {
            case 1:
                return appSize / 3.5;
            case 2:
                return appSize / 4;
            case 3:
                return appSize / 6;
        }
    };

    $: textSize = calculateTextSize(timeString, $size)

</script>


<div
    class="TimeIndicator"
    style="
        --opacity: {opacity};
        --numsSize: {textSize}px;
    "
    on:click|stopPropagation|preventDefault={() => focused.set(true)}
>
    {#if $focused}
        <TimeInput/>
    {:else}
        <h1 class="time">{timeString}</h1>
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
        font-size: var(--numsSize);
        font-family: var(--fontFamily);
    }

    .time {
        opacity: var(--opacity);
    }
</style>