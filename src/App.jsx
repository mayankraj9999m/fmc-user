import "./App.css";

// Pages
import { ThemeProvider } from "./context/ThemeProvider";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import RootLayout from "./layouts/RootLayout.jsx";
import NotFound from "./components/NotFound.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

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
                path: "auth/callback",
                element: <AuthCallback />,
            },
            { path: "*", element: <NotFound /> },
        ],
    },
]);

const App = () => {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    );
};

export default App;
