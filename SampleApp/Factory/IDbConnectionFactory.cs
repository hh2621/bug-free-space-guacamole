using System.Data;

namespace SampleApp.Factory
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
