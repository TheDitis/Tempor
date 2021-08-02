<script lang="ts">
    /**
     * IntervalModeIndicator.svelte
     * author: Ryan McKay
     *
     * This is the icon on the timer interface that indicates whether or not you are in interval mode
     */
    import {fade} from "svelte/transition";
    import TomatoIcon from "../../Icons/TomatoIcon.svelte";
    import {color, intervalColors, meme, size} from "../../../stores/appState";
    import {intervalDurations} from "../../../stores/timerState";
    import Fa from "svelte-fa";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";

    /** Exits interval mode
     * @event {KeyboardEvent} - an event with the key-code that MasterControls listens for to handleChange interval mode
     */
    const turnOff = async () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key: "i", shiftKey : false});
        document.dispatchEvent(e);

    };

    // Whether or not the times match the classic pomodoro configuration
    let isPomodoro: boolean;
    $: isPomodoro = (
        $intervalDurations.length === 2
        && $intervalDurations[0] === 1500000
        && $intervalDurations[1] === 300000
    );

</script>



{#if !$meme}
    <div class="IntervalModeIndicator" transition:fade={{duration: 100}} on:click={turnOff}>
        {#if isPomodoro}
            <TomatoIcon size={$size / 10} color={$color.hex()} colors={[$intervalColors[0], $intervalColors[1]]}/>
        {:else}
            <Fa icon={faSyncAlt}/>
        {/if}
    </div>
{/if}



<style>
    .IntervalModeIndicator {
        position: absolute;
        top: calc(((var(--size) * 0.05) + var(--thickness)) * 1px);
        color: var(--color);
        font-size: calc(var(--size) / 10 * 1px);
        filter: blur(calc(var(--textBlur) * 1px));
    }
</style>