<script lang="ts">
    /**
     * ThemeCycleButton.svelte
     * author: Ryan McKay
     *
     * This button lives in the style settings page and cycles to the next available theme every click
     */
    import {faAdjust} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    /**
     * Cycles to the next app theme
     * @event {KeyboardEvent} - keyboard event with key 'b', which is the key
     *      MasterControls listens for to run the appropriate logic
     */
    const cycleTheme = () => {
        const e = new KeyboardEvent(
            "keydown",
            {bubbles : true, cancelable : true, key: 'b', shiftKey : false}
        );
        document.dispatchEvent(e);
    }
</script>



<button class="IntervalModeButton" on:click={cycleTheme}>
    <Fa icon={faAdjust}/>
</button>



<style>
    .IntervalModeButton {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        opacity: 0;
        top: 5px;
        right: 5px;
        height: calc(var(--size) / 7 * 1px);
        width: calc(var(--size) / 7 * 1px);
        font-size: calc(var(--size) / 17 * 1px);
        outline: none;
        border: none;
        background: var(--buttonBg);
        color: white;
        border-radius: 100000px;
        transition-duration: 700ms;
        transition-delay: 500ms;
    }
    .IntervalModeButton:hover {
        opacity: 1;
        transition-duration: 200ms;
        transition-delay: 0ms;
    }
</style>