<script>
    import {start, pause, resume, runState, focused, tempDuration} from "../stores/timerState";
    import Fa from "svelte-fa"
    import {faPlay, faPause, faStop} from '@fortawesome/free-solid-svg-icons'


    const startTimer = () => {
        start()
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


    const handleKeyDown = (e) => {
        const key = e.key;
        switch (key) {
            case " ":
                console.log("Space pressed!");
                if ($runState === "running") pause();
                else if ($runState === "paused") resume();
                break;
            case "Enter":
                if ($focused && $tempDuration) {
                    console.log("starting")
                    start();
                }
                break;
            case "Escape":
                if ($focused) {
                    focused.set(false);
                }
                break;
            // case "Tab":
            //     if (!$focused) focused.set(true);
            //     break;
            default:
                break;
        }
    }

</script>

<div class="PlayPauseControl"
>
    <button
            class="playPauseButton"
            on:click={getRunStateItem(start, pause, resume)}
    >
        <Fa icon={getRunStateItem(faPlay, faPause, faPlay)}/>
    </button>
</div>
<!--{#if !$focused}-->
<svelte:window on:keydown={handleKeyDown}/>
<!--{/if}-->
<style>
    .PlayPauseControl {
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

