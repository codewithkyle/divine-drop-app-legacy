// @ts-expect-error
importScripts("/js/idb.js");

// @ts-expect-error
importScripts("/js/fuzzysort.js");
declare var fuzzysort: any;

// @ts-expect-error
importScripts("/js/config.js");

// @ts-expect-error
importScripts("/js/uid.js");

type Schema = {
	version: number;
	tables: Array<Table>;
};

type Table = {
	name: string;
	columns: Array<Column>;
	keyPath?: string;
	autoIncrement?: boolean;
	ingestURL?: string;
};

type Column = {
	key: string;
	unique?: boolean;
};

type WorkerPool = {
	[key: string]: {
		worker: Worker | StreamParser;
		table: string;
		rows: Array<any>;
		busy: boolean;
		status: "PARSING" | "INSERTING";
		total: number;
		streamStartedCallback: Function;
		keys: Array<any>;
	};
};

// If you change the DB name you must also update the Service Worker's clearCache() method
const DB_NAME = "application";

class IDBWorker {
	private db: any;
	private tables: Array<Table>;
	private workerPool: WorkerPool;

	constructor() {
		this.db = null;
		self.onmessage = this.inbox.bind(this);
		this.workerPool = {};
		this.tables = [];
		this.main();
	}

	private inbox(e: MessageEvent) {
		const messageEventData = e.data;
		const origin = e?.origin ?? null;
		const { type, data, uid } = messageEventData;
		switch (type) {
			case "delete":
				this.delete(data)
					.then(() => {
						this.send("response", true, uid, origin);
					})
					.catch((error) => {
						console.error(error);
						this.send("response", false, uid, origin);
					});
				break;
			case "put":
				this.put(data)
					.then(() => {
						this.send("response", true, uid, origin);
					})
					.catch((error) => {
						console.error(error);
						this.send("response", false, uid, origin);
					});
				break;
			case "search":
				this.search(data).then((output) => {
					this.send("response", output, uid, origin);
				});
				break;
			case "get":
				this.get(data).then((output) => {
					this.send("response", output, uid, origin);
				});
				break;
			case "count":
				this.count(data).then((output) => {
					this.send("response", output, uid, origin);
				});
				break;
			case "select":
				this.select(data).then((output) => {
					this.send("response", output, uid, origin);
				});
				break;
			case "ingest":
				this.ingestData(data)
					.then((output) => {
						this.send("response", output, uid, origin);
					})
					.catch((error) => {
						console.error(error);
						this.send("response", null, uid, origin);
					});
				break;
			case "purge":
				this.purgeData();
				break;
			default:
				console.warn(`Unhandled IDB Worker inbox message type: ${type}`);
				break;
		}
	}

	async workerInbox(e) {
		const { worker, table, rows, busy, streamStartedCallback, total } = this.workerPool[e.data.uid];
		switch (e.data.type) {
			case "error":
				// @ts-expect-error
				if (worker?.terminate) {
					// @ts-expect-error
					worker.terminate();
				}
				this.send("download-error", e.data.uid);
				streamStartedCallback(null);
				delete this.workerPool[e.data.uid];
				break;
			case "done":
				this.send("download-finished", e.data.uid);
				// @ts-expect-error
				if (worker?.terminate) {
					// @ts-expect-error
					worker.terminate();
				}
				this.workerPool[e.data.uid].worker = null;
				this.workerPool[e.data.uid].status = "INSERTING";
				if (!busy) {
					this.insertData(e.data.uid);
				}
				break;
			default:
				rows.push(e.data.result);
				this.send("download-tick", e.data.uid);
				if (!busy) {
					this.insertData(e.data.uid);
				}
				if (streamStartedCallback !== null) {
					streamStartedCallback(e.data.uid, total);
					this.workerPool[e.data.uid].streamStartedCallback = null;
				}
				break;
		}
	}

	private send(type: string = "response", data: any = null, uid: string = null, origin = null) {
		const message = {
			type: type,
			data: data,
			uid: uid,
		};
		if (origin) {
			self.postMessage(message, origin);
		} else {
			// @ts-expect-error
			self.postMessage(message);
		}
	}

	private getTableKey(table: string) {
		let key = "id";
		for (let i = 0; i < this.tables.length; i++) {
			if (this.tables[i].name === table) {
				if (this.tables[i]?.keyPath) {
					key = this.tables[i].keyPath;
				}
				break;
			}
		}
		return key;
	}

