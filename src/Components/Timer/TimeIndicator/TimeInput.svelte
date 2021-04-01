<script>
    import {onMount, afterUpdate} from "svelte";
    import {formatTime, formatTimeMs, arraysEqual} from "../../../utils/utils";
    import {tempDuration, runState, focused, intervalDurations, intervalIndex} from "../../../stores/timerState";
    import {currentFavInd, settings, intervalMode, currentFavInterval} from "../../../stores/appState";
    import {Duration} from "luxon";
    import _ from "lodash";

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let numbers = ""
    let input;

    onMount(() => {
        if (!$intervalMode && $tempDuration !== 0 && $runState !== "running") {
            numbers = formatTimeMs($tempDuration).replaceAll(":", "")
            numsStrToHrsMinsSecs();
        }

        if ($intervalMode && $intervalDurations[$intervalIndex]) {
            numbers = formatTimeMs($intervalDurations[$intervalIndex]).replaceAll(":", "")
            numsStrToHrsMinsSecs();
        }
    })

    const update = (deps = null) => {
        if (!$intervalMode) {
            if ($tempDuration !== 0 && $runState !== "running") {
                numbers = formatTimeMs($tempDuration).replaceAll(":", "")
                numsStrToHrsMinsSecs();
            }
        }
        else {
            if ($intervalDurations.every(v => v) && $runState !== "running") {
                numbers = formatTimeMs($intervalDurations[$intervalIndex]).replaceAll(":", "")
                numsStrToHrsMinsSecs();
            }
        }
    }

    $: { update([$currentFavInd, $currentFavInterval]) }
    $: readableTime = formatTime(hours, minutes, seconds)



    const updateTempDuration = () => {
        const duration = Duration.fromObject({hours, minutes, seconds})
        tempDuration.set(duration.toMillis());
        if ($currentFavInd !== null && $settings.favorites[$currentFavInd] !== duration.toMillis()) {
            currentFavInd.set(null)
        }
    }


    const updateIntervalTime = () => {
        const duration = Duration.fromObject({hours, minutes, seconds});
        const tempIntervalDurations = [...$intervalDurations];
        tempIntervalDurations[$intervalIndex] = duration.toMillis();
        intervalDurations.set(tempIntervalDurations);
        if ($currentFavInterval !== null && !arraysEqual(tempIntervalDurations, $settings.favoriteIntervals[$currentFavInterval])) {
            currentFavInterval.set(null);
        }
    }

    const numsStrToHrsMinsSecs = () => {
        /// create 6 digit string, split into pairs (hr, min, sec) and parse each into integers
        let sixNums = _.padStart(numbers, 6, "0");
        sixNums = sixNums.match(/.{1,2}/g).map(strNum => parseInt(strNum))

        // assign time values
        hours = sixNums[0];
        minutes = sixNums[1];
        seconds = sixNums[2];
    }


    const handleChange = e => {
        /// get rid of all characters that aren't digits, as well as leading 0's
        numbers = numbers.replace(/\D/g,'');
        numbers = _.dropWhile(numbers, c => c === "0").join("")

        // limit the length to 6:
        if (numbers.length > 6) {
            numbers = numbers.substring(0, 6)
        }

        numsStrToHrsMinsSecs();

        if (!$intervalMode) {
            updateTempDuration();
        }
        else {
            updateIntervalTime();
        }
    }
</script>


<div class="TimeInput" on:click={() => input.focus()}>
<h1>{readableTime}</h1>
<input bind:this={input} class="hiddenInput" type="text" bind:value={numbers} on:input={handleChange}/>
</div>


<style>
    .TimeInput {
        display: flex;
        justify-content: center;
    }
    h1 {
        color: var(--color);
        font-size: var(--fontSize);
        font-family: var(--fontFamily);
    }
    h1:focus {
        outline: none;
    }

    .hiddenInput {
        position: absolute;
        /*visibility: hidden;*/
        opacity: 0;
        /*width: 0;*/
        /*height: 0;*/
    }
</style>