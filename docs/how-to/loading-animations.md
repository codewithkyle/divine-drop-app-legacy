# Loading Animations

For technical information read the [global loading animation reference document](/references/global-loading-animation).

### Start Animation

```csharp
string Ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
```

### Stop Animation

```csharp
JSRuntime.InvokeVoidAsync("StopLoading", Ticket);
```