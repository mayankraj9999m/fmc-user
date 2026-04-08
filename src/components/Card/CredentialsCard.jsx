import styles from "./CredentialsCard.module.css"

export default function CredentialsCard({details}) {
    return (
        <div className={styles.credentialsCard}>
            <h2 className={styles.title}>Account Created </h2>

            <div className={styles.field}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{details?.email}</span>
            </div>

            <div className={styles.field}>
                <span className={styles.label}>Password</span>
                <span className={styles.value}>{details?.password}</span>
            </div>
        </div>
    );
}
