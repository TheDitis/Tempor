<script>
    import Fa from "svelte-fa";
    import {settings, color} from "../../stores/appState";
    import {time} from "../../stores/timerState";
    import Tooltip from "@fouita/tooltip";


    export let icon;
    export let option;
    export let label;

    let hovered = false;
    // let showHint = false;
    let hoverStart = Date.now();
    const hoverDelay = 1000;


    const toggle = () => {
        settings.set({...$settings, [option]: !$settings[option]});
        console.log("toggle clicked. value: ", $settings[option]);
    }

    const onMouseEnter = () => {
        hoverStart = Date.now();
        hovered = true;
    }

    const onMouseLeave = () => {
        hovered = false;
    }

    $: showHint = hovered && ($time - hoverStart >= hoverDelay)


</script>

    <Tooltip color={$color.alpha(0.2).hsl().string()} pointer=middle position=top text="Middle Top" show>
    <button
            class:on={$settings[option]}
            class:off={!$settings[option]}
            on:mouseenter={onMouseEnter}
            on:mouseleave={onMouseLeave}
            on:click={toggle}
    >

        <Fa {icon}/>
    </button>
    </Tooltip>


<style>
    .SettingsOptionButton {
        position: relative;
    }
    button {
        position: relative;
        height: calc(var(--size) / 7 * 1px);
        width: calc(var(--size) / 7 * 1px);
        font-size: calc(var(--size) / 17 * 1px);
        outline: none;
        border: none;
        background: var(--buttonBg);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 100px;
        box-shadow: none;
    }
    .off {
        box-shadow: none;
        text-shadow: none;
    }
    .on {
        box-shadow: 0 0 10px var(--color);
        background: var(--color);
        text-shadow: 0 0 7px rgba(0, 0, 0, 0.7);
    }

    /*div {*/
    /*    position: absolute;*/
    /*    transition-duration: 500ms;*/
    /*    transition: width 500ms ease-in-out 1s;*/
    /*    bottom: -15px;*/
    /*    max-width: 500px;*/
    /*    color: white;*/
    /*    background: var(--buttonBg);*/
    /*}*/
    /*.hintHidden {*/
    /*    opacity: 0;*/
    /*    height: 0;*/
    /*    width: 0;*/
    /*}*/

    /*.hintVisible {*/
    /*    opacity: 1;*/
    /*    height: 20px;*/
    /*    !*width: auto;*!*/
    /*}*/


</style>