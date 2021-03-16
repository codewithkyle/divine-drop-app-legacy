using Client.Models.Pages;
using Client.Models.Data;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace Client.Pages.Decks
{
    public class EditDeckBase : UserPage
    {
        [Parameter] public string UID { get; set; }
        public List<DeckCard> Cards = new List<DeckCard>();
        public Deck Deck {get;set;}
        protected override async Task Main()
        {
            Deck = await JSRuntime.InvokeAsync<Deck>("GetDeck", UID);
            if (Deck == null)
            {
                NavigationManager.NavigateTo("/decks");
            }
        }
    }
}