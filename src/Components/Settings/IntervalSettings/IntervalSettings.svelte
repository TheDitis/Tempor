<script lang="ts">
    /**
     * IntervalSettings.svelte
     * author: Ryan McKay
     *
     * Settings page dedicated to interval mode
     */
    import {onMount, tick} from "svelte";
    import Fa from "svelte-fa";
    import {faCaretLeft, faCaretRight, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
    import SettingsSection from "../SettingsSection.svelte";
    import {globalHue, hue, inputRef, intervalColors} from "../../../stores/appState";
    import {intervalDurations, intervalIndex, runState} from "../../../stores/timerState";
    import SettingsSlider from "../SettingControls/SettingsSlider.svelte";
    import SettingsOptionButton from "../SettingControls/SettingsOptionButton.svelte";
    import Color from "color";


    /** ON MOUNT
     * Make sure null intervalColors setting is converted to a null array */
    onMount(async () => {
        await tick();
        if ($intervalColors === null) {
            intervalColors.set([null, null, null, null, null]);
        }
        await tick();
    });

    /** Select the previous interval
     * @param event {MouseEvent} - Button click event. Not used, but halted
     * @event {KeyboardEvent} - an 'ArrowLeft' keyboard event with shift marked
     *      true (the combination MasterControls listens to cycle intervals -1)
     */
    const prev = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        const e = new KeyboardEvent(
            "keydown",
            {bubbles : true, cancelable : true, key : "ArrowLeft", shiftKey : true}
        );
        document.dispatchEvent(e);
    };

    /** Select the next interval
     * @param event {MouseEvent} - Button click event. Not used, but halted
     * @event {KeyboardEvent} - an 'ArrowRight' keyboard event with shift marked
     *      true (the combination MasterControls listens to cycle intervals +1)
     */
    const next = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const e = new KeyboardEvent(
            "keydown",
            {bubbles : true, cancelable : true, key : "ArrowRight", shiftKey : true}
        );
        document.dispatchEvent(e);
    };

    /** Generates a select-handler for the given interval index
     * @param i {number} - the index of the interval to get a select-handler for
     * @return {Function} - click event handler with i bound
     */
    const onNumberClick = (i: number) => (
        /** Navigates to interval at index i if state allows it
         * @param e {MouseEvent} - the click event. Unused
         */
        (e: MouseEvent) => {
            if ($runState !== "running") {
                intervalIndex.set(i);
                if ($intervalColors[$intervalIndex]) {
                    hue.set($intervalColors[$intervalIndex])
                }
                else {
                    hue.set($globalHue)
                }
                if ($inputRef) $inputRef.focus();
            }
        }
    );

    /**
     * Sets a separate color for the current interval if it doesn't have one,
     * and removes it if it does
     * @param e {MouseEvent} - not used, only halted
     */
    const toggleCustomColor = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const tempIntervalColors = [...$intervalColors];
        // remove the custom color if there is one
        if (hueValue === null) {
            tempIntervalColors[$intervalIndex] = $globalHue
        }
        // or create a custom color if there isn't one
        else {
            tempIntervalColors[$intervalIndex] = null;
            hue.set($globalHue)
        }
        intervalColors.set(tempIntervalColors);
        if ($inputRef) $inputRef.focus();  // keep focus on the time input
    };

    /** Generates an array of colors, one for each interval
     * @param deps - placeholder for svelte reactive expression dependents
     * @return {Color[]} - an array of Color objects, one for each interval
     */
    const generateUpdatedColors = (deps = null): Color[] => (
        $intervalColors.map((val: number | null): Color => {
            if (val !== null) {
                return new Color('rgb(255, 0, 0)').rotate(val)
            } else {
                return new Color('rgb(255, 0, 0)').rotate($globalHue)
            }
        })
    );


    // The custom hue value for the current interval if one is set
    let hueValue: (number | null);
    $: hueValue = $intervalColors[$intervalIndex];
    // set the actual app color if there is a hue value
    $: if (hueValue) hue.set(hueValue);

    // array of colors for each interval
    let colors: Color[];
    $: colors = generateUpdatedColors($intervalColors);

    // format the colors into a block of css variables
    let cssColorVars: string;
    $: cssColorVars = colors.map((val: Color, index: number) => (
        `--intervalColor${index + 1}:${val.hex()}`)
    ).join(';');

</script>


<SettingsSection>

    <h3>Intervals</h3>

    <div class="intervalColorSection">
        <div class="titleRow">
            <button class="arrowButton" on:click={prev}>
                <Fa icon={faCaretLeft}/>
            </button>

            {#if colors}
                <div class="intervals" style={cssColorVars}>
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
            on:click={toggleCustomColor}
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
        padding: 5px 10px;
        color: var(--color);
        border: 2px solid var(--color);
        outline: none;
        border-radius: 40px;
        font-size: calc(var(--size) / 16 * 1px);

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
        background: transparent;
        border: none;
        font-size: calc(var(--size) * 0.08 * 1px);
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
        transition-property: border, box-shadow;
        transition-duration: 800ms;
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