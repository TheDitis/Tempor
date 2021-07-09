<script lang="ts">
    /**
     * Favorites.svelte
     * author: Ryan McKay
     *
     * This is the the row of favorites numbers displayed inside the timer ring when shift is held
     */
    import {currentFavInd, currentFavInterval, FAVORITES_KEY_MAP, intervalMode, settings} from "../../../stores/appState";
    import {fade} from "svelte/transition";
    import _ from "lodash";

    type FavoritesItem = (number[] | number | null);

    /** Called when a favorites item is clicked
     * @param fav {FavoritesItem} - the item in favorites corresponding to the number clicked
     * @param i {number} - the index of the number clicked (the number minus 1)
     * @event {KeyboardEvent} - emits event with keycode that is being listened for in MasterControls
     *      that corresponds to the clicked favorite
     */
    const handleClick = (fav: FavoritesItem, i: number) => clickEvent => {
        /// Get the key that we need to fake to trigger our setter/getter function
        const keyMap = !!fav ? FAVORITES_KEY_MAP.load : FAVORITES_KEY_MAP.set;
        const key = _.invert(keyMap)[i];

        // stop event so that it doesn't remove focus from the input
        clickEvent.preventDefault();
        clickEvent.stopPropagation();

        // Trigger the relevant branch in our key listener in MasterControls
        const e = new KeyboardEvent(
            "keydown",
            {bubbles : true, cancelable : true, key, shiftKey : false}
        );
        document.dispatchEvent(e);
    };

    // declaring types for svelte 'reactive declaration' assignments
    let favsList: FavoritesItem[];
    let curInd: number;

    // the list of favorites for the mode the timer is currently in
    $: favsList = $intervalMode ? $settings.favoriteIntervals : $settings.favorites;
    // the index of the currently selected favorite in the current mode, if a favorite is selected (for circling)
    $: curInd = $intervalMode ? $currentFavInterval : $currentFavInd;
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
        display: flex;
        background: transparent;
        border: none;
        top: calc((var(--size) + (var(--thickness) * 2)) * 0.24 * 1px);
        font-size: calc(var(--size) * 0.10 * 1px);
        color: var(--color);
        filter: blur(calc(var(--textBlur) * 0.8 * 1px));
    }

    .favorite {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        opacity: 0.3;
        margin: 0;
        padding: 0;
        height: calc(var(--size) * 0.09 * 1px);
        width: calc(var(--size) * 0.09 * 1px);
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