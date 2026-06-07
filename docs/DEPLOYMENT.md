# GeoLMS Deployment Guide

Complete guide for deploying GeoLMS to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Architectures](#deployment-architectures)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Post-Deployment](#post-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code review completed
- [ ] No hardcoded secrets in code
- [ ] No console.log statements in production code

### Security
- [ ] JWT secret is strong (32+ characters)
- [ ] Database password is secure
- [ ] AWS credentials have minimal permissions
- [ ] CORS origins are restricted
- [ ] HTTPS enabled in production
- [ ] API rate limiting configured
- [ ] No sensitive data in logs

### Performance
- [ ] Frontend build optimized (`npm run build`)
- [ ] Database indexes created
- [ ] API response times acceptable
- [ ] Static assets cached appropriately
- [ ] CDN configured if needed

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Deployment steps documented
- [ ] Rollback procedure documented
- [ ] Contact information available

## Deployment Architectures

### Simple Deployment (Single Server)

```
┌─────────────────────┐
│   Single Server     │
│                     │
│ ┌─────────────────┐ │
│ │  Node.js Server │ │
│ │  - Express API  │ │
│ │  - React Build  │ │
│ └─────────────────┘ │
│         ↓           │
│ ┌─────────────────┐ │
│ │    MongoDB      │ │
│ └─────────────────┘ │
└─────────────────────┘
        ↑
     Nginx (Proxy)
```

**Best for**: Small teams, low traffic, development/staging

### Recommended Production Setup

```
┌────────────────────────────────────────────────────────┐
│                  Load Balancer                         │
│              (AWS ELB / Nginx)                         │
└────────────────────────────────────────────────────────┘
         ↑              ↑              ↑
    ┌────────┐    ┌────────┐    ┌────────┐
    │Server 1│    │Server 2│    │Server 3│
    │ Node.js│    │ Node.js│    │ Node.js│
    └────────┘    └────────┘    └────────┘
         ↓              ↓              ↓
    ┌────────────────────────────────────┐
    │     MongoDB Cluster                │
    │ (Replica Set)                      │
    └────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│         AWS S3 (File Storage)                │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│         CloudFront CDN                       │
│     (Static Assets Cache)                    │
└──────────────────────────────────────────────┘
```

## Backend Deployment

### Option 1: Heroku Deployment

#### Prerequisites
- Heroku account
- Heroku CLI installed
- MongoDB Atlas account

#### Steps

1. **Create Heroku App**
```bash
heroku create geolms-app
```

2. **Add MongoDB Atlas URI**
```bash
heroku config:set MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/geolms"
```

3. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set AWS_ACCESS_KEY_ID="your-key"
heroku config:set AWS_SECRET_ACCESS_KEY="your-secret"
heroku config:set AWS_S3_BUCKET="your-bucket"
heroku config:set NODE_ENV="production"
heroku config:set PORT="80"
```

4. **Deploy**
```bash
git push heroku main
```

5. **Verify**
```bash
heroku logs --tail
```

### Option 2: AWS Deployment (Elastic Beanstalk)

#### Steps

1. **Create Elastic Beanstalk Environment**
```bash
eb init -p "Node.js 16 running on 64bit Amazon Linux 2" geolms
eb create geolms-env
```

2. **Configure .ebextensions/nodecommand.config**
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    ProxyServer: nginx
    
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
```

3. **Deploy**
```bash
eb deploy
```

### Option 3: DigitalOcean Deployment

#### Prerequisites
- DigitalOcean account
- App Platform or Droplet
- MongoDB Atlas

#### Using App Platform (Recommended)

1. **Connect GitHub Repository**
   - Log into DigitalOcean
   - Go to Apps → Create App
   - Connect GitHub repository

2. **Configure Web Service**
```yaml
name: geolms
services:
  - name: api
    github:
      branch: main
      repo: username/GeoLMS
    build_command: "npm install && npm run build"
    run_command: "npm start"
    envs:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        scope: RUN_AND_BUILD_TIME
        value: ${db.connection_string}
```

3. **Deploy**
   - Review configuration
   - Click Deploy

### Option 4: Manual VPS Deployment (Ubuntu)

#### Prerequisites
- Ubuntu Server 20.04+
- Node.js v16+
- MongoDB
- Nginx

#### Steps

1. **SSH into Server**
```bash
ssh root@your_server_ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MongoDB**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

4. **Clone Repository**
```bash
cd /var/www
git clone https://github.com/username/GeoLMS.git
cd GeoLMS/server
```

5. **Install Dependencies**
```bash
npm ci --production
```

6. **Create .env File**
```bash
cat > .env <<EOF
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/geolms
JWT_SECRET=$(openssl rand -base64 32)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
CORS_ORIGIN=https://yourdomain.com
EOF
```

7. **Setup PM2 for Process Management**
```bash
sudo npm install -g pm2
pm2 start index.js --name "geolms-api"
pm2 startup
pm2 save
```

8. **Setup Nginx Reverse Proxy**
```bash
sudo apt-get install -y nginx

# Create Nginx config
sudo cat > /etc/nginx/sites-available/geolms <<EOF
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/geolms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to vercel.com
   - Import GitHub repository
   - Select `client` as root directory

2. **Configure Build Settings**
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

3. **Set Environment Variables**
```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=GeoLMS
```

4. **Deploy**
   - Review settings
   - Click Deploy

### Option 2: Netlify

1. **Connect Repository**
   - Go to netlify.com
   - New site from Git
   - Select GitHub repository

2. **Configure Build**
```
Base directory: client
Build command: npm run build
Publish directory: client/dist
```

3. **Set Environment Variables**
```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=GeoLMS
```

4. **Deploy**
   - Click Deploy

### Option 3: AWS S3 + CloudFront

1. **Build Frontend**
```bash
cd client
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://geolms-frontend
```

3. **Upload Build Files**
```bash
aws s3 sync dist/ s3://geolms-frontend --delete
```

4. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Error pages → index.html (for SPA routing)

5. **Update API Endpoint**
   - Set VITE_API_BASE_URL to CloudFront URL

### Option 4: Manual Deployment

1. **Build Production Files**
```bash
cd client
npm run build
```

2. **Copy to Server**
```bash
scp -r dist/* root@your_server:/var/www/html/
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose cloud provider (AWS, Google Cloud, Azure)
   - Select region closest to users
   - Choose M0 Sandbox (free)

3. **Create Database User**
   - Username: `geolms_prod`
   - Strong password (32+ chars)
   - Note connection string

4. **Whitelist IPs**
   - Add your server IP
   - Or use 0.0.0.0/0 (less secure)

5. **Update Connection String**
```
mongodb+srv://geolms_prod:password@cluster.mongodb.net/geolms?retryWrites=true&w=majority
```

### MongoDB Self-Hosted

1. **Install MongoDB Enterprise**
```bash
sudo apt-get install -y mongodb-enterprise
```

2. **Configure for Production**
```bash
sudo mongod --auth --bindIp 0.0.0.0 --dbpath /var/lib/mongodb
```

3. **Create Admin User**
```bash
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})
```

4. **Create Application Database**
```bash
use geolms
db.createUser({
  user: "geolms",
  pwd: "strong-password",
  roles: [
    { role: "readWrite", db: "geolms" }
  ]
})
```

## Environment Configuration

### Production .env Template

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/geolms?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-long-random-secret-32-characters-minimum

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=geolms-prod-bucket
AWS_REGION=us-east-1

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
ADMIN_EMAIL=admin@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Logging
LOG_LEVEL=info
```

