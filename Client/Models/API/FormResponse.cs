namespace Client.Models.API
{
    public class FormResponse : ResponseCore
    {
        public string[] FieldErrors { get; set; } = null;
    }
}