// @ts-expect-error
importScripts("/js/config.js");

self.onmessage = async (e:MessageEvent) => {
    // @ts-ignore
    self.postMessage("done");
    for (const card of e.data){
        try{
            await Promise.all([
                fetch(`${API_URL}/v1/image/${card.Front}`, {
                    credentials: "include"
                }),
                fetch(`${API_URL}/v1/image/${card.Front}`, {
                    credentials: "include"
                }),
                fetch(`${API_URL}/v1/card/${card.UID}/image`, {
                    credentials: "include"
                }),
                fetch(`${API_URL}/v1/card/${card.UID}/image?side=back`, {
                    credentials: "include"
                })
            ]);
        } catch (e){
            console.error(e);
        }
    }
}