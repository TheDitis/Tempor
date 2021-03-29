<script>
    import {faPalette, faPaintBrush, faVolumeUp, faHourglassHalf} from "@fortawesome/free-solid-svg-icons";
    import SettingsTab from "./SettingsTab.svelte";
    // TODO: icon ideas: stream, link, unlink
</script>


<div class="SettingsTabs">
    <SettingsTab name="style" icon={faPalette}/>
    <SettingsTab name="sound" icon={faVolumeUp}/>
    <SettingsTab name="intervals" icon={faHourglassHalf}/>
</div>

<style>
    .SettingsTabs {
        display: flex;
        width: 100%;
    }
</style>