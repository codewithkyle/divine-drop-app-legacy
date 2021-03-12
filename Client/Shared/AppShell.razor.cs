using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.API;
using Client.Models.Globals;
using Microsoft.AspNetCore.Components.Web;

namespace Client.Shared
{
    public class AppShellBase : LayoutComponentBase
    {
        [Inject] public IJSRuntime JSRuntime { get; set; }
		[Inject] public NavigationManager NavigationManager { get; set; }
		public bool CanRender = false;
		public bool MaintenanceMode = false;
		public bool AdminIsOpen = false;
		public bool NavigationIsOpen = false;

        protected override async Task OnInitializedAsync()
        {
            ProfileResponse Profile = await JSRuntime.InvokeAsync<ProfileResponse>("GetProfile");
            if (Profile.Success)
			{
                CurrentUser.SetCurrentUser(Profile.User);
				CanRender = true;
				StateHasChanged();
            }
			else
			{
				switch (Profile.StatusCode)
				{
					case 503:
						NavigationManager.NavigateTo("/maintenance");
						break;
					default:
						NavigationManager.NavigateTo("/");
						break;
				}
			}
			MaintenanceCheckResponse Response = await JSRuntime.InvokeAsync<MaintenanceCheckResponse>("MaintenanceCheck");
			MaintenanceMode = Response.IsUndergoingMaintenance;
			if (MaintenanceMode)
			{
				await JSRuntime.InvokeVoidAsync("SetTitle", "🚧 Maintenance Mode");
			}
        }

		public void OpenProfileModal()
		{
			AppSettings.OpenModal(AppSettings.Modal.Profile);
			StateHasChanged();
		}

		public void CloseModal()
		{
			AppSettings.OpenModal(AppSettings.Modal.None);
			StateHasChanged();
		}

		public void ToggleNavigation()
		{
			NavigationIsOpen ^= true;
			if (NavigationIsOpen)
			{
				JSRuntime.InvokeVoidAsync("FocusElement", ".js-nav-drawer");
			}
			else
			{
				JSRuntime.InvokeVoidAsync("FocusElement", ".js-nav-menu-button");
			}
			StateHasChanged();
		}

		public void KeyPress(KeyboardEventArgs e)
		{
			if (NavigationIsOpen && e.Key == "Escape")
			{
				NavigationIsOpen = false;
				JSRuntime.InvokeVoidAsync("FocusElement", ".js-nav-menu-button");
				StateHasChanged();
			}
		}
    }
}
