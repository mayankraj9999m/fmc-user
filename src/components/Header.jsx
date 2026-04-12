import { useState, useEffect, useRef } from "react";
// 1. Import React Router components and hooks
import { Link, useLocation, useNavigate } from "react-router";
import { AlertCircle, LogIn, Menu, Moon, Sun, X, UserCircle, House, LogOut, Shield, Users, MessageSquare, ClipboardList } from "lucide-react";
import styles from "./Header.module.css";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api";
import { Button } from "./Buttons/Button";

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, role, logout } = useAuth();
    const location = useLocation(); // 2. Hook to get current URL state
    const navigate = useNavigate();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const [headerHeight, setHeaderHeight] = useState(0);

    const tabsRef = useRef({});
    const headerRef = useRef(null);

    // --- Dynamically generate Nav Items based on Auth State ---
    const navItems = [
        { path: "/", label: "Home", icon: House },
        ...(user
            ? [{ path: "/profile", label: "Profile", icon: UserCircle }]
            : [
                  { path: "/login", label: "Login", icon: LogIn },
                  { path: "/signup", label: "SignUp", icon: LogIn },
              ]),

        // --- NEW: Student Routes ---
        ...(user && role === "student"
            ? [{ path: "/student/complaints", label: "Complaints", icon: MessageSquare }]
            : []),

        // --- NEW: Worker Routes ---
        ...(user && role === "worker" ? [{ path: "/worker/dashboard", label: "Tasks", icon: ClipboardList }] : []),
        // General Students Dashboard visible to admins
        ...(user && role === "admin"
            ? [{ path: "/admin/student-dashboard", label: "Students Dashboard", icon: Users }]
            : []),
        // NEW: Chief Warden strictly visible only to Chief Warden
        ...(user && role === "admin" && user.position === "Chief Warden"
            ? [{ path: "/admin/chiefwarden-dashboard", label: "Chief Warden", icon: Shield }]
            : []),
        ...(user && role === "admin" && (user.position === "Hostel Warden" || user.position === "Associate Warden")
            ? [{ path: "/admin/warden-dashboard", label: "Warden", icon: Shield }]
            : []),
    ];

    // --- 1. Path Logic (Now using React Router's location) ---
    const getActivePath = () => {
        const currentPath = location.pathname;

        const foundItem = navItems.find((item) => {
            if (item.path === "/") return currentPath === "/";
            return currentPath === item.path || currentPath.startsWith(item.path + "/");
        });

        return foundItem ? foundItem.path : "/broken";
    };

    const activePath = getActivePath();

    // --- Logout Handler ---
    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Failed to clear cookie on server", error);
        }
        logout(); // Clear React context
        setIsMobileOpen(false);
        navigate("/login");
    };

    // --- 2. Sliding Indicator Logic ---
    useEffect(() => {
        const updateIndicator = () => {
            const activeTab = tabsRef.current[activePath];
            if (activeTab) {
                setIndicatorStyle({
                    left: activeTab.offsetLeft,
                    width: activeTab.offsetWidth,
                    opacity: 1,
                });
            } else {
                setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
            }
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [activePath, location.pathname]); // 3. Re-run when path changes

    // --- 3. Dynamic Spacer Logic ---
    useEffect(() => {
        if (!headerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.borderBoxSize[0].blockSize;
                setHeaderHeight(height);
                document.documentElement.style.setProperty("--header-height", `${height}px`);
            }
        });
        observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <nav className={styles.navContainer} ref={headerRef}>
                <div className={styles.glassBar}>
                    <Link to="/">
                        <img src="/logo.jpg" alt="site logo" className={styles.logo}></img>
                    </Link>

                    <div style={{ display: "flex" }}>
                        <div className={styles.desktopMenu}>
                            <div
                                className={styles.indicator}
                                style={{
                                    left: `${indicatorStyle.left}px`,
                                    width: `${indicatorStyle.width}px`,
                                    opacity: indicatorStyle.opacity,
                                }}
                            />

                            {navItems.map((item) => {
                                const isActive = item.path === activePath;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path} // 5. 'to' prop
                                        ref={(el) => (tabsRef.current[item.path] = el)}
                                        className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className={styles.controls}>
                            {/* --- User Name & Logout (Desktop) --- */}
                            {user && (
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>
                                        Hi, {user.name.split(" ")[0]} {/* Shows first name */}
                                    </span>
                                    <Button variant="secondary" onClick={() => handleLogout()} danger={true}>
                                        <LogOut size={16} />
                                        Logout
                                    </Button>
                                </div>
                            )}
                            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Dark Mode">
                                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(!isMobileOpen)}>
                                {isMobileOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`${styles.mobileMenu} ${isMobileOpen ? styles.open : ""}`}>
                    {/* --- User Name (Mobile) --- */}
                    {user && (
                        <div className={styles.mobileUserInfo}>
                            <UserCircle size={24} />
                            <div>
                                <p>Hi, {user.name}</p>
                                <p className={styles.email}>{user.email}</p>
                            </div>
                        </div>
                    )}

                    {navItems.map((item) => {
                        const isActive = item.path === activePath;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`${styles.mobileLink} ${isActive ? styles.active : ""}`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* --- Logout (Mobile) --- */}
                    {user && (
                        <Button
                            onClick={() => handleLogout()}
                            danger={true}
                            mobileHeader={true}
                            mobileClass={styles.mobileLink}
                            icon={LogOut}
                        >
                            Logout
                        </Button>
                    )}
                </div>
            </nav>
            <div style={{ height: headerHeight, transition: "height 0.2s ease" }} />
        </>
    );
};

export default Header;
