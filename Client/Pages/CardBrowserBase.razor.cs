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
        public enum LayoutType {
            Card,
            List,
        }
        public LayoutType Layout = LayoutType.Card;
        public int Page = 1;
        protected override async Task Main()
        {
			SearchDebouceTimer = new Timer(600);
        	SearchDebouceTimer.Elapsed += DebounceCallback;
            string savedLayout = await JSRuntime.InvokeAsync<string>("GetSetting", "cardLayout");
            if (!String.IsNullOrEmpty(savedLayout))
            {
                switch(savedLayout)
                {
                    case "List":
                        Layout = LayoutType.List;
                        break;
                    case "Card":
                        Layout = LayoutType.Card;
                        break;
                }
            }
            await SearchCards();
        }
        public async Task SearchCards()
        {
            IsLoading = true;
            StateHasChanged();
            string[] keys = {"Name", "Text", "FlavorText"};
			Cards = await JSRuntime.InvokeAsync<List<Card>>("Search", "cards", Search, keys, Page, 50);
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
        public void CycleView()
        {
            switch(Layout)
            {
                case LayoutType.Card:
                    Layout = LayoutType.List;
                    break;
                case LayoutType.List:
                    Layout = LayoutType.Card;
                    break;
                default:
                    Layout = LayoutType.Card;
                    break;
            }
            JSRuntime.InvokeVoidAsync("SetSetting", "cardLayout", Layout.ToString());
            StateHasChanged();
        }
    }
}
