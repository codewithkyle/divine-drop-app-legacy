# API Requests

API Requests are sent via JavaScript, you can add your request to one of the files within the `Client/Scripts/api/` directory. If you need to add a new script read the [adding new scripts](/tutorials/scripts) documentation. For additional information about the API Request functions read the [API Request reference documentation](/references/api-requests).

## Posting Data

```csharp
using Client.Models.API;

ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("ExampleRequest", "example data");
```

```typescript
async function ExampleRequest(example:any): Promise<ResponseCore> {
	const data = {
		example: example,
	};
	const request = await apiRequest("/v1/example", "POST", data);
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}
```

## Sending Files

```typescript
async function ExampleFileRequest(): Promise<ResponseCore> {
	const input: HTMLInputElement = document.body.querySelector(`input[type="file"]`);
	const file = await ConvertToBase64(input.files[0]);
	const data = {
		file: file,
	};
	const request = await apiRequest("/v1/example", "POST", data);
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}
```

## Fetching Data

```typescript
interface ExampleResponse extends ResponseCore {
	Example: any;
}
async function GetExampleData(): Promise<ExampleResponse> {
	const request = await apiRequest("/v1/example");
	const fetchResponse: FetchReponse = await request.json();
	const response: Partial<ExampleResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (response.Success) {
		response.Example = fetchResponse.data;
	}
	return response as ExampleResponse;
}
```

> **NOTE:** the `ExampleResponse` interface should be added to the `Client/Scripts/types.d.ts` file.

## Using the Offline Outbox

```csharp
using Client.Models.API;

ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("ExampleRequest", "example data");
if (Response.Success)
{
	switch (Response.StatusCode){
		case 502:
			await JSRuntime.InvokeVoidAsync("Alert", "warning", "Request Pending", "The request is sitting in your outbox because you do not currently have an internet connection.");
			break;
		default:
			return;
	}
}
```

```typescript
async function ExampleRequest(example:any): Promise<ResponseCore> {
	const data = {
		example: example,
	};
	try{
		const request = await apiRequest("/v1/example", "POST", data);
		const fetchResponse = await request.json();
		const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
		return response;
	} catch (e) {
		const success = await Outbox(`${API_URL}/v1/example`, "POST", data);
		const response = buildResponseCore(success, 502, null);
		return response;
	}
}
```