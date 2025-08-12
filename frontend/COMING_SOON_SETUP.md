# Coming Soon Page Setup

This project includes a flexible coming soon page system that can be easily toggled on/off using environment variables.

## How It Works

The app automatically shows either:
- **Coming Soon Page**: When `VITE_COMING_SOON=true`
- **Full Application**: When `VITE_COMING_SOON=false` (or not set)

## Quick Setup

### 1. Show Coming Soon Page (Production)
Create a `.env` file in the frontend directory:
```bash
VITE_COMING_SOON=true
VITE_CONTACT_EMAIL=your-email@example.com
```

### 2. Show Full App (Development)
Create a `.env` file in the frontend directory:
```bash
VITE_COMING_SOON=false
```

### 3. Deploy with Coming Soon
When deploying to production, set the environment variable:
```bash
# For Vercel
VITE_COMING_SOON=true

# For Netlify
VITE_COMING_SOON=true

# For Docker
VITE_COMING_SOON=true
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_COMING_SOON` | Show coming soon page (`true`/`false`) | `false` |
| `VITE_CONTACT_EMAIL` | Contact email for coming soon page | `hello@onetee.com` |
| `VITE_TWITTER_URL` | Twitter profile URL (optional) | - |
| `VITE_INSTAGRAM_URL` | Instagram profile URL (optional) | - |
| `VITE_LINKEDIN_URL` | LinkedIn profile URL (optional) | - |
| `VITE_LAUNCH_DATE` | Launch date for countdown (optional) | - |

## Going Live

When you're ready to launch:

1. **Update environment variables**:
   ```bash
   VITE_COMING_SOON=false
   ```

2. **Deploy the changes**

3. **Your full app will now be live!**

## Benefits

- ✅ **No code changes needed** when switching between coming soon and full app
- ✅ **Environment-specific behavior** (dev vs production)
- ✅ **Easy to manage** with environment variables
- ✅ **Consistent branding** across coming soon and full app
- ✅ **Email collection** for launch notifications
- ✅ **Responsive design** that matches your app's aesthetic

## Customization

The coming soon page is located at `src/pages/ComingSoonPage.tsx` and can be customized to match your specific needs:

- Update colors and styling
- Add more sections
- Integrate with your email service
- Add social media links
- Include a countdown timer 