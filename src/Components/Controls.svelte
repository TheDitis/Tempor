<script>
    import {start, pause, resume, runState} from "./stores";


    const startTimer = () => {
        // startTime.set(Date.now());
        // duration.set(10000);
        start(10000)
        const sound = new Audio("file://" + __dirname + "/sounds/startSound.wav");
        sound.play();
    }
</script>

<button on:click={$runState === "paused" ? resume : $runState === "running" ? pause : startTimer}>
    {$runState === "paused" ? "RESUME" : $runState === "running" ? "PAUSE" : "START"}
</button>
