// src/pages/AuthCallback.jsx
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { googleAuth } from "../../api";
import LoadingScreen from "../LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";

const AuthCallback = () => {
    const { refreshProfile } = useAuth();
    const { showAlert } = useAlert();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Use a ref to prevent double-firing the API call in React.StrictMode
    const hasFetched = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");
        
        if (code && !hasFetched.current) {
            hasFetched.current = true;
            
            // Send the code to your Node.js backend
            googleAuth(code)
                .then(async (response) => {
                    await refreshProfile();
                    console.log("Student successfully verified:", response.data);
                    // Redirect to the dashboard/home after successful login
                    navigate("/", { replace: true });
                })
                .catch((error) => {
                    console.error("Backend verification failed:", error.response?.data?.error);
                    showAlert(error.response?.data?.error, "error");
                    // Redirect back to login so they can try again
                    navigate("/login", { replace: true });
                });
                
        } else if (!code && !hasFetched.current) {
            // If someone navigates to /auth/callback manually without a code
            navigate("/login", { replace: true });
        }
    }, [searchParams, navigate, refreshProfile, showAlert]);

    return <LoadingScreen message="Verifying your institutional account..." />;
};

export default AuthCallback;