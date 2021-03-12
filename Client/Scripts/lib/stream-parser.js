class StreamParser {
    constructor(url, uid, inbox){
        this.reader = null;
        this.decoder = new TextDecoder();
        this.buffer = "";
        this.workerUid = uid;
        this.fetchData(url);
        this.inbox = inbox;
    }

    send(obj){
        this.inbox({
            data: {
                type: "result",
                result: obj,
                uid: this.workerUid,
            },
        });
    }
    processJSON(objects){
        return new Promise(resolve => {
            while(true){
                try {
                    this.send(JSON.parse(objects.pop()));
                    if (!objects.length){
                        break;
                    }
                } catch(e) {
                    console.error(e);
                }
            }
            resolve();
        });
    }
    async processText({ done, value }) {
        if (!done) {
            const chunk = this.decoder.decode(value);
            this.buffer += chunk;
            const objects = this.buffer.split("\n");
            this.buffer = objects.pop();
            if (objects.length){
                await this.processJSON(objects.reverse());
            }
        } else if (this.buffer.length){
            const objects = this.buffer.split("\n");
            await this.processJSON(objects.reverse());
        }
        return done;
    }
    async readStream(stream) {
        this.reader = stream.getReader();
        let done = false;
        while (!done){
            const nextChunk = await this.reader.read();
            done = await this.processText(nextChunk);
        }
    }
    async fetchData(url){
        const response = await fetch(url, {
			method: "GET",
			credentials: "include",
			headers: new Headers({
				Accept: "application/x-ndjson",
			}),
		});
		if (response.ok) {
			await readStream(response.body);
			this.inbox({
				data: {
					type: "done",
					uid: this.workerUid,
				},
			});
		} else {
			console.error(`${response.status}: ${response.statusText}`);
		    this.inbox({
		    	type: "error",
		    	uid: this.workerUid,
		    });
		}
    }
}
