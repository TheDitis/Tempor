<script>

</script>


<div class="SettingsSection">
    <div class="mainControls">
        <slot/>
    </div>

    <div class="buttonSection">
        <slot name="buttons"/>
    </div>
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
    }
    .buttonSection {
        margin-top: 15px;
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }

</style>