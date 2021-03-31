<script>
    import Fa from "svelte-fa";
    import {fade} from "svelte/transition";
    import {faSave} from "@fortawesome/free-solid-svg-icons";
    import {saveSettings, color, size, width} from "../../stores/appState";
    import {tick} from "svelte";
    import {DoubleBounce, Jumper, Jellyfish} from "svelte-loading-spinners";

    let saved = true;

    const onClick = async () => {
        console.log("saving");
        saved = false;
        await tick();
        saveSettings()
        .then(res => {
            setTimeout(() => saved = true, 1000)
            console.log("saved");
        })
    }

</script>

<button
    class="SaveButton"
    on:click={onClick}
>

    <!--{:else}-->
        <div transition:fade>
            <Fa icon={faSave}/>
        </div>

    <!--{/if}-->
    {#if !saved}
        <div class="loading" transition:fade>
            <Jumper color={$color.hex()} size={$width < 200 ? 26 : $size / 5}/>
        </div>
    {/if}

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

        transition-property: filter;
        bottom: 8px;

        transition-duration: 300ms;
    }

    .loading {
        position: absolute;
        filter: hue-rotate(-70deg);
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