<script>
    import {faPalette, faPaintBrush, faVolumeUp} from "@fortawesome/free-solid-svg-icons";
    import SettingsTab from "./SettingsTab.svelte";
    // TODO: icon ideas: stream
</script>


<div class="SettingsTabs">
    <SettingsTab name="style" icon={faPalette}/>
    <SettingsTab name="sound" icon={faVolumeUp}/>
</div>

<style>
    .SettingsTabs {
        display: flex;
        width: 100%;
    }
</style>