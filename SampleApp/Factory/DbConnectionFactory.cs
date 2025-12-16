// File: NpgsqlConnectionFactory.cs
using System.Data;
using Npgsql;

namespace SampleApp.Factory
{
    /// <summary>
    /// Triển khai IDbConnectionFactory để tạo kết nối Npgsql (PostgreSQL).
    /// </summary>
    public class NpgsqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        /// <summary>
        /// Khởi tạo một thể hiện mới của NpgsqlConnectionFactory.
        /// </summary>
        /// <param name="connectionString">Chuỗi kết nối đến cơ sở dữ liệu PostgreSQL.</param>
        public NpgsqlConnectionFactory(string connectionString)
        {
            // Kiểm tra chuỗi kết nối không được rỗng hoặc null.
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new ArgumentException("Chuỗi kết nối không được để trống.", nameof(connectionString));
            }
            _connectionString = connectionString;
        }

        /// <summary>
        /// Tạo và trả về một đối tượng NpgsqlConnection đã được khởi tạo.
        /// </summary>
        /// <returns>Một đối tượng IDbConnection (là NpgsqlConnection).</returns>
        public IDbConnection CreateConnection()
        {
            // NpgsqlConnection triển khai IDbConnection
            return new NpgsqlConnection(_connectionString);
        }
    }
}

