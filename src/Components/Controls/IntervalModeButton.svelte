<script>
    import {tick} from "svelte";
    import TomatoIcon from "../Icons/TomatoIcon.svelte";
    // import {} from "../../stores/appState";
    import Fa from "svelte-fa";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
    import {globalHue, hue, intervalColors, intervalMode, size, settingsTab, inputRef} from "../../stores/appState";
    import {focused, intervalIndex} from "../../stores/timerState";


    const toggleIntervalMode = async () => {
        focused.set(false)
        if ($intervalMode) {
            hue.set($globalHue);
            if ($settingsTab === "intervals") {
                settingsTab.set("style");
            }
        }
        else if ($intervalColors[$intervalIndex] !== null) {
            hue.set($intervalColors[$intervalIndex])
        }
        intervalMode.set(!$intervalMode);
        await tick();
        if ($inputRef) $inputRef.focus();
        focused.set(true)
    }
</script>

<button class="IntervalModeButton" on:click={toggleIntervalMode}>
    <Fa icon={faSyncAlt}/>
</button>


<style>
    .IntervalModeButton {
        position: absolute;
        bottom: 5px;
        right: 5px;
        height: calc(var(--size) / 7 * 1px);
        width: calc(var(--size) / 7 * 1px);
        font-size: calc(var(--size) / 17 * 1px);
        outline: none;
        border: none;
        background: var(--buttonBg);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 100000px;
        opacity: 0;
        transition-duration: 700ms;
        transition-delay: 500ms;
        overflow: hidden;
    }
    .IntervalModeButton:hover {
        opacity: 1;
        transition-duration: 200ms;
        transition-delay: 0ms;
    }
</style>