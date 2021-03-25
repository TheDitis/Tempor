<script>
    import {start, pause, resume, runState, focused} from "../stores/timerState";
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
            // case "finished":
            default:
                return stoppedResult;
        }
    }

    const keyTypes = {
        32: "space",
        12: "enter",
        16: "shift",
        17: "ctrl"
    }

    const handleKeyDown = (e) => {
        // console.log("code: ", e.key)
        // console.log("code === ' ': ", e.key === ' ')
        const key = e.key;
        switch (key) {
            case " ":
                console.log("Space pressed!");
                if ($runState === "running") pause();
                else if ($runState === "paused") resume();
            default:
                break;
        }
        // const key = keyTypes[]
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
<!--{#if !$focused}-->
<!--    <svelte:window on:keydown={handleKeyDown}/>-->
<!--{/if}-->
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

