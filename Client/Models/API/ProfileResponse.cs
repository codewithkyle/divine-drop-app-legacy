using Client.Models.Data;

namespace Client.Models.API
{
    public class ProfileResponse : ResponseCore
    {
        public User User {get;set;}
    }
}