<script>
	import {onMount} from "svelte";
	import Timer from "./Components/Timer/Timer.svelte";
	const {ipcRenderer} = require("electron");
	import {
		size,
		hue,
		width,
		height,
		color,
		stayOnTop,
		scaledBlur,
		borderRadius,
		settings,
		maxSize,
		settingsOpen,
		loadSettings,
		intervalMode,
		intervalColors,
		playSound,
		inputRef,
		meme
	} from "./stores/appState";
	import ResizeControl from "./Components/Controls/ResizeControl.svelte";
	import OpenSettingsButton from "./Components/Settings/OpenSettingsButton.svelte";
	import Settings from "./Components/Settings/Settings.svelte";
	import IntervalModeButton from "./Components/Controls/IntervalModeButton.svelte";
	import MasterControls from "./Components/Controls/MasterControls.svelte";
	import {
		duration,
		focused,
		intervalDurations,
		intervalIndex,
		playingIntervalIndex,
		pausedRemainingTime,
		remainingTime,
		runState,
		startTime,
		tempDuration
	} from "./stores/timerState";

	// TODO: Add sounds to favorites
	// TODO: Make clicking on file name in sound selector play the current sound
	// TODO: Add other sounds
	// TODO: Rename sounds
	// TODO: Look into the angling of the bottom corners after closing settings with border radius
	// TODO: set settings to default


	onMount(() => {
		loadSettings();
		ipcRenderer.send("resize", $width, $height);

		ipcRenderer.on("size-data", (event, data) => {
			// console.log("size-data event recieved! event: ", event)
			// console.log("data: ", data)
		})
	})

	// any time the window size changes, send the signal to electron
	$: { ipcRenderer.send("resize", $width, $height) }
	// tell the window whether to stay on top or not when that setting changes
	$: { ipcRenderer.send("stayontop", $stayOnTop) }



	// sets the duration, start time, and run-state of the timer
	export const start = async () => {
		let tempDur;
		if (!$intervalMode) {
			tempDur = $tempDuration;
		}
		else {
			intervalIndex.set(0);
			tempDur = $intervalDurations[0];
			if ($intervalColors[0]) {
				hue.set($intervalColors[0])
			}
		}
		if (tempDur !== 0) {
			startTime.set(Date.now())
			duration.set(tempDur);
			focused.set(false);
			runState.set("running");
			playSound($settings.sounds.start);
		}
		if ($meme) meme.set(null);
	}


	// gets the current remaining time and sets the state to 'paused'
	export const pause = () => {
		playingIntervalIndex.set($intervalIndex);
		pausedRemainingTime.set($remainingTime);
		runState.set("paused");
	}


	// calculates the new relative start-time based on how much time is remaining and sets the state back to running
	export const resume = () => {
		intervalIndex.set($playingIntervalIndex);
		startTime.set(Date.now() - ($duration - $pausedRemainingTime));
		if ($meme) meme.set(null);
		focused.set(false);
		runState.set("running");
	}


	const makeSmaller = () => {
		if ($size > 100) {
			size.update(v => v - 50);
		}
		if ($inputRef) $inputRef.focus();
	}


	const makeBigger = () => {
		if ($size < $maxSize) {
			size.update(v => v + 50)
		}
		if ($inputRef) $inputRef.focus();
	}


	const themes = {
		"transparent": "transparent",
		"dark": "#202020",
		"light": "white",
	}


	$: appBg = themes[$settings.theme];
	// $: borderRadius = ($settings.frame === "round") ? `${$width}px` : "40px"

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
		--frameRadius: {$borderRadius  * ($width / 2) / 100}px;
	"
>
	<div class="App">
		<div class="draggableArea"></div>

		<div class="timerSection" >
			<Timer start={start} pause={pause} resume={resume}/>
			<ResizeControl on:sizeUp={makeBigger} on:sizeDown={makeSmaller}/>
			<OpenSettingsButton/>
<!--			<ThemeCycleButton/>-->
			<IntervalModeButton/>
		</div>

		{#if $settingsOpen}
			<Settings/>
		{/if}
	</div>
</main>
<MasterControls start={start} pause={pause} resume={resume} makeBigger={makeBigger} makeSmaller={makeSmaller}/>


<style>
	main {
		box-sizing: border-box;
	}

	.App {
		margin-top: 20px;
		padding: 0;
		background: var(--appBg);
		border-radius: var(--frameRadius);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.draggableArea {
		position: absolute;
		box-sizing: border-box;
		top: 20px;
		height: calc(var(--blur) * 3px + 10px);
		/*height: 20px;*/
		/*width: 100vw;*/
		width: calc(var(--size) / 2 * 1px);
		margin: 0;
		padding: 0;
		-webkit-app-region: drag;
		/*border: 2px solid rgb(255, 255, 255);*/
		/*opacity: 0;*/
		cursor: pointer;
		z-index: 10000;
	}
	.draggableArea:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.timerSection {
		/*width: 100vw;*/
		margin: 0;
		padding: 0;
		/*z-index: 100;*/
		/*padding: 10px;*/
		/*margin-top: 20px;*/
		/*padding-bottom: 15px;*/
		box-sizing: border-box;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(h1, h2, h3, h4, h5, p) {
		color: var(--color)
	}
</style>