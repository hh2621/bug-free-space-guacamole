using Microsoft.AspNetCore.Authentication.Cookies;
using SampleApp.Factory;
using SampleApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(opts =>
{
    opts.IdleTimeout = TimeSpan.FromSeconds(30);
    opts.Cookie.HttpOnly = true; // Chỉ có Server mới đọc được Cookie Session
    opts.Cookie.IsEssential = true; // Cookie này là cần thiết
});
builder.Services.AddTransient<IDbConnectionFactory>(service =>
                {
                    return new NpgsqlConnectionFactory("Host=localhost; Port=5432; Database=fiidb; Username=test96; Password=test96;");
                });

builder.Services.AddTransient<IUserRepo, UserRepo>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IAuthService, AuthService>();

// 🎯 BỔ SUNG PHẦN NÀY: Cấu hình Dịch vụ Xác thực
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        // Cấu hình cookie của bạn (ví dụ: tên, đường dẫn)
        options.LoginPath = "/Auth/Login";
        options.AccessDeniedPath = "/Auth/AccessDenied";
    });


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseDeveloperExceptionPage();
app.UseSession();
app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();

// Ví dụ, nếu code của bạn là Minimal API và bạn muốn nó nằm trong namespace SampleApp:
namespace SampleApp
{
    public partial class Program { }
}

