// File: Model User.cs

using System;
using System.Collections.Generic;

namespace SampleApp.Models
{
    // --- 1. Bảng c_dept (Phòng Ban - Department) ---
    /// <summary>
    /// Đại diện cho bảng c_dept (Phòng Ban).
    /// </summary>
    public class Department
    {
        // Khóa chính kỹ thuật (dept_key)
        public long DeptKey { get; set; }

        // ID Phòng ban (Code duy nhất)
        public string DeptId { get; set; }

        // Tên Phòng ban 
        public string DeptName { get; set; }

        // Mã phòng ban cha (fk_parent_dept) - có thể null
        public long? FkParentDept { get; set; }

        // Mô tả chức năng
        public string Description { get; set; }

        // Metadata
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Mối quan hệ: Có thể thêm thuộc tính để chứa phòng ban cha hoặc con nếu cần cho Dapper Multi-Mapping
        // public Department ParentDepartment { get; set; } 
    }

    // --- 2. Bảng c_role (Vai trò/Quyền hạn - Role) ---
    /// <summary>
    /// Đại diện cho bảng c_role (Vai trò/Quyền hạn).
    /// </summary>
    public class Role
    {
        // Khóa chính kỹ thuật (role_key)
        public long RoleKey { get; set; }

        // Tên vai trò duy nhất
        public string RoleName { get; set; }

        // Mô tả vai trò
        public string Description { get; set; }

        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // --- 3. Bảng c_emp (Nhân viên - Employee) ---
    /// <summary>
    /// Đại diện cho bảng c_emp (Nhân viên).
    /// </summary>
    public class User
    {
        // IDENTIFICATION & PRIMARY KEY (emp_key)
        public long EmpKey { get; set; }

        // ID Nhân viên duy nhất (emp_id)
        public string EmpId { get; set; }

        // BASIC INFORMATION
        public string FullName { get; set; }
        public string Title { get; set; }

        // SECURITY & AUTHENTICATION
        // Hash của mật khẩu
        public string PasswordHash { get; set; }

        // Email dùng để đăng nhập/liên hệ
        public string Email { get; set; }

        // ERP RELATIONSHIPS (Khóa ngoại)
        // Liên kết 1-to-N với c_dept
        public long? FkDeptKey { get; set; } 
        
        // Khóa ngoại đến bảng Chi nhánh/Vị trí làm việc (giả định có bảng c_branch)
        public long? FkBranchKey { get; set; } 

        // STATUS & METADATA
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // Ghi chú linh tinh
        public string MiscNote { get; set; }
    }

    // --- 4. Bảng c_emp_role (Liên kết Nhân viên - Vai trò: N-to-N) ---
    /// <summary>
    /// Đại diện cho bảng c_emp_role (Bảng liên kết Nhân viên - Vai trò).
    /// </summary>
    public class EmployeeRoleLink
    {
        // Khóa ngoại đến c_emp
        public long FkEmpKey { get; set; } 

        // Khóa ngoại đến c_role
        public long FkRoleKey { get; set; } 

        // Metadata
        public DateTime AssignedAt { get; set; }
    }


    // ####################################################################
    // # DTO/ViewModel cho Dapper (Truy vấn JOIN)
    // ####################################################################

    /// <summary>
    /// DTO/ViewModel để ánh xạ kết quả JOIN Employee và Department (1-N)
    /// </summary>
    public class EmployeeDetailDto : User
    {
        // Thông tin Phòng ban (thường được lấy bằng JOIN)
        public string DeptName { get; set; } 
        public string DeptId { get; set; }

        // Thông tin Vai trò (sử dụng Dapper Multi-Mapping hoặc truy vấn riêng)
        public List<Role> Roles { get; set; } = new List<Role>();
    }

    /// <summary>
    /// DTO/ViewModel nhẹ để ánh xạ kết quả JOIN Employee và Role qua bảng liên kết.
    /// Dùng cho Dapper Multi-Mapping (N-to-N).
    /// </summary>
    public class EmployeeRoleDto 
    {
        // Thuộc tính từ Employee
        public long EmpKey { get; set; }
        public string EmpId { get; set; }
        public string FullName { get; set; }
        // ... (Thêm các thuộc tính Employee cần thiết)

        // Thuộc tính từ Role (Để Dapper có thể map)
        public long RoleKey { get; set; }
        public string RoleName { get; set; }
        public string RoleDescription { get; set; } // Nếu cần 
    }
}

