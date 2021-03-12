using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.API;

namespace Client.Pages.Utility
{
    public class MaintenanceBase : ComponentBase
    {
        [Inject] private NavigationManager NavigationManager { get; set; }
        [Inject] private IJSRuntime JSRuntime { get; set; }

        protected override async Task OnInitializedAsync()
        {
            MaintenanceCheckResponse Response = await JSRuntime.InvokeAsync<MaintenanceCheckResponse>("MaintenanceCheck");
			if (!Response.IsUndergoingMaintenance)
			{
				NavigationManager.NavigateTo("/");
			}
        }
    }
}
