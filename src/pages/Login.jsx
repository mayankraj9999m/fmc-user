import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, loginUser } from "../api"; 
import { navigate } from "../router/navigate";
import styles from "./Login.module.css";
import { useState } from "react";

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isStaffLogging, setIsStaffLogging] = useState(false);
    const [error, setError] = useState("");

    const [staffEmail, setStaffEmail] = useState("");
    const [staffPassword, setStaffPassword] = useState("");
    const [role, setRole] = useState("worker");

    // Student login using Gmail of NIT Delhi only
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError("");
                const { data } = await googleAuth(tokenResponse.access_token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("role", "student");

                if (data.needsOnboarding) navigate("/onboard");
                else navigate("/dashboard");
            } catch (error) {
                setError(error.response?.data?.error || "Login Failed");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError("Google Login Failed"),
    });

    // Staff login using Email + Password
    const handleStaffLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsStaffLogging(true);
        try {
            const { data } = await loginUser({ email: staffEmail, password: staffPassword, role: role });
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.role);
            if (data.role === "admin") navigate("/admin/dashboard");
            else navigate("/worker/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Invalid credentials.");
        } finally {
            setIsStaffLogging(false);
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
                            <p className={styles.description}>Welcome to FixMyCampus</p>
                            <p className={styles.tagline}>Report issues and collaborate to make NIT Delhi better</p>
                        </div>
                        {error && (
                            <div className={styles.errorMessage}>
                                <span className={styles.errorIcon}>⚠️</span>{error}
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
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="role" className={styles.inputLabel}>Select Role</label>
                                    <select
                                        id="role"
                                        name="role"
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
                                    <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className={styles.inputField}
                                        placeholder="Enter your email"
                                        value={staffEmail}
                                        onChange={(e) => setStaffEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        autoComplete="username"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="password" className={styles.inputLabel}>Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className={styles.inputField}
                                        placeholder="Enter your password"
                                        value={staffPassword}
                                        onChange={(e) => setStaffPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                    {isStaffLogging ? "Verifying..." : "Login as " + (role === 'admin' ? "Admin" : "Worker")}
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