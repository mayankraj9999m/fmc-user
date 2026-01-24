import { useGoogleLogin } from "@react-oauth/google"; // Import the hook
import { googleAuth } from "../api";
import { navigate } from "../router/navigate";
import styles from "./Login.module.css";
import { useState } from "react";
import axios from "axios"; // You likely need axios to fetch user info

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // State for Worker/Admin Login
    const [workerEmail, setWorkerEmail] = useState("");
    const [workerPassword, setWorkerPassword] = useState("");

    // Initialize the hook for custom login
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError("");

                // 1. Get User Info using the access token from Google
                const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                console.log("User Info from Google:", userInfo.data);

                // 2. Send this data to your backend
                // NOTE: You might need to update your googleAuth api to accept
                // the access_token or the userInfo object instead of the 'credential' string.
                const { data } = await googleAuth(tokenResponse.access_token);

                // ... OR if your backend specifically needs the user data:
                // const { data } = await googleAuth(userInfo.data);

                console.log("Backend Response:", data);

                // Store user info
                localStorage.setItem("user", JSON.stringify(data.user));

                if (data.needsOnboarding) {
                    navigate("/onboard");
                } else {
                    navigate("/dashboard");
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error || "Login Failed";
                setError(errorMessage);
                console.error("Login Error:", errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError("Google Login Failed");
            console.log("Login Failed");
        },
    });

    // Handle Worker/Admin Login
    const handleWorkerLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            console.log("Logging in worker...", workerEmail, workerPassword);

            // TODO: Replace with your actual backend API call
            // const { data } = await workerAuth({ email: workerEmail, password: workerPassword });

            // For now, simulate a delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // localStorage.setItem("user", JSON.stringify(data.user));
            // navigate("/worker-dashboard");
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <div className={styles.leftColumn}>
                        <div className={styles.logoSection}>
                            <h1 className={styles.title}>FixMyCampus</h1>
                            <p className={styles.subtitle}>NIT Delhi</p>
                        </div>

                        <div className={styles.descriptionSection}>
                            <p className={styles.description}>
                                Welcome to FixMyCampus - Your Voice for Campus Improvements
                            </p>
                            <p className={styles.tagline}>Report issues and collaborate to make NIT Delhi better</p>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.loginSection}>
                            <h2 className={styles.loginTitle}>Student Login</h2>

                            <button className={styles.googleBtn} onClick={() => login()} disabled={isLoading}>
                                <div className={styles.googleIconWrapper}>
                                    <img className={styles.googleIcon} src="google.svg" />
                                </div>
                                <span className={styles.btnText}>
                                    {!isLoading ? "Sign in with Google" : "Verifying your account..."}
                                </span>
                            </button>

                            {/* {isLoading && <div className={styles.loadingMessage}>Verifying your account...</div>} */}
                        </div>

                        <div className={styles.workerSection}>
                            <h2 className={styles.loginTitle}>Worker/Admin Login</h2>

                            <form className={styles.loginForm} onSubmit={handleWorkerLogin}>
                                <div className={styles.formGroup}>
                                    <input
                                        type="email"
                                        className={styles.inputField}
                                        placeholder="Email Address"
                                        value={workerEmail}
                                        onChange={(e) => setWorkerEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <input
                                        type="password"
                                        className={styles.inputField}
                                        placeholder="Password"
                                        value={workerPassword}
                                        onChange={(e) => setWorkerPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Login"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className={styles.footerInfo}>
                    <p className={styles.footerText}>©️ Fix My Campus</p>
                </div>
            </div>

            <div className={styles.bgDecoration}></div>
        </div>
    );
};

export default Login;
