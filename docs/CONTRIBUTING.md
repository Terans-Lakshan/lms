# Contributing to GeoLMS

Thank you for your interest in contributing to GeoLMS! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We expect all contributors to be respectful and constructive.

### Expected Behavior

- Be respectful of differing opinions and experience levels
- Provide constructive criticism and feedback
- Focus on what is best for the community
- Help others learn and grow

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Deliberate intimidation or threats
- Unwelcome advances or comments
- Any form of abuse

## Getting Started

### Prerequisites

- Familiarity with Git and GitHub
- Node.js v14+ installed
- MongoDB running locally or access to MongoDB Atlas
- Basic understanding of React and Express.js

### Setting Up Development Environment

1. **Fork the Repository**
```bash
# Click "Fork" on GitHub repository page
```

2. **Clone Your Fork**
```bash
git clone https://github.com/YOUR_USERNAME/GeoLMS.git
cd GeoLMS
```

3. **Add Upstream Remote**
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/GeoLMS.git
```

4. **Install Dependencies**
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

5. **Setup Environment Files**
```bash
# In server directory
cp .env.example .env

# Configure with your settings
```

6. **Verify Setup**
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-name
```

### Branch Naming Convention

- **Features**: `feature/short-description`
- **Bugfixes**: `fix/short-description`
- **Refactoring**: `refactor/short-description`
- **Documentation**: `docs/short-description`
- **Testing**: `test/short-description`

Examples:
- `feature/add-assignment-submission`
- `fix/enrollment-notification-bug`
- `refactor/course-controller`
- `docs/api-documentation`

### Making Changes

1. **Create focused changes** - Each commit should address one concern
2. **Keep changes small** - Easier to review and test
3. **Test locally** - Verify changes work before pushing
4. **Follow code standards** - See section below

### Keeping Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase on main
git rebase upstream/main

# If conflicts occur, resolve them:
# 1. Edit conflicted files
# 2. Mark as resolved: git add <file>
# 3. Continue rebase: git rebase --continue
```

## Code Standards

### Frontend (React/JavaScript)

#### File Naming
- Components: `PascalCase.jsx` (e.g., `CourseCard.jsx`)
- Utilities: `camelCase.js` (e.g., `courseService.js`)
- Styles: `camelCase.css` (e.g., `courseCard.css`)

#### Code Style
```javascript
// Use arrow functions
const handleClick = () => {
  // Implementation
};

// Use destructuring
const { courseId, title } = course;

// Use meaningful variable names
const enrolledStudents = course.students.length;

// Use template literals
const message = `Student ${name} enrolled in ${course}`;
```

#### Component Structure
```javascript
import React from 'react';
import PropTypes from 'prop-types';

const CourseCard = ({ course, onEnroll }) => {
  const handleEnroll = () => {
    onEnroll(course.id);
  };

  return (
    <div className="course-card">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <button onClick={handleEnroll}>Enroll</button>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  onEnroll: PropTypes.func.isRequired
};

export default CourseCard;
```

#### ESLint Compliance
```bash
# Check for linting errors
npm run lint

# Fix auto-fixable errors
npm run lint -- --fix
```

### Backend (Node.js/Express)

#### File Naming
- Controllers: `camelCase.js` (e.g., `courseController.js`)
- Models: `PascalCase.js` (e.g., `Course.js`)
- Routes: `camelCase.js` (e.g., `courseRoutes.js`)
- Middleware: `camelCase.js` (e.g., `authMiddleware.js`)

#### Code Style
```javascript
// Use async/await
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Use consistent error handling
const handleError = (res, error, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: error.message
  });
};

// Use middleware for repetitive tasks
app.use(authMiddleware);

// Use environment variables
const PORT = process.env.PORT || 3000;
```

#### Response Format
```javascript
// Success
res.json({
  success: true,
  data: resource,
  message: "Operation successful"
});

