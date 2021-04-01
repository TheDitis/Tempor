<script>
    import {fade} from "svelte/transition";
    import TomatoIcon from "../../Icons/TomatoIcon.svelte";
    import {
        color,
        globalHue,
        hue,
        intervalColors,
        intervalMode,
        size,
        settingsTab,
        inputRef
    } from "../../../stores/appState";
    import {focused, intervalDurations} from "../../../stores/timerState";
    import {tick} from "svelte";
    import Fa from "svelte-fa";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";

    const turnOff = async () => {
        focused.set(false);
        intervalMode.set(false);
        hue.set($globalHue);
        if ($settingsTab === "intervals") {
            settingsTab.set("style");
        }
        await tick();
        focused.set(true);
        await tick();
    }
    let isPomodoro;
    $: isPomodoro = ($intervalDurations.length === 2 && $intervalDurations[0] === 1500000 && $intervalDurations[1] === 300000)

    let intervalCols;
    $: {
        intervalCols = [$intervalColors[0], $intervalColors[1]]
    }
</script>


<div class="IntervalModeIndicator" transition:fade={{duration: 100}} on:click={turnOff}>
    {#if isPomodoro}
        <TomatoIcon size={$size / 10} color={$color.hex()} colors={intervalCols}/>
    {:else}
        <Fa icon={faSyncAlt}/>
    {/if}
</div>


<style>
    .IntervalModeIndicator {
        position: absolute;
        top: calc(((var(--size) * 0.05) + var(--thickness)) * 1px);

        filter: blur(calc(var(--textBlur) * 1px));
        color: var(--color);
        font-size: calc(var(--size) / 10 * 1px);
    }
</style>