<script>

</script>


<div class="SettingsSection">
    <div class="mainControls">
        <slot/>
    </div>

    {#if $$slots.buttons}
        <div class="buttonSection">
            <slot name="buttons"/>
        </div>
    {/if}
</div>


<style>
    .SettingsSection {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
        box-sizing: border-box;
        padding-top: 20px;
    }
    .mainControls {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-height: 200px;
        overflow-y: scroll;
    }
    .buttonSection {
        margin-top: 25px;
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }

</style>