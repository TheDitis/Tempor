<script>
    import Fa from "svelte-fa";
    import {settingsTab} from "../../../stores/appState";

    export let name;
    export let icon;

    $: isCurrent = $settingsTab === name;

    const onClick = () => settingsTab.set(name);
</script>


<div class="SettingsTab" class:active={isCurrent} on:click={onClick}>
    <div class="mainSection">
        <Fa icon={icon}/>
    </div>
    <div class="underline" class:activeUnderline={isCurrent}></div>
</div>



<style>
    .SettingsTab {
        width: 100%;
        color: var(--color);
        opacity: 0.5;
        transition-property: opacity;
        transition-duration: 300ms;
        margin-left: 2px;
        margin-right: 2px;
    }
    .mainSection {
        font-size: calc(var(--size) / 13 * 1px);
        text-align: center;
        padding: calc(var(--size) / 22 * 1px);
        filter: blur(calc(var(--textBlur) / 2 * 1px));
    }
    .active {
        opacity: 1;
    }
    .underline {
        width: 100%;
        height: 5px;
        background: var(--color);
        transition-property: opacity;
        opacity: 0.3;
        transition-duration: 500ms;
        filter: blur(calc(var(--textBlur) * 2px));
    }
    .activeUnderline {
        opacity: 1;
    }
</style>