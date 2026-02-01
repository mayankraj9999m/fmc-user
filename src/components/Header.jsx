import { useState, useEffect, useRef } from "react";
import { AlertCircle, LogIn, Menu, Moon, Sun, X, UserCircle } from "lucide-react";
import Link from "../router/Link";
import { useLocation } from "../router/useLocation";
import styles from "./Header.module.css";
import { useTheme } from "../context/ThemeContext";

const navItems = [
    { path: "/login", label: "Login", icon: LogIn },
    { path: "/signup", label: "SignUp", icon: LogIn },
    { path: "/profile", label: "Profile", icon: UserCircle },
    { path: "/broken", label: "404", icon: AlertCircle },
];

const Header = () => {
    const currentPath = useLocation();
    const { theme, toggleTheme } = useTheme();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const [headerHeight, setHeaderHeight] = useState(0);

    // Refs
    const tabsRef = useRef({}); // object having path as key mapped to the header tab element
    const headerRef = useRef(null); // selects the header of the app

    // --- 1. Path Logic (Strict + Clean) ---
    const getActivePath = () => {
        // Handle malformed URLs
        if (currentPath.includes("//")) {
            return "/broken";
        }

        const foundItem = navItems.find((item) => {
            if (item.path === "/broken") return false;

            // Strict Home
            if (item.path === "/") return currentPath === "/";

            // Sub-path matching (e.g. /projects/1 matches /projects)
            return currentPath === item.path || currentPath.startsWith(item.path + "/");
        });

        if (foundItem) return foundItem.path;

        return "/broken";
    };

    const activePath = getActivePath();

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
            }
        };

        // Run initially
        updateIndicator();

        // Recalculate on window resize (Responsive fix)
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [activePath]);

    // --- 3. Dynamic Spacer Logic (Prevents layout overlap) ---
    useEffect(() => {
        if (!headerRef.current) return;

        // ResizeObserver detects if the header size changes (e.g., mobile wrap)
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
                    {/* Logo */}
                    <Link href="/">
                        <div className={styles.logo}>Fix My Campus</div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className={styles.desktopMenu}>
                        {/* The Sliding Pill */}
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
                                    href={item.path}
                                    // Capture DOM element for calculation
                                    ref={(el) => (tabsRef.current[item.path] = el)}
                                    className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Controls (Theme + Mobile) */}
                    <div className={styles.controls}>
                        <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Dark Mode">
                            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(!isMobileOpen)}>
                            {isMobileOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`${styles.mobileMenu} ${isMobileOpen ? styles.open : ""}`}>
                    {navItems.map((item) => {
                        const isActive = item.path === activePath;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.mobileLink} ${isActive ? styles.active : ""}`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Spacer to push content down so it's not hidden behind fixed header */}
            <div style={{ height: headerHeight, transition: "height 0.2s ease", flexShrink: 0 }} />
        </>
    );
};

export default Header;
