<script>
    import SettingsSection from "../SettingsSection.svelte";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";
    import {faLayerGroup, faAdjust} from "@fortawesome/free-solid-svg-icons";
    import {
        hue,
        globalHue,
        blur,
        borderRadius,
        lineThickness,
        settings,
        intervalColors
    } from "../../../stores/appState";
    import {intervalIndex} from "../../../stores/timerState";

    const onHueUpdate = (hueVal) => {
        if (!($intervalColors && $intervalColors[$intervalIndex])) {
            globalHue.set(hueVal);
        }
    }

    const themeOptions = ["transparent", "dark", "light"];

    const cycleTheme = () => {
        const currentInd = themeOptions.indexOf($settings.theme);
        const nextTheme = themeOptions[(currentInd + 1) % themeOptions.length];
        settings.update(opts => ({...opts, theme: nextTheme}))
    }

    $: {
        onHueUpdate($hue)
    }
</script>


<SettingsSection>
    <SettingsSlider label="Color" bind:value={$hue} min="0" max="360"/>
    <SettingsSlider label="Line Width" bind:value={$lineThickness} min="0" max="100"/>
    <SettingsSlider label="Blur" bind:value={$blur} min="0" max="10"/>
    {#if $settings.theme !== "transparent"}
        <SettingsSlider label="Border" bind:value={$borderRadius} min="0" max="100"/>
    {/if}
    <div class="buttonSection" slot="buttons">
        <SettingsOptionButton icon={faLayerGroup} option="alwaysOnTop" label="Stay on top"/>
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