<script>
    import {onMount} from "svelte";
    import {formatTime} from "../../utils/utils";
    import {tempDuration} from "../../stores/timerState";
    import {DateTime, Duration} from "luxon";
    import _ from "lodash";
    // let text = "00:00:00";
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    $: value = formatTime(hours, minutes, seconds)
    let numbers = ""
    let input;

    onMount(() => {
        input.focus();
    })

    const updateTempDuration = () => {
        const duration = Duration.fromObject({hours, minutes, seconds})
        console.log(duration.toMillis());
        tempDuration.set(duration.toMillis());
    }


    const handleChange = e => {
        /// get rid of all characters that aren't digits, as well as leading 0's
        numbers = numbers.replace(/\D/g,'');
        numbers = _.dropWhile(numbers, c => c === "0").join("")

        // limit the length to 6:
        if (numbers.length > 6) {
            numbers = numbers.substring(0, 6)
        }

        /// create 6 digit string, split into pairs (hr, min, sec) and parse each into integers
        let sixNums = _.padStart(numbers, 6, "0");
        sixNums = sixNums.match(/.{1,2}/g).map(strNum => parseInt(strNum))

        // assign time values
        hours = sixNums[0];
        minutes = sixNums[1];
        seconds = sixNums[2];
        updateTempDuration();
    }
</script>


<div class="TimeInput" on:click={() => input.focus()}>
<!--    <input class="textInput" bind:value={value} on:input={handleChange}/>-->
<!--    <h1 bind:this={input} contenteditable bind:innerHTML={text}></h1>-->
<h1>{value}</h1>
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
        opacity: 0;
    }

    /*input::-webkit-outer-spin-button,*/
    /*input::-webkit-inner-spin-button {*/
    /*    -webkit-appearance: none;*/
    /*    margin: 0;*/
    /*}*/
</style>