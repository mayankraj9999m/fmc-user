import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const googleAuth = (token) => API.post("/auth/google", { token });
export const onboardStudent = (data) => API.post("/student/onboard", data);
export const addWorker = (data) => API.post("/admin/add-worker", data);
export const createAdmin = (data) => API.post("/admin/create", data);
