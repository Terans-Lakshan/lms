# Changelog

All notable changes to GeoLMS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Student assignment submissions
- Automated grading system
- Advanced analytics dashboard
- Mobile app (React Native)
- WebRTC for live classes
- Multi-language support

---

## [1.0.0] - 2026-01-20

### Added
- Complete role-based access control (Student, Lecturer, Admin)
- User authentication system (Email/Password + Google OAuth)
- Course management system with material uploads
- Student enrollment and approval workflow
- Notification system with real-time updates
- AWS S3 integration for file storage
- FullCalendar integration for exam scheduling
- Degree program management
- Exam results tracking and viewing
- User profile management
- Password reset functionality
- Email verification system

### Features by Module

#### Authentication
- Sign up with email/password
- Login with email/password
- Google OAuth 2.0 integration
- JWT-based session management
- Email verification
- Password reset
- Password strength validation
- Multi-device support

#### Course Management
- Create courses (Lecturer/Admin)
- Edit course details
- Delete courses
- Manage course materials (PDF, documents)
- Course catalog search and filtering
- Enroll in courses
- View course roster (Lecturer/Admin)

#### Enrollments
- Student course enrollment requests
- Lecturer enrollment approval workflow
- Course dropping functionality
- Enrollment history tracking
- Enrollment status management

#### Notifications
- Enrollment request notifications
- Approval notifications
- Grade notifications
- Material update notifications
- Mark notifications as read
- Delete notifications
- Notification center with history

#### User Management (Admin)
- View all users
- Edit user profiles
- Change user roles
- User listing with search
- User status management

#### Degree Programs (Admin)
- Create degree programs
- Edit program details
- Delete programs
- Assign courses to programs
- View program statistics

#### Results & Performance
- View exam results
- Results calendar
- Grade tracking
- Performance history

#### File Management
- Upload course materials to S3
- File type validation
- File size limits
- Secure file access

### Technical Improvements
- Responsive UI design with Tailwind CSS
- React 19 with functional components
- Express.js backend with modular structure
- MongoDB with Mongoose ODM
- AWS SDK for S3 integration
- Bcrypt for secure password hashing
- JWT for stateless authentication
- Nodemailer for email notifications
- CORS configuration for security

### Bug Fixes
- S3 ACL permission issues resolved
- CORS configuration updated to port 5174
- AWS SDK compatibility fixes
- Notification deletion fixes
- Header styling improvements

### Documentation
- Complete README with setup instructions
- API documentation
- Architecture documentation
- Setup guide with troubleshooting
- Contributing guidelines
- Deployment guide
- Features overview

---

## [0.8.0] - 2026-01-15

### Added
- Geology LMS branding and theming
- Course materials count display
- Lecturer notifications logging
- Footer with UOP logo
- Backend CORS port update to 5174

### Fixed
- S3 ACL issue affecting file uploads
- Notification deletion functionality
- Header styling consistency

---

## [0.7.0] - 2026-01-10

### Added
- URL link support for course materials
- AWS SDK compatibility improvements
- Enhanced error handling for S3 uploads

---

## [0.6.0] - 2026-01-05

### Added
- Course enrollment notification system
- Lecturer approval workflow for enrollments
- Notification center for users
- Email notification service setup

### Features
- Real-time notification indicators
- Notification deletion functionality
- Notification history tracking

---

## [0.5.0] - 2025-12-28

### Added
- Enhanced notification system
- Unified UI across admin and lecturer pages
- Sidebar navigation improvements
- Dashboard enhancements

### Improvements
- Consistent styling across pages
- Better component reusability
- Improved user experience

---

## [0.4.0] - 2025-12-21

### Added
- User details view functionality
- S3 image upload capability
- Degree program management features
- User profile section

### Features
- Avatar upload to S3
- User profile editing
- Degree program CRUD operations

---

## [0.3.0] - 2025-12-14

### Added
- DegreeUser schema for managing user enrollments
- Teaching request management system
- User-program enrollment tracking

---

## [0.2.0] - 2025-12-07

### Added
- Enrollment notification system
- Admin enrollment approval panel
- Student enrollment panel
- Notification tracking

### Features
- Pending enrollment queue
- Admin review workflow
- Student notification center

---

## [0.1.0] - 2025-11-30

### Added
- Project initialization
- Basic project structure
- Frontend (React + Vite)
- Backend (Express.js)
- Basic authentication system
- Navigation standardization across all role pages

### Features
- Student dashboard
- Lecturer dashboard
- Admin dashboard
- Basic routing system
- User context setup

---

## Migration Notes

### From 0.8.0 to 1.0.0
No breaking changes. Existing data structures are compatible.

### Database Migrations
All collections are auto-created by Mongoose models.

---

## Known Issues

### Current
- None reported

### Previous (Fixed)
- S3 ACL permissions (Fixed in 1.0.0)
- CORS origin mismatch (Fixed in 0.8.0)
- Notification deletion (Fixed in 0.8.0)

---

## Dependencies

### Backend
- express: ^5.1.0
- mongoose: ^8.19.4
- aws-sdk: ^2.1692.0
- bcrypt: ^6.0.0
- jsonwebtoken: ^9.0.2
- nodemailer: ^7.0.10
- passport: ^0.7.0

### Frontend
- react: ^19.2.0
- react-router-dom: ^7.9.6
- axios: ^1.13.2
- tailwindcss: ^3.4.7
- @fullcalendar/react: ^6.1.19
- react-hot-toast: ^2.6.0

---

## Contributors

- Development Team
- QA Team
- University of Peradeniya

---

## Support

For issues or feature requests, please open an issue on GitHub.

---

**Last Updated**: June 8, 2026
