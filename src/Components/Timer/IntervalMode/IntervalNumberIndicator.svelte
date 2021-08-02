<script lang="ts">
    /**
     * IntervalNumberIndicator.svelte
     * author: Ryan McKay
     *
     * This component represents the rectangles just below the time indicator
     * when in interval mode, that indicate the currently selected/running
     * interval, and allow users to select a given interval (when not running)
     */
    import Color from "color";
    import {
        intervalDurations,
        intervalIndex,
        runState,
        time
    } from "../../../stores/timerState";
    import {globalHue, intervalColors} from "../../../stores/appState";
    import {fade} from "svelte/transition";

    /**
     * Calculates the opacity of the interval currently running at the current
     * time. The running interval 'blinks' lightly by fading in opacity
     * @param deps - placeholder for svelte reactive declaration dependents
     * @return {number} - the current opacity, between 0.5 and 1
     */
    const calculateCurrentOpacity = (deps): number => {
        const blinkRate: number = 130;
        if ($runState === "running") {
            const oneCycle = (2 * Math.PI);
            const curTime = ($time / (blinkRate / oneCycle));
            // get the y position and scale it between 0.5 & 1
            return (Math.sin(curTime / oneCycle) + 1) / 2 + 0.2;
        }
        else return 1;
    };


    /**
     * Generates a list of Color objects, one for each interval currently in
     * use. Maps the global app color to each item that doesn't have a
     * specified color, or the specified color for those that do
     * @param deps - placeholder for svelte reactive declaration dependents
     * @return {Color[]} - The list of colors to be used for each interval bar
     */
    const getUpdatedColors = (deps): Color[] => $intervalColors.map(val => {
        if (val !== null) {
            return Color('rgb(255, 0, 0)').rotate(val)
        } else {
            return Color('rgb(255, 0, 0)').rotate($globalHue)
        }
    });

    /**
     * Runs when an interval is clicked, and navigates to it if it's not running
     * @param ind {number} - the index of the clicked interval
     */
    const navigateToInterval = (ind: number) => () => {
        if ($runState !== "running") {
            intervalIndex.set(ind)
        }
    };

    // an array of the colors of each interval, reactively updated
    let colors: Color[];
    $: colors = getUpdatedColors([$intervalColors, $globalHue]);

    // the opacity of the currently running element, reactively updated
    let opacity: number;
    $: opacity = calculateCurrentOpacity($time);
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