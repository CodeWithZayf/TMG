# TMG - The Modern Gurukul

A modern institute management platform built for educational institutions to streamline academic and administrative operations. TMG replaces paper registers, WhatsApp groups, and spreadsheets with a secure, centralized, role-based mobile application.

## 🚀 Features

### Admin

* User Management (Students & Teachers)
* Subject & Class Management
* Attendance Monitoring
* Fee Management
* Salary Management
* Global Notices
* PTM Scheduling
* Academic Calendar
* Class Routine Management

### Teacher

* Mark Attendance
* Manage Subject Notices
* Upload Notes
* Create Assessments
* Enter Exam Results
* View Salary History
* Access Personal Timetable

### Student

* View Attendance Records
* Access Notes & Assessments
* Check Results
* Track Fee Status
* Receive Notices
* View Class Routine
* PTM Information

## 🛠 Tech Stack

### Frontend

* React Native
* Expo
* TypeScript
* Expo Router
* NativeWind
* Zustand
* TanStack Query

### Backend

* AWS Cognito
* AWS Lambda
* AWS DynamoDB
* AWS API Gateway
* AWS SNS
* AWS EventBridge

## 🔐 Authentication & Security

* Phone OTP Authentication
* Email Authentication
* Role-Based Access Control (RBAC)
* Cognito Groups
* JWT Verification
* Server-Side Authorization
* Assignment-Based Permission Checks

## 📱 User Roles

* **Admin** – Complete institute management
* **Teacher** – Academic operations & communication
* **Student** – Learning and academic tracking

## 📂 Architecture

Client → API Gateway → Lambda → DynamoDB

Authentication is handled via AWS Cognito, while all business logic is processed through AWS Lambda functions.

## 🌟 Key Highlights

* Mobile-first design
* Offline-first caching
* Real-time notifications
* Subject-based enrollment model
* Multi-role architecture
* Fully serverless backend
* Cost-efficient AWS deployment

## 📈 Scalability

Designed to support:

* 200+ active users
* Multiple classes
* Multiple subjects
* Many-to-many teacher assignments
* Subject-specific student enrollments

## 🚧 Development Status

Currently under active development.

## 📄 License

This project is developed for educational institution management and learning purposes.
