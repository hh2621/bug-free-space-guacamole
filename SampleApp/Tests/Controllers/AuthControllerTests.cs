
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using SampleApp.Factory;
using SampleApp.Services;
using Xunit;
using SampleApp.Utils;


namespace SampleApp.Tests.IntegrationTests
{
    internal class MyTestWebApplication : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            Environment.SetEnvironmentVariable("CacheSettings:UseCache", "false");

            _ = builder.ConfigureTestServices(services =>
            {
                services.AddTransient<IDbConnectionFactory>(service =>
                {
                    return new NpgsqlConnectionFactory("Host=localhost; Port=5432; Database=fiidb; Username=test96; Password=test96;");
                });

                services.AddTransient<IUserRepo, UserRepo>();
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
            await using var application = new MyTestWebApplication();
            var client = application.CreateClient();
            await client.GetAsync("/Auth/Logout");


            var responseGet = await client.GetAsync("/Auth/Login");

            var antiCRFS = await AntiForgeryTokenHelper.GetToken(responseGet);

            // Act
            var loginData = new Dictionary<string, string>
{
    { "username", "E0001" },
    { "Password", "Password123!" },
    {"__RequestVerificationToken", antiCRFS  }
};

            // 1. Create the content to be sent in the POST request body
            var content = new FormUrlEncodedContent(loginData);
            
            var response = await client.PostAsync("/Auth/Login", content);
            var msg = await response.Content.ReadAsStringAsync();
            Assert.True(msg.Contains("OK"), msg);
        }
    }
}

