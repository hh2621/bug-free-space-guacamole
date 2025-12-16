-- Tạo user test96 (không phải superuser, không thể tạo DB/superuser khác...)
CREATE ROLE test96 WITH LOGIN PASSWORD 'test96' NOSUPERUSER CREATEDB;

-- Tạo database fiidb với owner là test96
CREATE DATABASE fiidb OWNER test96;

-- Cấp quyền kết nối và tạo schema trong fiidb (mặc định có khi là owner, nhưng đảm bảo rõ ràng)
\connect fiidb

-- Đảm bảo test96 có quyền đầy đủ trên schema public (nếu cần)
GRANT ALL PRIVILEGES ON SCHEMA public TO test96;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test96;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test96;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO test96;

-- Đặt quyền mặc định cho các đối tượng mới do test96 tạo ra
ALTER DEFAULT PRIVILEGES FOR ROLE test96 IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO test96;
ALTER DEFAULT PRIVILEGES FOR ROLE test96 IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO test96;
ALTER DEFAULT PRIVILEGES FOR ROLE test96 IN SCHEMA public
    GRANT EXECUTE ON FUNCTIONS TO test96;


 -- ####################################################################
-- # INITIALIZATION SCRIPT FOR ERP CORE TABLES (POSTGRESQL)
-- #
-- # BAO GOM: c_dept (Phòng ban), c_role (Vai trò), c_emp (Nhân viên) 
-- # va c_emp_role (Lien ket N-to-N)
-- ####################################################################


