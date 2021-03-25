<script>
    import {color, size} from "../../stores/appState";
    const maxSize = Math.min(window.screen.height, window.screen.width);
    import {faPlus, faMinus} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    const makeSmaller = () => {
        if ($size > 100) {
            size.update(v => v - 50);
        }
    }

    const makeBigger = () => {
        if ($size < maxSize) {
            size.update(v => v + 50)
        }
    }
</script>


<div class="ResizeControl" style="--buttonBg: {$color.alpha(0.2).hsl().string()}">
    <button
        class="minusButton"
        disabled={$size <= 100}
        on:click={makeSmaller}
    >
        <Fa icon={faMinus}/>
    </button>

    <button
        class="plusButton"
        disabled={$size >= maxSize}
        on:click={makeBigger}
    >
        <Fa icon={faPlus}/>
    </button>
</div>


<style>
    .ResizeControl {
        position: absolute;
        top: 0;
        left: 5px;
        display: flex;
        justify-content: center;
        opacity: 0;
    }
    .ResizeControl:hover {
        opacity: 1;
    }

    button {
        /*height: 20px;*/
        height: calc(var(--size) / 10 * 1px);
        /*width: 30px;*/
        width: calc(var(--size) / 10 * 1px);

        outline: none;
        border: none;
        font-size: calc(var(--size) / 17 * 1px);
        background: var(--buttonBg);
        color: white;
    }

    button:disabled {
        opacity: 0.4;
    }

    .minusButton {
        border-radius: 10000px 0 0 10000px;
    }

    .plusButton {
        border-radius: 0 10000px 10000px 0;
        margin-left: 1px;

    }
</style>