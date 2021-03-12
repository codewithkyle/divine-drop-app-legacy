namespace Client.Models.API
{
    public class LoginResponse : FormResponse
    {
        public bool IsPendingEmailVerificaiton { get; set; }
    }
}