import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Enable cookies for admin authentication
});

// Types for API responses
export interface AnalyticsOverview {
  users: {
    total: number;
    new_today: number;
  };
  products: {
    total: number;
    active: number;
  };
  orders: {
    total: number;
    today: number;
  };
  revenue: {
    total_cents: number;
    today_cents: number;
  };
  community: {
    threads: number;
    likes: number;
    follows: number;
  };
}

export interface RevenueData {
  period: string;
  start_date: string;
  end_date: string;
  daily_data: Array<{
    date: string;
    revenue_cents: number;
    orders: number;
  }>;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  total_sold: number;
  total_revenue_cents: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
  bio: string;
  avatar_url: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  gender: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: Array<{ url: string; alt_text: string }>;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    stock_quantity: number;
  }>;
  tag_names: string[];
  collection_names: string[];
  total_stock: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_provider: string;
  payment_id: string;
  total_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
  }>;
}

export interface CommunityStats {
  total_threads: number;
  total_likes: number;
  total_reposts: number;
  total_bookmarks: number;
  total_follows: number;
  recent_threads: number;
  recent_likes: number;
}

export interface Thread {
  id: string;
  content: string;
  author_id: string;
  author_username: string;
  created_at: string;
  likes_count: number;
  reposts_count: number;
  bookmarks_count: number;
}

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

  // Refresh session to extend cookie expiration
  async refresh(): Promise<boolean> {
    try {
      const response = await api.post('/marketplace/admin/refresh');
      console.log('Session refreshed');
      return response.data;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  },

  // Logout by clearing the admin cookie
  async logout(): Promise<void> {
    try {
      await api.post('/marketplace/admin/logout');
    } catch {
      console.warn('Admin logout: could not clear server cookie');
    }
  },

  // Check if admin is authenticated by making a server request
  async checkAuth(): Promise<boolean> {
    try {
      // Make a lightweight request to validate the HttpOnly cookie
      await api.get('/marketplace/admin/analytics/overview');
      console.log('Admin authentication validated');
      return true;
    } catch (error) {
      console.log('Admin authentication failed:', error);
      return false;
    }
  },

  // Note: We cannot check HttpOnly cookies from JavaScript
  // This method always returns false to force server validation
  isAuthenticated(): boolean {
    // Since we use HttpOnly cookies, we cannot check them from JavaScript
    // Always return false to force server validation
    return false;
  },
};

// Analytics API functions
export const analyticsAPI = {
  // Get overview analytics
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await api.get('/marketplace/admin/analytics/overview');
    return response.data;
  },

  // Get revenue analytics
  async getRevenue(period: string = '7d'): Promise<RevenueData> {
    const response = await api.get('/marketplace/admin/analytics/revenue', {
      params: { period }
    });
    return response.data;
  },

  // Get top products
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response = await api.get('/marketplace/admin/analytics/top-products', {
      params: { limit }
    });
    return response.data;
  },
};

// User management API functions
export const usersAPI = {
  // List users
  async listUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{ users: User[]; total: number; limit: number; offset: number }> {
    const response = await api.get('/marketplace/admin/users', { params });
    return response.data;
  },

  // Update user status
  async updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; user_id: string; is_active: boolean }> {
    const response = await api.put(`/marketplace/admin/users/${userId}/status`, null, {
      params: { is_active: isActive }
    });
    return response.data;
  },

  // Update user admin status
  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<{ success: boolean; user_id: string; is_admin: boolean }> {
    const response = await api.put(`/marketplace/admin/users/${userId}/admin`, null, {
      params: { is_admin: isAdmin }
    });
    return response.data;
  },
};

