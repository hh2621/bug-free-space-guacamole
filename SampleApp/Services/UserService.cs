// File: Services/UserService.cs

using SampleApp.Models;
using System.Threading.Tasks;

// Service implementation for User operations
public class UserService : IUserService
{
    private readonly IUserRepo _userRepo;

    // Inject the User Repository
    public UserService(IUserRepo userRepo)
    {
        _userRepo = userRepo;
    }

    // Delegates the call to the repository
    public Task<User> GetUserByUsernameAsync(string username)
    {
        // Business logic here might involve caching checks or authorization before calling the repo
        return _userRepo.GetUserByUsernameAsync(username);
    }

    // Handles user creation logic
    public Task<bool> CreateUserAsync(User user)
    {
        // In a real application, logging or validation would occur here
        return _userRepo.AddUserAsync(user);
    }
    
    // Handles username existence check logic
    public Task<bool> UsernameExistsAsync(string username)
    {
        return _userRepo.CheckUsernameExistsAsync(username);
    }
}

