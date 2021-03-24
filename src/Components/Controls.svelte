<script>
    import {start, duration} from "./stores";

    const startTimer = () => {
        start.set(Date.now());
        duration.set(10000);
    }
</script>


<button on:click={startTimer}>
    START
</button>
