using System;
using System.Threading.Tasks;
using Client.Models.Pages;
using Client.Models.Data;
using System.Timers;
using Microsoft.JSInterop;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

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
        public int TotalCards = 0;
        public int TotalPages = 1;
        public string[] Types = {};
        public string[] Subtypes = {};
        public string[] Keywords = {};
        public string[] Rarities = {"Common", "Uncommon", "Rare", "Mythic"};
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
            Types = await JSRuntime.InvokeAsync<string[]>("GetCardTypes");
            Subtypes = await JSRuntime.InvokeAsync<string[]>("GetCardSubtypes");
            Keywords = await JSRuntime.InvokeAsync<string[]>("GetCardKeywords");
            await SearchCards();
        }
        public async Task SearchCards()
        {
            SearchDebouceTimer.Stop();
            IsLoading = true;
            StateHasChanged();
            string[] keys = {"Name", "Text", "FlavorText"};
			Cards = await JSRuntime.InvokeAsync<List<Card>>("Search", "cards", Search, keys, Page, 36);
            IsLoading = false;
            StateHasChanged();
            await JSRuntime.InvokeVoidAsync("ResetScroll");
        }
        public async void DebounceCallback(Object source, ElapsedEventArgs e)
		{
            Page = 1;
			await SearchCards();
            string[] keys = {"Name", "Text", "FlavorText"};
            TotalCards = await JSRuntime.InvokeAsync<int>("Count", "cards", Search, keys);
			TotalPages = (int)Math.Ceiling((decimal)TotalCards / 36);
            StateHasChanged();
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
        public void Next()
        {
            Page++;
            if (Page > TotalPages)
            {
                Page = TotalPages;
            }
            SearchCards();
        }

        public void Back()
        {
            Page--;
            if (Page < 1)
            {
                Page = 1;
            }
            SearchCards();
        }
        public void UpdateSort(ChangeEventArgs e)
        {
            Console.WriteLine(e.Value.ToString());
        }
        public void UpdateRarityFilter(ChangeEventArgs e)
        {
            Console.WriteLine(e.Value.ToString());
        }
    }
}
