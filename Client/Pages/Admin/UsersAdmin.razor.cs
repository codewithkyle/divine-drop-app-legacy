using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.Forms;
using Client.Models.API;
using Client.Models.Pages;
using Client.Models.Data;
using System.Collections.Generic;
using System.Timers;

namespace Client.Pages.Admin
{
    public class UsersAdmin : AdminPage
    {
        public List<User> Users = new List<User>();
        public bool IsLoadingUserData = true;
        public int UsersPerPage = 10;
        public int Page = 1;
        public int TotalUsers = 0;
        public int TotalPages = 1;
		public string Query = "";
		private Timer SearchDebouceTimer;

        protected override async Task Main()
        {
			SearchDebouceTimer = new Timer(600);
        	SearchDebouceTimer.Elapsed += DebounceCallback;
        	SearchDebouceTimer.AutoReset = false;
			TotalUsers = await JSRuntime.InvokeAsync<int>("Count", "users");
			if (TotalUsers == 0){
				await JSRuntime.InvokeVoidAsync("Ingest", "/v1/ingest/users", "users");
			} else {
				JSRuntime.InvokeVoidAsync("Ingest", "/v1/ingest/users", "users");
			}
            await LoadUserData();
        }

        public async Task LoadUserData()
        {
			IsLoadingUserData = true;
            StateHasChanged();
			if (String.IsNullOrEmpty(Query)){
				await SelectUsers();
			} else {
				await SearchUsers();
			}
            IsLoadingUserData = false;
            StateHasChanged();
        }

        public async Task UpdateUsersPerPage(ChangeEventArgs e)
        {
            UsersPerPage = Int32.Parse(e.Value.ToString());
            Page = 1;
            await LoadUserData();
        }

        public async Task NextPage()
        {
            Page++;
            Console.Write(Page);
            if (Page > TotalPages){
                Page = TotalPages;
            }
            await LoadUserData();
        }

        public async Task PreviousPage()
        {
            Page--;
            if (Page <= 0){
                Page = 1;
            }
            await LoadUserData();
        }

        public async Task JumpToPage(ChangeEventArgs e)
        {
            Page = Int32.Parse(e.Value.ToString());
            await LoadUserData();
        }

        public async Task SuspendUser(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("SuspendUser", user.Uid);
            if (Response.Success)
            {
                user.Suspended = true;
                user.Admin = false;
                StateHasChanged();
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Account Updated", user.Name + " has been suspended.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Suspension Failed", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
        }

        public async Task UnsuspendUser(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("UnsuspendUser", user.Uid);
            if (Response.Success)
            {
                user.Suspended = false;
                StateHasChanged();
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Account Updated", user.Name + " has been unsuspended.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Unsuspension Failed", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
        }

        public async Task ActivateUser(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("ActivateUser", user.Uid);
            if (Response.Success)
            {
                user.Verified = true;
                StateHasChanged();
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Account Updated", user.Name + "'s account has been activated.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Activation Failed", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
        }

        public async Task SendActivationEmail(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("SendActivationEmail", user.Uid);
            if (Response.Success)
            {
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Success", "An account activation email has been sent to " + user.Email);
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
        }

        public async Task RevokeAdmin(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("RevokeAdmin", user.Uid);
            if (Response.Success)
            {
                user.Admin = false;
                StateHasChanged();
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Success", user.Name + " is no longer an admin.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
        }

        public async Task GrantAdmin(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("GrantAdmin", user.Uid);
            if (Response.Success)
            {
                user.Admin = true;
                StateHasChanged();
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Success", user.Name + " is now an admin.");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
        }

        public async Task GetImpersonationLink(User user)
        {
            string ticket = await JSRuntime.InvokeAsync<string>("StartLoading");
            ImpersonationLinkResponse Response = await JSRuntime.InvokeAsync<ImpersonationLinkResponse>("GetImpersonationLink", user.Uid);
            await JSRuntime.InvokeAsync<ResponseCore>("StopLoading", ticket);
            if (Response.Success)
            {
                string temp = await JSRuntime.InvokeAsync<string>("Prompt", "Impersonation Link", Response.URL);
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
        }

		public async void DebounceCallback(Object source, ElapsedEventArgs e)
		{
			await LoadUserData();
		}

		public async Task SearchUsers()
		{
			string[] Keys = {"Name", "Email"};
            TotalUsers = await JSRuntime.InvokeAsync<int>("Count", "users", Query, Keys);
			TotalPages = (int)Math.Ceiling((decimal)TotalUsers / UsersPerPage);
            Users = await JSRuntime.InvokeAsync<List<User>>("Search", "users", Query, Keys, Page, UsersPerPage);
		}

		private async Task SelectUsers()
		{
			TotalUsers = await JSRuntime.InvokeAsync<int>("Count", "users");
			TotalPages = (int)Math.Ceiling((decimal)TotalUsers / UsersPerPage);
            Users = await JSRuntime.InvokeAsync<List<User>>("Select", "users", Page, UsersPerPage);
		}

		public void HandleKeyUp()
		{
			SearchDebouceTimer.Stop();
			SearchDebouceTimer.Start();
		}   
    }
}
