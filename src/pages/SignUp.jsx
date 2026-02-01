import { useEffect } from "react";
import { createAdmin, getProfile } from "../api";
// import { navigate } from "../router/navigate";
import Link from "../router/Link";
import styles from "./Login.module.css";
import { useState } from "react";
import { navigate } from "../router/navigate";
import LoadingScreen from "./LoadingScreen";

const Signup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        hostel_name: "Dhauladhar",
        position: "",
        masterKey: "",
    });

    const [checking, setChecking] = useState(true);

    // --- SECURE AUTH CHECK ---
    useEffect(() => {
        const verifySession = async () => {
            try {
                // If this call succeeds, the cookie is valid
                await getProfile();
                navigate("/profile");
            } catch {
                // If fails (401/403), user is not logged in. 
                localStorage.removeItem("user");
                localStorage.removeItem("role");
            } finally {
                setChecking(false);
            }
        };
        verifySession();
    }, []);
    // -------------------------

    const handleAdminSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            await createAdmin(formData);
            setSuccessMsg("Admin Account Created! Redirecting to login...");

            // setTimeout(() => {
            //     navigate("/login");
            // }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Signup Failed. Check Master Key.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (checking) {
        return <LoadingScreen message="Verifying Session..." />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <div className={styles.leftColumn}>
                        <div className={styles.logoSection}>
                            <h1 className={styles.title}>Create Admin Account</h1>
                            <p className={styles.subtitle}>e.g., Warder, Caretaker, etc</p>
                        </div>
                        <div className={styles.descriptionSection}>
                            <p className={styles.description}>Help us maintain and improve NIT Delhi.</p>
                            <p className={styles.tagline}>
                                Already have an account?{" "}
                                <Link href="/login" className={styles.link}>
                                    Login here
                                </Link>
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <span className={styles.errorIcon}>⚠️</span> {error}
                            </div>
                        )}
                        {successMsg && (
                            <div
                                className={styles.successMessage}
                                style={{ color: "green", padding: "10px", background: "#e6fffa", borderRadius: "5px" }}
                            >
                                ✅ {successMsg}
                            </div>
                        )}
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.workerSection} style={{ border: "none", marginTop: 0 }}>
                            <h2 className={styles.loginTitle}>Admin Registration</h2>
                            <form className={styles.loginForm} onSubmit={handleAdminSignup}>
                                {/* Master Key */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="masterKey" className={styles.inputLabel}>
                                        Master Admin Key
                                    </label>
                                    <input
                                        id="masterKey"
                                        type="password"
                                        name="masterKey"
                                        className={styles.inputField}
                                        placeholder="Enter secure key"
                                        value={formData.masterKey}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* Name & Phone (Side by Side) */}
                                <div className={styles.formGroup} style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="name" className={styles.inputLabel}>
                                            Full Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            className={styles.inputField}
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="phone" className={styles.inputLabel}>
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            type="text"
                                            name="phone"
                                            className={styles.inputField}
                                            placeholder="+91..."
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.inputLabel}>
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className={styles.inputField}
                                        placeholder="admin@nitdelhi.ac.in"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {/* Hostel & Position (Side by Side) */}
                                <div className={styles.formGroup} style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="hostel_name" className={styles.inputLabel}>
                                            Select Hostel
                                        </label>
                                        <select
                                            id="hostel_name"
                                            name="hostel_name"
                                            className={styles.selectField}
                                            value={formData.hostel_name}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Dhauladhar">Dhauladhar</option>
                                            <option value="Yamuna">Yamuna</option>
                                            <option value="Shivalik">Shivalik</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor="position" className={styles.inputLabel}>
                                            Position
                                        </label>
                                        <input
                                            id="position"
                                            type="text"
                                            name="position"
                                            className={styles.inputField}
                                            placeholder="e.g. Warden"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="password" className={styles.inputLabel}>
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className={styles.inputField}
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                    {isLoading ? "Creating Account..." : "Create Admin Account"}
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

export default Signup;