### Security Best Practices

1. **Use Secrets Manager**
   - AWS Secrets Manager
   - HashiCorp Vault
   - DigitalOcean App Secrets

2. **Generate Strong Secrets**
```bash
# Generate random JWT secret
openssl rand -base64 32

# Generate random password
openssl rand -base64 20
```

3. **Restrict Permissions**
   - Database users should have minimal required permissions
   - AWS IAM users should use least privilege
   - Nginx should run as unprivileged user

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

2. **Generate Certificate**
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

3. **Configure Nginx**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

4. **Auto-Renewal**
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Post-Deployment

### Verify Deployment

```bash
# Check backend health
curl https://api.yourdomain.com/api/auth/login

# Check frontend
curl https://yourdomain.com

# Check logs
pm2 logs geolms-api
```

### Database Initialization

```bash
# Connect to production database
mongo "mongodb+srv://user:password@cluster.mongodb.net/geolms"

# Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.courses.createIndex({ code: 1 }, { unique: true })
db.enrollments.createIndex({ student: 1, course: 1 })
db.notifications.createIndex({ recipient: 1, createdAt: -1 })
```

### Backup Strategy

1. **Database Backups**
```bash
# MongoDB Atlas - automated daily backups (included)

# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)
```

2. **File Storage**
   - S3 versioning enabled
   - Cross-region replication

3. **Code Repository**
   - Always push to Git before deploying
   - Tag releases: `v1.0.0`

## Monitoring & Maintenance

### Application Monitoring

1. **Error Tracking**
   - Sentry for error logging
   - LogRocket for frontend issues
   - Custom logging middleware

2. **Performance Monitoring**
   - New Relic for APM
   - DataDog for infrastructure
   - Google Analytics for frontend

3. **Uptime Monitoring**
   - StatusPage.io
   - Pingdom
   - UptimeRobot

### Log Management

```bash
# View application logs
pm2 logs geolms-api

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# View system logs
journalctl -u mongodb -f
```

### Database Maintenance

```bash
# Check database size
db.stats()

# Remove old notifications
db.notifications.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
})

# Rebuild indexes
db.courses.reIndex()
```

### Updates & Patches

```bash
# Update Node.js
sudo apt-get update
sudo apt-get install -y nodejs

# Update npm packages
npm update

# Test before deploying
npm run build
npm run lint

# Deploy updates
git pull origin main
npm ci
pm2 restart geolms-api
```

### Rollback Procedure

```bash
# If deployment fails, rollback to previous version
git revert HEAD
git push origin main

# Or checkout previous tag
git checkout v1.0.0
npm ci
npm run build
pm2 restart geolms-api
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

**MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGO_URI

# Test connection
mongo "$MONGO_URI"
```

**SSL Certificate Expired**
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check expiration
sudo certbot certificates
```

**High Memory Usage**
```bash
# Monitor memory
top

# Restart application
pm2 restart geolms-api

# Check for memory leaks
node --inspect index.js
```

---

Last Updated: June 2026
