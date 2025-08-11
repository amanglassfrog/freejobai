# Production Login 500 Error - Troubleshooting Guide

## 🚨 **Issue Summary**
Your production login endpoint at `https://www.freejobai.com/api/auth/login` is returning a 500 error, while it works fine in local development.

## 🔍 **Root Causes Identified**

### 1. **Missing Base URL Configuration**
- **Problem**: Frontend is using relative URLs (`/api/auth/login`) which work in development but fail in production
- **Solution**: Set `NEXT_PUBLIC_API_BASE_URL=https://www.freejobai.com` in production environment

### 2. **Environment Variables Missing**
- **Problem**: Production environment doesn't have required environment variables
- **Solution**: Ensure all required environment variables are set in production

### 3. **MongoDB Connection Issues**
- **Problem**: Production MongoDB connection might be failing due to network/IP restrictions
- **Solution**: Check MongoDB Atlas configuration and IP whitelist

## 🛠️ **Immediate Fixes Applied**

### ✅ **Code Changes Made**
1. **Created `src/lib/config.ts`** - Centralized environment configuration
2. **Created `src/lib/api.ts`** - Smart API client that handles base URLs automatically
3. **Updated signin/signup pages** - Now use the new API client
4. **Enhanced Next.js config** - Better production optimizations

### ✅ **New API Client Features**
- Automatically detects production vs development
- Uses `window.location.origin` as fallback for base URL
- Proper error handling and response parsing
- Environment-aware configuration

## 🚀 **Deployment Steps**

### Step 1: Set Environment Variables
In your production environment (Vercel, Netlify, etc.), set these variables:

```bash
# Required - API Base URL
NEXT_PUBLIC_API_BASE_URL=https://www.freejobai.com

# Required - MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freejobai

# Required - JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Required - Environment
NODE_ENV=production
```

### Step 2: Redeploy
After setting environment variables, redeploy your application.

### Step 3: Test the Fix
1. Test the MongoDB connection: `https://www.freejobai.com/api/test-mongodb`
2. Test the login endpoint: `https://www.freejobai.com/api/auth/login`

## 🔧 **Verification Steps**

### 1. **Check Environment Variables**
```bash
# In your production environment, verify:
echo $NEXT_PUBLIC_API_BASE_URL
echo $MONGODB_URI
echo $JWT_SECRET
echo $NODE_ENV
```

### 2. **Test MongoDB Connection**
```bash
curl -X GET https://www.freejobai.com/api/test-mongodb
```

### 3. **Check Production Logs**
Look for these specific messages:
- ✅ "MongoDB connected successfully"
- ✅ "=== LOGIN PROCESS COMPLETED SUCCESSFULLY ==="
- ❌ "Missing required environment variable: MONGODB_URI"
- ❌ "MongoDB connection failed"

## 🐛 **Common Issues & Solutions**

### Issue 1: Still Getting 500 Error
**Check**: MongoDB connection
**Solution**: Verify `MONGODB_URI` is set and accessible from production server

### Issue 2: CORS Errors
**Check**: Frontend domain vs API domain
**Solution**: Ensure `NEXT_PUBLIC_API_BASE_URL` matches your production domain

### Issue 3: JWT Errors
**Check**: JWT_SECRET environment variable
**Solution**: Set a strong, unique JWT secret in production

## 📱 **Platform-Specific Instructions**

### Vercel
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Redeploy the project

### Netlify
1. Go to Site Settings → Environment Variables
2. Add all required variables
3. Trigger a new deployment

### Self-hosted
1. Set environment variables in your server configuration
2. Restart the application
3. Verify variables are loaded

## 🔒 **Security Checklist**

- [ ] JWT_SECRET is strong and unique (not the default)
- [ ] MONGODB_URI uses secure connection (mongodb+srv://)
- [ ] Production uses HTTPS
- [ ] Environment variables are not exposed in client-side code
- [ ] MongoDB Atlas IP restrictions are properly configured

## 📊 **Expected Results After Fix**

1. **MongoDB Test Endpoint**: Should return connection success
2. **Login Endpoint**: Should return 200 with user data and set JWT cookie
3. **Frontend**: Should successfully authenticate and redirect to dashboard
4. **No More 500 Errors**: All authentication endpoints should work properly

## 🆘 **If Issues Persist**

1. **Check the test endpoint**: `/api/test-mongodb`
2. **Review production logs** for specific error messages
3. **Verify MongoDB Atlas** network access and user permissions
4. **Test with a simple MongoDB connection script**

## 📞 **Support Commands**

```bash
# Test MongoDB connection
curl -X GET https://www.freejobai.com/api/test-mongodb

# Test login endpoint (replace with real credentials)
curl -X POST https://www.freejobai.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

**Last Updated**: $(date)
**Status**: Code fixes applied, awaiting production deployment
