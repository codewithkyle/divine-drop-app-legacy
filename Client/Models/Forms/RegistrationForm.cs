using System.ComponentModel.DataAnnotations;

namespace Client.Models.Forms
{
    public class RegistrationForm : FormCore
    {
        [Required(
            ErrorMessage = "An email is requried."
        )]
        [StringLength(
            255,
            ErrorMessage = "Names cannot be longer than 255 characters."
        )]
        public string Email { get; set; }

        [Required(
            ErrorMessage = "Your name is requried."
        )]
        [StringLength(
            255,
            ErrorMessage = "Names cannot be longer than 255 characters."
        )]
        public string Name { get; set; }

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