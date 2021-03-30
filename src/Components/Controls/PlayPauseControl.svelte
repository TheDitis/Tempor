<script>
    import {
        // start,
        // pause,
        // resume,
        runState,
        focused,
        tempDuration
    } from "../../stores/timerState";

    export let start, pause, resume;

    import Fa from "svelte-fa"
    import {faPlay, faPause, faStop} from '@fortawesome/free-solid-svg-icons'


    $: getRunStateItem = (stoppedResult, runningResult, pausedResult) => {
        switch ($runState) {
            case "running":
                return runningResult;
            case "paused":
                return pausedResult;
            case "stopped":
                return stoppedResult;
            default:
                return stoppedResult;
        }
    }

</script>

    <button
        class="PlayPauseButton"
        on:click={getRunStateItem(start, pause, resume)}
    >
        <Fa icon={getRunStateItem(faPlay, faPause, faPlay)}/>
    </button>


<style>
    .PlayPauseButton {
        position: absolute;
        bottom: calc((var(--size) + (var(--thickness) * 2)) * 0.16 * 1px);
        background: transparent;
        border: none;
        font-size: calc(var(--size) * 0.10 * 1px);
        color: var(--color);
        filter: blur(calc(var(--textBlur) * 1px));
        /*transition-property: filter;*/
        transition-property: transform;
        transition-duration: 200ms;
    }
    .PlayPauseButton:focus {
        border: none;
        outline: none;
    }
    .PlayPauseButton:hover {
        transform: scale(1.05);
        /*filter: hue-rotate(-35deg);*/
    }
</style>

