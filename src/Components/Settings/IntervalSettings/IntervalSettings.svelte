<script>
    import {beforeUpdate, afterUpdate, onMount, tick} from "svelte";
    import Fa from "svelte-fa";
    import {faCaretLeft, faCaretRight} from "@fortawesome/free-solid-svg-icons";
    import SettingsSection from "../SettingsSection.svelte";
    import {hue, globalHue, intervalColors, settingsHeight} from "../../../stores/appState";
    import {intervalDurations, intervalIndex} from "../../../stores/timerState";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";

    onMount(async () => {
        if ($intervalColors === null) {
            intervalColors.set([null, null, null, null, null]);
        }
    })

    const prev = () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key : "ArrowLeft", shiftKey : true});
        document.dispatchEvent(e)
    }

    const next = () => {
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key : "ArrowRight", shiftKey : true});
        document.dispatchEvent(e)
    }

    $: hueValue = $intervalColors[$intervalIndex];


    const onClick = (e) => {
        const tempIntervalColors = [...$intervalColors];
        if (hueValue === null) {
            tempIntervalColors[$intervalIndex] = $globalHue
        }
        else {
            tempIntervalColors[$intervalIndex] = null;
            hue.set($globalHue)
        }
        intervalColors.set(tempIntervalColors);
    }

    const onColorChange = (val) => {
        if (val) hue.set(val);
    }

    $: { onColorChange(hueValue) }

</script>


<SettingsSection>

    <h3>Intervals</h3>

    <div class="intervalColorSection">
        <div class="titleRow">
            <button class="arrowButton" on:click={prev}>
                <Fa icon={faCaretLeft}/>
            </button>

            <div class="intervals">
                {#each $intervalDurations as fav, i}
                    <div class="intervalNumber" class:selected={$intervalIndex === i}>
                        <p>{i + 1}</p>
                    </div>
                {/each}
            </div>

<!--            <h4>Interval {$intervalIndex + 1}</h4>-->
            <button class="arrowButton" on:click={next}>
                <Fa icon={faCaretRight}/>
            </button>

        </div>
        <button
            class="unlinkButton"
            on:click={onClick}
        >
            {hueValue === null ? "Use Custom Color" : "Use Default Color"}
        </button>
        <br/><br/>
        <SettingsSlider
            disabled={hueValue === null}
            label="Interval Color"
            bind:value={$intervalColors[$intervalIndex]}
            min="0"
            max="360"
        />
        <br/>
    </div>
    <SettingsOptionButton slot="buttons" icon={faSyncAlt} option="repeatIntervalCycle" label="Repeat Cycle"/>
</SettingsSection>



<style>
    .unlinkButton {
        background: none;
        /*height: 30px;*/
        padding: 5px 10px;
        color: var(--color);
        border: 2px solid var(--color);
        outline: none;
        border-radius: 40px;
        font-size: calc(var(--size) / 16 * 1px);
        /*display: flex;*/

    }
    .intervalColorSection {
        border: 2px solid var(--color);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        width: 90%;
    }
    .titleRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 95%;
        margin-top: 10px;
        margin-bottom: 20px;
    }
    .intervals {
        /*position: absolute;*/
        /*top: calc((var(--size) + (var(--thickness) * 2)) * 0.24 * 1px);*/
        background: transparent;
        border: none;
        font-size: calc(var(--size) * 0.08 * 1px);
        color: var(--color);
        filter: blur(calc(var(--textBlur) * 0.8 * 1px));
        width: 90%;
        display: flex;
        justify-content: space-evenly;
    }
    .intervalNumber {
        margin: 0;
        padding: 0;
        height: calc(var(--size) * 0.11 * 1px);
        width: calc(var(--size) * 0.11 * 1px);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-radius: 1000px;
        box-sizing: border-box;
        transition-duration: 800ms;
        transition-property: border, box-shadow;
    }
    .selected {
        border: 2px solid var(--color);
        box-shadow: 0 0 10px var(--color);
    }
    .arrowButton {
        background: transparent;
        color: var(--color);
        border: none;
        outline: none;
        font-size: calc(var(--size) / 8 * 1px);
        display: flex;
        align-items: center;
    }



    h3 {

        font-size: calc(var(--size) * 0.09 * 1px);
        margin-bottom: 10px;
    }
    h4 {
        font-size: calc(var(--size) * 0.08 * 1px);
        margin: 0;
        /*margin-top: 5px;*/
        /*color: var(--color);*/
    }
    .spacer {
        height: 20px;
    }
</style>