import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router"; // <-- Added for redirection
import { GraduationCap, ShieldCheck, Mail, Lock, AlertCircle, Users } from "lucide-react"; // <-- Added AlertCircle & Users
import { loginUser, devLogin } from "../../api";
import styles from "./Auth.module.css";
import { useAuth } from "../../context/AuthContext";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const Login = () => {
    const { role, user, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (role === "admin" || role === "worker") {
                navigate("/profile", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        }
    }, [user, role, loading, navigate]);

    const [loginType, setLoginType] = useState("student");
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    // --- NEW: Staff Login States ---
    const [staffRole, setStaffRole] = useState("admin"); // Default to admin, can be 'worker'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [devRollNo, setDevRollNo] = useState("");

    // 1. Setup refs and state for the sliding pill
    const clientRef = useRef(null);
    const tabsRef = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    // 2. Sliding Indicator Logic
    useEffect(() => {
        const updateIndicator = () => {
            const activeTab = tabsRef.current[loginType];
            if (activeTab) {
                setIndicatorStyle({
                    left: activeTab.offsetLeft,
                    width: activeTab.offsetWidth,
                    opacity: 1,
                });
            }
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [loginType]);

    // Initialize Google Identity Services Script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (window.google) {
                clientRef.current = window.google.accounts.oauth2.initCodeClient({
                    client_id: CLIENT_ID,
                    scope: "openid email profile",
                    ux_mode: "redirect",
                    redirect_uri: `${window.location.origin}/auth/callback`,
                });
            }
        };

        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    // --- UPDATED: Staff/Admin Login Handler ---
    const handleStaffLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null); // Clear previous errors

        try {
            // Include the selected role in the payload for the backend
            const payload = {
                email: credentials.email,
                password: credentials.password,
                role: staffRole,
            };

            const response = await loginUser(payload);
            console.log("Logged in successfully", response.data);

            await refreshProfile();
        } catch (err) {
            console.error("Login failed", err);
            // Extract error message from backend or use fallback
            setError(err.response?.data?.error || "Invalid credentials or server error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        if (clientRef.current) {
            clientRef.current.requestCode();
        } else {
            console.error("Google script has not loaded yet.");
        }
    };

    const handleDevLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await devLogin(devRollNo);
            await refreshProfile();
        } catch (err) {
            setError(err.response?.data?.error || "Dev login failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to switch tabs and clear errors
    const handleTabSwitch = (type) => {
        setLoginType(type);
        setError(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Login</h1>
                    <p className={styles.subtitle}>Login to your account</p>
                </div>

                <div className={styles.tabContainer}>
                    {/* Render the sliding pill */}
                    <div
                        className={styles.activePill}
                        style={{
                            left: `${indicatorStyle.left}px`,
                            width: `${indicatorStyle.width}px`,
                            opacity: indicatorStyle.opacity,
                        }}
                    />
                    <button
                        ref={(el) => (tabsRef.current["student"] = el)}
                        className={`${styles.tab} ${loginType === "student" ? styles.active : ""}`}
                        onClick={() => handleTabSwitch("student")}
                    >
                        <GraduationCap size={18} /> Student
                    </button>
                    <button
                        ref={(el) => (tabsRef.current["staff"] = el)}
                        className={`${styles.tab} ${loginType === "staff" ? styles.active : ""}`}
                        onClick={() => handleTabSwitch("staff")}
                    >
                        <ShieldCheck size={18} /> Staff / Admin
                    </button>
                </div>

                {/* --- NEW: Error Display --- */}
                {error && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem",
                            marginBottom: "1rem",
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            border: "1px solid #fca5a5",
                        }}
                    >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {loginType === "student" ? (
                    <div className={styles.form}>
                        <p className={styles.subtitle} style={{ textAlign: "center" }}>
                            Students must sign in using their official institutional email (@nitdelhi.ac.in).
                        </p>
                        <button
                            type="button"
                            className={`${styles.submitBtn} ${styles.googleBtn}`}
                            onClick={handleGoogleLogin}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                            Sign in with Google
                        </button>

                        {import.meta.env.DEV && (
                            <form onSubmit={handleDevLogin} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <div style={{ fontSize: "0.85rem", color: "#666", textAlign: "center" }}>--- OR (Dev Only) ---</div>
                                <div className={styles.inputWrapper}>
                                    <input 
                                        type="text" 
                                        placeholder="Enter Roll No (e.g. 21BCS019)" 
                                        className={styles.input}
                                        value={devRollNo}
                                        onChange={(e) => setDevRollNo(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                    {isLoading ? "Logging in..." : "Dev Login"}
                                </button>
                            </form>
                        )}
                        
                        <div className={styles.notice}>
                            <strong>Note:</strong> Only students marked as "Verified Hostellers" from the official
                            allotment list can log in. Non-hostellers are blocked from accessing the system.
                        </div>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleStaffLogin}>
                        {/* --- NEW: Role Selector --- */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Account Type</label>
                            <div className={styles.inputWrapper}>
                                <Users size={18} className={styles.inputIcon} />
                                <select
                                    className={styles.input}
                                    style={{ appearance: "auto", cursor: "pointer" }}
                                    value={staffRole}
                                    onChange={(e) => setStaffRole(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="admin">Administrator / Warden</option>
                                    <option value="worker">Service Staff / Worker</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="admin@nitdelhi.ac.in"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* --- UPDATED: Loading Button State --- */}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
                        >
                            {isLoading ? "Authenticating..." : "Secure Login"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