// Error
res.status(400).json({
  success: false,
  error: "Error description",
  statusCode: 400
});
```

### General Standards

- **Comments**: Only for complex logic or non-obvious behavior
- **Functions**: Keep small and focused (Single Responsibility)
- **Variables**: Use clear, descriptive names
- **DRY**: Don't repeat code - extract to reusable functions
- **Consistency**: Match existing code style in the file

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Changes that don't affect logic (formatting)
- `refactor`: Code change without feature/fix
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build/dependency updates

### Examples

```bash
# Good commit messages

git commit -m "feat: add course enrollment notification system"

git commit -m "fix: resolve S3 upload ACL issue
- Update bucket policy
- Add proper permissions
- Add error handling"

git commit -m "docs: update API documentation for courses endpoint"

git commit -m "refactor: simplify course controller logic"
```

### Bad Commit Messages

❌ `Update files`
❌ `Fix bug`
❌ `asdfgh`
❌ `WIP`

## Pull Request Process

### Before Submitting

1. **Test thoroughly**
   ```bash
   # Backend
   cd server && npm run dev
   
   # Frontend
   cd client && npm run dev
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Update documentation** if needed

4. **Ensure branch is up to date**
   ```bash
   git rebase upstream/main
   ```

### Creating a Pull Request

1. **Push to your fork**
```bash
git push origin feature/feature-name
```

2. **Create PR on GitHub**
   - Title: Clear description of changes
   - Description: Explain what, why, and how
   - Link related issues
   - Add screenshots for UI changes

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe testing performed:
- [ ] Feature works locally
- [ ] No console errors
- [ ] Responsive design verified

## Related Issues
Fixes #123
Related to #124

## Screenshots (if applicable)
[Attach screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Request review** from maintainers
2. **Address feedback** with new commits
3. **Rebase** if requested
4. **Await approval** and merge

## Testing

### Frontend Testing

```bash
# Run linter
cd client && npm run lint

# Manual testing checklist
- [ ] Feature works as intended
- [ ] No console errors/warnings
- [ ] Responsive on mobile/tablet/desktop
- [ ] Works on latest browser versions
- [ ] Keyboard navigation works
```

### Backend Testing

```bash
# Run linter
cd server && npm run lint

# Manual API testing
- [ ] POST requests work
- [ ] GET requests return correct data
- [ ] PUT requests update data
- [ ] DELETE requests remove data
- [ ] Error responses are appropriate
```

### Test Endpoints with cURL

```bash
# Test API endpoint
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer <token>"

# Test with data
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"courseId":"123"}'
```

## Documentation

### Code Documentation

Comment complex logic and non-obvious decisions:

```javascript
// Calculate GPA using weighted average
// Only includes completed courses
const calculateGPA = (enrollments) => {
  const completed = enrollments.filter(e => e.grade);
  const total = completed.reduce((sum, e) => sum + gradePoints(e.grade), 0);
  return (total / completed.length).toFixed(2);
};
```

### README Updates

If your changes affect:
- Installation
- Configuration
- Features
- API endpoints

Update the main [README.md](../README.md) and relevant documentation files.

### API Documentation

For new endpoints, document in [API.md](API.md):

```markdown
### Create Enrollment

Create new course enrollment.

POST /enrollments

**Request Body**
{
  "courseId": "string"
}

**Response (201)**
{
  "success": true,
  "data": { ... }
}
```

## Common Issues & Solutions

### Merge Conflicts

```bash
# When pulling/rebasing results in conflicts:
# 1. Open conflicted files
# 2. Resolve markers (<<<, ===, >>>)
# 3. Stage resolved files
git add <resolved-files>
# 4. Continue operation
git rebase --continue  # if rebasing
git commit             # if merging
```

### Large Files

Don't commit large files (>5MB). Use Git LFS or S3 instead:

```bash
# Check file size before committing
ls -lh <file>
```

### Accidental Commits

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Getting Help

- **Questions?** Open a discussion or issue
- **Found a bug?** Create a bug report issue
- **Need help?** Contact maintainers
- **Have an idea?** Start a feature request discussion

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Community acknowledgment

Thank you for contributing! 🎉

---

Last Updated: June 2026
