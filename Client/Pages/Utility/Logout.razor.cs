using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Client.Pages.Utility
{
    public class LogoutBase : ComponentBase
    {
        [Inject] private NavigationManager NavigationManager { get; set; }
        [Inject] private IJSRuntime JSRuntime { get; set; }

        protected override async Task OnInitializedAsync()
        {
            await JSRuntime.InvokeVoidAsync("Logout");
            NavigationManager.NavigateTo("/");
        }
    }
}
