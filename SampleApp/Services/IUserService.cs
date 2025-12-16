// File: Services/IUserService.cs

using SampleApp.Models;

// Interface defining the business operations reated to User CRUD (Create, Read, Update, Delete)
public interface IUserService
{
    // Retrieve a User by their unique username
    Task<User> GetUserByUsernameAsync(string username);

    // Creates a new user in the system
    Task<bool> CreateUserAsync(User user);
    
    // Checks if a username already exists
    Task<bool> UsernameExistsAsync(string username);
    
    // Note: Other CRUD methods (Update, Delete) would also reside here.
}

