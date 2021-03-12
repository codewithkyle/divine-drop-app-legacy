using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.API;
using Client.Models.Globals;

namespace Client.Models.Pages
{
    public class UserPage : ComponentBase
    {
        [Inject] public NavigationManager NavigationManager { get; set; }
        [Inject] public IJSRuntime JSRuntime { get; set; }

        protected override async Task OnInitializedAsync()
        {
			ResponseCore UserVerificationResponse = await JSRuntime.InvokeAsync<ResponseCore>("VerifyUser");
            if (!UserVerificationResponse.Success)
            {
				switch (UserVerificationResponse.StatusCode)
				{
					case 503:
						NavigationManager.NavigateTo("/maintenance");
						return;
					default:
						NavigationManager.NavigateTo("/");
						return;
				}
            }
            await Main();
        }

        protected virtual async Task Main() {}
    }
}
