<script lang="ts">
    /**
     * SoundSettings.svelte
     * author: Ryan McKay
     *
     * The settings page dedicated to app audio
     */
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import {
        inputRef,
        intervalMode,
        listSoundFileNames,
        playSound,
        settings,
        volume
    } from "../../../stores/appState";
    import type {
        SettingsObject,
        SoundEventLabel,
        SoundSelectionSetting
    } from "../../../stores/appState";
    import SelectOption from "../SettingControls/SelectOption.svelte";


    /** Creates sound file updater for a given event type
     * @param eventName {SoundEventLabel} - the event type to target in updater
     */
    const changeSoundFile = (eventName: SoundEventLabel) => (
        /** Changes the setting sound for the given eventName and plays it
         * @param file {string} - the name of the new sound file
         */
        (file: string) => {
            const sounds: SoundSelectionSetting = $settings.sounds;
            sounds[eventName] = file;
            playSound(file);

            settings.set({...$settings, sounds} as SettingsObject)
        }
    );

    /** Plays the sound file passed
     * @param filename {string} - the name of the sound file to play
     */
    const onClick = (filename: string) => {
        playSound(filename);
        if ($inputRef) $inputRef.focus();  // making sure not to divert focus
    };

    // the audio file names
    let fileList: string[] = listSoundFileNames();

    // If sound settings have been successfully set, set individual sound vars
    let startSound: string, nextSound: string, endSound: string;
    $: if ($settings.sounds) {
        startSound = $settings.sounds.start;
        nextSound = $settings.sounds.next;
        endSound = $settings.sounds.end;
    }

</script>


<SettingsSection>
    <SettingsSlider
            label="Volume"
            bind:value={$volume}
            min="0"
            max="1"
            step="0.01"
    />
    {#if fileList.length > 0}
        <br/>
        {#if startSound}
            <SelectOption
                    onChange={changeSoundFile("start")}
                    onClick={onClick}
                    bind:value={startSound}
                    label="Start"
                    options={fileList}
            />
        {/if}
        {#if $intervalMode && nextSound}
            <br/>
            <SelectOption
                    onChange={changeSoundFile("next")}
                    onClick={onClick}
                    bind:value={nextSound}
                    label="Next"
                    options={fileList}
            />
        {/if}
        {#if endSound}
            <br/>
            <SelectOption
                    onChange={changeSoundFile("end")}
                    onClick={onClick}
                    bind:value={endSound}
                    label="End"
                    options={fileList}
            />
        {/if}
    {:else}
        <h2>No sound files found</h2>
    {/if}
    <br/>
</SettingsSection>

