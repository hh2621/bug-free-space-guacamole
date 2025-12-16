// File: Controllers/AuthController.cs

using Microsoft.AspNetCore.Mvc;
using SampleApp.Services; // Assuming AuthService is here
using SampleApp.ViewModels; // Assuming ViewModels are here
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using SampleApp.Utils;
// Controller responsible for handling user authentication (Login, Register, Logout)
public class AuthController : Controller
{
    private readonly IAuthService _authService;

    // Constructor Injection: The IAuthService dependency is injected here
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // --- LOGIN ACTIONS ---

    // GET: /Auth/Login
    // Displays the login form
    public IActionResult Login()
    {
        // If the user is already authenticated, redirect them to a default page (e.g., Home)
        if (User.Identity.IsAuthenticated)
        {
            return RedirectToAction("Index", "Home");
        }
        return View();
    }

    // POST: /Auth/Login
    // Processes the login request
    [HttpPost]
    public async Task<IActionResult> Login([FromForm] LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            // Return the view with validation errors if the model is invalid
            return new JsonResult(new
            {
                res = "Error",
                Message = "Invalid request" + model.ToString()
            });

        }
        try
        {
            // Call the Service Layer to handle the core login logic
            var userClaims = await _authService.ValidateUserAndGetClaimsAsync(model.Username, model.Password);

            if (userClaims == null)
            {
                // Authentication failed
                return new JsonResult(new
                {
                    res = "Error",
                    Message = "Invalid login user is null" + model.ToString()
                });
                //
                // ModelState.AddModelError(string.Empty, "Invalid username or password.");
                // return View(model);
            }

            // --- ASP.NET Core Authentication Flow ---

            // 1. Create a ClaimsIdentity (the identity of the user)
            var identity = new ClaimsIdentity(userClaims, "ApplicationCookie");

            // 2. Create a ClaimsPrincipal
            var principal = new ClaimsPrincipal(identity);

            // 3. Sign in the user (writes the authentication cookie)
            await HttpContext.SignInAsync("ApplicationCookie", principal);
        }
        catch (Exception e)
        {
            Console.WriteLine("============================");
            LoggerHelper.WriteRedExceptionLine(e.Message, true);
            LoggerHelper.WriteRedExceptionLine(e.StackTrace, false);

            Console.WriteLine("============================");
            return new JsonResult(new
            {
                res = "Error",
                Message = e.Message,
                StackTrace = e.StackTrace
            });
        }
        // Redirect to the intended return URL or Home page
        return new JsonResult(new
        {
            res = "OK",
            Message = ""
        });
        ;
    }

    // --- LOGOUT ACTION ---

    // POST/GET: /Auth/Logout
    public async Task<IActionResult> Logout()
    {
        // Sign out the user (removes the authentication cookie)
        try
        {
            await HttpContext.SignOutAsync("ApplicationCookie");
        }
        catch
        {

        }
        return RedirectToAction("Index", "Home");
    }

    // --- REGISTER ACTIONS (Optional, but included for completeness) ---

    // GET: /Auth/Register
    public IActionResult Register()
    {
        return View();
    }

    // POST: /Auth/Register
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var result = await _authService.RegisterUserAsync(model.Username, model.Password);

        if (result)
        {
            // Registration successful, redirect to login page
            return RedirectToAction("Login");
        }

        // Registration failed (e.g., username already exists)
        ModelState.AddModelError(string.Empty, "Registration failed. Username might be taken.");
        return View(model);
    }
}

