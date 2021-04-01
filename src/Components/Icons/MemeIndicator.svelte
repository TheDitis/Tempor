<script>
    import {fade} from "svelte/transition";
    import Fa from "svelte-fa";
    import {color} from "../../stores/appState";
    import {faCannabis, faGrinWink} from "@fortawesome/free-solid-svg-icons";
    import {meme} from "../../stores/appState";

    const faIconMap = {
        leaf: faCannabis,
        wink: faGrinWink,
    }

</script>


<div class="MemeIndicator" transition:fade={{duration: 100}}>
    {#if $meme in faIconMap}
        <Fa icon={faIconMap[$meme]} color={$color.hex()}/>
    {/if}
</div>



<style>
    .MemeIndicator {
        position: absolute;
        top: calc(((var(--size) * 0.05) + var(--thickness)) * 1px);

        filter: blur(calc(var(--textBlur) * 1px));
        color: var(--color);
        font-size: calc(var(--size) / 10 * 1px);
    }
</style>