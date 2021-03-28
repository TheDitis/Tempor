<script>
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import {hue, blur, borderRadius, settings} from "../../../stores/appState";
</script>



<SettingsSection>
        <SettingsSlider label="Color" bind:value={$hue} min="0" max="360"/>
        <SettingsSlider label="Blur" bind:value={$blur} min="0" max="10"/>
        {#if $settings.theme !== "transparent"}
                <SettingsSlider label="Border" bind:value={$borderRadius} min="0" max="100"/>
        {/if}
        <SettingsOptionButton slot="buttons" icon={faLayerGroup} option="alwaysOnTop" label="Stay on top"/>
</SettingsSection>