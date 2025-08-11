// Environment configuration for the application
export const config = {
  // API base URL - handles both development and production
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 
              (typeof window !== 'undefined' ? window.location.origin : ''),
  
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d'
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = config.apiBaseUrl;
  if (!baseUrl) {
    // Fallback to relative URL if no base URL is configured
    return endpoint;
  }
  
  // Ensure endpoint starts with / and base URL doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

// Helper function to check if we're in a browser environment
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}
