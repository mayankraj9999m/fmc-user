import styles from "./FormElements.module.css";

export const FormRow = ({ children }) => <div className={styles.row}>{children}</div>;

export const Input = ({ label, slim, ...props }) => (
    <div className={styles.inputGroup}>
        {label && <label className={styles.label}>{label}</label>}
        <input className={`${styles.input} ${slim ? styles.slim : ""}`} {...props} />
    </div>
);

export const Select = ({ label, slim, options, ...props }) => (
    <div className={styles.inputGroup}>
        {label && <label className={styles.label}>{label}</label>}
        <select className={`${styles.select} ${slim ? styles.slim : ""}`} {...props}>
            <option value="" disabled hidden>
                Select {label}
            </option>
            {options.map((opt, index) => (
                <option key={index} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const FormActions = ({ children }) => <div className={styles.actions}>{children}</div>;

// export const Button = ({ variant = "primary", isLoading = false, icon: Icon, children, ...props }) => {
//     return (
//         <button className={`${styles.btn} ${styles[variant]}`} disabled={isLoading || props.disabled} {...props}>
//             {isLoading ? <Loader2 size={18} className={styles.spin} /> : Icon && <Icon size={18} />}
//             {children}
//         </button>
//     );
// };
