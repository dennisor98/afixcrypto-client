import axios, { AxiosError } from 'axios';

// The auth_token cookie is only a routing hint for the proxy. The real check
// is the Bearer token against the backend guard, so its lifetime tracks the
// refresh token rather than the short-lived access token.
const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days, matches refresh token

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // CRITICAL — send cookies
});

// === Rate limit circuit breaker ===
let rateLimitedUntil = 0;

// === Refresh token coordination ===
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(newToken: string) {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
}

function clearAuthState() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

// === Request interceptor ===
// Attaches auth token and short-circuits if recently rate-limited
api.interceptors.request.use((config) => {
    // If recently rate-limited, fail fast without hitting the API
    if (Date.now() < rateLimitedUntil) {
        return Promise.reject(new Error('Cooling down from rate limit'));
    }

    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// === Response interceptor ===
// Auto-refresh on 401, track rate limits on 429
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 429 — pause future requests for 60 seconds
        if (error.response?.status === 429) {
            rateLimitedUntil = Date.now() + 60_000;
            console.warn('[API] Rate limited — pausing requests for 60s');
            return Promise.reject(error);
        }

        // Handle 401 — try to refresh the access token
        const isRefreshEndpoint = originalRequest?.url?.includes('/user/refresh');
        const isAuthEndpoint =
            originalRequest?.url?.includes('/user/login') ||
            originalRequest?.url?.includes('/user/verify-login-otp');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshEndpoint &&
            !isAuthEndpoint
        ) {
            if (isRefreshing) {
                // Another refresh is already in progress — wait for it
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.post('/user/refresh');
                localStorage.setItem('token', data.token);

                // Update user in localStorage if returned
                if (data.id) localStorage.setItem('user', JSON.stringify(data));

                document.cookie =
                    `${COOKIE_NAME}=${data.token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;

                isRefreshing = false;
                onRefreshed(data.token);

                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;

                // Refresh failed — clear auth state and redirect to login
                clearAuthState();

                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login?expired=true';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default api;