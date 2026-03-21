import { Link } from "react-router"; 
import { AlertTriangle, Home } from "lucide-react";
import styles from "./NotFound.module.css";

const NotFound = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <AlertTriangle className={styles.warningIcon} />
                </div>
                
                <h1 className={styles.errorCode}>404</h1>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.description}>
                    Oops! The page you are looking for doesn't exist or has been moved.
                </p>
                
                <div className={styles.actionContainer}>
                    <Link to="/" className={styles.homeButton}>
                        <Home size={18} /> Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;