using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.API;
using Client.Models.Pages;

namespace Client.Pages.Admin
{
    public class AdminDashboard : AdminPage
    {
		[Inject] public NavigationManager NavigationManager { get; set; }
		public bool IsUndergoingMaintenance {get;set;}

		protected override async Task Main()
		{
			MaintenanceCheckResponse Response = await JSRuntime.InvokeAsync<MaintenanceCheckResponse>("MaintenanceCheck");
			IsUndergoingMaintenance = Response.IsUndergoingMaintenance;
		}

		public async Task ClearApplicationCache()
		{
			string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("ClearApplicationCache");
            if (Response.Success)
            {
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Success","The applications cache has been cleared.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
		}

		public async Task ClearCloudflareCache()
		{
			string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("ClearCloudflareCache");
            if (Response.Success)
            {
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Success","The Cloudflare cache has been cleared.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
		}

		public async Task ClearNDJSONCache()
		{
			string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("ClearNDJSONCache");
            if (Response.Success)
            {
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Success","The NDJSON cache has been cleared.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
		}

		public async Task ToggleMaintenanceMode()
		{
			string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
			IsUndergoingMaintenance ^= true;
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("SetMaintenanceMode", IsUndergoingMaintenance);
            if (Response.Success)
            {
				if (IsUndergoingMaintenance)
				{
					await JSRuntime.InvokeVoidAsync("Alert", "success", "Success","The API is now in maintenance mode.");
				}
				else
				{
					await JSRuntime.InvokeVoidAsync("Alert", "success", "Success","The API is no longer in maintenance mode.");
				}
				NavigationManager.NavigateTo(NavigationManager.Uri, true);
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
		}
    }
}
