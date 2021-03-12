using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.Forms;
using Client.Models.API;
using Microsoft.AspNetCore.WebUtilities;

namespace Client.Pages.Utility
{
    public class ResetPasswordBase : ComponentBase
    {
        [Inject] private NavigationManager NavigationManager { get; set; }
        [Inject] private IJSRuntime JSRuntime { get; set; }
        public ResetPasswordForm ResetPasswordForm = new ResetPasswordForm();

        public async Task SubmitResetPasswordForm()
        {
            ResetPasswordForm.Submit();
            StateHasChanged();
            string Code = null;
            if (QueryHelpers.ParseQuery(new Uri(NavigationManager.Uri).Query).TryGetValue("code", out var value))
			{
                Code = value;
            }
            FormResponse Response = await JSRuntime.InvokeAsync<FormResponse>("ResetPassword", ResetPasswordForm.Password, Code);
            if (Response.Success)
			{
                ResetPasswordForm.Succeed();
            }
			else
			{
                if (Response.FieldErrors != null)
				{
                    ResetPasswordForm.Fail(Response.FieldErrors[0]);
                }
				else
				{
                    ResetPasswordForm.Fail(Response.Error);
                }
            }
            StateHasChanged();
        }
    }
}
