import { Link } from "react-router";
import { MapPin, Mail, Phone } from "lucide-react";
import styles from "./Footer.module.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const lastUpdated = "March 2026"; 

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    {/* Column 1: Brand & Logo */}
                    <div className={styles.brandCol}>
                        <div className={styles.logoWrapper}>
                            <img src={"/logo_final.png"} alt="Institute Logo" className={styles.logo} />
                            <h3 className={styles.brandName}>Fix My Campus</h3>
                        </div>
                        <p className={styles.brandDesc}>
                            The official AI-enabled hostel complaint resolution and management system for the National Institute of Technology Delhi.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className={styles.linksCol}>
                        <h4 className={styles.colTitle}>Quick Links</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/">Home Dashboard</Link></li>
                            <li><Link to="/login">Student Login</Link></li>
                            <li><Link to="/signup">Activate Account</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Details */}
                    <div className={styles.contactCol}>
                        <h4 className={styles.colTitle}>Contact Us</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <MapPin size={18} className={styles.icon} />
                                <span>Sector A-7, Institutional Area, Narela, Delhi - 110040</span>
                            </li>
                            <li>
                                <Phone size={18} className={styles.icon} />
                                <span>+91 11 3386 1005 (Hostel Office)</span>
                            </li>
                            <li>
                                <Mail size={18} className={styles.icon} />
                                <a href="mailto:admin@nitdelhi.ac.in">admin@nitdelhi.ac.in</a>
                            </li>
                        </ul>
                    </div>
                    
                </div>

                {/* Bottom Bar: Copyright & Last Updated */}
                <div className={styles.bottomSection}>
                    <p className={styles.copyright}>
                        &copy; {currentYear} FixMyCampus - NIT Delhi. All rights reserved.
                    </p>
                    <p className={styles.lastUpdated}>
                        Last Updated: {lastUpdated}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;