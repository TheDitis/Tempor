<script lang="ts">
	/**
	 * file: App.svelte
	 * This is the root component of the app
	 */
	import Timer from "./Components/Timer/Timer.svelte";
	import {
		borderRadius,
		color,
		globalHue,
		height,
		hue,
		inputRef,
		intervalColors,
		intervalMode,
		MAX_SIZE,
		meme,
		playSound,
		scaledBlur,
		settings,
		settingsOpen,
		size,
		stayOnTop, THEMES,
		width
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
		pausedRemainingTime,
		playingIntervalIndex,
		remainingTime,
		runState,
		startTime,
		tempDuration
	} from "./stores/timerState";

	const {ipcRenderer} = require("electron");

	//------------------------------------------------------------------------------------------------------------------
	//   ELECTRON EVENT TRIGGERS
	//------------------------------------------------------------------------------------------------------------------

	// any time the window size changes, send the signal to electron
	$: ipcRenderer.send("resize", $width, $height);
	// tell the window whether to stay on top or not when that setting changes
	$: ipcRenderer.send("stay-on-top", $stayOnTop);



	//------------------------------------------------------------------------------------------------------------------
	//   PRIMARY TIMER OPERATION FUNCTIONS
	//------------------------------------------------------------------------------------------------------------------

	/** Sets the duration, start time, and run-state of the timer */
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
			startTime.set(Date.now());
			duration.set(tempDur);
			focused.set(false);
			runState.set("running");
			playSound($settings.sounds.start);
		}
		if ($meme) meme.set(null);
	};


	/** Sets the current remaining time and sets the state to 'paused' */
	export const pause = () => {
		playingIntervalIndex.set($intervalIndex);
		pausedRemainingTime.set($remainingTime);
		runState.set("paused");
	};


	/** Calculates the new relative start-time based on how much time is remaining and sets the state back to running */
	export const resume = () => {
		if ($intervalMode) {
			intervalIndex.set($playingIntervalIndex);
			if ($intervalColors[$playingIntervalIndex]) {
				hue.set($intervalColors[$playingIntervalIndex]);
			}
			else {
				hue.set($globalHue)
			}
		}
		startTime.set(Date.now() - ($duration - $pausedRemainingTime));
		if ($meme) meme.set(null);
		focused.set(false);
		runState.set("running");
	};



	//------------------------------------------------------------------------------------------------------------------
	//   SIZE CHANGE FUNCTIONS
	//------------------------------------------------------------------------------------------------------------------

	/** Scales down the window by 50px if it's bigger than 100px */
	const makeSmaller = () => {
		if ($size > 100) {
			size.update(v => v - 50);
		}
		if ($inputRef) $inputRef.focus();
	};

	/** Scales up the window by 50px if it's smaller than their smallest window dimension */
	const makeBigger = () => {
		if ($size < MAX_SIZE) {
			size.update(v => v + 50)
		}
		if ($inputRef) $inputRef.focus();
	};

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
		--appBg: {THEMES[$settings.theme]};
		--frameRadius: {$borderRadius  * ($width / 2) / 100}px;
	"
>
	<div class="App">
		<div class="draggableArea"></div>

		<div class="timerSection" >
			<Timer start={start} pause={pause} resume={resume}/>
			<ResizeControl />
			<OpenSettingsButton/>
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
		top: 0;
		height: calc(var(--blur) * 3px + 10px);
		width: calc(var(--size) / 2 * 1px);
		margin: 0;
		padding: 0;
		-webkit-app-region: drag;
		cursor: pointer;
		z-index: 10000;
	}
	.draggableArea:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.timerSection {
		margin: 0;
		padding: 0;
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