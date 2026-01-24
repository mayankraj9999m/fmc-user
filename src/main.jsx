import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

// REPLACE with your actual Client ID
const CLIENT_ID = "810474966863-8l93fc1n6shckh6an57rv4ah8026rr12.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={CLIENT_ID}>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>,
);
