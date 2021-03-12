using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.Globals;
using Client.Models.Forms;
using System.Threading.Tasks;
using Client.Models.API;
using System;
using Microsoft.AspNetCore.Components.Forms;

namespace Client.Shared.Modals
{
    public class EditProfileModalBase : ComponentBase
    {
        [Inject] public IJSRuntime JSRuntime { get; set; }
        [Inject] public NavigationManager NavigationManager { get; set; }
		public EditProfileForm ProfileForm = new EditProfileForm();
		public PasswordForm PasswordForm = new PasswordForm();
		public bool ChangingPassword = false;
		[Parameter] public EventCallback CloseModal { get; set; }

		protected override void OnInitialized()
		{
			ProfileForm.Name = CurrentUser.Name;
			ProfileForm.Email = CurrentUser.Email;
			base.OnInitialized();
		}

		protected override void OnAfterRender(bool firstRender)
		{
			if (firstRender)
			{
				JSRuntime.InvokeVoidAsync("FocusElement", "#modal-close-button");
			}
			base.OnAfterRender(firstRender);
		}

		public async Task UpdateProfile()
        {
            ProfileForm.Submit();
            StateHasChanged();
            FormResponse ProfileUpdateResponse = await JSRuntime.InvokeAsync<FormResponse>("UpdateProfile", ProfileForm.Name, ProfileForm.Email);
            if (ProfileUpdateResponse.Success)
			{
                ProfileForm.Succeed();
				if (ProfileForm.Email != CurrentUser.Email)
				{
					await JSRuntime.InvokeVoidAsync("Alert", "success", "Profile Updated", "Your profile has been updated. Check your email for a new verification code.");
				}
				else
				{
					await JSRuntime.InvokeVoidAsync("Alert", "success", "Profile Updated", "Your profile has been updated.");
				}
				await RefreshProfile();
            }
			else
			{
                if (ProfileUpdateResponse.FieldErrors != null)
				{
                    ProfileForm.Fail(ProfileUpdateResponse.FieldErrors[0]);
                }
				else
				{
                    ProfileForm.Fail(ProfileUpdateResponse.Error);
                }
				await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", ProfileUpdateResponse.Error);
            }
            StateHasChanged();
        }

		public void OpenPasswordUpdateModal()
		{
			ChangingPassword = true;
			StateHasChanged();
		}

		public async Task UpdatePassword()
        {
            PasswordForm.Submit();
            StateHasChanged();
            FormResponse Response = await JSRuntime.InvokeAsync<FormResponse>("UpdatePassword", PasswordForm.OldPassword, PasswordForm.NewPassword);
            if (Response.Success)
			{
                PasswordForm.Succeed();
				await JSRuntime.InvokeVoidAsync("Alert", "success", "Password Changed", "Your password has been updated successfully.");
				PasswordForm.OldPassword = null;
				PasswordForm.NewPassword = null;
				ChangingPassword = false;
            }
			else
			{
                if (Response.FieldErrors != null)
				{
                    PasswordForm.Fail(Response.FieldErrors[0]);
                }else
				{
                    PasswordForm.Fail(Response.Error);
                }
				await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            StateHasChanged();
        }

        public async Task DeleteAccount()
        {
            bool DeleteConfirmed = await JSRuntime.InvokeAsync<bool>("Confirm", "This action cannot be undone and your data will be permanently deleted. Continue with account deletion?");
            if (DeleteConfirmed)
			{
                ProfileForm.Submit();
                StateHasChanged();
                ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("DeleteAccount");
                if (Response.Success)
				{
                    ProfileForm.Succeed();
                    await JSRuntime.InvokeVoidAsync("Alert", "success", "Account Deleted", "Your account has been successfully deleted.");
                    NavigationManager.NavigateTo("/");
                }
				else
				{
                    ProfileForm.Fail(Response.Error);
					await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
                }
            }
        }

        public async Task OnAvatarUpload(InputFileChangeEventArgs e)
        {
			ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("UpdateProfileAvatar");
			if (Response.Success)
			{
				await JSRuntime.InvokeVoidAsync("Alert", "success", "Profile Updated", "Your profile picture has been updated.");
				await RefreshProfile();
			}
			else
			{
				await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
			}
			StateHasChanged();
        }

		private async Task RefreshProfile()
		{
			ProfileResponse Response = await JSRuntime.InvokeAsync<ProfileResponse>("GetProfile");
			if (Response.Success)
			{
				CurrentUser.SetCurrentUser(Response.User);
			}
			StateHasChanged();
		}
    }
}
