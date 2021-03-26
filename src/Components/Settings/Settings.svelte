<script>
    // import {onMount}
    import {settingsOpen, settingsHeight, settings, hue, color, blur} from "../../stores/appState";
    import SettingsSlider from "./SettingsSlider.svelte";
    import SettingsOptionButton from "./SettingsOptionButton.svelte";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import SaveButton from "./SaveButton.svelte";
</script>


<div
    class="Settings"
    style="
        --settingsHeight: {$settingsHeight};
        --color2: {$color.alpha(0.5).hsl().string()}
    "
>
    <SettingsSlider label="Color" bind:value={$hue} min="0" max="360"/>
    <SettingsSlider label="Blur" bind:value={$blur} min="0" max="10"/>
    <div class="buttonSection">
        <SettingsOptionButton icon={faLayerGroup} option="alwaysOnTop" label="Stay on top"/>
    </div>
    <SaveButton/>
</div>


<style>
    .Settings {
        position: relative;
        width: calc(var(--width) * 1px);
        height: calc(var(--settingsHeight) * 1px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
        /*border: 2px solid red;*/
        box-sizing: border-box;
        padding-top: 0;
        /*box-shadow: 15px 0 15px -15px var(--color);*/
    }

    .buttonSection {
        margin-top: 15px;
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }
</style>