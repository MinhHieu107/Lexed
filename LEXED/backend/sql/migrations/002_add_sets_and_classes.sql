-- Migration cho DB đã tồn tại sẵn dữ liệu (đã chạy schema.sql bản cũ trước đó).
-- Chạy 1 lần. An toàn để chạy lại (các bước có kiểm tra tồn tại trước khi làm).

-- 1. Cho phép exam_id trong questions được để trống (set cá nhân có thể không gắn Legal Area)
ALTER TABLE `questions` MODIFY COLUMN `exam_id` int DEFAULT NULL;

-- 2. Tạo bảng classes (nếu chưa có)
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

-- 3. Tạo bảng class_members (nếu chưa có)
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

-- 4. Tạo bảng flashcard_sets (nếu chưa có)
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

-- 5. Thêm cột set_id vào questions (nếu chưa có), rồi backfill dữ liệu cũ
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'questions' AND COLUMN_NAME = 'set_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `questions` ADD COLUMN `set_id` int DEFAULT NULL AFTER `exam_id`,
   ADD KEY `fk_question_set` (`set_id`),
   ADD CONSTRAINT `fk_question_set` FOREIGN KEY (`set_id`) REFERENCES `flashcard_sets` (`id`) ON DELETE CASCADE',
  'SELECT "set_id column already exists, skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Backfill: mỗi cặp (exam_id, question_set) hiện có trong questions -> 1 dòng flashcard_sets GLOBAL
--    Bỏ qua các dòng đã có set_id (tránh chạy trùng khi migration được chạy lại).
INSERT INTO flashcard_sets (exam_id, title, description, owner_id, class_id, visibility)
SELECT DISTINCT
    q.exam_id,
    CONCAT(e.name, ' - Set ', q.question_set),
    e.description,
    NULL,
    NULL,
    'GLOBAL'
FROM questions q
JOIN exams e ON e.id = q.exam_id
WHERE q.set_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM flashcard_sets fs
    WHERE fs.exam_id = q.exam_id
    AND fs.title = CONCAT(e.name, ' - Set ', q.question_set)
    AND fs.visibility = 'GLOBAL'
);

UPDATE questions q
JOIN exams e ON e.id = q.exam_id
JOIN flashcard_sets fs
    ON fs.exam_id = q.exam_id
    AND fs.title = CONCAT(e.name, ' - Set ', q.question_set)
    AND fs.visibility = 'GLOBAL'
SET q.set_id = fs.id
WHERE q.set_id IS NULL;
