using System.Security.Claims;

namespace SampleApp.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterUserAsync(object username, object password);
        Task<IEnumerable<Claim>?> ValidateUserAndGetClaimsAsync(string username, string password);
    }
}
