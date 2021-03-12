namespace Client.Models.API
{
    public class ResponseCore
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Error { get; set; } = null;
    }
}