<script>
    import Fa from "svelte-fa";
    import {faSave} from "@fortawesome/free-solid-svg-icons";
</script>

<button
    class="SaveButton"
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
        right: 5px;
        bottom: 5px;
    }
</style>