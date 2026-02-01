import styles from "./LoadingScreen.module.css";

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <span className={styles.loader}></span>
                <p className={styles.message}>{message}</p>
            </div>
            <div className={styles.bgDecoration}></div>
        </div>
    );
};

export default LoadingScreen;
