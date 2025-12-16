// File: Services/AuthService.cs

using SampleApp.Models;
using SampleApp.Services;
using SampleApp.Utils;
using System.Security.Claims;

// Service implementation for Authentication logic
public class AuthService : IAuthService
{
    private readonly IUserService _userService;

    // Inject the User Service
    public AuthService(IUserService userService)
    {
        _userService = userService;
    }

    // Core validation logic
    public async Task<IEnumerable<Claim>> ValidateUserAndGetClaimsAsync(string username, string password)
    {
        // 1. Get user data (including HASHED password) from the service/repo
        var user = await _userService.GetUserByUsernameAsync(username);

        if (user == null)
        {
            // User not found
            return null;
        }

        // 2. Compare the raw input password against the stored HASHED password
        // The PasswordHasher handles the secure hashing and comparison process.
        if (!PasswordHasher.VerifyPassword(password, user.PasswordHash))
        {
            // Password verification failed
            return null;
        }

        // 3. Authentication successful! Create the Claims list
        // Claims are key pieces of information about the user that will be stored in the cookie/token
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.EmpKey.ToString()),
            new Claim(ClaimTypes.Name, user.EmpId),
            // Add other claims here (e.g., ClaimTypes.Role, etc.)
        };

        return claims;
    }

    // Handles user registration logic
    public async Task<bool> RegisterUserAsync(string username, string password)
    {
        // 1. Check if username is already taken
        if (await _userService.UsernameExistsAsync(username))
        {
            return false; // Registration failed
        }

        // 2. Hash the password SECURELY before storing
        string hashedPassword = PasswordHasher.HashPassword(password);

        // 3. Create the User model with the HASHED password
        var newUser = new User 
        { 
            EmpId = username, 
            PasswordHash = hashedPassword 
        };

        // 4. Call the User Service to save the new user record
        return await _userService.CreateUserAsync(newUser);
    }

    public Task<bool> RegisterUserAsync(object username, object password)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Claim>?> ValidateUserAndGetClaimsAsync(object username, object password)
    {
        throw new NotImplementedException();
    }
}

