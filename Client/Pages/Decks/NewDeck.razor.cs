using System.Threading.Tasks;
using Client.Models.Pages;
using Client.Models.API;
using Microsoft.JSInterop;
using System;

namespace Client.Pages.Decks
{
    public class NewDeckBase : UserPage
    {
        public string DeckName = "";
        public async Task CreateDeck()
        {
            CreateDeckResponse Response = await JSRuntime.InvokeAsync<CreateDeckResponse>("CreateDeck", DeckName);
            if (Response.Success)
            {
                await JSRuntime.InvokeVoidAsync("Alert", "success", "Deck Created", DeckName + " has been created.");
                NavigationManager.NavigateTo("/decks/edit/" + Response.UID);
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
            }
        }
    }
}