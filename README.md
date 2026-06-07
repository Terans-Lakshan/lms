# GeoLMS - Geology Learning Management System

A modern, full-stack Learning Management System designed specifically for Geology education. Built with React, Express.js, and MongoDB.

## Quick Links

- [Setup Instructions](docs/SETUP.md)
- [Project Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Features Overview](docs/FEATURES.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Overview

GeoLMS is a comprehensive platform for managing geology courses, student enrollments, exam results, and course materials. It supports three user roles: Students, Lecturers, and Administrators, each with tailored dashboards and functionality.

## Key Features

✨ **Role-Based Access Control** - Separate dashboards for Students, Lecturers, and Admins
📚 **Course Management** - Create, manage, and organize geology courses
📄 **Course Materials** - Upload and manage PDFs and documents via AWS S3
📧 **Notifications** - Real-time enrollment and approval notifications
👥 **User Authentication** - Email/password and Google OAuth 2.0 support
📅 **Calendar Integration** - FullCalendar for exam scheduling
🎓 **Degree Programs** - Manage geology degree programs and curriculum
📊 **Results Tracking** - View and track exam results

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool with HMR
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **FullCalendar** - Event calendar
- **React Hot Toast** - Notifications

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **AWS SDK** - S3 file storage
- **Nodemailer** - Email service

## Project Structure

```
GeoLMS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (role-based)
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (user state)
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── models/            # MongoDB schemas
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Custom middleware
│   ├── index.js           # Server entry point
│   └── package.json
├── docs/                  # Documentation
└── README.md             # This file
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- AWS S3 bucket (for file uploads)
- Google OAuth credentials (optional, for social login)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd GeoLMS
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env  # Configure with your environment variables
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5174`

For detailed setup instructions, see [SETUP.md](docs/SETUP.md)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (Lecturer/Admin)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Lecturer/Admin)
- `DELETE /api/courses/:id` - Delete course (Lecturer/Admin)

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in course
- `DELETE /api/enrollments/:id` - Drop course

### Notifications
- `GET /api/notifications` - Get user notifications
- `DELETE /api/notifications/:id` - Delete notification

For complete API documentation, see [API.md](docs/API.md)

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project uses ESLint for code linting. Run checks with:
```bash
npm run lint
```

### Building for Production
```bash
cd client && npm run build
cd ../server && npm run build
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines on:
- Code style and standards
- Commit message format
- Pull request process
- Issue reporting

## Environment Variables

### Server (.env)
```
MONGO_URI=mongodb://...
PORT=3000
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
SENDGRID_API_KEY=your-sendgrid-key
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=GeoLMS
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check `MONGO_URI` in your `.env` file
- Verify network connectivity

**S3 Upload Errors**
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket name is correct

**CORS Errors**
- Verify frontend origin in server CORS config
- Check that frontend and backend ports match config

For more troubleshooting, see [SETUP.md](docs/SETUP.md#troubleshooting)

## Project Status

| Component | Status |
|-----------|--------|
| Core Features | ✅ Stable |
| Authentication | ✅ Stable |
| Course Management | ✅ Stable |
| Notifications | ✅ Stable |
| File Uploads | ✅ Stable |
| Admin Panel | ✅ Stable |

## Roadmap

- [ ] Student assignment submissions
- [ ] Automated grading system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] WebRTC for live classes
- [ ] Multi-language support

## License

ISC

## Support

For issues, questions, or suggestions:
1. Check existing [issues](docs/TROUBLESHOOTING.md)
2. Create a new issue with detailed information
3. Contact the development team

## Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for version history and updates.

---

Last Updated: June 2026
