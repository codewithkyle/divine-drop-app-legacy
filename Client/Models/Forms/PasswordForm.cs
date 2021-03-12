using System.ComponentModel.DataAnnotations;

namespace Client.Models.Forms
{
    public class PasswordForm : FormCore
    {
        [Required(
            ErrorMessage = "Your current password is requried."
        )]
        [StringLength(
            255,
            MinimumLength = 6,
            ErrorMessage = "Passwords must be at least 6 characters."
        )]
        public string OldPassword { get; set; }

		[Required(
            ErrorMessage = "A new password is requried."
        )]
        [StringLength(
            255,
            MinimumLength = 6,
            ErrorMessage = "Passwords must be at least 6 characters."
        )]
        public string NewPassword { get; set; }
    }
}
