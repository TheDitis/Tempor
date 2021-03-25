<script>
    import partialCircle from "svg-partial-circle"
    import TimeIndicatorInput from "./TimeIndicatorInput.svelte"
    import {remainingTime, circleAngle, settings} from "../stores/timerState";
    import {color, size} from "../stores/appState";
    // export let color;
    $: thickness = $size / 20;

    const π = Math.PI;

    const degToRad = (deg) => (deg * π/180)
    const convertAngle = (deg) => degToRad(deg - 90);

    $: path = partialCircle(
        $size / 2,
        $size / 2,
        ($size / 2) - thickness,
        convertAngle($circleAngle),
        convertAngle(0),
    )
        .map(cmd => cmd.join(" "))
        .join(" ")



</script>

<div
    class="Timer"
    style="
        --size: {$size};
        --color: {$color.hsl().string()};
        --fontSize: {$size / 6}px;
        --fontFamily: {'Roboto ' + $settings.fontWeight}
"
>
    <svg width={$size} height={$size}>
        <circle r={($size / 2) - thickness} cx="50%" cy="50%" fill="transparent" stroke-width={thickness}
                stroke={$color.alpha(0.06).hsl().string()}></circle>
        <path d={`${path}`} stroke-width={thickness} stroke={$color.hsl().string()} stroke-linecap="round"
              fill="transparent"/>

    </svg>
<TimeIndicatorInput></TimeIndicatorInput>
</div>


<style>
    h1 {
        color: rgb(0, 190, 255)
    }

    .Timer {
        width: var(--size);
        height: var(--size);
        display: flex;
        justify-content: center;
        align-items: center;
    }


</style>