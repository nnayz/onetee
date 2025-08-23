import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Enable cookies for admin authentication
});

// Admin authentication functions
export const adminAuth = {
  // Login and get admin cookie
  async login(username: string, password: string): Promise<boolean> {
    try {
      console.log('Admin login request:', username, password);
      const response = await api.post('/marketplace/admin/login', null, {
        params: {
          username,
          password,
        }
      });
      console.log('Admin login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  },

  // Logout by clearing the admin cookie
  async logout(): Promise<void> {
    try {
      await api.post('/marketplace/admin/logout');
      // Also clear it client-side as backup
      document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch {
      console.warn('Admin logout: could not clear server cookie');
    }
  },

  // Check if admin is authenticated
  async checkAuth(): Promise<boolean> {
    // Check if admin cookie exists
    const cookies = document.cookie.split(';');
    const adminCookie = cookies.find(cookie => 
      cookie.trim().startsWith('admin_token=')
    );
    
    if (adminCookie) {
      console.log('Admin cookie found - user is authenticated');
      return true;
    } else {
      console.log('No admin cookie found - user is not authenticated');
      return false;
    }
  },
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error("Authentication failed");
          // You can redirect to login here if needed
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API Error:", error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error("Network error - no response received");
    } else {
      // Other error
      console.error("Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;