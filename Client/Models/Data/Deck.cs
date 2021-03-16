using System.Collections.Generic;

namespace Client.Models.Data
{
    public class Deck
    {
        public string UID {get;set;}
        public string Name {get;set;}
        public string Commander {get;set;}
        public List<DeckCard> Cards {get;set;}
    }
}
