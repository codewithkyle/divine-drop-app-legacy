using Client.Models.Data;
using System.Collections.Generic;

namespace Client.Models.API
{
    public class UsersResponse : ResponseCore
    {
        public List<User> Users {get;set;}
        public int Total {get;set;}
    }
}