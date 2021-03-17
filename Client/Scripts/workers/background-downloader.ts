// @ts-expect-error
importScripts("/js/config.js");

self.onmessage = async (e:MessageEvent) => {
    for (const card of e.data){
        try{
            await fetch(`${API_URL}/v1/image/${card.Front}`, {
                credentials: "include"
            });
        } catch (e){
            console.error(e);
        }
        try {
            await fetch(`${API_URL}/v1/card/${card.UID}/image`, {
                credentials: "include"
            });
        } catch(e){
            console.error(e);
        }
        if (card.Back !== null){
            try{
                await fetch(`${API_URL}/v1/image/${card.Back}`, {
                    credentials: "include"
                });
            } catch (e){
                console.error(e);
            }
            try {
                await fetch(`${API_URL}/v1/card/${card.UID}/image?side=back`, {
                    credentials: "include"
                });
            } catch(e){
                console.error(e);
            }
        }
    }
}