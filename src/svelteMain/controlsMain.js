import AppControls from '../AppControls.svelte';

const appControls = new AppControls({
    target: document.body,
    props: {
        width: 200,
        height: 200,
    }
});

export default appControls;