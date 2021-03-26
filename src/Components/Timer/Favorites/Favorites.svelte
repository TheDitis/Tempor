<script>
    import {settings, currentFavInd} from "../../../stores/appState";

    import {fade} from "svelte/transition"

    $: favsList = $settings.favorites
</script>

<div class="Favorites" in:fade={{duration: 100}} out:fade={{duration: 100}}>
    {#each favsList as fav, i}
        <div class="favorite" class:used={!!fav} class:selected={$currentFavInd === i}>
            <p>{i + 1}</p>
        </div>
    {/each}
</div>


<style>
    .Favorites {
        position: absolute;
        top: calc(var(--size) * 0.25 * 1px);
        background: transparent;
        border: none;
        font-size: calc(var(--size) * 0.10 * 1px);
        color: var(--color);
        filter: blur(calc(var(--textBlur) * 0.8 * 1px));

        display: flex;
    }


    .favorite {
        opacity: 0.3;
        margin: 0;
        padding: 0;
        border: 2px solid var(--color);
        height: calc(var(--size) * 0.08 * 1px);
        width: calc(var(--size) * 0.08 * 1px);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 1000px;
    }

    .used {
        opacity: 1;
    }

    p {
        color: var(--color);
        font-size: calc(var(--size) * 0.07 * 1px);
        line-height: calc(var(--size) * 0.07 * 1px);
        margin: 0;
        padding: 0;
    }
</style>