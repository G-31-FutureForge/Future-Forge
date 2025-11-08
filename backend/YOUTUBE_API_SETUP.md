# YouTube API Setup Guide

## Overview
The Skill Gap Analysis feature now fetches course recommendations directly from YouTube API instead of using dummy data. This provides real, up-to-date educational content for users.

## Prerequisites
- Google Cloud Platform account
- YouTube Data API v3 enabled

## Step-by-Step Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" → "New Project"
3. Enter a project name (e.g., "Future-Forge")
4. Click "Create"

### 2. Enable YouTube Data API v3
1. In the Google Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### 3. Create API Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional but recommended) Click "Restrict Key" to:
   - Restrict to "YouTube Data API v3"
   - Add application restrictions if needed

### 4. Configure Backend Environment
1. Navigate to `Future-Forge/backend/` directory
2. Create a `.env` file if it doesn't exist
3. Add the following line:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual API key.

### 5. Restart Backend Server
1. Stop your backend server (Ctrl+C)
2. Restart it:
   ```bash
   npm start
   ```

## Verification

### Test the API
You can test if the YouTube API is working by making a request to:
```
GET http://localhost:5000/api/courses?query=python&provider=youtube&limit=5
```

You should see YouTube videos related to Python programming.

### Check Backend Logs
If the API key is not set, you'll see this warning in the console:
```
YOUTUBE_API_KEY not set; YouTube fetch will return empty results.
```

## Features
- **Real-time Course Recommendations**: Fetches actual YouTube tutorials and courses
- **Video Details**: Includes duration, view count, and channel information
- **Smart Search**: Prioritizes longer videos (more likely to be full courses)
- **Skill-based**: Searches for courses based on missing skills identified in resume analysis

## Troubleshooting

### No Courses Showing
1. Verify the API key is set in `.env` file
2. Check backend logs for errors
3. Ensure YouTube Data API v3 is enabled in Google Cloud Console
4. Verify API key restrictions allow YouTube Data API v3
5. Check API quota limits in Google Cloud Console

### API Quota Exceeded
- Free tier: 10,000 units per day
- Each search uses ~100 units
- Consider upgrading if you exceed limits

### Invalid API Key Error
- Verify the key is correct in `.env` file
- Check if the key has proper restrictions
- Ensure YouTube Data API v3 is enabled for the project

## Notes
- The API fetches up to 3 courses per missing skill
- Courses are filtered to show longer videos (more likely to be full courses)
- All YouTube courses are marked as "free"
- Video duration and view counts are displayed when available

