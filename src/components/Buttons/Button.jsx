import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";

export const Button = ({
    variant = "primary",
    isLoading = false,
    useIconForLoader = false,
    icon: Icon,
    children,
    topMargin,
    slim = false,
    danger,
    mobileHeader = false,
    mobileClass,
    ...props
}) => {
    return (
        <button
            className={
                mobileHeader
                    ? `${mobileHeader ? styles.mobileHeaderDanger : ""}  ${mobileClass}`
                    : `${styles.btn} ${styles[variant]} ${danger ? styles.danger : ""}`
            }
            disabled={isLoading || props.disabled}
            style={{ marginTop: topMargin ? "0.4rem" : 0, padding: slim ? "0.5rem 0.8rem" : "" }}
            {...props}
        >
            {isLoading ? (
                useIconForLoader ? (
                    Icon && <Icon size={18} className={styles.spin} />
                ) : (
                    <Loader2 size={18} className={styles.spin} />
                )
            ) : (
                Icon && <Icon size={18} />
            )}
            {children}
        </button>
    );
};
