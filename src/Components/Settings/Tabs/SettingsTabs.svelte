<script>
    import {faHourglassHalf, faPalette, faVolumeUp} from "@fortawesome/free-solid-svg-icons";
    import SettingsTab from "./SettingsTab.svelte";
    import {intervalMode} from "../../../stores/appState";
    // TODO: icon ideas: stream, link, unlink
</script>


<div class="SettingsTabs">
    <SettingsTab name="style" icon={faPalette}/>
    <SettingsTab name="sound" icon={faVolumeUp}/>
    {#if $intervalMode}
        <SettingsTab name="intervals" icon={faHourglassHalf}/>
    {/if}
</div>

<style>
    .SettingsTabs {
        display: flex;
        width: 100%;
    }
</style>