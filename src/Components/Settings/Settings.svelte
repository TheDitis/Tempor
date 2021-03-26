<script>
    // import {onMount}
    import {settingsOpen, settingsHeight, settings, hue, color, blur} from "../../stores/appState";
    import SettingsSlider from "./SettingsSlider.svelte";
    import SettingsOptionButton from "./SettingsOptionButton.svelte";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
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
    <SettingsOptionButton icon={faLayerGroup} option="alwaysOnTop" label="Stay on top"/>
</div>


<style>
    .Settings {
        position: relative;
        width: calc(var(--size) * 1px);
        height: var(--settingsHeight);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

</style>