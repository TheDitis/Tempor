<script>
    import {intervalDurations, intervalIndex, time, runState} from "../../../stores/timerState";
    import {intervalColors, globalHue} from "../../../stores/appState";
    import {fade} from "svelte/transition";
    import Color from "color";

    const blinkRate = 130;
    let opacity

    $:{
        if ($runState === "running") {
            const oneCycle = (2 * Math.PI);
            const curTime = ($time / (blinkRate / oneCycle));
            // get the y position and scale between 0.5 & 1
            opacity = (Math.sin(curTime / oneCycle) + 1) / 2 + 0.2;
            // console.log("opacity: ", opacity)
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
        <div
            class="intervalItem"
            style="background: {$intervalColors[ind] !== null ? Color('rgb(255, 0, 0)').rotate($intervalColors[ind]) : Color('rgb(255, 0, 0)').rotate($globalHue)}"
            class:current={$intervalIndex === ind}
        ></div>
    {/each}
</div>


<style>
    .IntervalNumberIndicator {
        position: absolute;
        bottom: calc(var(--size) * 0.38 * 1px);
        display: flex;
        width: calc(var(--size) * 0.65 * 1px);
        filter: blur(calc(var(--textBlur) * 1px));
    }
    .intervalItem {
        width: 100%;
        height: calc(var(--size) / 45 * 1px);
        margin: 3px;
        opacity: 0.4;
        position: relative;
        transition-property: opacity, transform, margin;
        transition-duration: 500ms;
    }
    .current {
        /*opacity: 1;*/
        /*top: 100%;*/
        transform: scaleY(1.6);
    /*translateY(25%);*/

        opacity: var(--blink);
    }
</style>