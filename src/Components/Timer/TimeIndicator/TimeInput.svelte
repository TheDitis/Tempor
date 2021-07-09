<script lang="ts">
    /**
     * TimeInput.svelte
     * author: Ryan McKay
     */
    import {onMount} from "svelte";
    import {arraysEqual, formatTime, formatTimeMs} from "../../../utils/utils";
    import {intervalDurations, intervalIndex, runState, tempDuration} from "../../../stores/timerState";
    import {currentFavInd, currentFavInterval, inputRef, intervalMode, meme, settings} from "../../../stores/appState";
    import {Duration} from "luxon";
    import _ from "lodash";

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let numbers = "";

    /** ON MOUNT
     * Run the the update function to set initial values the above variables
     */
    onMount(() => {
        update();
        // if (!$intervalMode && $tempDuration !== 0 && $runState !== "running") {
        //     numbers = formatTimeMs($tempDuration).replace(/:/g, "");
        //     numsStrToHrsMinsSecs(numbers);
        // }
        //
        // if ($intervalMode && $intervalDurations[$intervalIndex]) {
        //     numbers = formatTimeMs($intervalDurations[$intervalIndex]).replace(/:/g, "");
        //     numsStrToHrsMinsSecs(numbers);
        // }
        // if ($inputRef) {
        //     $inputRef.focus()
        // }
    });

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

    // Update component variables if a favorite is selected
    $: update([$currentFavInd, $currentFavInterval]);
    $: readableTime = formatTime({hours, minutes, seconds});



    const updateTempDuration = () => {
        const duration = Duration.fromObject({hours, minutes, seconds});
        tempDuration.set(duration.toMillis());
        if ($currentFavInd !== null && $settings.favorites[$currentFavInd] !== duration.toMillis()) {
            currentFavInd.set(null)
        }
    };


    const updateIntervalTime = () => {
        const duration = Duration.fromObject({hours, minutes, seconds});
        const tempIntervalDurations = [...$intervalDurations];
        tempIntervalDurations[$intervalIndex] = duration.toMillis();
        intervalDurations.set(tempIntervalDurations);
        if ($currentFavInterval !== null && !arraysEqual(tempIntervalDurations, $settings.favoriteIntervals[$currentFavInterval])) {
            currentFavInterval.set(null);
        }
    };

    /** Checks for easter-egg values and updates meme store if it detects one
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

    const numsStrToHrsMinsSecs = (numsStr: string) => {
        /// create 6 digit string, split into pairs (hr, min, sec) and parse each into integers
        let strSixNums: string = _.padStart(numsStr, 6, "0");
        const sixNums: number[] = strSixNums
            .match(/.{1,2}/g)
            .map(strNum => parseInt(strNum));

        // assign time values
        hours = sixNums[0];
        minutes = sixNums[1];
        seconds = sixNums[2];
    };


    const handleChange = e => {
        /// get rid of all characters that aren't digits, as well as leading 0's
        numbers = numbers.replace(/\D/g,'');
        numbers = _.dropWhile(numbers, c => c === "0").join("");

        // limit the length to 6:
        if (numbers.length > 6) {
            numbers = numbers.substring(0, 6)
        }

        numsStrToHrsMinsSecs(numbers);

        if (!$intervalMode) {
            updateTempDuration();
        }
        else {
            updateIntervalTime();
        }
    };

    $: { memeDetector([hours, minutes, seconds]) }
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