<script>
    import partialCircle from "svg-partial-circle"
    import {remainingTime, circleAngle, start, duration} from "../stores/stores";
    // const fs = require("fs")



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
    <path d={`${path}`} stroke-width={thickness} stroke="rgb(0, 190, 255)" fill="transparent"/>
<!--    <circle r={(width / 2) - thickness} cx="50%" cy="50%" fill="transparent" stroke-width="20" stroke="rgb(0, 190, 255)"></circle>-->
</svg>
<h1>{$circleAngle}</h1>
<h2>{$start}</h2>
<h2>{$duration}</h2>
<button>START</button>



<style>
    h1 {
        color: rgb(0, 190, 255)
    }
</style>