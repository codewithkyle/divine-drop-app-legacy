// Caution! Be sure you understand the caveats before publishing an application with
// offline support. See https://aka.ms/blazor-offline-considerations

self.importScripts('./service-worker-assets.js');
self.addEventListener('install', event => event.waitUntil(onInstall(event)));
self.addEventListener('activate', event => event.waitUntil(onActivate(event)));
self.addEventListener('fetch', event => event.respondWith(onFetch(event)));

const cacheNamePrefix = 'resource-cache-';
const apiCachePrefix = "api-cache-";
const imageCacheName = "image-cache";
const cacheName = `${cacheNamePrefix}${self.assetsManifest.version}`;
const apiCacheName = `${apiCachePrefix}${self.assetsManifest.version}`;
const offlineAssetsInclude = [ /\.dll$/, /\.pdb$/, /\.wasm/, /\.html/, /\.js$/, /\.css$/, /\.png$/, /\.jpeg$/, /\.jpg$/, /\.gif$/, /\.webp$/, /\.svg$/, /\.mp3$/, /\.wav$/, /\.json$/, /\.webmanifest$/ ];
const offlineAssetsExclude = [ /service-worker\.js$/, /app\.json$/, ];

async function onInstall(event) {
    self.skipWaiting();
    const assetsRequests = self.assetsManifest.assets
        .filter(asset => offlineAssetsInclude.some(pattern => pattern.test(asset.url)))
        .filter(asset => !offlineAssetsExclude.some(pattern => pattern.test(asset.url)))
        .map(asset => new Request(asset.url));
	for (const request of assetsRequests){
		await caches.open(cacheName).then(cache => cache.add(request)).catch(error => {
			console.error("Failed to cache:", request, error);
		});
	}
    await prepOutbox();
}

async function onActivate(event) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys
        .filter(key => key.startsWith(cacheNamePrefix) && key !== cacheName)
        .map(key => caches.delete(key)));
}

async function tryAppCache(request){
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    return cachedResponse;
}

async function tryImageCache(request){
    const cache = await caches.open(imageCacheName);
    const cachedResponse = await cache.match(request);
    return cachedResponse;
}

async function tryFetch(request){
    const response =  await fetch(request);
    // Skip caching bad responses
    if (!response || response.status !== 200 || response.type !== "basic" && response.type !== "cors" || response.redirected) {
        return response;
    }
    // Only cache image API responses
    if (response.type === "cors"){
        const responseToCache = response.clone();
        if (response.url.indexOf("/v1/image/") !== -1){
            const imgCache = await caches.open(imageCacheName);
            await imgCache.put(request, responseToCache);
        } else {
            const apiCache = await caches.open(apiCacheName);
            await apiCache.put(request, responseToCache);
        }
    } else if (response.type === "basic"){
        await appCache.put(request, responseToCache);
    }
    return response;
}

async function onFetch(event) {
    const shouldServeIndexHtml = event.request.mode === 'navigate';
    const request = shouldServeIndexHtml ? 'index.html' : event.request;
    try {
        if (event.request.method === 'GET' && !event.request.url.match(/app\.json$/)) {
            let response = await tryAppCache(request);
            if (!response){
                if (event.request.url.indexOf("/v1/image/") !== -1){
                    response = await tryImageCache(event.request);
                    if (response){
                        return response;
                    }
                }
            }
            if (!response){
                response = await tryFetch(event.request);
            }
            return response;
        } else {
            return fetch(event.request);
        }
    } catch (e){
        // API cache is only hit when the client doesn't have a network connection
        const apiCache = await caches.open(apiCacheName);
        const cachedResponse = await apiCache.match(request);
        return cachedResponse;
    }
}

async function cachebust(){
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map(key => caches.delete(key)));
}

function reloadClients(){
	self.clients.matchAll().then(clients => {
		clients.forEach(client => {
			if (!client.focused){
				client.postMessage({
					type: "reload",
				});
			}
		});
	});
}

function clearCache(){
    caches.delete(imageCacheName);
    caches.delete(apiCacheName);
    indexedDB.deleteDatabase("localdb");
}

let db = null;
function queue(url, method, payload){
    db.put("outbox", {
        uid: uid(),
        url: url,
        method: method,
        payload: payload,
    });
}

async function prepOutbox(){
    db = await idb.openDB("service-worker", 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Purge old stores so we don't brick the service worker when upgrading
            for (let i = 0; i < db.objectStoreNames.length; i++) {
                db.deleteObjectStore(db.objectStoreNames[i]);
            }
            const outbox = db.createObjectStore("outbox", {
                keyPath: "uid",
                autoIncrement: false,
            });
            outbox.createIndex("uid", "uid", { unique: true });
            outbox.createIndex("url", "url", { unique: false });
            outbox.createIndex("method", "method", { unique: false });
            outbox.createIndex("payload", "payload", { unique: false });
        },
    });
}

async function tryRequest(request){
    try {
        const response = await fetch(request.url, {
            method: request.method,
            credentials: "include",
            body: request.payload,
        });
        return response.ok;
    } catch (e){
        return false;
    }
}