	async purgeStaleData(table: string, keys: Array<any>) {
		const rows = await this.db.getAll(table);
		const key = this.getTableKey(table);
		for (let i = 0; i < rows.length; i++) {
			let dead = true;
			for (let k = 0; k < keys.length; k++) {
				if (rows[i][key] === keys[k]) {
					dead = false;
					break;
				}
			}
			if (dead) {
				await this.db.delete(table, rows[i][key]);
			}
		}
	}

	async insertData(uid: string) {
		this.workerPool[uid].busy = true;
		const table = this.workerPool[uid].table;
		const tableKey = this.getTableKey(table);
		const row = this.workerPool[uid].rows.splice(0, 1)?.[0] ?? null;
		if (row !== null) {
			await this.db.put(table, row);
			this.workerPool[uid].keys.push(row[tableKey]);
			this.send("unpack-tick", uid);
		}
		if (!this.workerPool[uid].rows.length) {
			this.workerPool[uid].busy = false;
			if (this.workerPool[uid].status === "INSERTING") {
				await this.purgeStaleData(table, this.workerPool[uid].keys);
				this.send("unpack-finished", uid);
				delete this.workerPool[uid];
			}
		} else {
			this.insertData(uid);
		}
	}

	private async fetchExpectedTotal(route) {
		const countRequest = await fetch(`${API_URL}/${route}/count`, {
			method: "GET",
			credentials: "include",
			headers: new Headers({
				Accept: "application/json",
			}),
		});
		const countResponse = await countRequest.json();
		return countResponse.data;
	}

	private async lookupIngestInfo(route) {
		return await this.db.getFromIndex("ingest-tracker", "route", route);
	}

	private async fetchIngestEtag(route: string) {
		const response = await fetch(`${API_URL}/${route}`, {
			method: "HEAD",
			credentials: "include",
		});
		const incomingETag = response.headers.get("ETag") ?? null;
		return incomingETag;
	}

	private putIngestInfoInCache(route, etag): Promise<void> {
		return new Promise(async (resolve) => {
			await this.db.put("ingest-tracker", {
				route: route,
				etag: etag,
			});
			resolve();
		});
	}

	private async isIngestRequired(route: string, table: string): Promise<{ ingestRequired: boolean; expectedTotal: number }> {
		let ingestRequired = false;
		const cached = await this.lookupIngestInfo(route);
		const expectedTotal = await this.fetchExpectedTotal(route);
		const incomingETag = await this.fetchIngestEtag(route);

		if (typeof cached !== "undefined") {
			if (cached.etag === incomingETag) {
				const currentTotal = await (await this.db.getAll(table)).length;
				if (currentTotal !== expectedTotal) {
					ingestRequired = true;
				}
			} else {
				ingestRequired = true;
				await this.putIngestInfoInCache(route, incomingETag);
			}
		} else {
			ingestRequired = true;
			await this.putIngestInfoInCache(route, incomingETag);
		}
		return { ingestRequired: ingestRequired, expectedTotal: expectedTotal };
	}

	private async startIngest(route: string, table: string, expectedTotal: number, callback: Function) {
		const workerUid = uid();
		try {
			const worker = new Worker("/js/stream-parser-worker.js");
			this.workerPool[workerUid] = {
				worker: worker,
				table: table,
				rows: [],
				busy: false,
				status: "PARSING",
				total: expectedTotal,
				streamStartedCallback: callback,
				keys: [],
			};
			worker.onmessage = this.workerInbox.bind(this);
			worker.postMessage({
				url: `${API_URL}/${route}`,
				uid: workerUid,
			});
		} catch (e) {
			if (typeof StreamParser === "undefined") {
				// @ts-ignore
				importScripts("/js/stream-parser.js");
			}
			const parser = new StreamParser(route, workerUid, this.workerInbox.bind(this));
			this.workerPool[workerUid] = {
				worker: parser,
				table: table,
				rows: [],
				busy: false,
				status: "PARSING",
				total: expectedTotal,
				streamStartedCallback: callback,
				keys: [],
			};
		}
	}

