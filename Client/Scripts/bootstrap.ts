const loadingText: HTMLSpanElement = document.body.querySelector(".js-loading-text");
let loaded = 0;
let totalResources = scripts.length + stylesheets.length;

function UpdateLoadingText() {
	loaded++;
	loadingText.innerText = `Loading resource ${loaded} of ${totalResources}.`;
}

async function LoadScripts() {
	for (const resource of scripts) {
		await new Promise<void>((loaded) => {
			const script = document.createElement("script");
			script.src = resource;
			script.onload = () => {
				loaded();
			};
			script.onerror = () => {
				loaded();
			};
			document.head.appendChild(script);
		});
		UpdateLoadingText();
	}
}

async function LoadStylesheets() {
	await new Promise<void>((resolve) => {
		let resolved = 0;
		for (const resource of stylesheets) {
			new Promise<void>((loaded) => {
				const stylesheet = document.createElement("link");
				stylesheet.rel = "stylesheet";
				stylesheet.href = resource;
				stylesheet.onload = () => {
					loaded();
				};
				stylesheet.onerror = () => {
					loaded();
				};
				document.head.appendChild(stylesheet);
			}).then(() => {
				UpdateLoadingText();
				resolved++;
				if (resolved === scripts.length) {
					resolve();
				}
			});
		}
	});
}

function LoadFramework() {
	loadingText.innerText = `Launching, please wait.`;
	const framework = document.createElement("script");
	framework.src = "/_framework/blazor.webassembly.js";
	document.head.appendChild(framework);
}

async function Bootstrap() {
	let latestVersion = null;
	const loadedVersion = localStorage.getItem("version");
	try {
		const request = await fetch(`${location.origin}/app.json`, {
			headers: new Headers({
				Accept: "application/json",
			}),
			cache: "no-cache",
		});
		if (request.ok) {
			const response = await request.json();
			latestVersion = response.build;
			localStorage.setItem("version", latestVersion);
		}
	} catch (e) {
		latestVersion = localStorage.getItem("version");
	}
	if (loadedVersion !== latestVersion && loadedVersion !== null) {
		const sw: ServiceWorker = navigator?.serviceWorker?.controller ?? null;
		const app: HTMLElement = document.body.querySelector("app");
		app.style.display = "none";
		if (sw) {
			sw.postMessage({
				type: "reinstall",
			});
		}
		snackbar({
			message: `A manditory update must be installed.`,
			buttons: [
				{
					label: "install update",
					autofocus: true,
					callback: () => {
						const snackbar = document.body.querySelector("snackbar-component");
						if (snackbar) {
							snackbar.remove();
						}
						app.style.display = "flex";
						loadingText.innerText = `Installing update, please wait.`;
						location.reload();
					},
				},
			],
			duration: Infinity,
			force: true,
			closeable: false,
			classes: ["install-notification"],
		});
	} else {
		await LoadStylesheets();
		await LoadScripts();
		LoadFramework();
	}
}
Bootstrap();
