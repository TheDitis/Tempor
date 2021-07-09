<script lang="ts">
    /**
     * file: Timer.svelte
     * author: Ryan McKay
     * This is the actual timer component (countdown circle and everything contained in it
     */
    // @ts-ignore
    import partialCircle from "svg-partial-circle";
    import TimeIndicatorInput from "./TimeIndicator/TimeIndicator.svelte"
    import {duration, focused, remainingTime, runState,} from "../../stores/timerState";
    import {color, intervalMode, lineThickness, meme, settings, showFavorites, size} from "../../stores/appState";
    import PlayPauseControl from "../Controls/PlayPauseControl.svelte";
    import Favorites from "./Favorites/Favorites.svelte";
    import IntervalModeIndicator from "./IntervalMode/IntervalModeIndicator.svelte";
    import IntervalNumberIndicator from "./IntervalMode/IntervalNumberIndicator.svelte";
    import MemeIndicator from "../Icons/MemeIndicator.svelte";
    import {degToRad} from "../../utils/utils";

    export let start, pause, resume;

    /** Calculates the the angle of the count down progress circle based on the ratio of remainingTime to duration
     * @param deps - unused param, a spot for dependents used in the svelte reactive declaration
     */
    const calculateAngle = (deps: any): number => {
        if ($runState === "finished") return 359;
        if ($remainingTime > 0) return $remainingTime * 359 / $duration;
        else return 0;
    };

    // the size adjusted thickness of the line
    $: thickness = ($size / 8) * ($lineThickness / 100);

    // the angle of the indicator-end of the circle relative to 0 (not rotationally adjusted)
    $: circleAngle = calculateAngle($remainingTime);

    // calculated circle radius
    $: radius = ($size / 2) - (thickness / 2);

    // the path of the progress circle
    $: path = partialCircle(
        $size / 2,
        $size / 2,
        radius,
        degToRad(circleAngle - 90),
        degToRad(-90),
    )
        .map(cmd => cmd.join(" "))
        .join(" ");

</script>



<div
    class="Timer"
    style="--thickness: {thickness};"
    on:click={() => focused.set(false)}
>
    <svg class="circle" width={$size} height={$size}>
        <circle
                r={radius} cx="50%" cy="50%"
                fill="transparent"
                stroke-width={thickness}
                stroke={$color.alpha(0.08).hsl().string()}
        />
        <path
                d={`${path}`}
                stroke-width={thickness}
                stroke={$color.hsl().string()}
                stroke-linecap="round"
                fill="transparent"
        />
    </svg>

    {#if $showFavorites && $settings.favorites}
        <Favorites/>
    {/if}

    {#if $meme !== null}
        <MemeIndicator/>
    {/if}

    {#if $intervalMode}
        <IntervalModeIndicator/>
        <IntervalNumberIndicator/>
    {/if}

    <TimeIndicatorInput/>
    <PlayPauseControl  start={start} pause={pause} resume={resume}/>
</div>



<style>
    .Timer {
        width: var(--size);
        height: var(--size);
        margin: calc(var(--blur) * 3px + 10px);
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
    }
    .circle {
        filter: blur(calc(var(--blur) * 1px));
        margin: 0;
        padding: 0;
    }

</style>