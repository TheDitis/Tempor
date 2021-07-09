<script lang="ts">
    /**
     * TimeInput.svelte
     * author: Ryan McKay
     *
     * Input component of the timer. Handles entering of time values
     */
    import {onMount} from "svelte";
    import {arraysEqual, formatTime, formatTimeMs} from "../../../utils/utils";
    import {intervalDurations, intervalIndex, runState, tempDuration} from "../../../stores/timerState";
    import {currentFavInd, currentFavInterval, inputRef, intervalMode, meme, settings} from "../../../stores/appState";
    import {Duration} from "luxon";
    import _ from "lodash";



    //------------------------------------------------------------------------------------------------------------------
    //   COMPONENT STATE
    //------------------------------------------------------------------------------------------------------------------

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let numbers = "";

    /** ON MOUNT: Determine initial values for state variables */
    onMount(() => update());



    //------------------------------------------------------------------------------------------------------------------
    //   UPDATE HANDLER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Populates number string and the individual duration items, and set focus
     * on the input element
     * @param deps - placeholder for svelte reactive expression dependents
     */
    const update = (deps = null) => {
        // If in standard mode:
        if (!$intervalMode) {
            if ($tempDuration !== 0 && $runState !== "running") {
                numbers = formatTimeMs($tempDuration).replace(/:/g, "");
                numsStrToHrsMinsSecs(numbers);
            }
        }
        // If in interval mode:
        else {
            if ($intervalDurations.every(v => v) && $runState !== "running") {
                numbers = formatTimeMs($intervalDurations[$intervalIndex])
                    .replace(/:/g, "");
                numsStrToHrsMinsSecs(numbers);
            }
        }
        // If the inputRef has already been bound successfully, set focus on it
        if ($inputRef) {
            $inputRef.focus()
        }
    };

    /** Runs on change when in standard mode, and updates tempDuration store */
    const updateTempDuration = () => {
        const duration = Duration.fromObject({hours, minutes, seconds});
        tempDuration.set(duration.toMillis());
        // If a favorite is selected and the value is changed, indicate that
        // you are no longer on a favorite
        if ($currentFavInd !== null
            && $settings.favorites[$currentFavInd] !== duration.toMillis()
        ) { currentFavInd.set(null) }
    };

    /**
     * Runs on change when in interval mode, and updates the value in
     * intervalDurations at the index of the currently selected
     */
    const updateIntervalTime = () => {
        const duration = Duration.fromObject({hours, minutes, seconds});
        const tempIntervalDurations = [...$intervalDurations];
        tempIntervalDurations[$intervalIndex] = duration.toMillis();
        intervalDurations.set(tempIntervalDurations);
        // if a favorite interval is selected and its values have been altered,
        // indicate that we are no longer on that favorite
        if ($currentFavInterval !== null
            && !arraysEqual(
                tempIntervalDurations,
                $settings.favoriteIntervals[$currentFavInterval]
            )
        ) { currentFavInterval.set(null) }
    };

    /**
     * Checks for easter-egg values and updates meme store if it detects one
     * @param deps - placeholder for svelte reactive expression dependents
     */
    const memeDetector = (deps) => {
        const secString = seconds.toString();
        if (secString.length === 2 && secString[0] === "6" && secString[1] === "9") {
            meme.set("wink");
            return;
        }
        const minString = minutes.toString();
        if (minString[minString.length - 1] === "4" && secString === "20") {
            meme.set("leaf");
            return;
        }
        meme.set(null);
    };

    /**
     * Converts the string representation of the time into the separate
     * component values (hours, minutes, and seconds) and sets those variables
     * @param numsStr {string} - the time representation to parse and split into
     *      time value
     */
    const numsStrToHrsMinsSecs = (numsStr: string) => {
        /// create 6 digit string, split into pairs (hr, min, sec) and parse each into integers
        let strSixNums: string = _.padStart(numsStr, 6, "0");
        const sixNums: number[] = strSixNums
            .match(/.{1,2}/g)
            .map(strNum => parseInt(strNum));

        // assign individual time values
        hours = sixNums[0];
        minutes = sixNums[1];
        seconds = sixNums[2];
    };

    /** PRIMARY CHANGE-HANDLER
     * Passed to the input element to handle any keys entered
     * @param e {InputEvent} - the event triggered upon keypress in the input
     */
    const handleChange = e => {
        /// get rid of all characters that aren't digits, as well as leading 0's
        numbers = numbers.replace(/\D/g,'');
        numbers = _.dropWhile(numbers, c => c === "0").join("");

        // limit the length to 6:
        if (numbers.length > 6) {
            numbers = numbers.substring(0, 6);
        }
        numsStrToHrsMinsSecs(numbers); //<-- updates hours, minutes, and seconds

        // Call appropriate function to handle new time values
        if (!$intervalMode) {
            updateTempDuration();
        } else {
            updateIntervalTime();
        }
    };



    //------------------------------------------------------------------------------------------------------------------
    //   REACTIVE UPDATER CALLS
    //------------------------------------------------------------------------------------------------------------------

    // Update component variables if a favorite is selected
    $: update([$currentFavInd, $currentFavInterval]);

    // The string to display on the time indicator
    let readableTime: string;
    $: readableTime = formatTime({hours, minutes, seconds});

    // Check for easter-egg states when entered time changes
    $: memeDetector([hours, minutes, seconds])

</script>



<div class="TimeInput" on:click={() => $inputRef.focus()}>
    <h1>{readableTime}</h1>
    <input bind:this={$inputRef} class="hiddenInput" type="text" bind:value={numbers} on:input={handleChange}/>
</div>



<style>
    .TimeInput {
        display: flex;
        justify-content: center;
    }

    h1 {
        margin: 0;
        color: var(--color);
        font-size: var(--fontSize);
        font-family: var(--fontFamily);
    }

    h1:focus {
        outline: none;
    }

    .hiddenInput {
        position: absolute;
        opacity: 0;
    }
</style>