<script>
    import partialCircle from "svg-partial-circle";
    import TimeIndicatorInput from "./TimeIndicator/TimeIndicator.svelte"
    import {
        remainingTime,
        duration,
        runState,
        focused,
        tempDuration,
    } from "../../stores/timerState";
    import {color, size, settings, showFavorites, intervalMode, lineThickness} from "../../stores/appState";
    import PlayPauseControl from "../Controls/PlayPauseControl.svelte";
    import Favorites from "./Favorites/Favorites.svelte";
    import IntervalModeIndicator from "./IntervalMode/IntervalModeIndicator.svelte";
    import IntervalNumberIndicator from "./IntervalMode/IntervalNumberIndicator.svelte";

    export let start, pause, resume;

    // calculates the the angle of the count down progress circle based on the ratio of remainingTime to duration
    const calculateAngle = (deps) => {
        if ($runState === "finished") return 359;
        if ($remainingTime > 0) return $remainingTime * 359 / $duration;
        else return 0;
    }

    const degToRad = (deg) => (deg * Math.PI / 180) // π
    const convertAngle = (deg) => degToRad(deg - 90);


    $: thickness = ($size / 8) * ($lineThickness / 100);

    $: circleAngle = calculateAngle($remainingTime);

    $: radius = ($size / 2) - (thickness / 2);

    // the path of the progress circle
    $: path = partialCircle(
        $size / 2,
        $size / 2,
        radius,
        convertAngle(circleAngle),
        convertAngle(0),
    )
        .map(cmd => cmd.join(" "))
        .join(" ");


</script>


<div
    class="Timer"
    on:click={() => focused.set(false)}
>
    <svg class="circle" width={$size} height={$size}>
        <circle r={radius} cx="50%" cy="50%" fill="transparent" stroke-width={thickness}
                stroke={$color.alpha(0.08).hsl().string()}></circle>
        <path d={`${path}`} stroke-width={thickness} stroke={$color.hsl().string()} stroke-linecap="round"
              fill="transparent"/>
    </svg>
    {#if $showFavorites && $settings.favorites}
        <Favorites/>
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
        /*border: 2px solid purple;*/
        margin: calc(var(--blur) * 3px + 10px);
        position: relative;

        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        /*margin: 0;*/
    }
    .circle {
        filter: blur(calc(var(--blur) * 1px));
        margin: 0;
        padding: 0;
    }

</style>