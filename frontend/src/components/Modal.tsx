import React, { useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({
  title,
  children,
  footer,
  onClose,
  width,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
       
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} style={width ? { width } : undefined}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>{title}</div>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}