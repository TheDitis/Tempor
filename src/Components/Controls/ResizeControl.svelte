<script>
    import {createEventDispatcher} from "svelte";
    import {MAX_SIZE, size} from "../../stores/appState";

    import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    const dispatch = createEventDispatcher();

    const sizeDown = () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key: "-", shiftKey : false});
        document.dispatchEvent(e);
    };
    const sizeUp = () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key: "=", shiftKey : false});
        document.dispatchEvent(e);
    }

</script>


<div class="ResizeControl">
    <button
        class="minusButton"
        disabled={$size <= 100}
        on:click={sizeDown}
    >
        <Fa icon={faMinus}/>
    </button>

    <button
        class="plusButton"
        disabled={$size >= MAX_SIZE}
        on:click={sizeUp}
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
        transition-duration: 700ms;
        transition-delay: 500ms;
    }
    .ResizeControl:hover {
        opacity: 1;
        transition-duration: 200ms;
        transition-delay: 0ms;
    }

    button {
        height: calc(var(--size) / 10 * 1px);
        width: calc(var(--size) / 10 * 1px);
        outline: none;
        border: none;
        font-size: calc(var(--size) / 17 * 1px);
        background: var(--buttonBg);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
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