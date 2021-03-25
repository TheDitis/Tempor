import App from './App.svelte';


const app = new App({
	target: document.body,
	props: {
		width: 300,
		height: 400,
	}
});

export default app;