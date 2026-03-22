// src/pages/Login.jsx
import { useState, useEffect, useRef } from "react";
import { GraduationCap, ShieldCheck, Mail, Lock } from "lucide-react";
import { loginUser } from "../api";
import styles from "./Auth.module.css";

const CLIENT_ID = "999538032208-1dda3kb83ddiaiaunrdeiueno10dabsg.apps.googleusercontent.com";

const Login = () => {
    const [loginType, setLoginType] = useState("student");
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    // 1. Setup refs and state for the sliding pill
    const clientRef = useRef(null);
    const tabsRef = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    // 2. Sliding Indicator Logic (identical to Header.jsx)
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
    }, [loginType]); // Re-run whenever the loginType changes

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

    const handleStaffLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(credentials);
            console.log("Logged in successfully", response.data);
            // TODO: Redirect to dashboard
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleGoogleLogin = () => {
        if (clientRef.current) {
            clientRef.current.requestCode(); // This redirects the browser to Google
        } else {
            console.error("Google script has not loaded yet.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Login</h1>
                    <p className={styles.subtitle}>Login to your account</p>
                </div>

                <div className={styles.tabContainer}>
                    {/* 3. Render the sliding pill */}
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
                        onClick={() => setLoginType("student")}
                    >
                        <GraduationCap size={18} /> Student
                    </button>
                    <button
                        ref={(el) => (tabsRef.current["staff"] = el)}
                        className={`${styles.tab} ${loginType === "staff" ? styles.active : ""}`}
                        onClick={() => setLoginType("staff")}
                    >
                        <ShieldCheck size={18} /> Staff / Admin
                    </button>
                </div>

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
                        <div className={styles.notice}>
                            <strong>Note:</strong> Only students marked as "Verified Hostellers" from the official
                            allotment list can log in. Non-hostellers are blocked from accessing the system.
                        </div>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleStaffLogin}>
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
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            Secure Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
