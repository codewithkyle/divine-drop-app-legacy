# API Requests

## API Request

The `apiRequest` utility function provides easy access to the API URL along with applying the correct `Headers` to the request.

```typescript
type Method = "GET" | "POST" | "PUT" | "HEAD" | "DELETE";
/**
 * Build and returns a API fetch request.
 * @example buildRequest("v1/user/profile", "GET");
 * @example buildRequest("v1/login", "POST", { email: email, password: password, name: name,});
 */
function apiRequest(route: string, method: Method = "GET", body: any = null) {
	return fetch(`${API_URL}/${route.replace(/^\//, "").trim()}`, buildRequestOptions(method, body));
}
```

## Build Request Options

The `buildRequestOptions` utility function builds and returns a fetch options object, [learn more about the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters). 

```typescript
type Method = "GET" | "POST" | "PUT" | "HEAD" | "DELETE";
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
```

## Build Headers

The `buildHeaders` utility function builds and returns a new `Headers` object, [learn more about Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers).

```typescript
function buildHeaders(): Headers {
	return new Headers({
		"Content-Type": "application/json",
		Accept: "application/json",
	});
}
```

## Build Response Core

The `buildResponseCore` utility function builds and returns a `ResponseCore` object.

```typescript
interface ResponseCore {
	Success: boolean;
	StatusCode: number;
	Error: string;
}
function buildResponseCore(success: boolean, statusCode: number, error: string = null): ResponseCore {
	return {
		Success: success,
		StatusCode: statusCode,
		Error: error,
	};
}
```

## Expanding Upon the Response Core Interface

All responses should build upon the `ResponseCore` interface. New response types should be declared in the `Client/Scripts/types.d.ts` file.

```typescript
// types.d.ts
interface ExampleResponse extends ResponseCore {
	Example: any;
}

// account.ts
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