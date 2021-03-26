<script>
	import {onMount} from "svelte";
	import Timer from "./Components/Timer.svelte";
	const {ipcRenderer} = require("electron");
	import {size, width, height, color, blur, settings, maxSize, settingsOpen, loadSettings} from "./stores/appState"
	import {focused, pause, resume, runState, start, tempDuration} from "./stores/timerState";
	import ResizeControl from "./Components/ResizeControl/ResizeControl.svelte";
	import SettingsButton from "./Components/Settings/SettingsButton.svelte";
	import Settings from "./Components/Settings/Settings.svelte";



	onMount(() => {
		loadSettings();
		ipcRenderer.send("resize", $width, $size)
	})

	const resizeWindow = (listenTo) => {
		ipcRenderer.send("resize", $width, $height)
	}

	// any time the window size changes, send the signal to electron
	$: resizeWindow([$size, $height])

	const makeSmaller = () => {
		if ($size > 100) {
			size.update(v => v - 50);
		}
	}

	const makeBigger = () => {
		if ($size < $maxSize) {
			size.update(v => v + 50)
		}
	}

	const handleKeyDown = (e) => {
		const key = e.key;
		console.log(key)
		switch (key) {
			case " ":
				console.log("Space pressed!");
				if ($runState === "running") pause();
				else if ($runState === "paused") resume();
				break;
			case "Enter":
				if ($focused && $tempDuration) {
					console.log("starting")
					start();
				}
				break;
			case "Escape":
				if ($focused) {
					focused.set(false);
				}
				break;
			case "Tab":
				if (!$focused) {
					focused.set(true);
				}
				break;
			case "-":
				makeSmaller();
				break;
			case "=":
				makeBigger();
				break;
			default:
				break;
		}
	}

</script>

<main
	style="
		--size: {$size};
		--color: {$color.hsl().string()};
		--blur: {$blur};
		--textBlur: {$blur * 0.15};
		--fontSize: {$size / 6}px;
		--fontFamily: {'Roboto ' + $settings.fontWeight};
		--buttonBg: {$color.alpha(0.2).hsl().string()};
	"
>
	<div class="draggableArea"></div>

	<div
		class="timerSection"

	>
		<Timer/>
		<ResizeControl on:sizeUp={makeBigger} on:sizeDown={makeSmaller}/>
		<SettingsButton/>
	</div>

	{#if $settingsOpen}
		<Settings/>
	{/if}


</main>
<svelte:window on:keydown={handleKeyDown}/>

<style>
	main {
		margin: 0;
		padding: 0;
		/*display: flex;*/
		/*flex-direction: column;*/
		/*align-items: center;*/
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

	.timerSection {
		width: 100vw;
		margin: 0;
		box-sizing: border-box;
		position: relative;

	}
</style>