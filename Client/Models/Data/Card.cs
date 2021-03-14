namespace Client.Models.Data
{
    public class Card
    {
        public string UID {get;set;}
        public string Name {get;set;}
        public string Slug {get;set;}
        public string Layout {get;set;}
        public string Rarity {get;set;}
        public string Type {get;set;}
        public string Text {get;set;}
        public string FlavorText {get;set;}
        public Vitality[] Vitality {get;set;}
        public string[] FaceNames {get;set;}
        public string[] ManaCosts {get;set;}
        public string[] Subtypes {get;set;}
        public string[] Colors {get;set;}
        public string[] Keywords {get;set;}
        public string Front {get;set;}
        public string Back {get;set;}
    }
}
