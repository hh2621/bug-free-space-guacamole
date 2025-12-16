
using HtmlAgilityPack;

namespace SampleApp.Utils
{
    public class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            throw new NotImplementedException();
        }

        public static bool VerifyPassword(string password, string passwordHash)
        {
          return true;
        }
    }
    /// <summary>
    /// Helper để trích xuất Anti-Forgery Token từ nội dung HTML của trang Razor View.
    /// Cần thiết cho các Integration Test POST khi có [ValidateAntiForgeryToken].
    /// </summary>
    public static class AntiForgeryTokenHelper
    {
        /// <summary>
        /// Trích xuất giá trị của Anti-Forgery Token.
        /// </summary>
        /// <param name="response">HttpResponseMessage từ request GET tới trang chứa form.</param>
        /// <returns>Giá trị của __RequestVerificationToken.</returns>
        public static async Task<string> GetToken(HttpResponseMessage response)
        {
            // 1. Kiểm tra request GET phải thành công
            response.EnsureSuccessStatusCode();

            // 2. Đọc toàn bộ nội dung HTML
            var htmlContent = await response.Content.ReadAsStringAsync();

            // 3. Sử dụng HtmlAgilityPack để phân tích cú pháp
            var htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(htmlContent);

            // 4. Tìm thẻ input có tên "__RequestVerificationToken"
            // Thẻ này được tự động tạo ra khi dùng @Html.AntiForgeryToken()
            var tokenInput = htmlDoc.DocumentNode.SelectSingleNode("//input[@name='__RequestVerificationToken']");

            if (tokenInput == null)
            {
                // Nếu không tìm thấy, có thể View không dùng AntiForgeryToken hoặc tên trường khác
                throw new InvalidOperationException("Could not find the __RequestVerificationToken input field in the response content. Ensure the view uses @Html.AntiForgeryToken().");
            }

            // 5. Trả về giá trị (value) của input đó
            return tokenInput.GetAttributeValue("value", string.Empty);
        }
    }
    public static class LoggerHelper
    {
        // ANSI Code cho chữ In Đậm (Bold)
        private const string BOLD = "\u001b[1m";
        // ANSI Code cho màu Đỏ (Red)
        private const string RED_COLOR = "\u001b[96m";
        // ANSI Code để Khôi phục (Reset) về định dạng mặc định
        private const string RESET = "\u001b[0m";
        /// <summary>
        /// Ghi một dòng văn bản ra Console với màu đỏ, thường dùng cho các lỗi nghiêm trọng.
        /// </summary>
        /// <param name="message">Thông báo lỗi muốn in.</param>
        /// <param name="isBold">Nếu True, in thêm dấu * để mô phỏng in đậm (tùy thuộc vào terminal).</param>
        public static void WriteRedExceptionLine(string message, bool isBold = true)
        {
            // Lưu lại màu hiện tại của console để khôi phục sau này
            ConsoleColor originalColor = Console.ForegroundColor;

            // Thiết lập màu chữ thành Đỏ
            Console.ForegroundColor = ConsoleColor.Red;

            // Thêm dấu * để mô phỏng chữ đậm (vì Console không hỗ trợ định dạng đậm/nghiêng trực tiếp)
            string outputMessage = isBold ? $"*** {RED_COLOR}{message}{RESET} ***" : message;

            // In thông báo lỗi ra Console
            Console.WriteLine($"{outputMessage}");
            // Khôi phục lại màu chữ ban đầu
            Console.ForegroundColor = originalColor;
        }
    }

}
