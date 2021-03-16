using System;
using System.Threading.Tasks;
using Client.Models.Pages;
using Client.Models.Data;
using System.Timers;
using Microsoft.JSInterop;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Client.Pages.Decks
{
    public class EditDeckBase : UserPage
    {
        [Parameter] public string UID { get; set; }
        public Deck Deck {get;set;}
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
        public List<string> Colors = new List<string>();
        public string Sort = "abc";
        public string Rarity = "";
        public string Type = "";
        public string Subtype = "";
        public string Keyword = "";
        public string DeckName = "";
        protected override async Task Main()
        {
            Deck = await JSRuntime.InvokeAsync<Deck>("GetDeck", UID);
            if (Deck == null)
            {
                NavigationManager.NavigateTo("/decks");
                return;
            }
            DeckName = Deck.Name;
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
			Cards = await JSRuntime.InvokeAsync<List<Card>>("SearchCards", Search, Page, Type, Subtype, Keyword, Rarity, Colors, Sort);
            TotalCards = await JSRuntime.InvokeAsync<int>("CountCards", Search, Page, Type, Subtype, Keyword, Rarity, Colors, Sort);
            TotalPages = (int)Math.Ceiling((decimal)TotalCards / 36);
            IsLoading = false;
            StateHasChanged();
            await JSRuntime.InvokeVoidAsync("ResetScroll");
        }
        private void Reset(){
            Page = 1;
            SearchCards();
        }
        public async void DebounceCallback(Object source, ElapsedEventArgs e)
		{
            Page = 1;
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
            Sort = e.Value.ToString();
            Reset();
        }
        public void UpdateRarityFilter(ChangeEventArgs e)
        {
            Rarity = e.Value.ToString();
            Reset();
        }
        public void UpdateTypeFilter(ChangeEventArgs e)
        {
            Type = e.Value.ToString();
            Reset();
        }
        public void UpdateSubtypeFilter(ChangeEventArgs e)
        {
            Subtype = e.Value.ToString();
            Reset();
        }
        public void UpdateKeywordFilter(ChangeEventArgs e)
        {
            Keyword = e.Value.ToString();
            Reset();
        }
        public void UpdateColorFilter(string color, bool enabled)
        {
            int index = Colors.IndexOf(color);
            if (enabled && index == -1)
            {
                Colors.Add(color);
            }
            else
            {
                Colors.RemoveAt(index);
            }
            Reset();
        }
        public async Task AddCard(string uid)
        {
            bool isNewCard = true;
            for (int i = 0; i < Deck.Cards.Count; i++)
            {
                if (Deck.Cards[i].UID == uid)
                {
                    isNewCard = false;
                    Deck.Cards[i].Quantity += 1;
                    break;
                }
            }
            if (isNewCard)
            {
                DeckCard NewCard = new DeckCard();
                NewCard.Quantity = 1;
                NewCard.UID = uid;
                Deck.Cards.Add(NewCard);
            }
            await JSRuntime.InvokeVoidAsync("UpdateDeck", Deck);
            string selector = "input[data-card-uid=\"" + uid + "\"]";
            await JSRuntime.InvokeVoidAsync("FocusElement", selector);
            StateHasChanged();
        }
        public async Task ToggleCommander(string uid)
        {
            if (Deck.Commander == uid)
            {
                Deck.Commander = null;
            }
            else
            {
                Deck.Commander = uid;
            }
            await JSRuntime.InvokeVoidAsync("UpdateDeck", Deck);
            StateHasChanged();
        }
        public async Task RemoveFromDeck(string uid)
        {
            int index = -1;
            for (int i = 0; i < Deck.Cards.Count; i++)
            {
                if (Deck.Cards[i].UID == uid)
                {
                    index = i;
                    break;
                }
            }
            if (index >= 0)
            {
                Deck.Cards.RemoveAt(index);
                await JSRuntime.InvokeVoidAsync("UpdateDeck", Deck);
            }
            StateHasChanged();
        }
        public async Task UpdateCardQuantity(string uid, string newValue)
        {
            int newQty = 0;
            if (newValue != "e")
            {
                newQty = Int16.Parse(newValue);
            }
            for (int i = 0; i < Deck.Cards.Count; i++)
            {
                if (Deck.Cards[i].UID == uid)
                {
                    Deck.Cards[i].Quantity = newQty;
                    break;
                }
            }
            await JSRuntime.InvokeVoidAsync("UpdateDeck", Deck);
            StateHasChanged();
        }
        public async Task UpdateDeckName()
        {
            if (Deck.Name != DeckName)
            {
                await JSRuntime.InvokeVoidAsync("UpdateDeck", Deck);
            }
        }
    }
}