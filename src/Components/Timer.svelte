<script>
    import partialCircle from "svg-partial-circle"
    import TimeIndicatorInput from "./TimeIndicatorInput.svelte"
    import {remainingTime, duration} from "../stores/timerState";
    import {color, size} from "../stores/appState";
    import Controls from "./Controls.svelte";

    // thickness of the line
    $: thickness = $size / 20;

    // calculates the the angle of the count down progress circle based on the ratio of remainingTime to duration
    $: circleAngle = $remainingTime > 0 ? ($remainingTime * 360 / $duration) % 360 : 0


    const degToRad = (deg) => (deg * Math.PI / 180) // π
    const convertAngle = (deg) => degToRad(deg - 90);

    // the path of the progress circle
    $: path = partialCircle(
        $size / 2,
        $size / 2,
        ($size / 2) - thickness,
        convertAngle(circleAngle),
        convertAngle(0),
    )
        .map(cmd => cmd.join(" "))
        .join(" ")


</script>

<div
    class="Timer"

>
    <svg class="circle" width={$size} height={$size}>
        <circle r={($size / 2) - thickness} cx="50%" cy="50%" fill="transparent" stroke-width={thickness}
                stroke={$color.alpha(0.08).hsl().string()}></circle>
        <path d={`${path}`} stroke-width={thickness} stroke={$color.hsl().string()} stroke-linecap="round"
              fill="transparent"/>
    </svg>
    <TimeIndicatorInput/>
    <Controls/>
</div>


<style>
    h1 {
        color: rgb(0, 190, 255)
    }
    .circle {

        /*filter: blur(5px);*/
    }

    .Timer {
        width: var(--size);
        height: var(--size);

        display: flex;
        justify-content: center;
        align-items: center;
    }


</style>