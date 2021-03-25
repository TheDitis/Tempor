<script>
    import {start, pause, resume, runState} from "../stores/timerState";


    const startTimer = () => {
        // startTime.set(Date.now());
        // duration.set(10000);
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

<button
    on:click={getRunStateItem(startTimer, pause, resume)}
>
    {getRunStateItem("START", "PAUSE", "RESUME")}
</button>
