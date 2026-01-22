import axios from 'axios';

// Use relative path for production (same origin) or localhost for development
const isDevelopment = import.meta.env.MODE === 'development';
const API_URL = isDevelopment ? 'http://localhost:4115/api' : '/api';
export const API_BASE_URL = isDevelopment ? 'http://localhost:4115' : '';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (data: { email: string; password: string; name: string; phone?: string; address?: string }) =>
        api.post('/auth/register', data),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
        api.put('/auth/profile', data),

    googleLogin: () => {
        window.location.href = `${API_URL}/auth/google`;
    },
};

// Motor API
export const motorAPI = {
    getAll: (params?: { brand?: string; search?: string; minPrice?: number; maxPrice?: number }) =>
        api.get('/motors', { params }),

    getById: (id: string) => api.get(`/motors/${id}`),

    getBrands: () => api.get('/motors/brands'),

    create: (data: { name: string; brand: string; model: string; year: number; price: number; stock: number; image?: string; description?: string }) =>
        api.post('/motors', data),

    update: (id: string, data: Partial<{ name: string; brand: string; model: string; year: number; price: number; stock: number; image?: string; description?: string }>) =>
        api.put(`/motors/${id}`, data),

    delete: (id: string) => api.delete(`/motors/${id}`),
};

// Staff API
export const staffAPI = {
    getAll: (role?: 'CASHIER' | 'DRIVER') =>
        api.get('/staff', { params: { role } }),

    register: (data: { email: string; password: string; name: string; phone?: string; role: 'CASHIER' | 'DRIVER' }) =>
        api.post('/staff/register', data),

    delete: (id: string) => api.delete(`/staff/${id}`),
};

// Transaction API
export const transactionAPI = {
    create: (data: {
        motorId: string;
        quantity?: number;
        paymentMethod?: string;
        shippingAddress?: string;
        shippingProvince?: string;
        shippingCity?: string;
        shippingDistrict?: string;
        shippingVillage?: string;
        shippingPostalCode?: string;
        shippingPhone?: string;
        latitude?: number | null;
        longitude?: number | null;
    }) => api.post('/transactions', data),

    getMy: () => api.get('/transactions/my'),

    getAll: (status?: string) => api.get('/transactions', { params: { status } }),

    getPending: () => api.get('/transactions/pending'),

    process: (id: string, status: string) =>
        api.put(`/transactions/${id}/process`, { status }),

    assignDelivery: (data: { transactionId: string; driverId: string; address: string }) =>
        api.post('/transactions/assign-delivery', data),

    getStats: () => api.get('/transactions/stats'),
};

// Delivery API
export const deliveryAPI = {
    getMy: (status?: string) => api.get('/deliveries/my', { params: { status } }),

    getAll: (status?: string) => api.get('/deliveries', { params: { status } }),

    getDrivers: () => api.get('/deliveries/drivers'),

    updateStatus: (id: string, status: string, notes?: string) =>
        api.put(`/deliveries/${id}/status`, { status, notes }),

    complete: (id: string) => api.put(`/deliveries/${id}/complete`),
};

// User API
export const userAPI = {
    getAll: () => api.get('/users'),

    getDashboard: () => api.get('/users/dashboard'),

    getReports: () => api.get('/users/reports'),

    getProfile: () => api.get('/users/profile'),

    updateProfile: (data: any) => api.put('/users/profile', data),

    uploadProfileImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/users/profile/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// Upload API
export const uploadAPI = {
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};



export default api;
