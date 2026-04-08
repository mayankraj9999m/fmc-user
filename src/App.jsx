import "./App.css";

// Pages
import { ThemeProvider } from "./context/ThemeProvider";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import RootLayout from "./layouts/RootLayout.jsx";
import NotFound from "./components/NotFound.jsx";
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import Profile from "./pages/Auth/Profile.jsx";
import AuthCallback from "./pages/Auth/AuthCallback.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { AlertProvider } from "./context/AlertProvider.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ChiefWardenDashboard from "./pages/Admin/ChiefWardenDashboard.jsx";
import WardenDashboard from "./pages/Admin/WardenDashboard.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <div>Home</div>,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "signup",
                element: <SignUp />,
            },
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
