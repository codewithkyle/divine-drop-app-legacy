using System.ComponentModel.DataAnnotations;

namespace Client.Models.Forms
{
    public class ResetPasswordForm : FormCore
    {
        [Required(
            ErrorMessage = "A password is requried."
        )]
        [StringLength(
            255,
            MinimumLength = 6,
            ErrorMessage = "Passwords must be at least 6 characters."
        )]
        public string Password { get; set; }
    }
}