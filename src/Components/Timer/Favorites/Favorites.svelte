<script>
    import {currentFavInd, currentFavInterval, favoritesKeyMap, intervalMode, settings} from "../../../stores/appState";
    import _ from "lodash";

    import {fade} from "svelte/transition";

    let favsList, curInd;

    const handleClick = (fav, i) => clickEvent => {
        /// Get the key that we need to fake to trigger our setter/getter function
        const keyMap = !!fav ? favoritesKeyMap.load : favoritesKeyMap.set;
        const key = _.invert(keyMap)[i];

        // stop event so that it doesn't remove focus from the input
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        // Trigger the relevant function in our key listener in MasterControls
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key, shiftKey : false});
        document.dispatchEvent(e);
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