	private ingestData(data): Promise<object> {
		return new Promise(async (resolve) => {
			let { route, table } = data;
			route = route.replace(/^\//, "");
			const { ingestRequired, expectedTotal } = await this.isIngestRequired(route, table);
			if (!ingestRequired) {
				resolve(null);
			} else {
				await this.startIngest(route, table, expectedTotal, resolve);
			}
		});
	}

	private async purgeData() {
		// @ts-expect-error
		await idb.deleteDB(DB_NAME, {
			blocked() {
				this.send("error", "Failed to purge local data because this app is still open in other tabs.");
			},
		});
	}

	private async main() {
		try {
			const request = await fetch(`/schema.json`);
			const scheam: Schema = await request.json();
			this.tables = scheam.tables;
			// @ts-expect-error
			this.db = await idb.openDB(DB_NAME, scheam.version, {
				upgrade(db, oldVersion, newVersion, transaction) {
					// Purge old stores so we don't brick the JS runtime VM when upgrading
					for (let i = 0; i < db.objectStoreNames.length; i++) {
						db.deleteObjectStore(db.objectStoreNames[i]);
					}

					const ingestTracker = db.createObjectStore("ingest-tracker", {
						keyPath: "route",
						autoIncrement: false,
					});
					ingestTracker.createIndex("route", "route", { unique: true });
					ingestTracker.createIndex("etag", "etag", { unique: true });

					for (let i = 0; i < scheam.tables.length; i++) {
						const table: Table = scheam.tables[i];
						const options = {
							keyPath: "id",
							autoIncrement: false,
						};
						if (table?.keyPath) {
							options.keyPath = table.keyPath;
						}
						if (typeof table.autoIncrement !== "undefined") {
							options.autoIncrement = table.autoIncrement;
						}
						const store = db.createObjectStore(table.name, options);
						for (let k = 0; k < table.columns.length; k++) {
							const column: Column = table.columns[k];
							store.createIndex(column.key, column.key, {
								unique: column?.unique ?? false,
							});
						}
					}
				},
				blocked() {
					this.send("error", "This app needs to restart. Close all tabs for this app and before relaunching.");
				},
				blocking() {
					this.send("error", "This app needs to restart. Close all tabs for this app before relaunching.");
				},
			});
			this.send("ready");
		} catch (e) {
			console.error(e);
		}
	}

	private async delete(data): Promise<void> {
		const { table, key } = data;
		await this.db.delete(table, key);
		return;
	}

	private async put(data): Promise<void> {
		const { table, key, value } = data;
		if (key !== null) {
			await this.db.put(table, value, key);
		} else {
			await this.db.put(table, value);
		}
		return;
	}

	private fuzzySearch(rows: Array<unknown>, query: string, key: Array<string> | string) {
		const options = {
			threshold: -Infinity,
			allowTypo: false,
		};
		if (Array.isArray(key)) {
			options["keys"] = key;
		} else {
			options["key"] = key;
		}
		const results = fuzzysort.go(query, rows, options);
		const output = [];
		for (let i = 0; i < results.length; i++) {
			output.push(results[i].obj);
		}
		return output;
	}

	private async search(data): Promise<unknown> {
		const { table, key, query, limit, page } = data;
		const rows: Array<unknown> = await this.db.getAll(table);
		let output = [];
		if (query) {
			output = this.fuzzySearch(rows, query, key);
		} else {
			output = rows;
		}
		if (limit !== null) {
			let start = (page - 1) * limit;
			let end = page * limit;
			output = output.slice(start, end);
		}
		return output;
	}

	private async get(data): Promise<unknown> {
		const { table, key, index } = data;
		let output = null;
		if (index !== null) {
			output = await this.db.getFromIndex(table, index, key);
		} else {
			output = await this.db.get(table, key);
		}
		return output;
	}

	private async count(data): Promise<number> {
		const { table, query, key } = data;
		const rows: Array<unknown> = await this.db.getAll(table);
		let output = 0;
		if (query && key) {
			output = this.fuzzySearch(rows, query, key).length;
		} else {
			output = rows.length;
		}
		return output;
	}

	private async select(data): Promise<Array<unknown>> {
		const { table, page, limit } = data;
		const rows: Array<unknown> = await this.db.getAll(table);
		let output = [];
		if (limit !== null) {
			let start = (page - 1) * limit;
			let end = page * limit;
			output = rows.slice(start, end);
		} else {
			output = rows;
		}
		return output;
	}
}
new IDBWorker();
