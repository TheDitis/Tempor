<script>
    import Fa from "svelte-fa";
    import {faCaretLeft, faCaretRight} from "@fortawesome/free-solid-svg-icons";
    import {onMount, beforeUpdate, afterUpdate, tick} from "svelte";

    export let label = "";
    export let options = [];
    export let onChange = (val) => null;
    export let value;

    // so that the onChange function will be called only when the buttons are pressed, not on initial mount
    let callChangeHandler = false;
    // the index of the current value in the options list provided
    let ind = null;


    onMount(async () => {
        /// ON MOUNT, WAIT FOR VALUE PROP AND FIND ITS INDEX IN THE OPTIONS LIST
        await tick()
        if (options && value) {
            let index = options.indexOf(value);
            if (index < 0) ind = 0;
            else ind = index;
        }
    })

    beforeUpdate(() => {
        /// when the values update, call the change handler
        if (value && callChangeHandler) {
                onChange(value);
        }
    })

    // update the value when index changes.
    $: value = options[ind];


    const withoutExtension = (filename) => (
        // strip the file extension
        filename.slice(0, filename.lastIndexOf("."))
    )

    const next = () => {
        /// GET THE NEXT ITEM, WRAPPING IF NECESSARY
        if (!callChangeHandler) callChangeHandler = true;
        if (ind < options.length - 1) ind = ind + 1;
        else ind = 0;
    }

    const prev = () => {
        /// GET THE PREVIOUS ITEM, WRAPPING IF NECESSARY
        if (!callChangeHandler) callChangeHandler = true;
        if (ind > 0) ind = ind - 1;
        else ind = options.length - 1;
    }

</script>
<div class="SelectDropdown">
    <p>{label}</p>
    <div class="arrowButtonsSection">
        <button class="arrowButton" on:click={prev}>
            <Fa icon={faCaretLeft}/>
        </button>
        {#if ind !== null}
            <p>{withoutExtension(value)}</p>
        {/if}
        <button class="arrowButton" on:click={next}>
            <Fa icon={faCaretRight}/>
        </button>
    </div>
</div>


<style>
    .SelectDropdown {
        color: var(--color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 95%;

    }

    p {
        margin: 0;
        padding: 0;
        margin-bottom: 8px;
        user-select: none;
    }

    .arrowButtonsSection {
        display: flex;
        /*flex-direction: column;*/
        justify-content: space-between;
        align-items: center;
        width: 95%;
        /*border: 1px solid var(--color);*/
        box-shadow: 0 0 6px var(--color);
        border-radius: 50px
    }

    .arrowButton {
        background: transparent;
        color: var(--color);
        border: none;
        outline: none;
        font-size: calc(var(--size) / 8 * 1px);
    }
</style>