import App from './App.svelte';


const app = new App({
	target: document.body,
	props: {
		width: 800,
		height: 600,
		// ipcRenderer: electron.ipcRenderer
		// resize: () => ipcRenderer.send("resize")
	}
});

export default app;