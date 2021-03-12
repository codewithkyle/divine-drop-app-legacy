using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.Forms;
using Client.Models.API;

namespace Client.Pages.Utility
{
    public class ForgotPasswordBase : ComponentBase
    {
        [Inject] private NavigationManager NavigationManager { get; set; }
        [Inject] private IJSRuntime JSRuntime { get; set; }
        public ForgotPasswordForm ForgotPasswordForm = new ForgotPasswordForm();

        public async Task SubmitForgotPasswordForm()
        {
            ForgotPasswordForm.Submit();
            StateHasChanged();
            FormResponse Response = await JSRuntime.InvokeAsync<FormResponse>("ForgotPassword", ForgotPasswordForm.Email);
            if (Response.Success)
			{
                ForgotPasswordForm.Succeed();
            }
			else
			{
                if (Response.FieldErrors != null)
				{
                    ForgotPasswordForm.Fail(Response.FieldErrors[0]);
                }
				else
				{
                    ForgotPasswordForm.Fail(Response.Error);
                }
            }
            StateHasChanged();
        }
    }
}