let flushingOutbox = false;
async function flushOutbox(){
    if(flushingOutbox){
        return;
    }
    flushingOutbox = true;
    const requests = await db.getAll("outbox");
    for (const request of requests){
        if (navigator.onLine){
            const success = await tryRequest(request);
            if (success){
                await db.delete("outbox", request.uid);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    flushingOutbox = false;
}

// @ts-ignore
var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
connection.addEventListener("change", (e) => {
	if (navigator.onLine) {
		flushOutbox();
	}
});

self.onmessage = async (event) => {
    const { type } = event.data;
    switch (type){
        case "flush-outbox":
            flushOutbox();
            break;
        case "queue":
            if (event.data?.url && event.data?.method && event.data?.payload){
                queue(event.data.url, event.data.method, event.data.payload);
            }
            break;
		case "login":
			reloadClients();
			break;
		case "logout":
            clearCache();
			reloadClients();
			break;
        case "reinstall":
            await cachebust();
            break;
        default:
            break;
    }
}

///////// VENDOR CODE BELOW -- DO NOT TOUCH \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
var idb = function (e) {
    "use strict";
    let t, n;
    const r = new WeakMap, o = new WeakMap, s = new WeakMap, a = new WeakMap, i = new WeakMap;
    let c = { get(e, t, n) { if (e instanceof IDBTransaction) {
            if ("done" === t)
                return o.get(e);
            if ("objectStoreNames" === t)
                return e.objectStoreNames || s.get(e);
            if ("store" === t)
                return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
        } return p(e[t]); }, set: (e, t, n) => (e[t] = n, !0), has: (e, t) => e instanceof IDBTransaction && ("done" === t || "store" === t) || t in e };
    function u(e) { return e !== IDBDatabase.prototype.transaction || "objectStoreNames" in IDBTransaction.prototype ? (n || (n = [IDBCursor.prototype.advance, IDBCursor.prototype.continue, IDBCursor.prototype.continuePrimaryKey])).includes(e) ? function (...t) { return e.apply(f(this), t), p(r.get(this)); } : function (...t) { return p(e.apply(f(this), t)); } : function (t, ...n) { const r = e.call(f(this), t, ...n); return s.set(r, t.sort ? t.sort() : [t]), p(r); }; }
    function d(e) { return "function" == typeof e ? u(e) : (e instanceof IDBTransaction && function (e) { if (o.has(e))
        return; const t = new Promise(((t, n) => { const r = () => { e.removeEventListener("complete", o), e.removeEventListener("error", s), e.removeEventListener("abort", s); }, o = () => { t(), r(); }, s = () => { n(e.error || new DOMException("AbortError", "AbortError")), r(); }; e.addEventListener("complete", o), e.addEventListener("error", s), e.addEventListener("abort", s); })); o.set(e, t); }(e), n = e, (t || (t = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])).some((e => n instanceof e)) ? new Proxy(e, c) : e); var n; }
    function p(e) { if (e instanceof IDBRequest)
        return function (e) { const t = new Promise(((t, n) => { const r = () => { e.removeEventListener("success", o), e.removeEventListener("error", s); }, o = () => { t(p(e.result)), r(); }, s = () => { n(e.error), r(); }; e.addEventListener("success", o), e.addEventListener("error", s); })); return t.then((t => { t instanceof IDBCursor && r.set(t, e); })).catch((() => { })), i.set(t, e), t; }(e); if (a.has(e))
        return a.get(e); const t = d(e); return t !== e && (a.set(e, t), i.set(t, e)), t; }
    const f = e => i.get(e);
    const l = ["get", "getKey", "getAll", "getAllKeys", "count"], D = ["put", "add", "delete", "clear"], v = new Map;
    function b(e, t) { if (!(e instanceof IDBDatabase) || t in e || "string" != typeof t)
        return; if (v.get(t))
        return v.get(t); const n = t.replace(/FromIndex$/, ""), r = t !== n, o = D.includes(n); if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !o && !l.includes(n))
        return; const s = async function (e, ...t) { const s = this.transaction(e, o ? "readwrite" : "readonly"); let a = s.store; return r && (a = a.index(t.shift())), (await Promise.all([a[n](...t), o && s.done]))[0]; }; return v.set(t, s), s; }
    return c = (e => ({ ...e, get: (t, n, r) => b(t, n) || e.get(t, n, r), has: (t, n) => !!b(t, n) || e.has(t, n) }))(c), e.deleteDB = function (e, { blocked: t } = {}) { const n = indexedDB.deleteDatabase(e); return t && n.addEventListener("blocked", (() => t())), p(n).then((() => { })); }, e.openDB = function (e, t, { blocked: n, upgrade: r, blocking: o, terminated: s } = {}) { const a = indexedDB.open(e, t), i = p(a); return r && a.addEventListener("upgradeneeded", (e => { r(p(a.result), e.oldVersion, e.newVersion, p(a.transaction)); })), n && a.addEventListener("blocked", (() => n())), i.then((e => { s && e.addEventListener("close", (() => s())), o && e.addEventListener("versionchange", (() => o())); })).catch((() => { })), i; }, e.unwrap = f, e.wrap = p, e;
}({});
function uid() {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}
