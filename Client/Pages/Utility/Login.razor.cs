using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.Forms;
using Client.Models.API;

namespace Client.Pages.Utility
{
    public class LoginBase : ComponentBase
    {
        [Inject] private NavigationManager NavigationManager { get; set; }
        [Inject] private IJSRuntime JSRuntime { get; set; }
        public LoginForm LoginForm = new LoginForm();
        public bool ViewIsReady = false;
        public bool TrustDevice = true;

        protected override async Task OnInitializedAsync()
        {
			ResponseCore UserVerificationResponse = await JSRuntime.InvokeAsync<ResponseCore>("VerifyUser");
            if (!UserVerificationResponse.Success)
            {
				switch (UserVerificationResponse.StatusCode){
					case 503:
						NavigationManager.NavigateTo("/maintenance");
						return;
                    case 502:
						NavigationManager.NavigateTo("/network-offline");
						break;
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

        public async Task LoginUser()
        {
            LoginForm.Submit();
            StateHasChanged();
            LoginResponse Response = await JSRuntime.InvokeAsync<LoginResponse>("LoginUser", LoginForm.Email, LoginForm.Password, TrustDevice);
            if (Response.Success)
			{
                LoginForm.Succeed();
                if (Response.IsPendingEmailVerificaiton)
				{
                    NavigationManager.NavigateTo("/verification/pending");
                }
				else
				{
                    NavigationManager.NavigateTo("/dashboard");
                }
            }
			else
			{
                if (Response.FieldErrors != null)
				{
                    LoginForm.Fail(Response.FieldErrors[0]);
                }
				else
				{
                    LoginForm.Fail(Response.Error);
                }
            }
            StateHasChanged();
        }
    }
}
