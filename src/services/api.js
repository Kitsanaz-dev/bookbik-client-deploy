import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("bookbik_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    me: () => api.get("/auth/me"),
};

// Businesses
export const businessAPI = {
    list: (params) => api.get("/businesses", { params }),
    get: (id) => api.get(`/businesses/${id}`),
};

// Services
export const serviceAPI = {
    list: (business_id) => api.get("/services", { params: { business_id } }),
    get: (id) => api.get(`/services/${id}`),
};

// Resources
export const resourceAPI = {
    list: (business_id) => api.get("/resources", { params: { business_id } }),
    get: (id) => api.get(`/resources/${id}`),
};

// Availability
export const availabilityAPI = {
    get: (resource_id) => api.get("/availability", { params: { resource_id } }),
    checkDates: (service_id, start_date, end_date) =>
        api.get("/availability/check-dates", { params: { service_id, start_date, end_date } }),
};

// Bookings
export const bookingAPI = {
    create: (data) => api.post("/bookings", data),
    list: (params) => api.get("/bookings", { params }),
    get: (id) => api.get(`/bookings/${id}`),
    listForResource: (resource_id) => api.get("/bookings", { params: { resource_id, status: ['pending', 'confirmed'] } }),
    getResourceCalendar: (resource_id) => api.get("/bookings/resource-calendar", { params: { resource_id } }),
    checkAvailability: (params) =>
        api.get("/bookings/check-availability", { params }),
    cancel: (id, data) => api.post(`/bookings/${id}/cancel`, data),
    postpone: (id, data) => api.post(`/bookings/${id}/postpone`, data),
    confirmPayment: (id) => api.post(`/bookings/${id}/confirm-payment`),
    deleteDraft: (id) => api.delete(`/bookings/${id}/draft`),
};

// Favorites
export const favoritesAPI = {
    list: () => api.get("/favorites"),
    toggle: (id, type) => api.post(`/favorites/${id}/toggle`, { type }),
};

export default api;
