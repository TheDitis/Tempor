<script>
    import Fa from "svelte-fa";
    import {settings} from "../../../stores/appState";

    export let icon;
    export let option;
    export let label;
    export let onChange;

    const toggle = () => {
        if (onChange) {
            onChange()
        }
        else {
            settings.set({...$settings, [option]: !$settings[option]});
            console.log("toggle clicked. value: ", $settings[option]);
        }
    }

</script>


<button
    class:on={$settings[option]}
    class:off={!$settings[option]}
    on:click={toggle}
>

    <Fa {icon}/>
</button>


<style>
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