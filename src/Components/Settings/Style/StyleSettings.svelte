<script lang="ts">
    /**
     * StyleSettings.svelte
     * author: Ryan McKay
     *
     * The settings page dedicated to app appearance / style
     */
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";
    import {faAdjust, faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import {
        blur,
        borderRadius,
        globalHue,
        hue,
        intervalColors,
        intervalMode,
        lineThickness,
        settings
    } from "../../../stores/appState";
    import {intervalIndex} from "../../../stores/timerState";

    /**
     * Cycles to the next app theme
     * @event {KeyboardEvent} - keyboard event with key 'b', which is the key
     *      MasterControls listens for to run the appropriate logic
     */
    const cycleTheme = () => {
        const e = new KeyboardEvent(
            "keydown",
            {bubbles : true, cancelable : true, key: 'b', shiftKey : false}
        );
        document.dispatchEvent(e);
    };

    // true is in interval mode and the current interval has a set color
    let customColor: boolean;
    $: customColor = $intervalMode && $intervalColors[$intervalIndex] !== null;
    // if current color isn't a custom interval color, update hue with global
    $: { if (!customColor) hue.set($globalHue) }
</script>


<SettingsSection>
    <SettingsSlider label="Color" bind:value={$globalHue} min="0" max="360" disabled={customColor}/>
    <SettingsSlider label="Line Width" bind:value={$lineThickness} min="0" max="100"/>
    <SettingsSlider label="Blur" bind:value={$blur} min="0" max="10"/>
    {#if $settings.theme !== "transparent"}
        <SettingsSlider label="Border" bind:value={$borderRadius} min="0" max="100"/>
    {/if}
    <div class="buttonSection" slot="buttons">
        <SettingsOptionButton icon={faLayerGroup} option="alwaysOnTop" label="Always on top"/>
        <SettingsOptionButton icon={faAdjust} onChange={cycleTheme} label="Background"/>
    </div>
</SettingsSection>


<style>
    .buttonSection {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }
</style>