<script>
    import {fade} from "svelte/transition";
    import TomatoIcon from "../../Icons/TomatoIcon.svelte";
    import {
        color,
        intervalColors,
        size,
        meme
    } from "../../../stores/appState";
    import {intervalDurations} from "../../../stores/timerState";
    import Fa from "svelte-fa";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";

    const turnOff = async () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key: "i", shiftKey : false});
        document.dispatchEvent(e);

    }

    $: isPomodoro = ($intervalDurations.length === 2 && $intervalDurations[0] === 1500000 && $intervalDurations[1] === 300000)

    $: intervalCols = [$intervalColors[0], $intervalColors[1]]

</script>

{#if !$meme}
    <div class="IntervalModeIndicator" transition:fade={{duration: 100}} on:click={turnOff}>
        {#if isPomodoro}
            <TomatoIcon size={$size / 10} color={$color.hex()} colors={intervalCols}/>
        {:else}
            <Fa icon={faSyncAlt}/>
        {/if}
    </div>
{/if}


<style>
    .IntervalModeIndicator {
        position: absolute;
        top: calc(((var(--size) * 0.05) + var(--thickness)) * 1px);

        filter: blur(calc(var(--textBlur) * 1px));
        color: var(--color);
        font-size: calc(var(--size) / 10 * 1px);
    }
</style>