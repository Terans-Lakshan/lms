# GeoLMS Setup Guide

Complete setup instructions for developing and running GeoLMS locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** v14.0.0 or higher
- **npm** v6.0.0 or higher
- **MongoDB** v4.4 or higher (local or remote)
- **Git** for version control

### Optional Services
- **AWS Account** (for S3 file uploads)
- **Google Cloud Account** (for OAuth)
- **SendGrid Account** (for email service)

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB (if installed locally)
mongod --version
```

## Backend Setup

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Express.js
- MongoDB/Mongoose
- Authentication (JWT, bcrypt)
- AWS SDK
- Email service (nodemailer)

### Step 3: Create Environment File

```bash
# Copy example file or create new .env
cp .env.example .env
```

Or manually create `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/geolms

# JWT
JWT_SECRET=your-very-secret-jwt-key-change-this-in-production

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
ADMIN_EMAIL=admin@geolms.com

# CORS
CORS_ORIGIN=http://localhost:5174
```

### Step 4: Verify Server Starts

```bash
npm run dev
```

Expected output:
```
Server listening on port 3000
```

## Frontend Setup

### Step 1: Navigate to Client Directory

```bash
cd client
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React 19
- Vite build tool
- Tailwind CSS
- React Router
- FullCalendar
- Axios
- Other utilities

### Step 3: Create Environment File

```bash
# Create .env in client directory
```

Add configuration:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=GeoLMS
VITE_PORT=5174
```

### Step 4: Verify Frontend Starts

```bash
npm run dev
```

Expected output:
```
VITE v7.2.2  ready in 234 ms

➜  Local:   http://localhost:5174/
```

## Database Setup

### Option 1: Local MongoDB

#### Installation (Windows)

1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer and follow setup wizard
3. MongoDB will be installed as a Windows Service

#### Start MongoDB

```bash
# Windows (Service)
# MongoDB automatically starts as a service

# Or manually start
mongod
```

#### Create Database

```bash
# Connect to MongoDB
mongo

# Switch to geolms database
use geolms

# Create collections (Mongoose will handle this)
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string
5. Update `MONGO_URI` in `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/geolms?retryWrites=true&w=majority
```

### Verify Connection

```bash
# In server directory
npm run dev

# Look for this log:
# Connected to MongoDB
```

## Environment Configuration

### Backend Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URI` | Database connection | `mongodb://localhost:27017/geolms` |
| `JWT_SECRET` | Token signing key | `your-secret-key` |
| `AWS_ACCESS_KEY_ID` | AWS credentials | From AWS console |
| `AWS_S3_BUCKET` | S3 bucket name | `geolms-uploads` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5174` |

### Frontend Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_APP_NAME` | Application name | `GeoLMS` |
| `VITE_PORT` | Development port | `5174` |

## Running the Application

### Development Mode (Recommended)

#### Terminal 1: Start Backend

```bash
cd server
npm run dev
```

Output should show:
```
Server listening on port 3000 (with DB)
```

#### Terminal 2: Start Frontend

```bash
cd client
npm run dev
```

Output should show:
```
Local: http://localhost:5174/
```

### Access Application

1. Open browser to `http://localhost:5174`
2. You should see the login page
3. Sign up or use test credentials

### Production Build

```bash
# Build frontend
cd client
npm run build

# Build backend (if needed)
cd ../server
npm run build
```

## Troubleshooting

### MongoDB Connection Issues

**Error: `MongooseError: Cannot connect to MongoDB`**

**Solution:**
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` format is correct
- Verify network connectivity
- For MongoDB Atlas, whitelist your IP

```bash
# Test MongoDB connection
mongo "mongodb://localhost:27017"
```

### Port Already in Use

**Error: `Error: listen EADDRINUSE: address already in use :::3000`**

**Solution:**

```bash
# Find process using port (Windows)
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### CORS Errors in Browser Console

**Error: `Access to XMLHttpRequest blocked by CORS policy`**

**Solution:**
- Ensure `CORS_ORIGIN` in server `.env` matches your frontend URL
- Verify frontend is running on port 5174
- Restart server after changing CORS config

### Module Not Found Errors

**Error: `Cannot find module 'express'`**

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### AWS S3 Upload Failures

**Error: `NoSuchBucket` or `AccessDenied`**

**Solution:**
- Verify AWS credentials in `.env`
- Check bucket name is correct
- Ensure bucket permissions allow uploads
- Verify AWS IAM user has S3 access

```bash
# Test AWS credentials
aws s3 ls --profile default
```

### Frontend Won't Start

**Error: `Vite build error`**

**Solution:**
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules .vite dist package-lock.json
npm install
npm run dev
```

### Hot Module Replacement (HMR) Not Working

**Issue: Changes not reflecting in browser**

**Solution:**
- Check browser console for errors
- Restart dev server: `npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check that file is saved

## Database Models

The application automatically creates these MongoDB collections:

- `users` - User accounts and authentication
- `courses` - Course information
- `enrollments` - Student course enrollments
- `degrees` - Degree programs
- `notifications` - User notifications

## First Time Login

### Create Admin User

The first user should be created with admin role:

1. Sign up through the application
2. Contact database admin to set `role: 'admin'` in users collection

Or manually via MongoDB:

```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@geolms.com",
  password: "hashed-password",
  role: "admin",
  createdAt: new Date()
})
```

## Next Steps

1. Read [FEATURES.md](FEATURES.md) to understand application features
2. Check [API.md](API.md) for API endpoints
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## Support

If you encounter issues:
1. Check this troubleshooting section
2. Review error messages carefully
3. Check logs in terminal
4. Create an issue with detailed error information

---

Last Updated: June 2026
