import styles from "./DetailItem.module.css";

export const DetailItem = ({ icon: Icon, label, value }) => {
    return (
        <div className={styles.detailItem}>
            <div className={styles.iconWrapper}>{Icon && <Icon size={20} />}</div>
            <div className={styles.detailContent}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
            </div>
        </div>
    );
};
