# GeoLMS Architecture

System design and architecture overview for the Geology Learning Management System.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Models](#data-models)
6. [API Design](#api-design)
7. [Authentication Flow](#authentication-flow)
8. [File Storage Strategy](#file-storage-strategy)

## System Overview

GeoLMS is a three-tier web application:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Tier (Browser)                    │
│              React 19 + Vite + Tailwind CSS                 │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                  Application Tier (Server)                   │
│              Express.js + Node.js (Port 3000)               │
│          Routes → Controllers → Services → Models            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Data Tier                                │
│        MongoDB (Database) + AWS S3 (File Storage)           │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Diagram

### Component Interaction

```
Frontend (React)
├── Pages (Role-based)
│   ├── Student Dashboard
│   ├── Lecturer Dashboard
│   └── Admin Dashboard
├── Components (Reusable)
│   ├── CourseCard
│   ├── Sidebar
│   ├── Notification
│   └── ...
└── Context (State Management)
    └── UserContext

        ↓ (Axios HTTP calls)

Backend (Express)
├── Routes
│   ├── /api/auth
│   ├── /api/courses
│   ├── /api/enrollments
│   ├── /api/notifications
│   └── ...
├── Controllers
│   └── Handle business logic
├── Middlewares
│   ├── Authentication
│   ├── Authorization
│   └── Error handling
└── Services
    └── Database operations

        ↓ (Mongoose ODM)

MongoDB
├── Collections
│   ├── users
│   ├── courses
│   ├── enrollments
│   ├── notifications
│   └── degrees
```

## Frontend Architecture

### Directory Structure

```
client/src/
├── pages/              # Route-specific components
│   ├── login.jsx       # Authentication page
│   ├── signup.jsx      # User registration
│   ├── student/        # Student role pages
│   │   ├── dashboard.jsx
│   │   ├── myCourses.jsx
│   │   └── results.jsx
│   ├── lecturer/       # Lecturer role pages
│   │   ├── dashboard.jsx
│   │   ├── myCourses.jsx
│   │   └── manageCourses.jsx
│   └── admin/          # Admin role pages
│       ├── dashboard.jsx
│       ├── manageDegree.jsx
│       ├── manageUsers.jsx
│       └── addDegreeProgram.jsx
├── components/         # Reusable UI components
│   ├── header.jsx
│   ├── sidebar.jsx
│   ├── courseCard.jsx
│   ├── notification.jsx
│   └── ...
├── context/            # React Context for state
│   └── userContext.jsx # Global user state
├── App.jsx             # Main app with routes
└── main.jsx            # Entry point
```

### State Management

**Global State (UserContext)**
```javascript
{
  user: {
    id: string,
    name: string,
    email: string,
    role: 'student' | 'lecturer' | 'admin',
    enrollments: string[],
    courses: string[]
  },
  isAuthenticated: boolean,
  loading: boolean
}
```

### Component Hierarchy

```
<App>
├── <UserContextProvider>
│   ├── <Routes>
│   │   ├── <Login>
│   │   ├── <Signup>
│   │   ├── <StudentDashboard>
│   │   │   ├── <Header>
│   │   │   ├── <Sidebar>
│   │   │   └── Content
│   │   ├── <LecturerDashboard>
│   │   └── <AdminDashboard>
│   └── <Toaster>  (Notifications)
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Axios API Call
    ↓
Backend Response
    ↓
Update State/Context
    ↓
Re-render Component
```

## Backend Architecture

### Directory Structure

```
server/
├── routes/             # API route definitions
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── enrollmentRoutes.js
│   ├── notificationRoutes.js
│   ├── uploadRoutes.js
│   └── ...
├── controllers/        # Business logic handlers
│   ├── authController.js
│   ├── courseController.js
│   └── ...
├── models/             # MongoDB schemas
│   ├── User.js
│   ├── Course.js
│   ├── Enrollment.js
│   └── ...
├── middlewares/        # Express middleware
│   ├── auth.js         # JWT verification
│   ├── errorHandler.js
│   └── ...
├── utils/              # Helper functions
├── config/             # Configuration files
└── index.js            # Server entry point
```

### Request Processing Pipeline

```
HTTP Request
    ↓
Express Middleware (CORS, JSON parse)
    ↓
Route Matching
    ↓
Authentication Middleware
    ↓
Authorization Check
    ↓
Controller Function
    ↓
Database Query (Mongoose)
    ↓
Response Processing
    ↓
HTTP Response
```

### Middleware Stack

```javascript
app.use(cors())                    // Cross-Origin Resource Sharing
app.use(express.json())            // Parse JSON bodies
app.use(cookieParser())            // Parse cookies
app.use(authMiddleware)            // Verify JWT tokens
app.use(errorHandler)              // Global error handling
```

## Data Models

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: 'student' | 'lecturer' | 'admin',
  enrollments: [ObjectId],      // References to Enrollment
  teachingCourses: [ObjectId],  // For lecturers
  createdAt: Date,
  updatedAt: Date
}
```

### Course Schema

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  code: String (unique),
  lecturer: ObjectId,           // Reference to User
  degree: ObjectId,             // Reference to Degree
  enrolledStudents: [ObjectId], // References to User
  materials: [
    {
      title: String,
      url: String,              // S3 URL
      uploadedAt: Date
    }
  ],
  schedule: {
    day: String,
    time: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment Schema

```javascript
{
  _id: ObjectId,
  student: ObjectId,      // Reference to User
  course: ObjectId,       // Reference to Course
  status: 'pending' | 'active' | 'completed' | 'dropped',
  enrollmentDate: Date,
  grade: String
}
```

### Notification Schema

```javascript
{
  _id: ObjectId,
  recipient: ObjectId,    // Reference to User
  type: String,           // 'enrollment_request', 'approval', etc
  message: String,
  relatedCourse: ObjectId,
  relatedUser: ObjectId,
  read: Boolean,
  createdAt: Date
}
```

### Degree Schema

```javascript
{
  _id: ObjectId,
  title: String,
  code: String (unique),
  description: String,
  courses: [ObjectId],    // References to Course
  credits: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Design

### RESTful Principles

- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON request/response format
- Standard HTTP status codes

### Response Format

**Success Response**
```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful"
}
```

**Error Response**
```javascript
{
  success: false,
  error: "Error message",
  statusCode: 400
}
```

### Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
```

### Base URL
```
http://localhost:3000/api
```

## Authentication Flow

### Sign Up Flow

```
User Input (email, password)
    ↓
POST /api/auth/signup
    ↓
Validate Input
    ↓
Check Email Exists
    ↓
Hash Password (bcrypt)
    ↓
Create User in DB
    ↓
Generate JWT Token
    ↓
Return Token + User Data
    ↓
Store Token in LocalStorage/Cookie
```

### Login Flow

```
User Input (email, password)
    ↓
POST /api/auth/login
    ↓
Find User by Email
    ↓
Compare Password (bcrypt)
    ↓
Generate JWT Token
    ↓
Return Token + User Data
    ↓
Store Token + User Context
```

### Protected Route Flow

```
User Requests Protected Resource
    ↓
Include JWT in Authorization Header
    ↓
Server Verifies JWT Signature
    ↓
Check Token Expiration
    ↓
Extract User ID from Token
    ↓
Authorize User Access
    ↓
Return Resource
```

## File Storage Strategy

### AWS S3 Configuration

**Bucket Structure**
```
s3://geolms-uploads/
├── courses/
│   └── {courseId}/
│       └── {filename}
├── users/
│   └── {userId}/
│       └── {avatar}
└── materials/
    └── {materialId}/
        └── {filename}
```

### Upload Flow

```
User Selects File
    ↓
Frontend Validation (type, size)
    ↓
POST /api/upload
    ↓
Server Validates File
    ↓
Upload to S3 (multer-s3)
    ↓
Save Metadata to MongoDB
    ↓
Return S3 URL
    ↓
Update UI
```

### File Security

- Validate file types on server
- Limit file size (max 50MB)
- Store S3 URLs in database
- Use S3 presigned URLs for downloads
- Set appropriate ACL permissions

## Security Considerations

### Authentication & Authorization

- JWT tokens for stateless auth
- Bcrypt for password hashing (10 salt rounds)
- Role-based access control (RBAC)
- Middleware for permission verification

### Data Protection

- HTTPS in production
- Input validation on all endpoints
- CORS configuration restricts origins
- MongoDB injection prevention (Mongoose escaping)

### API Security

- Rate limiting (implement with express-rate-limit)
- CSRF protection (cookies in production)
- Helmet.js for secure headers (future enhancement)
- SQL/NoSQL injection prevention

## Scalability Considerations

### Future Enhancements

- **Caching**: Redis for session and query caching
- **Load Balancing**: nginx or AWS ELB
- **Database Replication**: MongoDB replica sets
- **CDN**: CloudFront for static assets
- **Microservices**: Separate auth, course, notification services
- **Message Queue**: RabbitMQ/Kafka for async operations

### Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Lazy loading of course materials
- API response compression
- Frontend code splitting with Vite

## Deployment Architecture

### Development
```
localhost:3000 (Backend) ←→ localhost:5174 (Frontend)
```

### Production
```
                    CDN (Static Assets)
                           ↑
                    Load Balancer
                           ↑
                    API Gateway
                           ↑
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   Server Node 1     Server Node 2     Server Node 3
        ↓                  ↓                  ↓
        └──────────────────┼──────────────────┘
                           ↓
                    MongoDB Cluster
                           ↑
                    AWS S3 (Files)
```

## Architecture Decisions

### Why React over other frameworks?
- Large ecosystem
- Easy to learn and maintain
- Excellent performance
- Good component reusability

### Why Express over other Node frameworks?
- Minimal and flexible
- Widely adopted and documented
- Lightweight middleware system
- Perfect for RESTful APIs

### Why MongoDB?
- Document-based (flexible schema)
- Horizontal scaling capability
- JSON-like data structure
- Mongoose provides schema validation

### Why AWS S3?
- Reliable file storage
- Scalable and cost-effective
- Good integration with Node.js
- Built-in access control

---

Last Updated: June 2026
