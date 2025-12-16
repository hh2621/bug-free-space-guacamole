
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using SampleApp.Services;
using Xunit;

namespace SampleApp.Tests.IntegrationTests
{
    internal class GoatWebApplication : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            Environment.SetEnvironmentVariable("CacheSettings:UseCache", "false");

            _ = builder.ConfigureTestServices(services =>
            {
                services.AddTransient<IUserService, UserService>();
                services.AddTransient<IAuthService, AuthService>();
            });
            string buildDir = AppDomain.CurrentDomain.BaseDirectory;
            builder.UseContentRoot(buildDir);

        }
    }

    public class AuthControllerTest()
    {

        [Fact]
        public async Task AuthControllerTest_Login()
        {
            // Arrange
            await using var application = new GoatWebApplication();
            var client = application.CreateClient();

            // Act
            var response = await client.GetAsync("/validpath");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

    }

}

