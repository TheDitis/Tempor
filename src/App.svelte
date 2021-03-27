<script>
	import {onMount} from "svelte";
	import Timer from "./Components/Timer/Timer.svelte";

	const {ipcRenderer} = require("electron");
	import {
		size,
		width,
		height,
		color,
		stayOnTop,
		scaledBlur,
		settings,
		maxSize,
		settingsOpen,
		loadSettings,
		intervalMode,
		playSound
	} from "./stores/appState";
	import ResizeControl from "./Components/Controls/ResizeControl.svelte";
	import OpenSettingsButton from "./Components/Settings/OpenSettingsButton.svelte";
	import Settings from "./Components/Settings/Settings.svelte";
	import ThemeCycleButton from "./Components/Settings/ThemeCycleButton.svelte";
	import IntervalModeButton from "./Components/Controls/IntervalModeButton.svelte";
	import MasterControls from "./Components/Controls/MasterControls.svelte";
	import {
		duration,
		focused,
		intervalDurations,
		intervalIndex, pausedRemainingTime, remainingTime,
		runState,
		startTime,
		tempDuration
	} from "./stores/timerState";


	onMount(() => {
		loadSettings();
		ipcRenderer.send("resize", $width, $height)
	})

	// any time the window size changes, send the signal to electron
	$: { ipcRenderer.send("resize", $width, $height) }
	// tell the window whether to stay on top or not when that setting changes
	$: { ipcRenderer.send("stayontop", $stayOnTop) }


	// sets the duration, start time, and run-state of the timer
	export const start = () => {
		let tempDur;
		if (!$intervalMode) {
			tempDur = $tempDuration;
		}
		else {
			tempDur = $intervalDurations[$intervalIndex];
		}
		if (tempDur !== 0) {
			startTime.set(Date.now())
			duration.set(tempDur);
			focused.set(false);
			runState.set("running");
			playSound($settings.sounds.start);
		}
	}

	// gets the current remaining time and sets the state to 'paused'
	export const pause = () => {
		pausedRemainingTime.set($remainingTime);
		runState.set("paused");
	}

	// calculates the new relative start-time based on how much time is remaining and sets the state back to running
	export const resume = () => {
		startTime.set(Date.now() - ($duration - $pausedRemainingTime));
		focused.set(false);
		runState.set("running");
	}


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

	const themes = {
		"transparent": "transparent",
		"dark": "rgb(33, 33, 33)",
		"light": "white",
	}

	$: appBg = themes[$settings.theme];
	$: borderRadius = ($settings.frame === "round") ? `${$width}px` : "40px"

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
		--frameRadius: {borderRadius};
	"
>
	<div class="draggableArea"></div>

	<div class="timerSection">
		<Timer start={start} pause={pause} resume={resume}/>
		<ResizeControl on:sizeUp={makeBigger} on:sizeDown={makeSmaller}/>
		<OpenSettingsButton/>
		<ThemeCycleButton/>
		<IntervalModeButton/>
	</div>

	{#if $settingsOpen}
		<Settings/>
	{/if}

</main>
<MasterControls start={start} pause={pause} resume={resume} makeBigger={makeBigger} makeSmaller={makeSmaller}/>


<style>
	main {
		margin: 0;
		padding: 0;
		background: var(--appBg);
		/*border-radius: 40px;*/
		/*border*/
		/*border-radius: calc(var(--width) * 1px);*/
		border-radius: var(--frameRadius);
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