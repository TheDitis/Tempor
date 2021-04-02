<script>
    import Fa from "svelte-fa";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";


    const toggleIntervalMode = () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key: "i", shiftKey : false});
        document.dispatchEvent(e);
    }
</script>

<button class="IntervalModeButton" on:click={toggleIntervalMode}>
    <Fa icon={faSyncAlt}/>
</button>


<style>
    .IntervalModeButton {
        position: absolute;
        bottom: 5px;
        right: 5px;
        height: calc(var(--size) / 7 * 1px);
        width: calc(var(--size) / 7 * 1px);
        font-size: calc(var(--size) / 17 * 1px);
        outline: none;
        border: none;
        background: var(--buttonBg);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 100000px;
        opacity: 0;
        transition-duration: 700ms;
        transition-delay: 500ms;
        overflow: hidden;
    }
    .IntervalModeButton:hover {
        opacity: 1;
        transition-duration: 200ms;
        transition-delay: 0ms;
    }
</style>