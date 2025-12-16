using System.ComponentModel.DataAnnotations;

namespace SampleApp.ViewModels
{
    public class LoginViewModel
    {
        [Required]

        public string Username { get; set; }
        [Required]
        public string Password { get; set; }


        public override string ToString()
                {
                    return "[log] Username: " + this.Username + ", Password:" + Password;
                }
    }
}
