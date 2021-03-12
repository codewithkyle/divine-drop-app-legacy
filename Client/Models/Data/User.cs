namespace Client.Models.Data
{
    public class User
    {
        public string Name {get;set;}
        public string Email {get;set;}
        public string Uid {get;set;}
        public string[] Groups {get;set;}
        public bool Suspended {get;set;}
        public bool Verified {get;set;}
        public bool Admin {get;set;}
		public string Avatar {get;set;}
    }
}
