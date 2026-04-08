import styles from "./NoticeBox.module.css";

export function NoticeBox({ children, urgent, success, ...props }) {
    return (
        <div
            className={`${styles.noticeBox} ${urgent ? `${styles.urgent}` : ""} ${success ? `${styles.success}` : ""}`}
            {...props}
        >
            {children}
        </div>
    );
}
