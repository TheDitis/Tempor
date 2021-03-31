<script>
    import Fa from "svelte-fa";
    import {faCaretUp, faCaretDown, faCaretLeft, faCaretRight} from "@fortawesome/free-solid-svg-icons";
    import {onMount, beforeUpdate, afterUpdate} from "svelte";
    export let label;
    export let options = ["sound (1).wav", "sound (2).wav", "sound (3).wav"];
    export let onChange = (_val) => {null};
    export let value;

    let ind = 0;


    onMount(() => {
        if (value && ind && options) {
            ind = options.indexOf(value);
            if (ind < 0) ind = 0;
        }
    })

    // beforeUpdate(() => {
    $: value = options[ind];

    beforeUpdate(() => {
        if (value && ind && options) {
            onChange(value);
            const valInd = options.indexOf(value);
            if (valInd !== ind) {
                ind = valInd;
            }
        }
    })

    afterUpdate(() => {
        if (value && ind && options) {

        }
    })

    const withoutExtension = (filename) => (
        filename.slice(0, filename.lastIndexOf("."))
    )

    const next = () => {
        if (ind < options.length - 1) ind = ind + 1;
        else ind = 0;
    }

    const prev = () => {
        if (ind > 0) ind = ind - 1;
        else ind = options.length - 1;
    }

    const onkeyup = e => {
        console.log("onkeyup called! e: ", e);
        e.stopPropagation();
    }
</script>
<svelte:window on:keydown={onkeyup}/>
<div class="SelectDropdown">
    <p>{label}</p>
<!--    <div class="selectList">-->
        <!--{#each options as item}-->
        <!--    <option value={item}>{withoutExtension(item)}</option>-->
        <!--{/each}-->
<!--    </div>-->
    <div class="arrowButtonsSection">
        <button class="arrowButton" on:click={prev}>
            <Fa icon={faCaretLeft}/>
        </button>
        <p>{withoutExtension(value)}</p>
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