<script>
	import Timer from "./Components/Timer.svelte";
	import Controls from "./Components/Controls.svelte";
	// export let ipcRenderer;

	// import electron from "../node_modules/electron/index"
	const {ipcRenderer} = require("electron")
	const resize = () => {
		ipcRenderer.send("resize");
		console.log("resize called")
	}

	let color = "orange";
	export let width;
	export let height;

	let styles = {
		"width": `${width}px`,
		"height": `${height}px`,
	}

	$: cssVars = Object.entries(styles)
			.map(([key, value]) => `--${key}:${value}`)
			.join(";");

</script>

<main>
	<div class="draggableArea"></div>
	<div
		class="background"
		style={cssVars}
	>
		<Timer/>
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
		height: var(--height);
		width: var(--width);
		/*background: rgb(255, 128, 0);*/
		margin: 0;
		box-sizing: border-box;
		position: absolute;

	}
</style>