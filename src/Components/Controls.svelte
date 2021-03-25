<script>
    import {start, pause, resume, runState} from "../stores/timerState";
    import {size} from "../stores/appState";
    import Fa from "svelte-fa"
    import {faPlay, faPause, faStop} from '@fortawesome/free-solid-svg-icons'


    const startTimer = () => {
        start(10000)
        const sound = new Audio("file://" + __dirname + "/sounds/startSound.wav");
        sound.play();
    }

    $: getRunStateItem = (stoppedResult, runningResult, pausedResult) => {
        switch ($runState) {
            case "running":
                return runningResult;
            case "paused":
                return pausedResult;
            case "stopped":
                return stoppedResult;
        }
    }

</script>

<div class="Controls"
>
    <button
            class="playPauseButton"
            on:click={getRunStateItem(startTimer, pause, resume)}
    >
        <Fa icon={getRunStateItem(faPlay, faPause, faPlay)}/>
    </button>
</div>

<style>
    .Controls {
        position: absolute;
        bottom: calc(var(--size) * 0.25 * 1px);
    }
    .playPauseButton {
        background: transparent;
        border: none;
        font-size: 20px;
        color: var(--color);
    }
    .playPauseButton:focus {
        border: none;
        outline: none;
    }
    .playPauseButton:hover {
        transform: scale(1.05);
    }
</style>

