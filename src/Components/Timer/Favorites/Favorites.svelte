<script>
    import {settings, currentFavInd, intervalMode, currentFavInterval, inputRef, favKeyMap} from "../../../stores/appState";
    import {focused} from "../../../stores/timerState";
    import _ from "lodash";

    import {fade} from "svelte/transition"
    // import {intervalIndex} from "../../../stores/timerState";
    let favsList, curInd;

    const handleClick = (fav, i) => event => {
        // TODO: HERE!!
        let key;
        if (!!fav) key = _.invert(favKeyMap.load)[i]
        else key = _.invert(favKeyMap.set)[i]
        console.log("sending event with key: ", key)

        event.preventDefault();
        event.stopPropagation();
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key, shiftKey : false});
        document.dispatchEvent(e);
        e.preventDefault();
        e.stopPropagation();
    }

    $: { favsList = $intervalMode ? $settings.favoriteIntervals : $settings.favorites }
    $: { curInd = $intervalMode ? $currentFavInterval : $currentFavInd; }
</script>

<div class="Favorites" in:fade={{duration: 100}} out:fade={{duration: 100}}>
    {#each favsList as fav, i}
        <div class="favorite" class:used={!!fav} class:selected={curInd === i} on:click={handleClick(fav, i)}>
            <p on:click={handleClick(fav, i)}>{i + 1}</p>
        </div>
    {/each}
</div>


<style>
    .Favorites {
        position: absolute;
        top: calc((var(--size) + (var(--thickness) * 2)) * 0.24 * 1px);
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
        height: calc(var(--size) * 0.09 * 1px);
        width: calc(var(--size) * 0.09 * 1px);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 1000px;
        box-sizing: border-box;
        cursor: pointer;
        z-index: 100;
    }

    .selected {
        border: 2px solid var(--color);
        box-shadow: 0 0 6px var(--color);
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
        user-select: none;
        cursor: pointer;
    }
</style>