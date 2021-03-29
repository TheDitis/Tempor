<script>
    import {intervalDurations, intervalIndex, time, runState} from "../../../stores/timerState";
    import {fade} from "svelte/transition";

    const blinkRate = 130;
    let opacity

    $:{
        if ($runState === "running") {
            const oneCycle = (2 * Math.PI);
            const curTime = ($time / (blinkRate / oneCycle));
            // get the y position and scale between 0.5 & 1
            opacity = (Math.sin(curTime / oneCycle) + 1) / 4 + 0.5;
        }
        else opacity = 1;
    }
</script>


<div
    class="IntervalNumberIndicator"
    transition:fade={{duration: 100}}
    style="--blink: {opacity};"
>
    {#each $intervalDurations as duration, ind}
        <div class="intervalItem" class:current={$intervalIndex === ind}></div>
    {/each}
</div>


<style>
    .IntervalNumberIndicator {
        position: absolute;
        bottom: calc(var(--size) * 0.43 * 1px);
        display: flex;
        width: calc(var(--size) * 0.65 * 1px);
        filter: blur(calc(var(--textBlur) * 1px));
    }
    .intervalItem {
        width: 100%;
        height: 5px;
        margin: 3px;
        background: var(--color);
        opacity: 0.2;
        transition-property: opacity;
        transition-duration: 500ms;
    }
    .current {
        /*opacity: 1;*/
        opacity: var(--blink);
    }
</style>