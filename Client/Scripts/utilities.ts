function buildHeaders(): Headers {
	return new Headers({
		"Content-Type": "application/json",
		Accept: "application/json",
	});
}

function buildRequestOptions(method: Method = "GET", body: any = null): RequestInit {
	const options: RequestInit = {
		method: method,
		headers: buildHeaders(),
		credentials: "include",
	};
	if (body) {
		options.body = JSON.stringify(body);
	}
	return options;
}

/**
 * Build and returns a API fetch request.
 * @example buildRequest("v1/user/profile", "GET");
 * @example buildRequest("v1/login", "POST", { email: email, password: password, name: name,});
 */
function apiRequest(route: string, method: Method = "GET", body: any = null) {
	return fetch(`${API_URL}/${route.replace(/^\//, "").trim()}`, buildRequestOptions(method, body));
}

function buildResponseCore(success: boolean, statusCode: number, error: string = null): ResponseCore {
	return {
		Success: success,
		StatusCode: statusCode,
		Error: error,
	};
}

function ClearStorage() {
	localStorage.clear();
	sessionStorage.clear();
}

function Notify(message: string) {
	snackbar({
		message: message,
		duration: Infinity,
		closeable: true,
		force: true,
	});
}

function debounce(func: Function, wait: number, immediate: boolean): Function {
	let timeout;
	return function () {
		const context = this,
			args = arguments;
		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

document.onkeydown = (event: KeyboardEvent) => {
	if (event instanceof KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (key === "f5") {
			event.returnValue = false;
			return false;
		} else if (key === "r" && (event.ctrlKey || event.metaKey)) {
			event.returnValue = false;
			return false;
		}
	}
};

function Alert(type: string, title: string, message: string) {
	let className = "";
	let icon = "";
	switch (type) {
		case "warning":
			className = "-yellow";
			icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
			break;
		case "error":
			className = "-red";
			icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
			break;
		case "success":
			className = "-green";
			icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
			break;
		default:
			icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
			break;
	}
	toast({
		title: title,
		message: message,
		closeable: true,
		classes: className,
		duration: 60,
		icon: icon,
	});
}

const tickets: Array<string> = [];
let domState = "idling";

function StopLoading(ticket: string): void {
	if (!ticket || typeof ticket !== "string") {
		console.error(`A ticket with the typeof 'string' is required to end the loading state.`);
		return;
	}

	for (let i = 0; i < tickets.length; i++) {
		if (tickets[i] === ticket) {
			tickets.splice(i, 1);
			break;
		}
	}

	if (tickets.length === 0 && domState === "loading") {
		domState = "idling";
		document.documentElement.setAttribute("state", domState);
	}
}

async function StartLoading(): Promise<string> {
	if (domState !== "loading") {
		domState = "loading";
		document.documentElement.setAttribute("state", domState);
	}
	const ticket = uid();
	tickets.push(ticket);
	return ticket;
}

const noop = () => {};

function Prompt(label: string, value: string): Promise<string> {
	return new Promise((resolve) => {
		const response = prompt(label, value);
		resolve(response);
	});
}

function Confirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const result = confirm(message);
		resolve(result);
	});
}

function Reinstall() {
	const sw: ServiceWorker = navigator?.serviceWorker?.controller ?? null;
	if (sw) {
		sw.postMessage({
			type: "reinstall",
		});
		setTimeout(() => {
			location.reload();
		}, 300);
	}
}

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
	deferredInstallPrompt = e;
});
function Install() {
	deferredInstallPrompt.prompt();
	deferredInstallPrompt.userChoice.then(() => {
		deferredInstallPrompt = null;
	});
}

const sw: ServiceWorkerContainer = navigator?.serviceWorker ?? null;
if (sw) {
	sw.addEventListener("message", (e: MessageEvent) => {
		const { type, data } = e.data;
		switch (type) {
			case "reload":
				location.reload();
				break;
			default:
				console.warn(`Unhandled Service Worker message: ${type}`);
				break;
		}
	});
}

function LogoutAllInstances() {
	if (sw?.controller) {
		sw.controller.postMessage({
			type: "logout",
		});
	}
}

function LoginAllInstances() {
	if (sw?.controller) {
		sw.controller.postMessage({
			type: "login",
		});
	}
}

function FocusElement(selector: string) {
	// @ts-ignore
	document?.activeElement?.blur();
	setTimeout(() => {
		const el: HTMLElement = document.body.querySelector(selector);
		if (el) {
			el.focus();
		}
	}, 300);
}

function ConvertToBase64(file: File | Blob): Promise<string> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.readAsDataURL(file);
	});
}

function SetTitle(title: string) {
	document.title = title;
}

// @ts-ignore
var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let wasOffline = navigator.onLine === false;
connection.addEventListener("change", (e) => {
	if (navigator.onLine) {
		if (wasOffline) {
			Alert("success", "Reconnected", "Your network connection has been reestablished.");
			sw.controller.postMessage({
				type: "flush-outbox",
			});
		}
		wasOffline = false;
	} else {
		if (!wasOffline) {
			Alert("warning", "Connection Lost", "Your network connection has gone away. Parts of this application may no longer work as expected.");
		}
		wasOffline = true;
	}
});
if (!navigator.onLine) {
	Alert("warning", "Application Offline", "You do not have a network connection. Parts of this application may not work as expected.");
}

async function Outbox(url: string, method: "POST" | "DELETE" | "PUT", data: any = null): Promise<boolean> {
	if (sw?.controller) {
		sw.controller.postMessage({
			type: "queue",
			url: url,
			method: method,
			payload: data,
		});
		return true;
	}
	return false;
}
if (sw?.controller && navigator.onLine) {
	sw.controller.postMessage({
		type: "flush-outbox",
	});
}

async function CopyToClipboard(value: string) {
	if ("clipboard" in navigator) {
		navigator.clipboard.writeText(value);
	}
	return;
}

async function GetSetting(key: string): Promise<string> {
	return localStorage.getItem(key) ?? null;
}

function SetSetting(key: string, value) {
	localStorage.setItem(key, `${value}`);
}

function ResetScroll() {
	document.body.querySelector(".app-body").scrollTo({
		top: 0,
		left: 0,
		behavior: "auto",
	});
}

window.addEventListener("contextmenu", (e) => e.preventDefault());
