<script>
	import {onMount} from "svelte";
	import Timer from "./Components/Timer.svelte";
	import Controls from "./Components/Controls.svelte";
	const {ipcRenderer} = require("electron");
	import {size, height, color, settings} from "./stores/appState"

	onMount(() => {
		ipcRenderer.send("resize", $size, $size)
	})



</script>

<main>
	<div class="draggableArea"></div>
	<div
		class="main"
		style="
			--size: {$size};
			--color: {$color.hsl().string()};
			--fontSize: {$size / 6}px;
			--fontFamily: {'Roboto ' + $settings.fontWeight}
		"
	>

		<Timer/>
<!--		<Controls/>-->
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
	.draggableArea:hover {
		background-color: rgba(255, 255, 255, 0.5);
	}

	.main {
		width: 100vw;
		margin: 0;
		box-sizing: border-box;
		position: absolute;

	}
</style>