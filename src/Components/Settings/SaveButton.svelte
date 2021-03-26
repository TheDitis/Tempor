<script>
    import Fa from "svelte-fa";
    import {faSave} from "@fortawesome/free-solid-svg-icons";
    import {saveSettings} from "../../stores/appState";


</script>

<button
    class="SaveButton"
    on:click={saveSettings}
>
    <Fa icon={faSave}/>
</button>


<style>
    .SaveButton {
        /*position: relative;*/
        /*height: calc(var(--size) / 7 * 1px);*/
        /*width: calc(var(--size) / 7 * 1px);*/
        font-size: calc(var(--size) / 13 * 1px);
        outline: none;
        border: none;
        background: transparent;
        /*background: var(--buttonBg);*/
        /*color: white;*/
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 100px;
        box-shadow: none;
        color: var(--color);

        position: absolute;
        /*right: 8px;*/
        bottom: 8px;

        transition-duration: 300ms;
    }

    .SaveButton:hover {
        filter: hue-rotate(-35deg);
    }

    @media (max-width: 200px) {
        .SaveButton {
            width: 35px;
            height: 35px;
            font-size: 18px;
        }
    }
</style>