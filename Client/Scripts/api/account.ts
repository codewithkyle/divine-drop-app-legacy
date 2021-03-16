async function GetProfile(): Promise<ProfileResponse> {
	const request = await apiRequest("/v1/user/profile");
	const fetchResponse: FetchReponse = await request.json();
	const response: Partial<ProfileResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (response.Success) {
		response.User = fetchResponse.data;
	}
	return response as ProfileResponse;
}

async function UpdateProfile(name: string, email: string): Promise<ResponseCore> {
	const data = {
		name: name,
		email: email,
	};
	const request = await apiRequest("/v1/user/profile", "POST", data);
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}

async function UpdatePassword(oldPassword: string, newPassword: string): Promise<ResponseCore> {
	const data = {
		oldPassword: oldPassword,
		newPassword: newPassword,
	};
	const request = await apiRequest("/v1/user/update-password", "POST", data);
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}

async function DeleteAccount(): Promise<ResponseCore> {
	const request = await apiRequest("/v1/user/profile", "DELETE");
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (response.Success) {
		ClearStorage();
		LogoutAllInstances();
	}
	return response;
}

async function UpdateProfileAvatar(): Promise<ResponseCore> {
	const input: HTMLInputElement = document.body.querySelector(`input[type="file"]#avatar`);
	const image = await ConvertToBase64(input.files[0]);
	const data = {
		file: image,
	};
	const request = await apiRequest("/v1/user/profile/avatar", "POST", data);
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}

async function GetDecks(): Promise<DecksReponse> {
	const request = await apiRequest("/v1/decks");
	const fetchResponse = await request.json();
	const response: Partial<DecksReponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	response.Decks = fetchResponse.data;
	if (response.Decks.length) {
		StashDecks(response.Decks);
	}
	return response as DecksReponse;
}

async function CreateDeck(name: string): Promise<CreateDeckResponse> {
	const data = {
		name: name,
	};
	const request = await apiRequest("/v1/deck", "POST", data);
	const fetchResponse = await request.json();
	const response: Partial<CreateDeckResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	response.UID = fetchResponse.data;
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
	const request = await apiRequest("/v1/deck", "POST", data);
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}

async function DeleteDeck(UID: string): Promise<ResponseCore> {
	Delete("decks", UID);
	const request = await apiRequest(`/v1/deck/${UID}`, "DELETE");
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}
