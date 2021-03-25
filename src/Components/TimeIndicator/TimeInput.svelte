<script>
    let text = "00:00:00";
    let value = "00:00:00"



    $: getValue = () => {
        console.log(value)
        return value
    }

    const handleChange = e => {
        console.log(e.target.value)
    }
</script>


<div class="TimeInput">
<!--    <input class="textInput" bind:value={value} on:input={handleChange}/>-->
    <h1>{text}</h1>
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

    /*input::-webkit-outer-spin-button,*/
    /*input::-webkit-inner-spin-button {*/
    /*    -webkit-appearance: none;*/
    /*    margin: 0;*/
    /*}*/
</style>