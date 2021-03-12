# Creating Pages

Pages will extend one of the Page models available in the `Client/Models/Pages/` directory. Once you know what type of user will be using the page add the `.razor` file in the `Client/Pages/` directory. Be sure to place pages into appropriate subfolders.

For this tutorial we will be creating an `Example.razor` file in the base `Pages/` directory.

```html
@layout AppShell
@page "/example"
@inherits ExampleBase

<div>
    <h1>Hello world!</h1>
</div>
```

To add logic to our view we will create an `Example.razor.cs` file alongside our `Example.razor` file.

```csharp
using Client.Models.Pages;

namespace Client.Pages
{
    public class ExampleBase : UserPage
    {
        // ...
    }
}
```

If we need to fetch data we can override the `UserPage` main method. In the example below we asynchronously fetch an array of strings from the API.

```csharp
using Client.Models.Pages;

namespace Client.Pages
{
    public class ExampleBase : UserPage
    {
        string[] Data {get;set;}

        protected override async Task Main()
        {
            Data = await JSRuntime.InvokeVoidAsync("ExampleFetchFunction");
        }
    }
}
```

> **Note:** if you don't know how to set up API Request functions read the [API Requests how-to guide](/how-to/api-requests).

Let's add interactive elements to our view. In the example below we will add a button that when clicked fetches another array of strings.

Update the code in the `Example.razor` file.

```html
<div>
    <h1>Hello world!</h1>
    <button @onclick="FetchData">Fetch data</button>
</div>
```

Update the code in the `Example.razor.cs` file.

```csharp
public async Task FetchData()
{
    Data = await JSRuntime.InvokeVoidAsync("SecondExampleFetchFunction");
    StateHasChanged();
}
```

> **Note:** for additional information about Blazor event handling read the [Blazor documentation](https://docs.microsoft.com/en-us/aspnet/core/blazor/components/event-handling?view=aspnetcore-5.0).

That's it! You now have a working page that can be accessed by navigating to the `/example` page. Your next step should be to [create a new endpoint](/tutorials/creating-endpoints).
