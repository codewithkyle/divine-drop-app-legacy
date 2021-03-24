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
				if (resolved === stylesheets.length) {
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

function LoadCards() {
	IngestTracked("/v1/ingest/cards", "cards").then((data) => {
		if (data === null) {
			return;
		}
		const { workerUid, total } = data;
		EventBus.create(workerUid);
		tracker({
			total: total,
			count: 0,
			ticket: workerUid,
			label: "Downloading cards",
			tickType: "download",
		});
		tracker({
			total: total,
			count: 0,
			ticket: workerUid,
			label: "Unpacking cards",
			tickType: "unpack",
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
			message: `We are installing an update. Please wait.`,
			duration: Infinity,
			force: true,
			closeable: false,
			classes: ["install-notification"],
		});
		navigator.serviceWorker.onmessage = (e) => {
			location.reload();
		};
		setTimeout(() => {
			location.reload();
		}, 30000);
	} else {
		if (loadedVersion !== null) {
			document.title = `${document.title} v${loadedVersion}`;
		}
		await LoadStylesheets();
		await LoadScripts();
		LoadFramework();
	}
}
Bootstrap();
