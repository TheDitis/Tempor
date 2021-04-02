<script>
    import {faAdjust} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    const themeOptions = ["transparent", "dark", "light"];

    const cycleTheme = () => {
        // send a background cycle key command to our main listener
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key: 'b', shiftKey : false});
        document.dispatchEvent(e);
    }
</script>


<button class="IntervalModeButton" on:click={cycleTheme}>
    <Fa icon={faAdjust}/>
</button>


<style>
    .IntervalModeButton {
        position: absolute;
        top: 5px;
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
    }
    .IntervalModeButton:hover {
        opacity: 1;
        transition-duration: 200ms;
        transition-delay: 0ms;
    }
</style>