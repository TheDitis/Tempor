import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		width: 800,
		height: 600,
	}
});

export default app;