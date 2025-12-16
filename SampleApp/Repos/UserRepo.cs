// File: Repositories/UserRepo.cs

using SampleApp.Models;
using SampleApp.Factory;
using System.Data;
using Dapper; // Assuming Dapper is used for micro-ORM functionalities

// Repository implementation for User data access using PostgreSQL and Parameterized Queries
public class UserRepo : IUserRepo
{
    private readonly IDbConnectionFactory _connectionFactory;

    // Inject the connection factory
    public UserRepo(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Retrieves a user by username from the database
    public async Task<User> GetUserByUsernameAsync(string username)
    {
        // SQL query: SELECT necessary columns including the HASHED password
        const string sql = "SELECT id, username, passwordhash FROM c_emp WHERE username = @Username";

        using (IDbConnection connection = _connectionFactory.CreateConnection())
        {
            // Dapper call: Uses parameterized query (@Username) to prevent SQL Injection
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
        }
    }

    // Inserts a new user into the database
    public async Task<bool> AddUserAsync(User user)
    {
        // Ensure the User model passed here contains the HASHED password, not the raw one
        const string sql = "INSERT INTO users (username, passwordhash) VALUES (@Username, @PasswordHash)";

        using (IDbConnection connection = _connectionFactory.CreateConnection())
        {
            // Execute the query; returns the number of rows affected
            var rowsAffected = await connection.ExecuteAsync(sql, user);
            return rowsAffected > 0;
        }
    }

    // Checks if a username already exists in the database
    public async Task<bool> CheckUsernameExistsAsync(string username)
    {
        const string sql = "SELECT COUNT(*) FROM users WHERE username = @Username";

        using (IDbConnection connection = _connectionFactory.CreateConnection())
        {
            // Dapper call: QuerySingleAsync<int> returns the count
            var count = await connection.QuerySingleAsync<int>(sql, new { Username = username });
            return count > 0;
        }
    }
}

