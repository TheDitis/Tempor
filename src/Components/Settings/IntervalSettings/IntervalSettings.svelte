<script>
    import {beforeUpdate, afterUpdate, onMount, tick} from "svelte";
    import SettingsSection from "../SettingsSection.svelte";
    import {hue, globalHue, intervalColors, settingsHeight} from "../../../stores/appState";
    import {intervalDurations, intervalIndex} from "../../../stores/timerState";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";

    onMount(async () => {
        if ($intervalColors === null) {
            intervalColors.set([null, null, null, null, null]);
        }
    })


    $: hueValue = $intervalColors[$intervalIndex];


    const onClick = (e) => {
        console.log("onClick: ");
        const tempIntervalColors = [...$intervalColors];
        if (hueValue === null) {
            tempIntervalColors[$intervalIndex] = $globalHue
        }
        else {
            tempIntervalColors[$intervalIndex] = null;
            hue.set($globalHue)
        }
        intervalColors.set(tempIntervalColors);
    }

    const onColorChange = (val) => {
        if (val) hue.set(val);
        console.log($intervalColors)
    }

    $: { onColorChange(hueValue) }

</script>


<SettingsSection>
    <h3>Interval Settings</h3>
    <h4>Interval {$intervalIndex + 1}</h4>
    <button
        class="unlinkButton"
        on:click={onClick}
    >
        {hueValue === null ? "Use Custom Color" : "Use Default Color"}
    </button>
<!--    <div class="spacer"/>-->
    <br/><br/>
    <SettingsSlider
        disabled={hueValue === null}
        label="Interval Color"
        bind:value={$intervalColors[$intervalIndex]}
        min="0"
        max="360"
    />
    <br/>

    <SettingsOptionButton slot="buttons" icon={faSyncAlt} option="repeatIntervalCycle" label="Repeat Cycle"/>
</SettingsSection>



<style>
    .unlinkButton {
        background: none;
        /*height: 30px;*/
        padding: 5px 10px;
        color: var(--color);
        border: 2px solid var(--color);
        outline: none;
        border-radius: 40px;
        /*display: flex;*/

    }
    h3 {
        margin-bottom: 10px;
    }
    h4 {
        margin-top: 5px;
        /*color: var(--color);*/
    }
    .spacer {
        height: 20px;
    }
</style>