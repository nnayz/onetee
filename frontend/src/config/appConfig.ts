// App configuration based on environment variables
export const appConfig = {
  // Show coming soon page if VITE_COMING_SOON is set to 'true'
  isComingSoon: import.meta.env.VITE_COMING_SOON === 'true',
  
  // App metadata
  appName: 'OneTee',
  appTagline: 'OneTeam!',
  
  // Contact information
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'hello@onetee.com',
  
  // Social media links (optional)
  socialLinks: {
    twitter: import.meta.env.VITE_TWITTER_URL,
    instagram: import.meta.env.VITE_INSTAGRAM_URL,
    linkedin: import.meta.env.VITE_LINKEDIN_URL,
  },
  
  // Launch date (optional, for countdown)
  launchDate: import.meta.env.VITE_LAUNCH_DATE,
} as const;

// Type for the config
export type AppConfig = typeof appConfig; 