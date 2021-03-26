<script>
	import {onMount} from "svelte";
	import Timer from "./Components/Timer/Timer.svelte";

	const {ipcRenderer} = require("electron");
	import {
		size,
		width,
		height,
		color,
		blur,
		stayOnTop,
		scaledBlur,
		settings,
		maxSize,
		settingsOpen,
		loadSettings
	} from "./stores/appState"
	import {focused, pause, resume, runState, start, tempDuration} from "./stores/timerState";
	import ResizeControl from "./Components/ResizeControl/ResizeControl.svelte";
	import OpenSettingsButton from "./Components/Settings/OpenSettingsButton.svelte";
	import Settings from "./Components/Settings/Settings.svelte";
	import ThemeCycleButton from "./Components/Settings/ThemeCycleButton.svelte";


	onMount(() => {
		loadSettings();
		ipcRenderer.send("resize", $width, $height)
	})

	const changeStayOnTop = (deps) => {
		console.log("stayOnTop: ", $stayOnTop)
		ipcRenderer.send("stayontop", $stayOnTop);
	}

	const resizeWindow = (deps) => {
		console.log("$width: ", $width);
		console.log("$height: ", $height);
		ipcRenderer.send("resize", $width, $height)
	}

	// any time the window size changes, send the signal to electron
	$: resizeWindow([$size, $height])

	$: changeStayOnTop([$stayOnTop])

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

	const themes = {
		"transparent": "transparent",
		"dark": "rgb(33, 33, 33)",
		"light": "white",
	}

	const calcAppBg = (deps) => {
		if ($settings.transparent) return "transparent";
		if ($settings.theme === "dark") return "rgb(33, 33, 33)";
		else return "white";
	}

	$: appBg = themes[$settings.theme];

</script>

<main
	style="
		--size: {$size};
		--width: {$width};
		--color: {$color.hsl().string()};
		--blur: {$scaledBlur};
		--textBlur: {$scaledBlur * 0.2};
		--fontSize: {$size / 6}px;
		--fontFamily: {'Roboto ' + $settings.fontWeight};
		--buttonBg: {$color.alpha(0.5).hsl().string()};
		--activeButtonBg: {$color.alpha(0.6).hsl().string()};
		--appBg: {appBg};
	"
>
	<div class="draggableArea"></div>

	<div
		class="timerSection"

	>
		<Timer/>
		<ResizeControl on:sizeUp={makeBigger} on:sizeDown={makeSmaller}/>
		<OpenSettingsButton/>
		<ThemeCycleButton/>
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
		background: var(--appBg);
		border-radius: 20px;
	}


	.draggableArea {
		height: 20px;
		width: 100vw;
		margin: 0;
		padding: 0;
		-webkit-app-region: drag;
	}

	.timerSection {
		width: 100vw;
		margin: 0;
		padding-bottom: 15px;
		box-sizing: border-box;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>