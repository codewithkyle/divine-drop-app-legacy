using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.API;
using Client.Models.Globals;

namespace Client.Models.Pages
{
    public class AdminPage : ComponentBase
    {
        [Inject] public NavigationManager NavigationManager { get; set; }
        [Inject] public IJSRuntime JSRuntime { get; set; }

        protected override async Task OnInitializedAsync()
        {
            ResponseCore AdminVerificationResponse = await JSRuntime.InvokeAsync<ResponseCore>("VerifyAdmin");
            if (!AdminVerificationResponse.Success)
            {
                NavigationManager.NavigateTo("/");
                return;
            }
            await Main();
        }

        protected virtual async Task Main() {}
    }
}
