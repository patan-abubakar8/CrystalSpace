import { APP_CONFIG } from '../config';

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem(APP_CONFIG.AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private async send(endpoint: string, options: RequestOptions = {}): Promise<unknown> {
    const { requiresAuth = true, headers = {}, ...rest } = options;

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        headers: finalHeaders,
        ...rest,
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          responseData?.error ||
          responseData?.message ||
          `Request failed with status ${response.status}`;
        throw new ApiError(errorMsg, response.status, responseData);
      }

      return responseData;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        (err as Error).message || 'Network connection error. Is the backend server running?',
        0
      );
    }
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const responseData = await this.send(endpoint, options);
    // If backend wrapped in { success: true, data: ... }
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return (responseData as { data: T }).data;
    }
    return responseData as T;
  }

  /** Returns the full envelope so callers can read pagination meta alongside data. */
  public async getWithMeta<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<{ data: T; meta?: { page?: number; page_size?: number; total?: number; total_page?: number } }> {
    return this.send(endpoint, { method: 'GET', ...options }) as Promise<{
      data: T;
      meta?: { page?: number; page_size?: number; total?: number; total_page?: number };
    }>;
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new HttpClient(APP_CONFIG.API_BASE_URL);
