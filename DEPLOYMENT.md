# Deployment Guide

This guide will help you deploy the Petrol Pump Management System to various platforms.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/petrol-pump-management

# JWT Secret Key (use a strong, random secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Python Executable (optional, defaults to 'python')
PYTHON_EXECUTABLE=python

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables**
   - In the Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add all required environment variables

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Your app will be available at `https://your-project.vercel.app`

#### Vercel Configuration:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2. Netlify

#### Steps:
1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x

2. **Environment Variables**
   - Add all required environment variables in Netlify dashboard

3. **Deploy**
   - Connect your GitHub repository
   - Netlify will build and deploy automatically

### 3. Railway

#### Steps:
1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Create new project from GitHub repo

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Railway will automatically detect Next.js

3. **Deploy**
   - Railway will build and deploy automatically

### 4. Docker Deployment

#### Create Dockerfile:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Build and Run:
```bash
# Build Docker image
docker build -t petrol-pump-management .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  petrol-pump-management
```

### 5. Traditional VPS/Server

#### Prerequisites:
- Node.js 18+
- MongoDB
- Python 3.8+
- Tesseract OCR
- Nginx (optional, for reverse proxy)

#### Steps:
1. **Clone Repository**
   ```bash
   git clone https://github.com/Ankushsph/petrol-pump-management.git
   cd petrol-pump-management
   ```

2. **Install Dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Application**
   ```bash
   npm start
   ```

5. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Database Setup

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/petrol-pump-management`

## OCR Setup for Production

### For Vercel/Netlify:
- OCR functionality requires server-side Python execution
- Consider using external OCR services for serverless deployments
- Or use Vercel's serverless functions with Python runtime

### For VPS/Docker:
1. Install Tesseract OCR on the server
2. Install Python dependencies
3. Ensure Python script has proper permissions

## Security Considerations

### Production Checklist:
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set secure cookie options
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up proper file upload restrictions
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

### Environment Variables for Production:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=very-long-random-secret-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Monitoring and Maintenance

### Health Checks:
- Monitor `/api/test-db` endpoint
- Check application logs regularly
- Monitor database performance
- Set up uptime monitoring

### Backup Strategy:
- Regular MongoDB backups
- Backup uploaded receipt images
- Version control for code changes
- Environment variable backup

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify database permissions

3. **OCR Not Working**
   - Check Python dependencies
   - Verify Tesseract installation
   - Check file permissions

4. **Authentication Issues**
   - Verify JWT secret
   - Check cookie settings
   - Verify middleware configuration

## Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation
5. Create an issue on GitHub

---

**Happy Deploying! 🚀**
