<script>
    import {settingsOpen} from "../../stores/appState";
    import {faCog} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    const toggleSettings = () => {
        settingsOpen.update(isOpen => !isOpen)
    }
</script>

<button class="OpenSettingsButton" on:click={toggleSettings}>
    <Fa icon={faCog}/>
</button>


<style>
    .OpenSettingsButton {
        position: absolute;
        bottom: 5px;
        left: 5px;
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
    .OpenSettingsButton:hover {
        opacity: 1;
        transition-duration: 200ms;
        transition-delay: 0ms;
    }
</style>