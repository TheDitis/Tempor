<script>
    export let value;
    export let min;
    export let max;
    export let label;

</script>

<div class="SettingsSlider">
    <p>{label}</p>
    <input type="range" bind:value={value} {min} {max} step={0.1}/>
</div>

<style>
    .SettingsSlider {
        width: 90%;
        display: flex;
        flex-direction: column;
        /*border: 2px solid var(--color);*/
        margin: 0;
    }

    p {
        color: var(--color);
        margin: 0;
        padding: 0 0 0 3px;
        /*padding-left: 3px;*/
    }

    input[type=range] {
        filter: blur(calc(var(--textBlur) * 1px));
        -webkit-appearance: none;
        width: 100%;
        outline: none;
        border: none;
        background: transparent; /* Otherwise white in Chrome */
        height: calc(var(--size) / 10 * 1px);
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
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
        /*opacity: 0.3;*/
        border-radius: 10px;
    }

</style>