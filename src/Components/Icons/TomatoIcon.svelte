<script>
    import {onMount} from "svelte"
    import Color from "color";

    export let size = 10;
    export let color;
    export let colors;

    let color1, color2;
    const updateColors = (deps) => {
        if (colors && (colors[0] !== null || colors[1] !== null)) {
            color1 = colors[0] !== null ? (
                Color('rgb(255, 0, 0)').rotate(colors[0])
            ) : Color('rgb(255, 0, 0)').rotate(colors[1]);

            color2 = colors[1] !== null ? (
                Color('rgb(255, 0, 0)').rotate(colors[1])
            ) : Color('rgb(255, 0, 0)').rotate(colors[0]);

        } else if (color) {
            console.log("branch 2")
            color1 = color;
            color2 = color;
        }
    };

    onMount(() => updateColors(colors));

    $: updateColors(colors);

    const tomatoRed = "rgb(252, 61, 3)";
    const stemGreen = "rgb(0, 163, 27)";
</script>

<svg height={size} width={size} viewBox="0 0 595.3 593.1">
    <path d="M555,257.6c20.9,182.8-117.4,350.5-305.4,313C33.2,552.6-61.7,166.4,160,112.7c5.6,22.8,45,43.2,46,38.4
			c-3.8,7-52.1,41.7-88,63.3c44.4,31.9,104.6,36.5,141.9,17.9c7.3,37.7,36.2,71,78.4,92.1c12.5-37.8,26.4-52.1,16.4-101.2
			c44.7,27.6,91.7,25.5,121.2-24.6c-16.2-7.4-30.9-18.6-52.6-35.2c31.5-13.5,32.9-42.1,41.6-39.2C515.9,141.2,544.9,208.6,555,257.6z"
          fill={color1 || tomatoRed}
    />
    <path d="M342,10c10.3,69.4-23.5,110,0,104.8c43.4-9.7,54.9,10.4,91.5-0.9c-9.9,30.8-15.1,35.3-53.8,47.5
			c19.3,15.6,38.4,35.7,62.1,44.8c-31.5,23.7-63.8,16-123.7-39.2c13.3,40.5,16.6,74,10.5,115.5c-36.9-15-49.1-42.6-45.6-105.7
			c-31.2,44.2-70.7,51.4-118.6,31.5c37.5-20.9,71.9-42.9,91.9-67.8c-13.9-10.1-70.7-11.6-80-57c53.1,34.3,85.4-14.9,116,24.6
			c24.3-20.4,33.4-57.8,33.4-98.1C331.1,10,336.5,10,342,10z" fill={color2 || stemGreen}/>
</svg>