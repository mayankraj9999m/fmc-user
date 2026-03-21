import "./App.css";

// Pages
import { ThemeProvider } from "./context/ThemeProvider";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import RootLayout from "./layouts/RootLayout.jsx";
import NotFound from "./components/NotFound.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <div>Home</div>,
            },
            // {
            //     path: "about",
            //     element: <About />,
            // },
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
