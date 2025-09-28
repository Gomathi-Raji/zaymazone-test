# Google OAuth Setup Guide

## 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google OAuth2 API

## 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized origins:
   - http://localhost:3000
   - http://localhost:8081
   - https://yourdomain.com (for production)
5. Add authorized redirect URIs:
   - http://localhost:3000/auth/google/callback
   - http://localhost:8081/auth/google/callback
   - https://yourdomain.com/auth/google/callback

## 3. Get Your Credentials
- Client ID: Will look like `xxx.apps.googleusercontent.com`
- Client Secret: Will be a long string

## 4. Environment Variables Needed
```env
# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Backend (server/.env)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```