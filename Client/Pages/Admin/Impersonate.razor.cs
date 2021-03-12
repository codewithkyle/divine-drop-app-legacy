using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Client.Models.API;

namespace Client.Pages.Admin
{
    public class ImpersonateBase : ComponentBase
    {
        [Parameter]
        public string Token { get; set; }

        [Inject]
        public NavigationManager NavigationManager { get; set; }

        [Inject]
        public IJSRuntime JSRuntime { get; set; }
        
        protected override async Task OnInitializedAsync()
        {
            ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("Impersonate", Token);
            NavigationManager.NavigateTo("/");
        }
    }
}