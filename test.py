import requests
import json

# --- 1. Cấu hình ---
# Đảm bảo URL này khớp với nơi Server của bạn đang chạy
BASE_URL = "http://localhost:5260" 
LOGIN_ENDPOINT = "/Auth/Login" # Thay đổi nếu endpoint của bạn khác

# Dữ liệu Form Data
# KEY PHẢI KHỚP VỚI TÊN THUỘC TÍNH (Username, Password) trong LoginViewModel C#
LOGIN_PAYLOAD = {
    "Username": "E0001",
    "Password": "PythonPassword123"
}

# --- 2. Gửi Request POST ---
def test_login_form_data():
    full_url = BASE_URL + LOGIN_ENDPOINT
    
    print(f"--- Đang gửi POST Request đến: {full_url} ---")
    print(f"Payload (Form Data): {LOGIN_PAYLOAD}")
    
    try:
        # Sử dụng tham số 'data' trong requests.post 
        # Requests sẽ tự động set Content-Type: application/x-www-form-urlencoded
        response = requests.post(
            full_url, 
            data=LOGIN_PAYLOAD
        )
        
        # --- 3. Phân tích kết quả ---
        print("\n--- Phản hồi từ Server ---")
        print(f"Status Code: {response.status_code}")
        
        # In nội dung phản hồi
        print("Response Body:")
        try:
            # Thử parse JSON nếu Server trả về JSON
            print(json.dumps(response.json(), indent=4))
        except requests.exceptions.JSONDecodeError:
            # Nếu không phải JSON, in text thô
            print(response.text)
            
        if response.status_code == 200:
            print("\n✅ TEST THÀNH CÔNG: Controller đã nhận và xử lý dữ liệu.")
        else:
            print("\n❌ TEST THẤT BẠI: Model Binding có thể bị lỗi hoặc logic Server gặp vấn đề.")
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ LỖI KẾT NỐI: Đảm bảo Server đang chạy tại {BASE_URL}")

if __name__ == "__main__":
    test_login_form_data()

