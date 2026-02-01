import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, loginUser } from "../api"; // Ensure loginUser is imported
import { navigate } from "../router/navigate";
import styles from "./Login.module.css";
import { useState } from "react";

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // State for Worker/Admin Login
    const [workerEmail, setWorkerEmail] = useState("");
    const [workerPassword, setWorkerPassword] = useState("");
    const [role, setRole] = useState("worker"); // Default to worker

    // Google Login Hook (Student)
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError("");
                
                // Fetch basic google info if needed, or just send token to backend
                // const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", ...);

                const { data } = await googleAuth(tokenResponse.access_token);

                // Store user info
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("role", "student");

                if (data.needsOnboarding) {
                    navigate("/onboard");
                } else {
                    navigate("/dashboard");
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error || "Login Failed";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError("Google Login Failed");
        },
    });

    // Handle Worker/Admin Login
    const handleStaffLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            console.log(`Logging in as ${role}...`, workerEmail);

            // Send email, password, AND role to backend
            const { data } = await loginUser({ 
                email: workerEmail, 
                password: workerPassword,
                role: role 
            });

            console.log("Login Success", data);

            // Store user info
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.role);

            // Navigate based on role
            if (data.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/worker/dashboard");
            }

        } catch (err) {
            const msg = err.response?.data?.error || "Invalid credentials. Please try again.";
            setError(msg);
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
                                    <img className={styles.googleIcon} src="google.svg" alt="G" />
                                </div>
                                <span className={styles.btnText}>
                                    {!isLoading ? "Sign in with Google" : "Verifying..."}
                                </span>
                            </button>
                        </div>

                        <div className={styles.workerSection}>
                            <h2 className={styles.loginTitle}>Staff Login</h2>

                            <form className={styles.loginForm} onSubmit={handleStaffLogin}>
                                {/* Role Selection Dropdown */}
                                <div className={styles.formGroup}>
                                    <select
                                        className={styles.selectField}
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="worker">Worker</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

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
                                    {isLoading ? "Verifying..." : "Login as " + (role === 'admin' ? "Admin" : "Worker")}
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