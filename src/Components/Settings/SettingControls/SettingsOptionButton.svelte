<script lang="ts">
    /**
     * SettingsOptionButton.svelte
     * author: Ryan McKay
     *
     * A generalized button component for settings
     *
     * @param icon {IconDefinition} - a fontawesome icon element
     * @param [option] {string} - the item in settings that this button controls
     * @param [label] {string} - the label to show on hover
     * @param [onChange] {Function} - a custom click event handler if needed
     */
    import Fa from "svelte-fa";
    import {fade} from "svelte/transition";
    import {color, inputRef, settings} from "../../../stores/appState";
    import type {SettingsObject} from "../../../stores/appState";
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

    /// PROPS:
    export let icon: IconDefinition;
    export let option: string = null;
    export let label = "";
    export let onChange: Function = null;

    // Hover-hit related state
    let showHint = false;
    let hintDelay = 800; // ms delay to show hint
    let timeout: NodeJS.Timeout;

    /** When the mouse moves in, start the clock for displaying the hint */
    const mouseIn = () => {
        timeout = setTimeout(() => showHint = true, hintDelay);
    };

    /** Clear timeout created in mouseIn and hide the hint if its showing */
    const mouseOut = () => {
        clearTimeout(timeout);
        showHint = false;
    };

    /** Called by handleChange when no custom handleChange function is passed */
    const toggle = () => {
        if (option in $settings && typeof $settings[option] === "boolean") {
            settings.set({
                ...$settings,
                [option]: !$settings[option]
            } as SettingsObject);
        } else console.error(
            "option prop passed to SettingsOptionButton not in settings"
        )
    };

    /** Called on click. Calls onChange if it was provided, toggle otherwise */
    const handleChange = (e: MouseEvent) => {
        if (e.clientX && e.clientY) {
            if (onChange) onChange();
            else toggle();
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
            on:click|preventDefault|stopPropagation={handleChange}
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
        font-size: calc(var(--size) / 18 * 1px);
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