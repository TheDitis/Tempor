<script>
    import {settingsHeight, color, settingsTab} from "../../stores/appState";
    import IntervalSettings from "./IntervalSettings/IntervalSettings.svelte"
    import SaveButton from "./SaveButton.svelte";
    import {afterUpdate, onMount} from "svelte";
    import SettingsTabs from "./Tabs/SettingsTabs.svelte";
    import StyleSettings from "./Style/StyleSettings.svelte";
    import SoundSettings from "./Sound/SoundSettings.svelte"

    let settingsRef;

    const settingsPages = {
        "style": StyleSettings,
        "sound": SoundSettings,
        "intervals": IntervalSettings,
    }

    onMount(() => {
        settingsHeight.set(settingsRef.clientHeight);
    })
    afterUpdate(() => {
        settingsHeight.set(settingsRef.clientHeight);
    })
</script>


<div
    bind:this={settingsRef}
    class="Settings"
    style="
        --settingsHeight: {$settingsHeight};
        --color2: {$color.alpha(0.5).hsl().string()}
    "
>
    <SettingsTabs/>

    <svelte:component this={settingsPages[$settingsTab]}/>

    <div class="bottomRow">
        <SaveButton/>
    </div>
</div>


<style>
    .Settings {
        position: relative;
        width: calc(var(--width) * 1px);
        /*height: calc(var(--settingsHeight) * 1px);*/
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
        box-sizing: border-box;
        padding-top: 0;
        /*box-shadow: 15px 0 15px -15px var(--color);*/
    }

    .bottomRow {
        margin-top: 30px;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
    }
</style>