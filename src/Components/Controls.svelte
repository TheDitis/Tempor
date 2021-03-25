<script>
    import {startTime, duration} from "./stores";


    const startTimer = () => {
        startTime.set(Date.now());
        duration.set(10000);
        const sound = new Audio("file://" + __dirname + "/sounds/startSound.wav");
        sound.play();
    }
</script>

<button on:click={startTimer}>
    START
</button>
