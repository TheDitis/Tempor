<script>
	import Timer from "./Components/Timer.svelte";
	import Controls from "./Components/Controls.svelte";
	const {ipcRenderer} = require("electron");
	import Color from "color";

	let i = 0;
	let sizes = [100, 150, 200, 250, 300, 350, 400, 450, 500];

	let hue = 180
	let color = Color("rgb(255, 0, 0)").rotate(hue);

	$: color.rotate(hue)

	export let windowWidth = 300;

	const resize = () => {
		ipcRenderer.send("resize", sizes[i]);
		windowWidth = sizes[i];
		i = (i + 1) % sizes.length;
		console.log("resize called");
	}




	// let styles = {
	// 	"width": `${width}px`,
	// 	"height": `${height}px`,
	// }

	// $: cssVars = Object.entries(styles)
	// 		.map(([key, value]) => `--${key}:${value}`)
	// 		.join(";");

</script>

<main>
	<div class="draggableArea"></div>
	<div
		class="background"
	>

		<Timer size={windowWidth} color={color}/>
		<Controls/>

		<button on:click={resize}>resize</button>
	</div>


</main>

<style>
	main {
		margin: 0;
		padding: 0;
	}

	h1 {
		color: #ff3eff;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	.draggableArea {
		height: 20px;
		width: 100vw;
		-webkit-app-region: drag;
	}
	.background {
		/*height: var(--height);*/
		/*width: var(--width);*/
		width: 100vw;
		/*background: rgb(255, 128, 0);*/
		margin: 0;
		box-sizing: border-box;
		position: absolute;

	}
</style>