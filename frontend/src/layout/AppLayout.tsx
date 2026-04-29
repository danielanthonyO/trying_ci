import React, { useState } from "react";
import { NavLink, Outlet } from "react-router";
import styles from "./AppLayout.module.css";
import logo from "../assets/Logo.png";
import { TextAlignJustify, X } from "lucide-react";
import { GrUserWorker } from "react-icons/gr";
import LanguageToggle from "../components/languageToggle/LanguageToggle";

import { useTranslation } from "react-i18next";

function Item({
  to,
  label,
  icon,
  end,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive ? `${styles.link} ${styles.active}` : styles.link
      }
      onClick={onClick}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const handleItemClick = () => {
    if (window.innerWidth < 900) setOpen(false);
  };
  return (
    <div className={styles.app}>
      {/* ----menu button for mobile responsiveness---- */}
      <button onClick={() => setOpen(true)} className={styles.menuBtn}>
        <TextAlignJustify />
      </button>
      {/* overlay */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}></div>
      )}
      <div className={styles.langBtn}>
        <LanguageToggle />
      </div>

      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.brand}>
          <img
            src={logo}
            alt="Leppävaaran Tietokonehuolto"
            className={styles.logoImage}
          />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Leppävaaran</div>
            <div className={styles.brandSub}>Tietokonehuolto</div>
          </div>
          <button onClick={() => setOpen(false)} className={styles.closeBtn}>
            <X />
          </button>
        </div>

        <nav className={styles.nav}>
          <Item
            to="/"
            end
            label={t("sidebar.dashboard")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-16h7v5h-7V4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            }
          />

          <div className={styles.sectionTitle}>
            {t("sidebar.sections.workspace")}
          </div>

          <Item
            to="/calendar"
            label={t("sidebar.calendar")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M7 3v3M17 3v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M4 7h16v14H4z" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11h4v4H8z" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />

          <Item
            to="/work-orders"
            label={t("sidebar.workOrders")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M6 3h12v18H6z" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 7h8M8 11h8M8 15h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <Item
            to="/customers"
            label={t("sidebar.customers")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20 21a8 8 0 1 0-16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <Item
            to="/invoices"
            label={t("sidebar.invoices")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M5 3h14v18H5z" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M7 7h10M7 12h10M7 17h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <Item
            to="/parts"
            label={t("sidebar.parts")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 3h6v4H9z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 17v4h6v-4" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
          <Item
            to="/users"
            label={t("sidebar.users")}
            onClick={handleItemClick}
            icon={<GrUserWorker size={18} />}
          />

          <div className={styles.sectionTitle}>
            {t("sidebar.sections.system")}
          </div>

          <Item
            to="/settings"
            label={t("sidebar.settings")}
            onClick={handleItemClick}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a8.5 8.5 0 0 0-1.7-1l-.4-2.6H10l-.4 2.6a8.5 8.5 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2 1.6 2 3.4 2.4-1a8.5 8.5 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8.5 8.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>U</div>
            <div className={styles.userText}>
              <div className={styles.userName}>User</div>
              <div className={styles.userRole}>Admin</div>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.mainWrap}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
