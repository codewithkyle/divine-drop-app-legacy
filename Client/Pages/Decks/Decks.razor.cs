using System.Threading.Tasks;
using Client.Models.Pages;
using Client.Models.Data;
using Client.Models.API;
using Microsoft.JSInterop;
using System.Collections.Generic;

namespace Client.Pages.Decks
{
    public class DecksBase : UserPage
    {
        public List<Deck> Decks = new List<Deck>();
        protected override async Task Main()
        {
            Decks = await JSRuntime.InvokeAsync<List<Deck>>("Select", "decks");
            if (Decks.Count == 0)
            {
                await GetDecks();
            }
            else
            {
                GetDecks();
            }
            
        }

        private async Task GetDecks()
        {
            DecksResponse DecksResponse = await JSRuntime.InvokeAsync<DecksResponse>("GetDecks");
            if (DecksResponse.Success)
            {
                Decks = DecksResponse.Decks;
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", "Failed to get your decks from the database.");
            }
            StateHasChanged();
        }
    }
}