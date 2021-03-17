using System;
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
            bool Success = await JSRuntime.InvokeAsync<bool>("Ingest", "/v1/ingest/decks", "decks");
            if (Success)
            {
                Decks = await JSRuntime.InvokeAsync<List<Deck>>("Select", "decks");
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", "Failed to sync your decks with the database.");
            }
            StateHasChanged();
        }
        public async Task RenameDeck(string UID, string currentName)
        {
            string newName = await JSRuntime.InvokeAsync<string>("Prompt", "What would you like the new deck name to be?", currentName);
            if (!String.IsNullOrEmpty(newName) && !String.IsNullOrWhiteSpace(newName))
            {
                for (int i = 0; i < Decks.Count; i++)
                {
                    if (Decks[i].UID == UID)
                    {
                        Decks[i].Name = newName;
                        await JSRuntime.InvokeVoidAsync("UpdateDeck", Decks[i]);
                        break;
                    }
                }
            }
        }

        public async Task DeleteDeck(string UID, string name)
        {
            bool isConfirmed = await JSRuntime.InvokeAsync<bool>("Confirm", "Are you sure you want to delete \"" + name + "\"?");
            if (isConfirmed)
            {
                int index = -1;
                for (int i = 0; i < Decks.Count; i++)
                {
                    if (Decks[i].UID == UID)
                    {
                        index = i;
                        break;
                    }
                }
                if (index >= 0)
                {
                    ResponseCore Response = await JSRuntime.InvokeAsync<ResponseCore>("DeleteDeck", Decks[index].UID);
                    if (Response.Success)
                    {
                        await JSRuntime.InvokeVoidAsync("Alert", "success", "Deck Deleted", name + " has been deleted.");
                        Decks = await JSRuntime.InvokeAsync<List<Deck>>("Select", "decks");
                        StateHasChanged();
                    }
                    else
                    {
                        await JSRuntime.InvokeVoidAsync("Alert", "error", "Error", Response.Error);
                    }
                }
            }
        }
    }
}