## Fetching Data

Invoke the API Request from your component/page.

```csharp
using Client.Models.API;

ExampleResponse Response = await JSRuntime.InvokeAsync<ExampleResponse>("GetExampleData");
```

Define the response model in the `Client/Models/API` directory.

```csharp
namespace Client.Models.API
{
    public class ExampleResponse : ResponseCore
    {
        public string Example { get; set; }
    }
}
```

Add the API Request logic to one of the `Client/Scripts/api` files.

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