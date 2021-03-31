<script>
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";

    import {settings, volume, playSound, intervalMode} from "../../../stores/appState";
    import SelectOption from "../SettingControls/SelectOption.svelte";
    import {listSoundFileNames} from "../../../stores/appState";

    const changeSoundFile = eventName => filename => {
        const sounds = $settings.sounds;
        sounds[eventName] = filename;
        playSound(filename)
        settings.set({...$settings, sounds})
    }

    let fileList = listSoundFileNames();
    let startVal, nextVal, endVal;

    $: {
        if ($settings.sounds) {
            startVal = $settings.sounds.start;
            nextVal = $settings.sounds.next
            endVal = $settings.sounds.end;
        }
    }
</script>


<SettingsSection>
    <SettingsSlider label="Volume" bind:value={$volume} min="0" max="1" step="0.01"/>
    <br/>
    {#if startVal}
        <SelectOption onChange={changeSoundFile("start")} bind:value={startVal} label="Start" options={fileList}/>
    {/if}
    {#if $intervalMode && nextVal}
        <br/>
        <SelectOption onChange={changeSoundFile("next")} bind:value={nextVal} label="Next" options={fileList}/>
    {/if}
    {#if endVal}
        <br/>
        <SelectOption onChange={changeSoundFile("end")} bind:value={endVal} label="End" options={fileList}/>
    {/if}
    <br/>
</SettingsSection>

