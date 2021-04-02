<script>
    import {color, settingsHeight, settingsTab} from "../../stores/appState";
    import IntervalSettings from "./IntervalSettings/IntervalSettings.svelte"
    import SaveButton from "./SaveButton.svelte";
    import {afterUpdate, onMount, onDestroy} from "svelte";
    import {fade} from "svelte/transition";
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
    // onDestroy(() => {
    //     console.log("ondestroy called!")
    //     settingsHeight.set(0);
    // })
    afterUpdate(() => {
        settingsHeight.set(settingsRef.clientHeight);
    })
</script>


<div
    bind:this={settingsRef}
    transition:fade={{duration: 0}}
    class="Settings"
    style="
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
        box-sizing: border-box;
        padding-top: 0;
    }

    .bottomRow {
        margin-top: 30px;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
    }
</style>