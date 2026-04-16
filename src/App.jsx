import "./App.css";

// Pages
import { ThemeProvider } from "./context/ThemeProvider";

import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import RootLayout from "./layouts/RootLayout.jsx";
import NotFound from "./components/NotFound.jsx";
import Login from "./pages/Auth/Login.jsx";
// import SignUp from "./pages/Auth/SignUp.jsx";
import Profile from "./pages/Auth/Profile.jsx";
import AuthCallback from "./pages/Auth/AuthCallback.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { AlertProvider } from "./context/AlertProvider.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ChiefWardenDashboard from "./pages/Admin/ChiefWardenDashboard.jsx";
import WardenDashboard from "./pages/Admin/WardenDashboard.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import StudentComplaints from "./pages/Student/StudentComplaints.jsx";
import WorkerDashboard from "./pages/Student/WorkerDashboard.jsx";
import Home from "./pages/Home/Home.jsx";

// --- INLINE ROUTE GUARD (The "Old Way") ---
// This checks the AuthContext before rendering the element.
const RoleGuard = ({ element, allowedRole }) => {
    const { user, role, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>; // Show a loader while fetching profile
    if (!user) return <Navigate to="/login" replace />; // Not logged in

    // If a specific role is required and the user doesn't match it, redirect them
    // (You can change "/" to a custom unauthorized page if you want)
    if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;

    return element;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Home/>,
            },
            {
                path: "login",
                element: <Login />,
            },
            // {
            //     path: "signup",
            //     element: <SignUp />,
            // },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "auth/callback",
                element: <AuthCallback />,
            },
            {
                path: "admin/student-dashboard",
                element: <AdminDashboard />,
            },
            {
                path: "admin/chiefwarden-dashboard",
                element: <ChiefWardenDashboard />,
            },
            { path: "admin/warden-dashboard", element: <WardenDashboard /> },
            {
                path: "student/complaints",
                element: <RoleGuard element={<StudentComplaints />} allowedRole="student" />,
            },
            {
                path: "worker/dashboard",
                element: <RoleGuard element={<WorkerDashboard />} allowedRole="worker" />,
            },
            { path: "*", element: <NotFound /> },
        ],
    },
]);

const App = () => {
    return (
        <ThemeProvider>
            <AlertProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </AlertProvider>
        </ThemeProvider>
    );
};

export default App;
