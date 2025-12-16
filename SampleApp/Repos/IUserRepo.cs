// File: Repositories/IUserRepo.cs

using SampleApp.Models;
using System.Threading.Tasks;

// Interface defining the direct data access operations for the User entity
public interface IUserRepo
{
    // Data access method to fetch the User record by username
    Task<User> GetUserByUsernameAsync(string username);

    // Data access method to insert a new User record into the database
    // The password MUST be a HASHED password when passed to this method
    Task<bool> AddUserAsync(User user);

    // Data access method to check if a specific username exists
    Task<bool> CheckUsernameExistsAsync(string username);
}

