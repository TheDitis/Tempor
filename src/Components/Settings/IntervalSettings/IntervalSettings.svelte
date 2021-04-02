<script>
    import {onMount, tick} from "svelte";
    import Fa from "svelte-fa";
    import {faCaretLeft, faCaretRight, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
    import SettingsSection from "../SettingsSection.svelte";
    import {globalHue, hue, inputRef, intervalColors} from "../../../stores/appState";
    import {intervalDurations, intervalIndex} from "../../../stores/timerState";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";
    import Color from "color";

    onMount(async () => {
        await tick();
        if ($intervalColors === null) {
            intervalColors.set([null, null, null, null, null]);
        }
        await tick();
    })

    const prev = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key : "ArrowLeft", shiftKey : true});
        document.dispatchEvent(e);
    }

    const next = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key : "ArrowRight", shiftKey : true});
        document.dispatchEvent(e);
    }

    let hueValue;
    $: hueValue = $intervalColors[$intervalIndex];


    const onUnlinkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tempIntervalColors = [...$intervalColors];
        if (hueValue === null) {
            tempIntervalColors[$intervalIndex] = $globalHue
        }
        else {
            tempIntervalColors[$intervalIndex] = null;
            hue.set($globalHue)
        }
        intervalColors.set(tempIntervalColors);
        // await tick();
        if ($inputRef) $inputRef.focus();
    }

    const onColorChange = (val) => {
        if (val) hue.set(val);
    }



    let colors, intervalColorVars;
    const updateColorsTick = async (deps) => {
        // await tick();
        updateColors()
    }
    const updateColors = (deps) => {
        // await tick();
        const cols = $intervalColors.map(val => {
            if (val !== null) {
                return new Color('rgb(255, 0, 0)').rotate(val)
            } else {
                return new Color('rgb(255, 0, 0)').rotate($globalHue)
            }
        })
        colors = cols
        return colors
    }

    const createCssColorVars = (deps) => {
        intervalColorVars = updateColors($intervalColors)
            .map((val, index) => `--intervalColor${index + 1}:${val.hex()}`)
            .join(';');
    }

    const onNumberClick = (i) => e => {
        intervalIndex.set(i)
        if ($inputRef) $inputRef.focus();
    }


    $: {
        updateColorsTick();
    }

    $: {
        createCssColorVars([colors, $intervalColors, $hue, $globalHue])
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

            {#if colors}
                <div class="intervals" style={intervalColorVars}>
                    {#each $intervalDurations as fav, i}
                        <div class="intervalNumber"  class:selected={$intervalIndex === i} on:click={onNumberClick(i)}>
                            <p style="color: {`var(--intervalColor${i + 1})`};">{i + 1}</p>
                        </div>
                    {/each}
                </div>
            {/if}

<!--            <h4>Interval {$intervalIndex + 1}</h4>-->
            <button class="arrowButton" on:click={next}>
                <Fa icon={faCaretRight}/>
            </button>

        </div>
        <button
            class="unlinkButton"
            on:click={onUnlinkClick}
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
        /*color: var(--color);*/
        filter: blur(calc(var(--textBlur) * 0.8 * 1px));
        width: 90%;
        display: flex;
        justify-content: space-evenly;
    }
    .intervalNumber {
        --col1: "white";
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
        /*color: var(--intervalColor);*/
        /*border: 0 solid var(--color);*/
        /*box-shadow: 0 0 0 var(--color);*/
        transition-property: border, box-shadow;
        transition-duration: 800ms;
        /*, box-shadow;*/
    }
    .selected:nth-of-type(1) {
        border: 2px solid var(--intervalColor1);
        box-shadow: 0 0 10px var(--intervalColor1);
    }
    .selected:nth-of-type(2) {
        border: 2px solid var(--intervalColor2);
        box-shadow: 0 0 10px var(--intervalColor2);
    }
    .selected:nth-of-type(3) {
        border: 2px solid var(--intervalColor3);
        box-shadow: 0 0 10px var(--intervalColor3);
    }
    .selected:nth-of-type(4) {
        border: 2px solid var(--intervalColor4);
        box-shadow: 0 0 10px var(--intervalColor4);
    }
    .selected:nth-of-type(5) {
        border: 2px solid var(--intervalColor5);
        box-shadow: 0 0 10px var(--intervalColor5);
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
</style>