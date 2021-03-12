using Client.Models.Data;

namespace Client.Models.Globals
{
    public static class CurrentUser
    {
        public static string Name {get;set;}
        public static string Email {get;set;}
        public static string Uid {get;set;}
        public static string[] Groups {get;set;}
        public static bool Suspended {get;set;}
        public static bool Verified{get;set;}
        public static bool Admin {get;set;}
		public static string Avatar {get;set;}

        public static void SetCurrentUser(User User)
        {
            Name = User.Name;
            Email = User.Email;
            Uid = User.Uid;
            Groups = User.Groups;
            Suspended = User.Suspended;
            Verified = User.Verified;
            Admin = User.Admin;
			Avatar = User.Avatar;
        }
    }
}
