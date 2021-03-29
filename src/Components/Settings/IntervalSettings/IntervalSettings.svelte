<script>
    import SettingsSection from "../SettingsSection.svelte";
    import {hue} from "../../../stores/appState";
    import {intervalDurations} from "../../../stores/timerState";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";

    export let value;
</script>


<SettingsSection>
    {#each $intervalDurations as dur, ind}
        <SettingsSlider label={`Interval ${ind} color`} bind:value={value} min="0" max="360"/>
    {/each}
</SettingsSection>