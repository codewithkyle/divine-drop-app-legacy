using Client.Models.Data;
using System.Collections.Generic;

namespace Client.Models.API
{
    public class DecksResponse : ResponseCore
    {
        public List<Deck> Decks {get;set;}
    }
}