# Production Deployment Guide for FreeJobAI

## 🚨 **Current Issue: Authentication Not Working in Production**

The signin and signup endpoints are returning internal server errors in production. This guide will help resolve the issue.

## 🔍 **Root Cause Analysis**

The authentication system works perfectly in development but fails in production. Common causes:

1. **Missing Environment Variables** - Production environment doesn't have the same variables
2. **MongoDB Network Access** - Atlas cluster IP restrictions
3. **Build Configuration** - Differences between dev and production builds
4. **SSL/TLS Issues** - Production MongoDB connection requirements

## 🛠️ **Immediate Fixes**

### 1. Environment Variables Check

Ensure these environment variables are set in your production environment:

```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freejobai
JWT_SECRET=your-secure-jwt-secret

# Optional but recommended
NODE_ENV=production
```

### 2. MongoDB Atlas Configuration

1. **Network Access**: Ensure your production server's IP is whitelisted in MongoDB Atlas
2. **Database User**: Verify the database user has proper permissions
3. **SSL**: Ensure SSL is enabled for production connections

### 3. Test MongoDB Connection

Use the new test endpoint to verify connection:

```bash
curl -X GET https://your-domain.com/api/test-mongodb
```

## 🔧 **Troubleshooting Steps**

### Step 1: Check Environment Variables

```bash
# In your production environment, verify:
echo $MONGODB_URI
echo $JWT_SECRET
echo $NODE_ENV
```

### Step 2: Test MongoDB Connection

```bash
# Test the connection endpoint
curl -X GET https://your-domain.com/api/test-mongodb
```

### Step 3: Check Production Logs

Look for these specific error messages:
- "Missing required environment variables"
- "MongoDB connection failed"
- "Database connection failed"

### Step 4: Verify IP Whitelist

In MongoDB Atlas:
1. Go to Network Access
2. Add your production server's IP address
3. Or temporarily allow access from anywhere (0.0.0.0/0) for testing

## 🚀 **Deployment Checklist**

- [ ] Environment variables are set in production
- [ ] MongoDB Atlas IP whitelist includes production server
- [ ] Production build is successful (`npm run build`)
- [ ] MongoDB connection test endpoint works
- [ ] Authentication endpoints return proper responses
- [ ] JWT tokens are being generated and set as cookies

## 📱 **Platform-Specific Instructions**

### Vercel
1. Set environment variables in Vercel dashboard
2. Redeploy after setting variables
3. Check function logs for errors

### Netlify
1. Set environment variables in Netlify dashboard
2. Redeploy after setting variables
3. Check function logs for errors

### Self-hosted
1. Set environment variables in your server configuration
2. Restart the application
3. Check server logs for errors

## 🔒 **Security Considerations**

1. **JWT Secret**: Use a strong, unique secret in production
2. **MongoDB URI**: Ensure credentials are secure
3. **HTTPS**: Always use HTTPS in production
4. **Cookie Security**: HTTP-only cookies with secure flag

## 📞 **Support**

If issues persist:
1. Check the `/api/test-mongodb` endpoint response
2. Review production server logs
3. Verify MongoDB Atlas configuration
4. Test with a simple MongoDB connection script

## 🎯 **Expected Behavior After Fix**

- ✅ MongoDB connection successful
- ✅ User signup creates accounts in database
- ✅ User login generates JWT tokens
- ✅ Protected routes work with valid tokens
- ✅ All authentication flows complete successfully
