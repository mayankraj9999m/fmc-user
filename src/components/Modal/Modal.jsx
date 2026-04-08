// import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

const Modal = ({ isOpen, onClose, title, children, disableClose = false, maxWidth }) => {
    // useEffect(() => {
    //     if (isOpen) document.body.style.overflow = "hidden";
    //     else document.body.style.overflow = "unset";
    //     return () => {
    //         document.body.style.overflow = "unset";
    //     };
    // }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{ maxWidth: maxWidth || "var(--modal-max-width)" }}>
                <div className={styles.modalHeader}>
                    {title && <h2>{title}</h2>}
                    <button onClick={onClose} className={styles.closeBtn} disabled={disableClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.modalBody}>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
