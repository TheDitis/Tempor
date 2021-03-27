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
		showFavorites,
		currentFavInd,
		loadSettings
	} from "./stores/appState"
	import {focused, pause, resume, runState, start, tempDuration, duration} from "./stores/timerState";
	import ResizeControl from "./Components/Controls/ResizeControl.svelte";
	import OpenSettingsButton from "./Components/Settings/OpenSettingsButton.svelte";
	import Settings from "./Components/Settings/Settings.svelte";
	import ThemeCycleButton from "./Components/Settings/ThemeCycleButton.svelte";
	import IntervalModeButton from "./Components/Controls/IntervalModeButton.svelte";


	onMount(() => {
		loadSettings();
		ipcRenderer.send("resize", $width, $height)
	})

	const changeStayOnTop = (deps) => {
		ipcRenderer.send("stayontop", $stayOnTop);
	}

	const resizeWindow = (deps) => {
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

	const favKeyMap = {
		set: {
			Q: 0,
			W: 1,
			E: 2,
			R: 3,
			T: 4
		},
		load: {
			"!": 0,
			"@": 1,
			"#": 2,
			"$": 3,
			"%": 4
		}
	}

	const setFavorite = (key) => {
		if ($focused) {
			console.log("setting favorite: ", favKeyMap.set[key], " to ", $tempDuration)
			const tempFavorites = $settings.favorites;
			// if this value isn't already in a favorite slot
			if (!tempFavorites.includes($tempDuration)) {
				tempFavorites[favKeyMap.set[key]] = $tempDuration > 0 ? $tempDuration : null;
				settings.set({...$settings, favorites: tempFavorites})
				currentFavInd.set(favKeyMap.set[key]);
			}
		}
	}

	const loadFavorite = (key) => {
		const favInd = favKeyMap.load[key];
		const setting = $settings.favorites[favInd]
		if (!!setting && setting !== $tempDuration) {
			if ($runState === "running") {
				pause();
			}
			focused.set(true);
			tempDuration.set(setting);
			currentFavInd.set(favInd);
		}
	}

	const handleKeyDown = (e) => {
		const key = e.key;
		if (e.repeat) return;
		console.log(key)
		switch (key) {
			/// MAIN PAUSE/PLAY CONTROLS
			case " ":
				if ($runState === "running") pause();
				else if (($runState === "finished" || ($currentFavInd !== null && $tempDuration !== $duration)) && $tempDuration) start();
				else if ($runState === "paused") resume();
				break;
			case "Enter":
				if ($focused && $tempDuration) {
					start();
				}
				break;
			case "Escape":
				if ($focused) {
					focused.set(false);
				}
				break;
			case "Tab":
				// prevents focus being shifted away from the input as soon as it renders
				e.preventDefault();
				e.stopPropagation();
				focused.set(!$focused);
				break;

			/// FAVORITES CONTROLS:
			case "Shift":
				showFavorites.set(true);
				break;
			// keys for setting favorites
			case "Q":
			case "W":
			case "E":
			case "R":
			case "T":
				setFavorite(key);
				break;
			// keys for loading favorites
			case "!":
			case "@":
			case "#":
			case "$":
			case "%":
				loadFavorite(key);
				break;

			/// WINDOW SIZING CONTROLS:
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

	const handleKeyUp = (e) => {
		const key = e.key;
		switch (key) {
			case "Shift":
				showFavorites.set(false);
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

	<div
		class="timerSection"

	>
		<Timer/>
		<ResizeControl on:sizeUp={makeBigger} on:sizeDown={makeSmaller}/>
		<OpenSettingsButton/>
		<ThemeCycleButton/>
		<IntervalModeButton/>
	</div>

	{#if $settingsOpen}
		<Settings/>
	{/if}


</main>
<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp}/>

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