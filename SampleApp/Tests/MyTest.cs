// File: CustomWebApplicationFactory.cs (Điều chỉnh để không Mock)
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Testing;
using SampleApp.Factory;

namespace SampleApp.Tests
{
    // TProgram là class entry point của ứng dụng (Program.cs)
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        public NpgsqlConnectionFactory NpgSqlFactory = new NpgsqlConnectionFactory("Host=localhost;Port=5432;Database=fiidb;Username=test96;Password=1");
        // Sử dụng SQLite Factory để kiểm soát DB test
        // ** PHƯƠNG THỨC MỚI: GHI ĐÈ CreateHost **
        protected override IHost CreateHost(IHostBuilder builder)
        {
            // 1. Định nghĩa đường dẫn tuyệt đối đến thư mục gốc của dự án chính (SampleApp)
            // Lấy thư mục của Assembly đang chạy (dự án Test)
            var testAssembly = typeof(CustomWebApplicationFactory<TProgram>).Assembly.Location;

            // Tìm thư mục gốc của Solution (giả định cấu trúc tiêu chuẩn: [SolutionRoot]/SampleApp/Tests/...)
            // Cần đi ngược lên 2 cấp (Test -> SampleApp -> Solution)
            var solutionRoot = "";

            // Đường dẫn đến thư mục dự án chính (Ví dụ: [SolutionRoot]/SampleApp)
            var applicationPath = Path.Combine(solutionRoot, "SampleApp");


            builder.ConfigureWebHost(webBuilder =>
            {
                // ** CHỈ ĐỊNH CONTENT ROOT THƯỜNG MINH **
                // Đảm bảo WebHost biết nơi tìm Views và appsettings.json
                
                webBuilder.UseContentRoot("/workspaces/bug-free-space-guacamole/SampleApp");
                webBuilder.UseWebRoot("/workspaces/bug-free-space-guacamole/SampleApp");
                // Khởi tạo (Startup) Assembly
                webBuilder.UseStartup<TProgram>();


            });

            builder.ConfigureServices(services =>
        {
            // 1. Tìm và xóa triển khai IDbConnectionFactory ban đầu (Npgsql/DB thật)
            var dbFactoryDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IDbConnectionFactory));

            if (dbFactoryDescriptor != null)
            {
                services.Remove(dbFactoryDescriptor);
            }

            // 2. Thêm triển khai IDbConnectionFactory sử dụng SQLite In-Memory cho môi trường test.
            // Các lớp Repository và Service còn lại (EmployeeRepository, AuthService) 
            // sẽ sử dụng Factory này và chạy logic THẬT của chúng.
            services.AddSingleton<IDbConnectionFactory>(NpgSqlFactory);

        });
            return base.CreateHost(builder);
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // 1. Lấy đường dẫn tuyệt đối đến thư mục dự án Web (SampleApp)
            // Đây là thư mục chứa tệp .csproj của dự án web.
            var projectDir = Assembly.GetAssembly(typeof(TProgram)).Location;

            // Tùy thuộc vào cấu trúc dự án của bạn, bạn có thể cần điều chỉnh đường dẫn này.
            // Ví dụ: Tìm kiếm từ thư mục chứa dll đang chạy (.bin/Debug/net10.0/)
            // đến thư mục gốc của dự án web.
            var webAppProjectRoot = "/workspaces/bug-free-space-guacamole/SampleApp";

            // 2. Đặt ContentRoot thủ công
            builder.UseContentRoot(webAppProjectRoot);

            base.ConfigureWebHost(builder);
        }


    }
}
