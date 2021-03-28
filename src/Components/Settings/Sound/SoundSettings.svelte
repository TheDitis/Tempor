<script>
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import {onMount} from "svelte";
    import {settings, volume} from "../../../stores/appState";



</script>


<SettingsSection>
    <SettingsSlider label="Volume" bind:value={$volume} min="0" max="1" step="0.01"/>
</SettingsSection>