<script>
    import {inputRef} from "../../../stores/appState";

    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let label;
    export let step = 0.1;
    export let onChange = () => null;
    export let disabled = false;

    const handleChange = () => {
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
        margin: 0;
    }

    .disabled {
        opacity: 0.4;
    }

    p {
        color: var(--color);
        font-size: calc(var(--size) / 15 * 1px);
        margin: 0;
        padding: 0 0 0 3px;
        user-select: none;
    }

    input[type=range] {
        filter: blur(calc(var(--textBlur) * 1px));
        -webkit-appearance: none;
        width: 100%;
        outline: none;
        border: none;
        background: transparent;
        height: calc(var(--size) / 10 * 1px);
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: var(--color);
        outline: none;
        width: calc(var(--size) / 15 * 1px);
        height: calc(var(--size) / 15 * 1px);
        border-radius: 100%;
        margin-top: calc(var(--size) / -54.5 * 1px);
    }

    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: calc(var(--size) / 40 * 1px);
        cursor: pointer;
        background: var(--color2);
        border-radius: 10px;
    }

    @media (max-width: 250px) {
        p {
            font-size: 8pt;
        }
    }

</style>