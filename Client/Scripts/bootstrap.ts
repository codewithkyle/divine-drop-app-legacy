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

function LoadCards(): Promise<void> {
	return new Promise((resolve) => {
		IngestTracked("/v1/ingest/cards", "cards").then((data) => {
			if (data === null) {
				resolve();
				return;
			}
			const { workerUid, total } = data;
			EventBus.create(workerUid);
			loadingText.innerText = `Downloading ${total} cards.`;
			let download = 0;
			let unpack = 0;
			let finishedDownloading = false;
			const inbox = (data) => {
				switch (data) {
					case "download-tick":
						download++;
						loadingText.innerText = `Download card ${download} of ${total}`;
						break;
					case "unpack-tick":
						unpack++;
						if (finishedDownloading) {
							loadingText.innerText = `Unpacking card ${unpack} of ${total}`;
						}
						break;
					case "download-finished":
						finishedDownloading = true;
						break;
					case "unpack-finished":
						EventBus.destroy(workerUid);
						resolve();
						break;
					default:
						break;
				}
			};
			EventBus.subscribe(workerUid, inbox.bind(this));
		});
	});
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
		const app: HTMLElement = document.body.querySelector("app");
		app.style.display = "none";
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
		await LoadCards();
		LoadFramework();
	}
}
Bootstrap();
