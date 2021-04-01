<script>
    import Fa from "svelte-fa";
    import {fade} from "svelte/transition";
    import {settings, color, inputRef} from "../../../stores/appState";

    export let icon;
    export let option;
    export let label = "";
    export let onChange;

    let showHint = false;
    let timeout;


    const mouseIn = () => timeout = setTimeout(() => showHint = true, 1000)
    const mouseOut = () => {
        clearTimeout(timeout);
        showHint = false;
    }


    const toggle = (e) => {
        if (e.clientX && e.clientY) {
            e.preventDefault();
            e.stopPropagation();
            console.log(" ", e)
            if (onChange) {
                onChange()
            } else {
                settings.set({...$settings, [option]: !$settings[option]});
            }
            if ($inputRef) $inputRef.focus();
        }
    }

</script>

<div
    class="SettingsOptionButton"
    style="color: {$color.hex()}; font-family: Roboto Regular;"
    on:mouseenter={mouseIn}
    on:mouseleave={mouseOut}
>
        <button
            class:on={$settings[option]}
            class:off={!$settings[option]}
            on:click={toggle}
        >

            <Fa {icon}/>
        </button>
    {#if showHint}
        <div class="hint" transition:fade>
            <p>{label}</p>
        </div>
    {/if}

</div>

<style>
    .SettingsOptionButton {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    button {
        position: relative;
        height: calc(var(--size) / 7 * 1px);
        width: calc(var(--size) / 7 * 1px);

        font-size: calc(var(--size) / 14 * 1px);
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

    .hint {
        position: absolute;
        top: calc(var(--size) / 8 * 1px);
    }

    @media (max-width: 200px) {
        button {
            width: 35px;
            height: 35px;
            font-size: 18px;
        }
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

</style>