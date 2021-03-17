async function GetDecks(): Promise<DecksReponse> {
	let response: Partial<DecksReponse>;
	try {
		const request = await apiRequest("/v1/decks");
		const fetchResponse = await request.json();
		response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
		response.Decks = fetchResponse.data;
		if (response.Decks.length) {
			await StashDecks(response.Decks);
		}
	} catch (e) {
		response = buildResponseCore(true, 502, null);
		// @ts-ignore
		response.Decks = await Select("decks");
	}
	return response as DecksReponse;
}

async function CreateDeck(name: string): Promise<CreateDeckResponse> {
	const data = {
		Name: name,
	};
	let response: Partial<CreateDeckResponse>;
	try {
		const request = await apiRequest("/v1/deck", "POST", data);
		const fetchResponse = await request.json();
		response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
		if (response.Success) {
			response.UID = fetchResponse.data;
			await StashNewDeck(response.UID, name);
		}
	} catch (e) {
		data["UID"] = uuid();
		const success = await Outbox(`${API_URL}/v1/deck`, "POST", data);
		if (success) {
			await StashNewDeck(data["UID"], name);
			response = buildResponseCore(success, 502, null);
			response.UID = data["UID"];
		}
	}
	return response as CreateDeckResponse;
}

async function UpdateDeck(deck): Promise<ResponseCore> {
	const cards = [];
	for (let i = 0; i < deck.cards.length; i++) {
		cards.push({
			UID: deck.cards[i].uid,
			Quantity: deck.cards[i].quantity,
		});
	}
	const data = {
		UID: deck.uid,
		Name: deck.name,
		Cards: cards,
		Commander: deck.commander,
	};
	await Put("decks", data);
	let response;
	try {
		const request = await apiRequest("/v1/deck", "POST", data);
		const fetchResponse = await request.json();
		response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	} catch (e) {
		const success = await Outbox(`${API_URL}/v1/deck`, "POST", data);
		response = buildResponseCore(success, 502, null);
	}
	return response;
}

async function DeleteDeck(UID: string): Promise<ResponseCore> {
	let response: ResponseCore;
	try {
		const request = await apiRequest(`/v1/deck/${UID}`, "DELETE");
		const fetchResponse = await request.json();
		response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
		if (response.Success) {
			await Delete("decks", UID);
		}
	} catch (e) {
		const success = await Outbox(`${API_URL}/v1/deck/${UID}`, "DELETE");
		response = buildResponseCore(success, 502, null);
		if (response.Success) {
			await Delete("decks", UID);
		}
	}
	return response;
}
