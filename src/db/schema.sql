-- Credential table for storing basic credential information
CREATE TABLE `Credential` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `issuer` varchar(255) DEFAULT NULL,
  `issuance_date` datetime DEFAULT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- UniversityDegree specific details
CREATE TABLE `UniversityDegree` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `credential_id` bigint NOT NULL,
  `degree` varchar(100) NOT NULL,
  `university` varchar(255) NOT NULL,
  `graduation_year` int NOT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `verified_by` varchar(100) NOT NULL,
  `verification_date` date NOT NULL,
  `verification_method` varchar(50) NOT NULL,
  `verification_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_credential` (`credential_id`),
  CONSTRAINT `fk_credential_university` FOREIGN KEY (`credential_id`) REFERENCES `Credential` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VendorPermit specific details
CREATE TABLE `VendorPermit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `credential_id` bigint NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `permit_type` varchar(50) NOT NULL,
  `permit_number` varchar(50) NOT NULL UNIQUE,
  `business_category` varchar(100) NOT NULL,
  `location_allowed` varchar(255) NOT NULL,
  `max_employees` int DEFAULT NULL,
  `verified_by` varchar(100) NOT NULL,
  `verification_date` date NOT NULL,
  `verification_method` varchar(50) NOT NULL,
  `verification_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_credential` (`credential_id`),
  CONSTRAINT `fk_credential_vendor` FOREIGN KEY (`credential_id`) REFERENCES `Credential` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Event definition
CREATE TABLE `Event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `created_date` varchar(10) DEFAULT NULL,
  `valid_from` varchar(10) DEFAULT NULL,
  `valid_to` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;