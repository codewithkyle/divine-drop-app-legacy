namespace Client.Models.Forms
{
    public class FormCore
    {
        public string ErrorMessage { get; set; } = null;
        public bool Success { get; set; } = false;
        public bool IsSubmitting { get; set; } = false;

        public void Submit()
        {
            IsSubmitting = true;
            ErrorMessage = null;
            Success = false;
        }

        public void Fail(string error)
        {
            IsSubmitting = false;
            ErrorMessage = error;
            Success = false;
        }

        public void Succeed()
        {
            IsSubmitting = false;
            ErrorMessage = null;
            Success = true;
        }
    }
}