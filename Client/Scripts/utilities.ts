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
			icon = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="exclamation-triangle" class="svg-inline--fa fa-exclamation-triangle fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M248.747 204.705l6.588 112c.373 6.343 5.626 11.295 11.979 11.295h41.37a12 12 0 0 0 11.979-11.295l6.588-112c.405-6.893-5.075-12.705-11.979-12.705h-54.547c-6.903 0-12.383 5.812-11.978 12.705zM330 384c0 23.196-18.804 42-42 42s-42-18.804-42-42 18.804-42 42-42 42 18.804 42 42zm-.423-360.015c-18.433-31.951-64.687-32.009-83.154 0L6.477 440.013C-11.945 471.946 11.118 512 48.054 512H527.94c36.865 0 60.035-39.993 41.577-71.987L329.577 23.985zM53.191 455.002L282.803 57.008c2.309-4.002 8.085-4.002 10.394 0l229.612 397.993c2.308 4-.579 8.998-5.197 8.998H58.388c-4.617.001-7.504-4.997-5.197-8.997z"></path></svg>`;
			break;
		case "error":
			className = "-red";
			icon = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="exclamation-circle" class="svg-inline--fa fa-exclamation-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm42-104c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42zm-81.37-211.401l6.8 136c.319 6.387 5.591 11.401 11.985 11.401h41.17c6.394 0 11.666-5.014 11.985-11.401l6.8-136c.343-6.854-5.122-12.599-11.985-12.599h-54.77c-6.863 0-12.328 5.745-11.985 12.599z"></path></svg>`;
			break;
		case "success":
			className = "-green";
			icon = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="check-circle" class="svg-inline--fa fa-check-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"></path></svg>`;
			break;
		default:
			icon = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="info-circle" class="svg-inline--fa fa-info-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path></svg>`;
			break;
	}
	toast({
		title: title,
		message: message,
		closeable: true,
		classes: className,
		duration: 30,
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

async function Outbox(url: string, method: "POST" | "DELETE" | "PUT", data: any):Promise<boolean> {
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
