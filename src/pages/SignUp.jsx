import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, createAdmin } from "../api"; // You need to ensure createAdmin is in api.js
import { navigate } from "../router/navigate";
import Link from "../router/Link"; // Assuming you have a Link component
import styles from "./Login.module.css"; // Reuse Login styles
import { useState } from "react";

const Signup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // State for Admin Signup
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        hostel_name: "Dhauladhar", // Default enum
        position: "Warden",
        masterKey: "" // Critical for Admin creation
    });

    const [role, setRole] = useState("student"); // 'student' or 'admin'

    // --- 1. Student Signup (Google) ---
    const googleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError("");
                const { data } = await googleAuth(tokenResponse.access_token);
                
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("role", "student");

                if (data.needsOnboarding) {
                    navigate("/onboard");
                } else {
                    navigate("/dashboard");
                }
            } catch (err) {
                setError(err.response?.data?.error || "Google Signup Failed");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError("Google Signup Failed"),
    });

    // --- 2. Admin Signup (Form) ---
    const handleAdminSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            console.log("Creating Admin...", formData);
            // Call the backend API
            const { data } = await createAdmin(formData);
            
            setSuccessMsg("Admin Account Created! Redirecting to login...");
            
            // Optional: Auto-redirect after success
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "Signup Failed. Check Master Key.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    {/* Left Side: Branding */}
                    <div className={styles.leftColumn}>
                        <div className={styles.logoSection}>
                            <h1 className={styles.title}>Join FixMyCampus</h1>
                            <p className={styles.subtitle}>Create your account</p>
                        </div>
                        <div className={styles.descriptionSection}>
                            <p className={styles.description}>
                                Help us maintain and improve NIT Delhi.
                            </p>
                            <p className={styles.tagline}>
                                Already have an account? <Link href="/login" className={styles.link}>Login here</Link>
                            </p>
                        </div>
                        
                        {/* Feedback Messages */}
                        {error && (
                            <div className={styles.errorMessage}>
                                <span className={styles.errorIcon}>⚠️</span> {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className={styles.successMessage} style={{ color: 'green', padding: '10px', background: '#e6fffa', borderRadius: '5px' }}>
                                ✅ {successMsg}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Forms */}
                    <div className={styles.rightColumn}>
                        
                        {/* Role Toggle Tabs */}
                        <div className={styles.toggleContainer} style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                            <button 
                                type="button"
                                className={`${styles.submitBtn} ${role !== 'student' ? styles.inactiveBtn : ''}`} 
                                onClick={() => setRole("student")}
                                style={{ opacity: role === 'student' ? 1 : 0.5 }}
                            >
                                Student
                            </button>
                            <button 
                                type="button"
                                className={`${styles.submitBtn} ${role !== 'admin' ? styles.inactiveBtn : ''}`}
                                onClick={() => setRole("admin")}
                                style={{ opacity: role === 'admin' ? 1 : 0.5 }}
                            >
                                Admin
                            </button>
                        </div>

                        {/* --- STUDENT VIEW --- */}
                        {role === "student" && (
                            <div className={styles.loginSection}>
                                <div>
                                    <h2 className={styles.loginTitle}>Student Signup</h2>
                                    <p style={{marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                                        Use college email
                                    </p>
                                </div>
                                <button className={styles.googleBtn} onClick={() => googleSignup()} disabled={isLoading}>
                                    <div className={styles.googleIconWrapper}>
                                        <img className={styles.googleIcon} src="google.svg" alt="G" />
                                    </div>
                                    <span className={styles.btnText}>
                                        {isLoading ? "Verifying..." : "Sign up with Google"}
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* --- ADMIN VIEW --- */}
                        {role === "admin" && (
                            <div className={styles.workerSection} style={{ border: 'none', marginTop: 0 }}>
                                <h2 className={styles.loginTitle}>Admin Registration</h2>
                                <form className={styles.loginForm} onSubmit={handleAdminSignup}>
                                    
                                    {/* Master Key Field */}
                                    <div className={styles.formGroup}>
                                        <input type="password" name="masterKey" className={styles.inputField} placeholder="Master Admin Key (Required)" value={formData.masterKey} onChange={handleInputChange} required />
                                    </div>

                                    <div className={styles.formGroup} style={{display:'flex', gap:'10px'}}>
                                        <input type="text" name="name" className={styles.inputField} placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
                                        <input type="text" name="phone" className={styles.inputField} placeholder="Phone No." value={formData.phone} onChange={handleInputChange} required />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <input type="email" name="email" className={styles.inputField} placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                                    </div>

                                    <div className={styles.formGroup} style={{display:'flex', gap:'10px'}}>
                                        <select name="hostel_name" className={styles.selectField} value={formData.hostel_name} onChange={handleInputChange}>
                                            <option value="Dhauladhar">Dhauladhar</option>
                                            <option value="Yamuna">Yamuna</option>
                                            <option value="Shivalik">Shivalik</option>
                                        </select>
                                        <input type="text" name="position" className={styles.inputField} placeholder="Position (e.g. Warden)" value={formData.position} onChange={handleInputChange} required />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <input type="password" name="password" className={styles.inputField} placeholder="Create Password" value={formData.password} onChange={handleInputChange} required />
                                    </div>

                                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                        {isLoading ? "Creating Account..." : "Create Admin Account"}
                                    </button>
                                </form>
                            </div>
                        )}
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

export default Signup;