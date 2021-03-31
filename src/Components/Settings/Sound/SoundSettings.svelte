<script>
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import {onMount} from "svelte";
    import {settings, volume, playSound, intervalMode} from "../../../stores/appState";
    import SelectOption from "../SettingControls/SelectOption.svelte";
    import {listSoundFileNames} from "../../../stores/appState";

    const changeSoundFile = eventName => filename => {
        console.log(`updating ${eventName} sound to ${filename}`)
        const sounds = $settings.sounds;
        sounds[eventName] = filename;
        playSound(filename)
        settings.set({...$settings, sounds})
    }

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
    <div class="spacer"/>
    <SelectOption onChange={changeSoundFile("start")} value={startVal} label="Start" options={listSoundFileNames()}/>
    {#if $intervalMode}
        <div class="spacer"/>
        <SelectOption onChange={changeSoundFile("next")} value={nextVal} label="Next" options={listSoundFileNames()}/>
    {/if}
    <div class="spacer"/>
    <SelectOption onChange={changeSoundFile("end")} value={endVal} label="End" options={listSoundFileNames()}/>
    <div class="spacer"/>
</SettingsSection>


<style>
    .spacer {
        height: 20px;
    }
</style>