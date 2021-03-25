<script>
    import {start, pause, resume, runState, focused, tempDuration} from "../stores/timerState";
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
            // case "finished":
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
        bottom: calc(var(--size) * 0.20 * 1px);
        background: transparent;
        border: none;
        font-size: 25px;
        color: var(--color);
    }
    .PlayPauseButton:focus {
        border: none;
        outline: none;
    }
    .PlayPauseButton:hover {
        transform: scale(1.05);
    }
</style>