// Product management API functions
export const productsAPI = {
  // List products (admin version)
  async listProducts(params: {
    limit?: number;
    offset?: number;
    search?: string;
    is_active?: boolean;
    gender?: string;
  } = {}): Promise<{ products: Product[]; total: number; limit: number; offset: number }> {
    const response = await api.get('/marketplace/admin/products', { params });
    return response.data;
  },

  // Create product
  async createProduct(formData: FormData): Promise<Product> {
    const response = await api.post('/marketplace/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product
  async updateProduct(productId: string, data: {
    name?: string;
    description?: string;
    gender?: string;
    price_cents?: number;
    currency?: string;
    is_active?: boolean;
  }): Promise<{ success: boolean; product_id: string }> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put(`/marketplace/admin/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/marketplace/admin/products/${productId}`);
    return response.data;
  },

  // Update variant stock
  async updateVariantStock(productId: string, variantId: string, stockQuantity: number): Promise<{ success: boolean; variant_id: string; stock_quantity: number }> {
    const response = await api.put(`/marketplace/admin/products/${productId}/variants/${variantId}/stock`, null, {
      params: { stock_quantity: stockQuantity }
    });
    return response.data;
  },

  // Add product variant
  async addProductVariant(productId: string, data: {
    size: string;
    color?: string;
    stock_quantity?: number;
  }): Promise<{ id: string; size: string; color: string; stock_quantity: number }> {
    const formData = new FormData();
    formData.append('size', data.size);
    if (data.color) formData.append('color', data.color);
    if (data.stock_quantity !== undefined) formData.append('stock_quantity', data.stock_quantity.toString());

    const response = await api.post(`/marketplace/admin/products/${productId}/variants`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Order management API functions
export const ordersAPI = {
  // List orders
  async listOrders(params: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): Promise<{ orders: Order[]; total: number; limit: number; offset: number }> {
    const response = await api.get('/marketplace/admin/orders', { params });
    return response.data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; order_id: string; status: string }> {
    const response = await api.put(`/marketplace/admin/orders/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  },
};

// Community management API functions
export const communityAPI = {
  // Get community stats
  async getStats(): Promise<CommunityStats> {
    const response = await api.get('/marketplace/admin/community/stats');
    return response.data;
  },

  // List threads
  async listThreads(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ threads: Thread[]; total: number; limit: number; offset: number }> {
    const response = await api.get('/marketplace/admin/community/threads', { params });
    return response.data;
  },

  // Delete thread
  async deleteThread(threadId: string): Promise<{ success: boolean; thread_id: string }> {
    const response = await api.delete(`/marketplace/admin/community/threads/${threadId}`);
    return response.data;
  },
};

// Tags and Collections API functions
export const tagsAPI = {
  // List tags
  async listTags(): Promise<Array<{ id: string; name: string; description: string }>> {
    const response = await api.get('/marketplace/admin/tags');
    return response.data;
  },

  // Create tag
  async createTag(data: { name: string; description?: string }): Promise<{ id: string; name: string; description: string }> {
    const response = await api.post('/marketplace/admin/tags', data);
    return response.data;
  },

  // Update tag
  async updateTag(tagId: string, data: { name: string; description?: string }): Promise<{ id: string; name: string; description: string }> {
    const response = await api.put(`/marketplace/admin/tags/${tagId}`, data);
    return response.data;
  },

  // Delete tag
  async deleteTag(tagId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/marketplace/admin/tags/${tagId}`);
    return response.data;
  },
};

export const collectionsAPI = {
  // List collections
  async listCollections(): Promise<Array<{ id: string; name: string; description: string }>> {
    const response = await api.get('/marketplace/admin/collections');
    return response.data;
  },

  // Create collection
  async createCollection(data: { name: string; description?: string }): Promise<{ id: string; name: string; description: string }> {
    const response = await api.post('/marketplace/admin/collections', data);
    return response.data;
  },

  // Update collection
  async updateCollection(collectionId: string, data: { name: string; description?: string }): Promise<{ id: string; name: string; description: string }> {
    const response = await api.put(`/marketplace/admin/collections/${collectionId}`, data);
    return response.data;
  },

  // Delete collection
  async deleteCollection(collectionId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/marketplace/admin/collections/${collectionId}`);
    return response.data;
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