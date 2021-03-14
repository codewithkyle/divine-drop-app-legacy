using System;
using System.Threading.Tasks;
using Client.Models.Pages;
using Client.Models.Data;
using System.Timers;
using Microsoft.JSInterop;
using System.Collections.Generic;

namespace Client.Pages
{
    public class CardBrowserBase : UserPage
    {
        public string Search = "";
        private Timer SearchDebouceTimer;
        public bool IsLoading = true;
        public List<Card> Cards = new List<Card>();
        protected override async Task Main()
        {
			SearchDebouceTimer = new Timer(600);
        	SearchDebouceTimer.Elapsed += DebounceCallback;
        	SearchDebouceTimer.AutoReset = false;
            await SearchCards();
        }
        public async Task SearchCards()
        {
            IsLoading = true;
            StateHasChanged();
            string[] keys = {"Name", "Text", "FlavorText"};
			Cards = await JSRuntime.InvokeAsync<List<Card>>("Search", "cards", Search, keys, 1, 1);
            IsLoading = false;
            StateHasChanged();
        }
        public async void DebounceCallback(Object source, ElapsedEventArgs e)
		{
			await SearchCards();
		}
        public void DebounceSearch()
		{
			SearchDebouceTimer.Stop();
			SearchDebouceTimer.Start();
		}
    }
}
