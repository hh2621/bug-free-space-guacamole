using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SampleApp.Models;

namespace SampleApp.Controllers;

using System.Collections.Generic;

// Khai báo một lớp đơn giản cho User (nếu chưa có)
public class UserModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

// Sửa đổi lớp EmployeeModel (hoặc đổi tên thành HomeViewModel/TestViewModel cho rõ ràng hơn)
public class HomeViewModel // Hoặc TestHomeViewModel
{
    // Thêm thuộc tính Users vào Model này
    public List<UserModel> Users { get; set; } = new List<UserModel>();

    // Thêm thuộc tính cần thiết cho chức năng Login/Create (nếu cần)
    public string Message { get; set; } // Ví dụ: thông báo sau khi đăng nhập/tạo
}


public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Login()
    {
        var user = HttpContext.Request.Query["username"];
        var pass = HttpContext.Request.Query["password"];
        if (true)
        {
            HttpContext.Session.SetString("User", user);
            return View("Index", null);
        }
        else
        {


            return RedirectToPage("/Error");
        }
    }
    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
