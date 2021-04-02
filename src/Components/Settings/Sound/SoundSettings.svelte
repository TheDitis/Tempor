<script>
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";

    import {settings, inputRef, volume, playSound, intervalMode} from "../../../stores/appState";
    import SelectOption from "../SettingControls/SelectOption.svelte";
    import {listSoundFileNames} from "../../../stores/appState";

    const changeSoundFile = eventName => filename => {
        const sounds = $settings.sounds;
        sounds[eventName] = filename;
        playSound(filename)
        settings.set({...$settings, sounds})
    }

    const onClick = (filename) => {
        playSound(filename);
        if ($inputRef) inputRef.focus();
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
    {#if fileList.length > 0}
        <br/>
        {#if startVal}
            <SelectOption onChange={changeSoundFile("start")} onClick={onClick} bind:value={startVal} label="Start" options={fileList}/>
        {/if}
        {#if $intervalMode && nextVal}
            <br/>
            <SelectOption onChange={changeSoundFile("next")} onClick={onClick} bind:value={nextVal} label="Next" options={fileList}/>
        {/if}
        {#if endVal}
            <br/>
            <SelectOption onChange={changeSoundFile("end")} onClick={onClick} bind:value={endVal} label="End" options={fileList}/>
        {/if}
    {:else}
        <h2>No sound files found</h2>
    {/if}
    <br/>
</SettingsSection>

