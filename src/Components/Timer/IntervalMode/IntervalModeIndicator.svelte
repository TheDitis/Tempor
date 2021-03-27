<script>
    import TomatoIcon from "../../Icons/TomatoIcon.svelte";
    import {color, intervalMode} from "../../../stores/appState";
</script>

<div class="IntervalModeIndicator" on:click={() => intervalMode.set(false)}>
    <TomatoIcon size={30} color={$color.hex()}/>
</div>


<style>
    .IntervalModeIndicator {
        position: absolute;
        top: calc(var(--size) * 0.12 * 1px);

        filter: blur(calc(var(--textBlur) * 1px));
    }
</style>