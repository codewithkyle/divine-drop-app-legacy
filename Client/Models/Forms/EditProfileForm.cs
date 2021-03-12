using System.ComponentModel.DataAnnotations;

namespace Client.Models.Forms
{
    public class EditProfileForm : FormCore
    {
        [Required(
            ErrorMessage = "Your email address is required."
        )]
        public string Email { get; set; }

        [Required(
            ErrorMessage = "Your name is requried."
        )]
        public string Name { get; set; }
    }
}
