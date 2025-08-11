import { getApiUrl } from './config';

// Define response types
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// API client for making HTTP requests
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '';
  }

  // Make a fetch request with proper error handling
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.baseUrl ? getApiUrl(endpoint) : endpoint;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Parse JSON response
      try {
        return await response.json();
      } catch {
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // GET request
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

// Helper functions for common API operations
export const authApi = {
  login: (credentials: LoginCredentials): Promise<UserData> =>
    apiClient.post<UserData>('/api/auth/login', credentials),
  
  signup: (userData: SignupData): Promise<UserData> =>
    apiClient.post<UserData>('/api/auth/signup', userData),
  
  logout: (): Promise<{ message: string }> => 
    apiClient.post<{ message: string }>('/api/auth/logout'),
  
  me: (): Promise<UserData> => 
    apiClient.get<UserData>('/api/auth/me'),
};

export const resumeApi = {
  parse: (formData: FormData): Promise<ApiResponse<unknown>> =>
    apiClient.post<ApiResponse<unknown>>('/api/resume/parse', formData),
};

// Export the default client for backward compatibility
export default apiClient;
