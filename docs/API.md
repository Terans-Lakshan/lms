# GeoLMS API Documentation

Complete REST API reference for the Geology Learning Management System.

## Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Response Format](#response-format)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Course Endpoints](#course-endpoints)
5. [Enrollment Endpoints](#enrollment-endpoints)
6. [Notification Endpoints](#notification-endpoints)
7. [User Endpoints](#user-endpoints)
8. [File Upload Endpoints](#file-upload-endpoints)
9. [Error Codes](#error-codes)

## Base URL & Authentication

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained from the login endpoint and typically stored in localStorage or cookies.

### Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

## Response Format

### Success Response (2xx)
```javascript
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response (4xx, 5xx)
```javascript
{
  "success": false,
  "error": "Error description",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate/conflict |
| 500 | Server Error | Internal error |

## Authentication Endpoints

### Sign Up

Create a new user account.

```
POST /auth/signup
```

**Request Body**
```javascript
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "student"  // or "lecturer"
}
```

**Response (201)**
```javascript
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f4a2b8c1d2e3f4g5h6i7j",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error (400)**
```javascript
{
  "success": false,
  "error": "Email already exists",
  "statusCode": 400
}
```

### Login

Authenticate and obtain JWT token.

```
POST /auth/login
```

**Request Body**
```javascript
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200)**
```javascript
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f4a2b8c1d2e3f4g5h6i7j",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Logout

Invalidate user session.

```
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Logout successful"
}
```

### Forgot Password

Request password reset.

```
POST /auth/forgot-password
```

**Request Body**
```javascript
{
  "email": "john@example.com"
}
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

Set new password with reset token.

```
POST /auth/reset-password
```

**Request Body**
```javascript
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Password reset successful"
}
```

### Verify Email

Confirm email address.

```
GET /auth/verify-email/:token
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Email verified successfully"
}
```

## Course Endpoints

### List All Courses

Get all available courses.

```
GET /courses
```

**Query Parameters**
```
?page=1&limit=10&search=geology
```

**Response (200)**
```javascript
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "65f4a2b8c1d2e3f4g5h6i7j",
        "title": "Mineralogy 101",
        "code": "GEO101",
        "description": "Introduction to minerals",
        "lecturer": {
          "_id": "65f4a2b8c1d2e3f4g5h6i7k",
          "name": "Dr. Smith"
        },
        "enrolledStudents": 45,
        "materials": [
          {
            "title": "Lecture 1.pdf",
            "url": "https://s3.amazonaws.com/..."
          }
        ],
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

### Get Course Details

Get specific course information.

```
GET /courses/:courseId
```

**Response (200)**
```javascript
{
  "success": true,
  "data": {
    "_id": "65f4a2b8c1d2e3f4g5h6i7j",
    "title": "Mineralogy 101",
    "code": "GEO101",
    "description": "Introduction to minerals",
    "lecturer": {
      "_id": "65f4a2b8c1d2e3f4g5h6i7k",
      "name": "Dr. Smith",
      "email": "smith@university.edu"
    },
    "enrolledStudents": 45,
    "materials": [
      {
        "_id": "65f4a2b8c1d2e3f4g5h6i7l",
        "title": "Lecture 1.pdf",
        "url": "https://s3.amazonaws.com/geolms/materials/...",
        "uploadedAt": "2026-01-15T10:00:00Z"
      }
    ],
    "schedule": {
      "day": "Monday",
      "time": "10:00 AM"
    }
  }
}
```

### Create Course

Create a new course (Lecturer/Admin only).

```
POST /courses
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**
```javascript
{
  "title": "Mineralogy 101",
  "code": "GEO101",
  "description": "Introduction to minerals",
  "degree": "65f4a2b8c1d2e3f4g5h6i7m",
  "schedule": {
    "day": "Monday",
    "time": "10:00 AM"
  }
}
```

**Response (201)**
```javascript
{
  "success": true,
  "data": {
    "_id": "65f4a2b8c1d2e3f4g5h6i7j",
    "title": "Mineralogy 101",
    "code": "GEO101",
    "description": "Introduction to minerals",
    "lecturer": "65f4a2b8c1d2e3f4g5h6i7k",
    "degree": "65f4a2b8c1d2e3f4g5h6i7m"
  },
  "message": "Course created successfully"
}
```

### Update Course

Update course information (Lecturer/Admin only).

```
PUT /courses/:courseId
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**
```javascript
{
  "title": "Mineralogy 101 Advanced",
  "description": "Advanced mineral studies"
}
```

**Response (200)**
```javascript
{
  "success": true,
  "data": { ... },
  "message": "Course updated successfully"
}
```

### Delete Course

Delete a course (Lecturer/Admin only).

```
DELETE /courses/:courseId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### Add Course Material

Upload material to a course.

```
POST /courses/:courseId/materials
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data**
```
file: <binary file>
title: "Lecture Notes"
```

**Response (201)**
```javascript
{
  "success": true,
  "data": {
    "material": {
      "_id": "65f4a2b8c1d2e3f4g5h6i7l",
      "title": "Lecture Notes",
      "url": "https://s3.amazonaws.com/geolms/...",
      "uploadedAt": "2026-01-20T15:30:00Z"
    }
  },
  "message": "Material added successfully"
}
```

## Enrollment Endpoints

### Get User Enrollments

Get all enrollments for current user.

```
GET /enrollments
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "data": [
    {
      "_id": "65f4a2b8c1d2e3f4g5h6i7n",
      "course": {
        "_id": "65f4a2b8c1d2e3f4g5h6i7j",
        "title": "Mineralogy 101",
        "code": "GEO101"
      },
      "student": "65f4a2b8c1d2e3f4g5h6i7o",
      "status": "active",
      "enrollmentDate": "2026-01-10T08:00:00Z",
      "grade": null
    }
  ]
}
```

### Enroll in Course

Enroll current user in a course.

```
POST /enrollments
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**
```javascript
{
  "courseId": "65f4a2b8c1d2e3f4g5h6i7j"
}
```

**Response (201)**
```javascript
{
  "success": true,
  "data": {
    "_id": "65f4a2b8c1d2e3f4g5h6i7n",
    "student": "65f4a2b8c1d2e3f4g5h6i7o",
    "course": "65f4a2b8c1d2e3f4g5h6i7j",
    "status": "pending",
    "enrollmentDate": "2026-01-20T15:30:00Z"
  },
  "message": "Enrollment request sent"
}
```

### Approve Enrollment

Approve student enrollment (Lecturer/Admin only).

```
PUT /enrollments/:enrollmentId/approve
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Enrollment approved"
}
```

### Reject Enrollment

Reject student enrollment (Lecturer/Admin only).

```
PUT /enrollments/:enrollmentId/reject
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Enrollment rejected"
}
```

### Drop Course

Withdraw from a course.

```
DELETE /enrollments/:enrollmentId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Course dropped successfully"
}
```

## Notification Endpoints

### Get All Notifications

Get user notifications.

```
GET /notifications
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**
```
?unreadOnly=false&limit=20
```

**Response (200)**
```javascript
{
  "success": true,
  "data": [
    {
      "_id": "65f4a2b8c1d2e3f4g5h6i7p",
      "type": "enrollment_request",
      "message": "New student enrollment request",
      "relatedCourse": "65f4a2b8c1d2e3f4g5h6i7j",
      "relatedUser": "65f4a2b8c1d2e3f4g5h6i7o",
      "read": false,
      "createdAt": "2026-01-20T15:30:00Z"
    }
  ]
}
```

### Mark Notification as Read

Mark notification as read.

```
PUT /notifications/:notificationId/read
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Delete Notification

Delete a notification.

```
DELETE /notifications/:notificationId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Notification deleted"
}
```

### Clear All Notifications

Delete all user notifications.

```
DELETE /notifications/clear
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "All notifications cleared"
}
```

## User Endpoints

### Get Current User

Get logged-in user profile.

```
GET /users/me
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "data": {
    "_id": "65f4a2b8c1d2e3f4g5h6i7k",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "enrollments": [
      "65f4a2b8c1d2e3f4g5h6i7n"
    ]
  }
}
```

### Get User by ID

Get specific user profile.

```
GET /users/:userId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200)**
```javascript
{
  "success": true,
  "data": { ... }
}
```

### Update User Profile

Update user information.

```
PUT /users/me
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**
```javascript
{
  "name": "Jane Doe",
  "phone": "123-456-7890"
}
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Change Password

Change user password.

```
PUT /users/me/password
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**
```javascript
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200)**
```javascript
{
  "success": true,
  "message": "Password changed successfully"
}
```

## File Upload Endpoints

### Upload File to S3

Upload file to AWS S3.

```
POST /upload
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data**
```
file: <binary file>
type: "course_material"  // or "user_avatar"
courseId: "65f4a2b8c1d2e3f4g5h6i7j"
```

**Response (200)**
```javascript
{
  "success": true,
  "data": {
    "url": "https://s3.amazonaws.com/geolms/courses/.../filename.pdf",
    "key": "courses/65f4a2b8c1d2e3f4g5h6i7j/filename.pdf",
    "fileName": "filename.pdf"
  },
  "message": "File uploaded successfully"
}
```

## Error Codes

### Common Errors

| Code | Error | Solution |
|------|-------|----------|
| 401 | Unauthorized | Login and obtain JWT token |
| 403 | Forbidden | Insufficient permissions for action |
| 404 | Not Found | Resource doesn't exist |
| 400 | Validation Error | Check request parameters |
| 409 | Duplicate | Email/code already exists |
| 500 | Server Error | Report to support |

### Error Response Examples

**Missing Token**
```javascript
{
  "success": false,
  "error": "No authorization token provided",
  "statusCode": 401
}
```

**Invalid Token**
```javascript
{
  "success": false,
  "error": "Invalid or expired token",
  "statusCode": 401
}
```

**Validation Error**
```javascript
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Permission Denied**
```javascript
{
  "success": false,
  "error": "You don't have permission to perform this action",
  "statusCode": 403
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General Endpoints**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes
- **File Upload**: 10 files per 15 minutes

Rate limit info is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642867200
```

## API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# List Courses
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer <TOKEN>"
```

### Using Postman

1. Import the API collection (provided separately)
2. Set up environment variables (base_url, token)
3. Execute requests

---

Last Updated: June 2026
