<script>
    import {faAdjust} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import {inputRef, settings} from "../../stores/appState";

    const themeOptions = ["transparent", "dark", "light"];

    const cycleTheme = () => {
        const currentInd = themeOptions.indexOf($settings.theme);
        const nextTheme = themeOptions[(currentInd + 1) % themeOptions.length];
        settings.update(opts => ({...opts, theme: nextTheme}));
        if ($inputRef) $inputRef.focus();
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