----------------------------------------------------------------------
-- 1. Bảng c_dept (Phòng Ban - 部门/部門)
----------------------------------------------------------------------
-- Bang co so, tao truoc de cac bang khac co the tham chieu (FK)
CREATE TABLE c_dept (
    -- Khóa chính kỹ thuật (主键/主鍵)
    dept_key        BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- ID Phòng ban (Code duy nhất)
    dept_id         VARCHAR(20)     UNIQUE NOT NULL,

    -- Tên Phòng ban 
    dept_name       VARCHAR(255)    NOT NULL,

    -- Mã phòng ban cha (Self-referencing FK cho cau truc cay)
    fk_parent_dept  BIGINT          REFERENCES c_dept (dept_key), 

    -- Mô tả chức năng
    description     TEXT,

    -- Metadata
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE, 
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_dept_id ON c_dept (dept_id);
CREATE INDEX idx_dept_parent ON c_dept (fk_parent_dept);
ALTER TABLE public.c_dept OWNER TO test96;


----------------------------------------------------------------------
-- 2. Bảng c_role (Vai trò/Quyền hạn - 角色)
----------------------------------------------------------------------
-- Bang co so cho he thong phan quyen (RBAC)
CREATE TABLE c_role (
    -- Khóa chính kỹ thuật
    role_key        BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- Tên vai trò duy nhất (Ví dụ: "ADMIN", "ACCOUNTANT")
    role_name       VARCHAR(100)    UNIQUE NOT NULL,

    -- Mô tả vai trò
    description     TEXT,

    -- Metadata
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_role_name ON c_role (role_name);
ALTER TABLE public.c_role OWNER TO test96;



----------------------------------------------------------------------
-- 3. Bảng c_emp (Nhân viên - 员工/員工)
----------------------------------------------------------------------
-- Bang chinh chua thong tin nhan vien
CREATE TABLE c_emp (
    -- IDENTIFICATION & PRIMARY KEY
    emp_key             BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- ID Nhân viên duy nhất (员工编号/員工編號)
    emp_id              VARCHAR(20)     UNIQUE NOT NULL,

    -- BASIC INFORMATION
    full_name           VARCHAR(255)    NOT NULL,
    title               VARCHAR(100),

    -- SECURITY & AUTHENTICATION (安全)
    -- Hash của mật khẩu
    password_hash       VARCHAR(255)    NOT NULL,

    -- Email dùng để đăng nhập/liên hệ
    email               VARCHAR(255)    UNIQUE,

    -- ERP RELATIONSHIPS (Khóa ngoại - 外键/外鍵)
    -- Liên kết 1-to-N với c_dept
    fk_dept_key         BIGINT          REFERENCES c_dept (dept_key), 
    
    -- Khóa ngoại đến bảng Chi nhánh/Vị trí làm việc (giả định có bảng c_branch)
    fk_branch_key       BIGINT, 

    -- STATUS & METADATA (状态/狀態)
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE, 
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE,
    last_login_at       TIMESTAMP WITH TIME ZONE,

    -- Ghi chú linh tinh
    misc_note           TEXT
);

CREATE UNIQUE INDEX idx_emp_id ON c_emp (emp_id);
CREATE INDEX idx_emp_dept ON c_emp (fk_dept_key);
ALTER TABLE public.c_emp OWNER TO test96;



----------------------------------------------------------------------
-- 4. Bảng c_emp_role (Liên kết Nhân viên - Vai trò: N-to-N)
----------------------------------------------------------------------
-- Bang trung gian giup mot nhan vien co nhieu vai tro
CREATE TABLE c_emp_role (
    -- Khóa ngoại đến c_emp (Neu nhan vien bi xoa, ban ghi nay cung bi xoa)
    fk_emp_key      BIGINT      REFERENCES c_emp (emp_key) ON DELETE CASCADE, 

    -- Khóa ngoại đến c_role (Neu vai tro bi xoa, ban ghi nay cung bi xoa)
    fk_role_key     BIGINT      REFERENCES c_role (role_key) ON DELETE CASCADE,

    -- Tổ hợp hai khóa ngoại làm Khóa chính kép (đảm bảo mỗi cặp chỉ tồn tại 1 lần)
    PRIMARY KEY (fk_emp_key, fk_role_key),

    -- Metadata
    assigned_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emp_role_emp ON c_emp_role (fk_emp_key);
CREATE INDEX idx_emp_role_role ON c_emp_role (fk_role_key);
ALTER TABLE public.c_emp_role OWNER TO test96;



-- ####################################################################
-- # BẢNG THUẬT NGỮ TIẾNG TRUNG (Phục vụ việc học)
-- ####################################################################

/*
| Thuật ngữ Việt | Giản thể (Simplified) | Phồn thể (Traditional) | Phiên âm (Pinyin) |
| :--- | :--- | :--- | :--- |
| Khóa chính | 主键 | 主鍵 | Zhǔjiàn |
| Khóa ngoại | 外键 | 外鍵 | Wàijiàn |
| ID Nhân viên | 员工编号 |員工編號 | Yuángōng biānhào |
| Mật khẩu | 密码 | 密碼 | Mìmǎ |
| Phòng ban | 部门 | 部門 | Bùmén |
| Vai trò | 角色 | 角色 | Juésè |
| Trạng thái | 状态 | 狀態 | Zhuàngtài |
| Cập nhật | 更新 | 更新 | Gēngxīn |
*/

-- Dữ liệu mẫu cho Bảng c_dept (Phòng Ban)
INSERT INTO c_dept (dept_id, dept_name, fk_parent_dept, description) VALUES
-- Cấp 1 (Công ty gốc)
('C00', 'Công ty Mẹ (HQ)', NULL, 'Trụ sở chính, không có cấp cha'),
-- Cấp 2
('A01', 'Phòng Hành chính Nhân sự', (SELECT dept_key FROM c_dept WHERE dept_id = 'C00'), 'Quản lý nhân sự và các hoạt động hành chính'),
('F01', 'Phòng Kế toán Tài chính', (SELECT dept_key FROM c_dept WHERE dept_id = 'C00'), 'Quản lý tài chính, lập ngân sách và báo cáo'),
('IT1', 'Phòng Công nghệ Thông tin', (SELECT dept_key FROM c_dept WHERE dept_id = 'C00'), 'Phát triển, bảo trì hệ thống và hỗ trợ kỹ thuật'),
('S01', 'Phòng Kinh doanh', (SELECT dept_key FROM c_dept WHERE dept_id = 'C00'), 'Phụ trách doanh số và quan hệ khách hàng'),
-- Cấp 3
('IT1-D', 'Bộ phận Phát triển Phần mềm', (SELECT dept_key FROM c_dept WHERE dept_id = 'IT1'), 'Phát triển và nâng cấp các ứng dụng nội bộ');
-- Dữ liệu mẫu cho Bảng c_role (Vai trò)
INSERT INTO c_role (role_name, description) VALUES
('ADMIN', 'Quản trị viên hệ thống (Toàn quyền)'),
('MANAGER', 'Quản lý cấp trung (Giám sát phòng ban)'),
('EMPLOYEE', 'Nhân viên thông thường'),
('ACCOUNTANT', 'Nhân viên Kế toán/Tài chính'),
('HR_STAFF', 'Nhân viên Hành chính Nhân sự'),
('DEVELOPER', 'Nhân viên Phát triển Phần mềm');
-- Dữ liệu mẫu cho Bảng c_emp (Nhân viên)
INSERT INTO c_emp (
    emp_id, full_name, title, password_hash, email, fk_dept_key, fk_branch_key, is_active
) VALUES
-- ADMIN (IT1-D)
('E0001', 'Trần Văn A', 'Trưởng phòng IT', '$2a$10$SampleHashValue', 'tva@company.com', (SELECT dept_key FROM c_dept WHERE dept_id = 'IT1'), NULL, TRUE),
-- MANAGER (F01)
('E0002', 'Lê Thị B', 'Kế toán Trưởng', '$2a$10$SampleHashValue', 'ltb@company.com', (SELECT dept_key FROM c_dept WHERE dept_id = 'F01'), NULL, TRUE),
-- EMPLOYEE (IT1-D)
('E0003', 'Phạm Văn C', 'Kỹ sư Phát triển', '$2a$10$SampleHashValue', 'pvc@company.com', (SELECT dept_key FROM c_dept WHERE dept_id = 'IT1-D'), NULL, TRUE),
-- EMPLOYEE (A01)
('E0004', 'Nguyễn Thị D', 'Chuyên viên Nhân sự', '$2a$10$SampleHashValue', 'ntd@company.com', (SELECT dept_key FROM c_dept WHERE dept_id = 'A01'), NULL, TRUE),
-- EMPLOYEE (S01)
('E0005', 'Hoàng Văn E', 'Nhân viên Kinh doanh', '$2a$10$SampleHashValue', 'hve@company.com', (SELECT dept_key FROM c_dept WHERE dept_id = 'S01'), NULL, TRUE);
-- Dữ liệu mẫu cho Bảng c_emp_role (Liên kết N-to-N)
INSERT INTO c_emp_role (fk_emp_key, fk_role_key) VALUES
-- E0001: Trưởng phòng IT
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0001'), (SELECT role_key FROM c_role WHERE role_name = 'ADMIN')), -- Cũng là ADMIN
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0001'), (SELECT role_key FROM c_role WHERE role_name = 'MANAGER')),
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0001'), (SELECT role_key FROM c_role WHERE role_name = 'DEVELOPER')),

-- E0002: Kế toán Trưởng
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0002'), (SELECT role_key FROM c_role WHERE role_name = 'MANAGER')),
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0002'), (SELECT role_key FROM c_role WHERE role_name = 'ACCOUNTANT')),

-- E0003: Kỹ sư Phát triển
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0003'), (SELECT role_key FROM c_role WHERE role_name = 'EMPLOYEE')),
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0003'), (SELECT role_key FROM c_role WHERE role_name = 'DEVELOPER')),

-- E0004: Chuyên viên Nhân sự
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0004'), (SELECT role_key FROM c_role WHERE role_name = 'EMPLOYEE')),
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0004'), (SELECT role_key FROM c_role WHERE role_name = 'HR_STAFF')),

-- E0005: Nhân viên Kinh doanh
((SELECT emp_key FROM c_emp WHERE emp_id = 'E0005'), (SELECT role_key FROM c_role WHERE role_name = 'EMPLOYEE'));

CREATE TABLE c_dept_sequence (
    -- Khóa ngoại đến c_dept
    fk_dept_key         BIGINT          PRIMARY KEY REFERENCES c_dept (dept_key),

    -- Số thứ tự tiếp theo sẽ được sử dụng (ví dụ: 1 -> 0001)
    next_sequence_num   INTEGER         NOT NULL DEFAULT 1,

    -- Lần cập nhật cuối cùng
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Chỉ định chủ sở hữu
ALTER TABLE public.c_dept_sequence OWNER TO test96;


-- Chèn các phòng ban hiện có vào bảng theo dõi sequence, đặt số tiếp theo là 1
INSERT INTO c_dept_sequence (fk_dept_key, next_sequence_num)
SELECT dept_key, 1
FROM c_dept;

CREATE OR REPLACE FUNCTION generate_emp_id()
RETURNS TRIGGER AS $$
DECLARE
    v_dept_id       VARCHAR(20);
    v_next_seq      INTEGER;
BEGIN
    -- Chỉ thực hiện nếu emp_id chưa được cung cấp (NULL)
    IF NEW.emp_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- 1. Lấy dept_id từ c_dept dựa trên fk_dept_key
    SELECT dept_id INTO v_dept_id
    FROM c_dept
    WHERE dept_key = NEW.fk_dept_key;

    -- Kiểm tra phòng ban có tồn tại không
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy phòng ban với dept_key %', NEW.fk_dept_key;
    END IF;

    -- 2. Lấy số thứ tự tiếp theo và TĂNG số thứ tự trong c_dept_sequence
    UPDATE c_dept_sequence
    SET next_sequence_num = next_sequence_num + 1,
        updated_at = NOW()
    WHERE fk_dept_key = NEW.fk_dept_key
    RETURNING next_sequence_num - 1 INTO v_next_seq; -- Lấy giá trị CŨ trước khi tăng

    -- 3. Tạo emp_id theo định dạng: [dept_id]-[Số thứ tự 4 chữ số]
    NEW.emp_id := v_dept_id || '-' || LPAD(v_next_seq::TEXT, 4, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Chỉ định chủ sở hữu
ALTER FUNCTION public.generate_emp_id() OWNER TO test96;


CREATE TRIGGER tr_c_emp_generate_id
BEFORE INSERT ON c_emp
FOR EACH ROW
EXECUTE FUNCTION generate_emp_id();


CREATE OR REPLACE FUNCTION add_new_employee(
    p_full_name     VARCHAR,
    p_title         VARCHAR,
    p_email         VARCHAR,
    p_password      VARCHAR,
    p_dept_id       VARCHAR,
    p_role_names    VARCHAR[]
)
-- Thay đổi giá trị trả về thành JSONB
RETURNS JSONB AS $$
DECLARE
    v_emp_key       BIGINT;
    v_dept_key      BIGINT;
    v_password_hash VARCHAR(255);
    v_role_name     VARCHAR;
    v_role_key      BIGINT;
    v_emp_id        VARCHAR(20); -- Thêm biến để lưu emp_id
    v_output_data   JSONB;       -- Biến để lưu kết quả JSON
BEGIN
    -- 1. Tìm fk_dept_key dựa trên p_dept_id
    SELECT dept_key INTO v_dept_key
    FROM c_dept
    WHERE dept_id = p_dept_id;

    IF v_dept_key IS NULL THEN
        RAISE EXCEPTION 'Lỗi: Không tìm thấy phòng ban với ID: %', p_dept_id;
    END IF;

    -- 2. Mã hóa mật khẩu
    v_password_hash := MD5(p_password);

    -- 3. Chèn vào bảng c_emp
    INSERT INTO c_emp (
        full_name, title, password_hash, email, fk_dept_key, is_active
    )
    VALUES (
        p_full_name, p_title, v_password_hash, p_email, v_dept_key, TRUE
    )
    -- Lấy emp_key và emp_id (đã được trigger tự động tạo)
    RETURNING emp_key, emp_id INTO v_emp_key, v_emp_id;

    -- 4. Chèn vai trò vào c_emp_role
    FOREACH v_role_name IN ARRAY p_role_names
    LOOP
        SELECT role_key INTO v_role_key
        FROM c_role
        WHERE role_name = v_role_name;

        IF v_role_key IS NULL THEN
            RAISE WARNING 'Cảnh báo: Không tìm thấy vai trò "%". Bỏ qua việc gán vai trò này.', v_role_name;
        ELSE
            INSERT INTO c_emp_role (fk_emp_key, fk_role_key)
            VALUES (v_emp_key, v_role_key);
        END IF;
    END LOOP;

    -- 5. TRẢ VỀ JSONB bao gồm tất cả thông tin quan trọng
    v_output_data := jsonb_build_object(
        'status', 'success',
        'message', 'Tạo nhân viên thành công',
        'employee', jsonb_build_object(
            'emp_key', v_emp_key,
            'emp_id', v_emp_id, -- Rất quan trọng vì nó được tự động sinh
            'full_name', p_full_name,
            'email', p_email,
            'dept_id', p_dept_id,
            'roles', p_role_names
        )
    );

    RETURN v_output_data;
END;
$$ LANGUAGE plpgsql;

