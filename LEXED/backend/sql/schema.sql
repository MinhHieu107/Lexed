-- Full schema snapshot of the `khoinghiep7ngay` database.
-- Run this on a fresh database to set up all tables from scratch.

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('USER','TEACHER','ADMIN') NOT NULL DEFAULT 'USER',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Lớp học do TEACHER tạo, mỗi lớp có 1 mã lớp duy nhất để học sinh tự join.
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `class_code` varchar(10) NOT NULL,
  `teacher_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_code` (`class_code`),
  KEY `fk_class_teacher` (`teacher_id`),
  CONSTRAINT `fk_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Thành viên lớp. Join bằng mã lớp -> status ACTIVE ngay.
-- TEACHER thêm bằng email -> nếu email đã có tài khoản thì user_id được điền và ACTIVE luôn,
-- nếu email chưa từng đăng ký thì lưu invited_email, status PENDING, và gán user_id khi họ đăng ký/đăng nhập lần đầu bằng đúng email đó.
CREATE TABLE IF NOT EXISTS `class_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `invited_email` varchar(100) DEFAULT NULL,
  `status` enum('PENDING','ACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_user` (`class_id`,`user_id`),
  KEY `fk_member_class` (`class_id`),
  KEY `fk_member_user` (`user_id`),
  CONSTRAINT `fk_member_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Một "Set" flashcard: có thể là set công khai (ADMIN tạo, owner_id NULL),
-- set cá nhân của USER (owner_id = user đó, class_id NULL), hoặc set TEACHER giao trong 1 lớp (class_id có giá trị).
CREATE TABLE IF NOT EXISTS `flashcard_sets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `owner_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `visibility` enum('GLOBAL','PRIVATE','CLASS') NOT NULL DEFAULT 'GLOBAL',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_set_exam` (`exam_id`),
  KEY `fk_set_owner` (`owner_id`),
  KEY `fk_set_class` (`class_id`),
  CONSTRAINT `fk_set_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_set_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_set_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int DEFAULT NULL,
  `set_id` int DEFAULT NULL,
  `noi_dung` text NOT NULL,
  `nhan_dinh` enum('ĐÚNG','SAI') NOT NULL,
  `co_so_phap_ly` text,
  `giai_thich` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `question_number` int NOT NULL,
  `question_set` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_exam` (`exam_id`),
  KEY `fk_question_set` (`set_id`),
  CONSTRAINT `fk_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_question_set` FOREIGN KEY (`set_id`) REFERENCES `flashcard_sets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Lưu refresh token (đã hash bằng bcrypt) để có thể thu hồi (revoke) khi logout.
-- Chính sách hiện tại: single-session — login sẽ xóa hết token cũ của user trước khi tạo token mới,
-- nên mỗi user chỉ có tối đa 1 dòng tại một thời điểm.
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Ghi chú lịch học cá nhân của từng user, hiển thị trên lịch ở trang Home.
CREATE TABLE IF NOT EXISTS `study_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `note_date` date NOT NULL,
  `title` varchar(255) NOT NULL,
  `note_time` time DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_note_user` (`user_id`),
  CONSTRAINT `fk_note_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Lịch sử trả lời flashcard của từng user, dùng để tính % mastered, streak, total correct.
CREATE TABLE IF NOT EXISTS `question_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `answered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_attempt_user` (`user_id`),
  KEY `fk_attempt_question` (`question_id`),
  CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempt_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Mã OTP xác thực email khi đăng ký.
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_verification_user` (`user_id`),
  CONSTRAINT `fk_verification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Câu hỏi "Case of the Day" được chốt cố định cho từng ngày (chung cho mọi user), chọn ngẫu nhiên lần đầu rồi lưu lại.
CREATE TABLE IF NOT EXISTS `daily_challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `challenge_date` date NOT NULL,
  `question_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_challenge_date` (`challenge_date`),
  KEY `fk_daily_question` (`question_id`),
  CONSTRAINT `fk_daily_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
