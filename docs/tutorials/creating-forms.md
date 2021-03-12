## Post Form Data

Add the form model to the `Client/Models/Forms/` directory.

```csharp
using System.ComponentModel.DataAnnotations;

namespace Client.Models.Forms
{
    public class ExampleForm : FormCore
    {
        [Required(
            ErrorMessage = "This field is required."
        )]
        public string Input1 { get; set; }
    }
}
```

Update the view.

```html
@if (Form.ErrorMessage != null) {
	<p class="block font-danger-700 font-sm line-normal mb-1.5 text-center">@Form.ErrorMessage</p>
}
<EditForm Model="@Form" OnValidSubmit="@SubmitForm" grid="columns 1 gap-1.5" class="@(Form.IsSubmitting ? "submitting" : "")">
	<DataAnnotationsValidator />
	<div class="input">
		<label for="input1">Input</label>
		<InputText type="text" id="input1" @bind-Value="@Form.Input1" />
		<ValidationMessage For="@(() => Form.Input1)" />
	</div>
	<button type="submit" class="button -solid -primary block w-full" disabled="@Form.IsSubmitting">
		<span class="@(Form.IsSubmitting ? "hidden" : "")">Submit</span>
		<i class="spinning-icon @(Form.IsSubmitting ? "" : "hidden")">
			<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512">
				<g class="fa-group">
					<path class="fa-secondary" fill="currentColor"
						d="M478.71 364.58zm-22 6.11l-27.83-15.9a15.92 15.92 0 0 1-6.94-19.2A184 184 0 1 1 256 72c5.89 0 11.71.29 17.46.83-.74-.07-1.48-.15-2.23-.21-8.49-.69-15.23-7.31-15.23-15.83v-32a16 16 0 0 1 15.34-16C266.24 8.46 261.18 8 256 8 119 8 8 119 8 256s111 248 248 248c98 0 182.42-56.95 222.71-139.42-4.13 7.86-14.23 10.55-22 6.11z"
						opacity="0.4"></path>
					<path class="fa-primary" fill="currentColor"
						d="M271.23 72.62c-8.49-.69-15.23-7.31-15.23-15.83V24.73c0-9.11 7.67-16.78 16.77-16.17C401.92 17.18 504 124.67 504 256a246 246 0 0 1-25 108.24c-4 8.17-14.37 11-22.26 6.45l-27.84-15.9c-7.41-4.23-9.83-13.35-6.2-21.07A182.53 182.53 0 0 0 440 256c0-96.49-74.27-175.63-168.77-183.38z">
					</path>
				</g>
			</svg>
		</i>
	</button>
</EditForm>
```

Add the submission logic to the component or page.

```csharp
public async Task SubmitForm()
{
	Form.Submit();
	StateHasChanged();
	FormResponse Response = await JSRuntime.InvokeAsync<FormResponse>("Example", Form.Input1);
	if (Response.Success)
	{
		Form.Succeed();
	}
	else
	{
		if (Response.FieldErrors != null)
		{
			Form.Fail(Response.FieldErrors[0]);
		}
		else
		{
			Form.Fail(Response.Error);
		}
	}
	StateHasChanged();
}
```

Add the API Request logic to one of the `Client/Scripts/api` files.

```typescript
async function GetExampleData(input1:string): Promise<FormResponse> {
	const data = {
		example: input1,
	}
	const request = await apiRequest("/v1/example", "POST", data);
	const fetchResponse: FetchReponse = await request.json();
	const response: Partial<FormResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (!response.Success) {
		response.FieldErrors = fetchResponse.data;
	}
	return response as FormResponse;
}
```