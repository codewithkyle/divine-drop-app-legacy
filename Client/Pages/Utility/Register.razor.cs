using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.Forms;
using Client.Models.API;

namespace Client.Pages.Utility
{
    public class RegisterBase : ComponentBase
    {
        [Inject] private NavigationManager NavigationManager { get; set; }
        [Inject] private IJSRuntime JSRuntime { get; set; }
        public RegistrationForm RegistrationForm = new RegistrationForm();
        public bool ViewIsReady = false;

        protected override async Task OnInitializedAsync()
        {
            ResponseCore UserVerificationResponse = await JSRuntime.InvokeAsync<ResponseCore>("VerifyUser");
            if (!UserVerificationResponse.Success)
            {
				switch (UserVerificationResponse.StatusCode){
					case 503:
						NavigationManager.NavigateTo("/maintenance");
						return;
					default:
						ViewIsReady = true;
						return;
				}
            }
			else
			{
				NavigationManager.NavigateTo("/dashboard");
			}
        }

        public async Task RegisterUser()
        {
            RegistrationForm.Submit();
            StateHasChanged();
            FormResponse Response = await JSRuntime.InvokeAsync<FormResponse>("RegisterUser", RegistrationForm.Email, RegistrationForm.Password, RegistrationForm.Name);
            if (Response.Success)
			{
                RegistrationForm.Succeed();
            }
			else
			{
                RegistrationForm.Fail(Response.FieldErrors[0]);
            }
            StateHasChanged();
        }
    }
}
