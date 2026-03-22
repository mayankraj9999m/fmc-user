// src/api.js
import axios from "axios";

const API = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true 
});

// 1. Google Auth (Students) - Now expects an Authorization Code
export const googleAuth = (code) => API.post("/auth/google", { code });

// ... the rest of your api.js remains unchanged

// 2. Email/Password Auth (Workers & Admins)
export const loginUser = (credentials) => API.post("/auth/login", credentials); // credentials = { email, password }

// 3. Logout (Clears Cookie)
export const logoutUser = () => API.post("/auth/logout");

// 4. Onboarding & Registration
export const onboardStudent = (data) => API.post("/student/onboard", data);

// Note: These admin routes should likely be protected. 
// Since we use cookies now, the backend middleware will handle verification automatically.
export const addWorker = (data) => API.post("/admin/add-worker", data);
export const createAdmin = (data) => API.post("/admin/create", data);
export const getProfile = () => API.get("/profile");