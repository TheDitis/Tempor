<script>
    import partialCircle from "svg-partial-circle"
    import {remainingTime, circleAngle, start, duration} from "./stores";

    export let width = 200;
    export let height = 200;
    export let thickness = 15

    const π = Math.PI;

    const degToRad = (deg) => (deg * π/180)
    const convertAngle = (deg) => degToRad(deg - 90);

    $: path = partialCircle(
        width / 2,
        height / 2,
        (width / 2) - thickness,
        convertAngle($circleAngle),
        convertAngle(0),
    )
        .map(cmd => cmd.join(" "))
        .join(" ")

</script>


<svg width={width} height={height}>
<!--    <circle r={(width / 2) - thickness} cx="50%" cy="50%" fill="transparent" stroke-width={thickness} stroke="rgba(0, 120, 220, 0.5)"></circle>-->
    <path d={`${path}`} stroke-width={thickness} stroke="rgb(0, 190, 255)" stroke-linecap="round" fill="transparent"/>
</svg>
<h1>{$circleAngle}</h1>
<h2>{$start}</h2>
<h2>{$duration}</h2>


<style>
    h1 {
        color: rgb(0, 190, 255)
    }
</style>