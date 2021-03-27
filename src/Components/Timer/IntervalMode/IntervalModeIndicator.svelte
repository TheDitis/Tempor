<script>
    import {fade} from "svelte/transition";
    import TomatoIcon from "../../Icons/TomatoIcon.svelte";
    import {color, intervalMode, size} from "../../../stores/appState";
    import {focused} from "../../../stores/timerState";
    import {tick} from "svelte";

    const turnOff = async () => {
        focused.set(false);
        intervalMode.set(false);
        await tick();
        focused.set(true);
    }

</script>


<div class="IntervalModeIndicator" transition:fade={{duration: 100}} on:click={turnOff}>
    <TomatoIcon size={$size / 10} color={$color.hex()}/>
</div>


<style>
    .IntervalModeIndicator {
        position: absolute;
        top: calc(var(--size) * 0.12 * 1px);

        filter: blur(calc(var(--textBlur) * 1px));
    }
</style>