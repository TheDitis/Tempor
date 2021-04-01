<script>
    import {inputRef} from "../../../stores/appState";

    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let label;
    export let step = 0.1
    export let onChange = () => null;
    export let disabled = false;

    const handleChange = (e) => {
        onChange();
        if ($inputRef) $inputRef.focus();
    }

</script>

<div class="SettingsSlider" class:disabled={disabled}>
    <p>{label}</p>
    <input type="range" {disabled} bind:value={value} {min} {max} {step} on:input={handleChange}/>
</div>

<style>
    .SettingsSlider {
        width: 90%;
        display: flex;
        flex-direction: column;
        /*border: 2px solid var(--color);*/
        margin: 0;
    }

    .disabled {
        opacity: 0.4;
    }

    p {
        color: var(--color);
        /*transition-duration: 400ms;*/
        margin: 0;
        padding: 0 0 0 3px;
        /*padding-left: 3px;*/
        user-select: none;
    }

    input[type=range] {
        filter: blur(calc(var(--textBlur) * 1px));
        -webkit-appearance: none;
        /*transition-duration: 400ms;*/
        width: 100%;
        outline: none;
        border: none;
        background: transparent; /* Otherwise white in Chrome */
        height: calc(var(--size) / 10 * 1px);
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        /*transition-duration: 400ms;*/
        background: var(--color);
        outline: none;
        width: calc(var(--size) / 15 * 1px);
        height: calc(var(--size) / 15 * 1px);
        border-radius: 20px;

        margin-top:calc(var(--size) / -54.5 * 1px);;
    }

    /*input[type=range]:focus {*/
    /*    outline: none; !* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. *!*/
    /*}*/

    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 8px;
        cursor: pointer;
        background: var(--color2);
        /*transition-duration: 400ms;*/
        /*opacity: 0.3;*/
        border-radius: 10px;
    }

</style>