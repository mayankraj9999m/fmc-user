import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

//* 1. Google Auth (Students) - Now expects an Authorization Code
//* 2. Email/Password Auth (Workers & Admins)
//* 3. Get Profile
//* 4. Logout (Clears Cookie)
export const googleAuth = (code) => API.post("/auth/google", { code });
export const loginUser = (credentials) => API.post("/auth/login", credentials); // credentials = { email, password }
export const getUserProfile = () => API.get("/auth/profile");
export const logoutUser = () => API.post("/auth/logout");

//* Student Routes
export const updateStudentProfile = (data) => API.put("/auth/student/profile", data);
export const onboardStudent = () => API.put("/auth/student/onboard");

//* Admin Student routes
export const uploadStudentsCsv = (formData) =>
    API.post("/admin/students/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getAllStudents = (page = 1, limit = 10, sortBy = "room_no", sortOrder = "ASC", search = "") => {
    return API.get(
        `/admin/students?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}`,
    );
};
export const updateStudent = (id, data) => API.put(`/admin/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/admin/students/${id}`);
export const bulkDeleteStudents = (data) => API.post(`/admin/students/bulk-delete`, data);
export const addStudent = (data) => API.post(`/admin/students/add`, data);
export const exportStudentsCsv = (sortBy = "room_no", sortOrder = "ASC", search = "") =>
    API.get(`/admin/students/export?sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}`, {
        responseType: "blob",
    });

//! --- Chief Warden Routes ---
export const getWardens = () => API.get("/admin/chief/wardens");
export const addWarden = (data) => API.post("/admin/chief/wardens", data);
export const updateWarden = (id, data) => API.put(`/admin/chief/wardens/${id}`, data);
export const deleteWarden = (id) => API.delete(`/admin/chief/wardens/${id}`);
export const updateAdminPassword = (data) => API.put("/auth/admin/profile/password", data); // data = { currentPassword, newPassword }
export const getHostelAnalytics = () => API.get("/admin/chief/hostel-analytics");

//! --- Warden/Worker Operations ---
export const getWorkers = () => API.get("/admin/warden/workers");
export const addWorker = (data) => API.post("/admin/warden/workers", data);
export const updateWorker = (id, data) => API.put(`/admin/warden/workers/${id}`, data);
export const deleteWorker = (id) => API.delete(`/admin/warden/workers/${id}`);
export const getWorkerPerformance = (department = "") =>
    API.get(`/admin/warden/performance?department=${encodeURIComponent(department)}`);
export const getWorkerComplaintsByWarden = (workerId, page = 1, limit = 10) =>
    API.get(`/admin/warden/workers/${workerId}/complaints?page=${page}&limit=${limit}`);

// Student Complaint Routes
export const getStudentComplaints = (page = 1, limit = 10, status = "") =>
    API.get(`/complaints/student/dashboard?page=${page}&limit=${limit}&status=${encodeURIComponent(status)}`);
export const lodgeComplaint = (formData) =>
    API.post("/complaints/student", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const escalateComplaint = (id) => API.put(`/complaints/student/${id}/escalate`);
export const submitComplaintFeedback = (id, data) => API.put(`/complaints/student/${id}/feedback`, data);

// Worker Complaint Routes
export const getWorkerComplaints = (page = 1, limit = 10, status = "") =>
    API.get(`/complaints/worker/dashboard?page=${page}&limit=${limit}&status=${encodeURIComponent(status)}`);
export const resolveComplaint = (id, formData) =>
    API.put(`/complaints/worker/${id}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// --- Announcement Routes ---
export const getAnnouncements = () => {
    return API.get(`/announcements`);
};

export const createAnnouncement = (data) => API.post("/announcements", data);