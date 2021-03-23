<script>
    import {start, duration} from "./stores/stores"
    // export let width;
    // export let height;
    const startTimer = () => {
        start.set(Date.now());
        duration.set(10000)
    }
</script>


<main>
    <h1>{$start}</h1>
    <button on:click={startTimer}>Start</button>
</main>