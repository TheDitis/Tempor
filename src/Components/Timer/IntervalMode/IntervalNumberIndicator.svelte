<script>
    import {intervalDurations, intervalIndex} from "../../../stores/timerState";
</script>


<div class="IntervalNumberIndicator">
    {#each $intervalDurations as duration, ind}
        <div class="intervalItem" class:current={$intervalIndex === ind}></div>
    {/each}
</div>


<style>
    .IntervalNumberIndicator {
        position: absolute;
        bottom: calc(var(--size) * 0.43 * 1px);
        display: flex;
        width: calc(var(--size) * 0.67 * 1px);
    }
    .intervalItem {
        width: 100%;
        height: 5px;
        margin: 3px;
        background: var(--color);
        opacity: 0.3;
    }
    .current {
        opacity: 1;
    }
</style>