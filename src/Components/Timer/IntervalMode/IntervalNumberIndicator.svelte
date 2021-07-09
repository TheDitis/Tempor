<script>
    import {intervalDurations, intervalIndex, runState, time} from "../../../stores/timerState";
    import {globalHue, intervalColors} from "../../../stores/appState";
    import {fade} from "svelte/transition";
    import Color from "color";

    const blinkRate = 130;
    let opacity, colors;

    $:{
        if ($runState === "running") {
            const oneCycle = (2 * Math.PI);
            const curTime = ($time / (blinkRate / oneCycle));
            // get the y position and scale between 0.5 & 1
            opacity = (Math.sin(curTime / oneCycle) + 1) / 2 + 0.2;
        }
        else opacity = 1;
    }

    const updateColors = (deps) => {
        colors = $intervalColors.map(val => {
            if (val !== null) {
                return Color('rgb(255, 0, 0)').rotate(val)
            } else {
                return Color('rgb(255, 0, 0)').rotate($globalHue)
            }
        })
    };

    const navigateToInterval = ind => () => {
        if ($runState !== "running") {
            intervalIndex.set(ind)
        }
    };


    $: {
        updateColors($intervalColors, $globalHue)
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
            style="background: {colors[ind]}"
            class:current={$intervalIndex === ind}
            on:click={navigateToInterval(ind)}
        ></div>
    {/each}
</div>


<style>
    .IntervalNumberIndicator {
        position: absolute;
        z-index: 999999999999;
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
        transform: scaleY(1.6);

        opacity: var(--blink);
    }
</style>