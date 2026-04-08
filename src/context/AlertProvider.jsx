import { useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X, HelpCircle } from "lucide-react";
import styles from "../components/CustomAlert.module.css";
import { AlertContext } from "./AlertContext";

export const AlertProvider = ({ children }) => {
    const [alertData, setAlertData] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    // type can be "info", "success", or "error"
    const showAlert = useCallback((message, type = "info") => {
        setAlertData({ message, type });
    }, []);

    const closeAlert = useCallback(() => {
        setAlertData(null);
    }, []);

    const showConfirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirmData({
                message,
                onConfirm: () => {
                    setConfirmData(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmData(null);
                    resolve(false);
                },
            });
        });
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* Standard Alert Popup */}
            {alertData && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <div className={styles.header}>
                            {alertData.type === "error" && <AlertCircle className={styles.iconError} />}
                            {alertData.type === "success" && <CheckCircle className={styles.iconSuccess} />}
                            {alertData.type === "info" && <Info className={styles.iconInfo} />}
                            <span className={styles.title}>
                                {alertData.type === "error"
                                    ? "Error"
                                    : alertData.type === "success"
                                      ? "Success"
                                      : "Notice"}
                            </span>
                            <button className={styles.closeIcon} onClick={closeAlert}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.body}>
                            {typeof alertData.message === "string" ? <p>{alertData.message}</p> : alertData.message}
                        </div>
                        <div className={styles.footer}>
                            <button className={styles.okBtn} onClick={closeAlert}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Popup */}
            {confirmData && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <div className={styles.header}>
                            <HelpCircle className={styles.iconInfo} />
                            <span className={styles.title}>Confirm Action</span>
                            <button className={styles.closeIcon} onClick={confirmData.onCancel}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.body}>
                            <p>{confirmData.message}</p>
                        </div>
                        <div className={styles.footer}>
                            <button className={styles.cancelBtn} onClick={confirmData.onCancel}>
                                Cancel
                            </button>
                            <button className={styles.okBtn} onClick={confirmData.onConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};
