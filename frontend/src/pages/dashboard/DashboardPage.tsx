import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../API/endpoints";
import NewWorkOrderModal from "../../components/workOrders/NewWorkOrderModal";

import styles from "./DashboardPage.module.css";
import { useLang } from "../../i18n/LangContext";
import { t } from "../../i18n/t";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const { lang, toggleLang } = useLang();
  const tr = t[lang];

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["workOrders"],
    queryFn: api.listWorkOrders,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const { data: mechanics = [] } = useQuery({
    queryKey: ["mechanics"],
    queryFn: api.listMechanics,
  });

  const customerById = useMemo(
    () => new Map(customers.map((c: any) => [String(c.id), c])),
    [customers]
  );

  const mechanicById = useMemo(
    () => new Map(mechanics.map((m: any) => [String(m.id), m])),
    [mechanics]
  );

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const stats = useMemo(() => {
    const normalized = workOrders.map((w: any) => normalizeDashboardStatus(w.status));

    const active = normalized.filter((s) => s === "active").length;
    const planned = normalized.filter((s) => s === "planned").length;
    const done = normalized.filter((s) => s === "done").length;
    const cancelled = normalized.filter((s) => s === "cancelled").length;

    const estimateSent = workOrders.filter((w: any) => w.estimateStatus === "sent").length;

    const now = Date.now();
    const last7 = workOrders.filter((w: any) => {
      const tt = new Date(w.createdAt ?? 0).getTime();
      return !Number.isNaN(tt) && now - tt <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return { active, planned, done, cancelled, estimateSent, last7 };
  }, [workOrders]);

  const todaysSchedule = useMemo(() => {
    return [...workOrders]
      .filter((w: any) => w?.schedule?.date === todayISO)
      .sort((a: any, b: any) =>
        String(a?.schedule?.startTime ?? "").localeCompare(String(b?.schedule?.startTime ?? ""))
      );
  }, [workOrders, todayISO]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{tr.dashboard.title}</h1>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.langToggle} onClick={toggleLang}>
            {lang === "en" ? "EN 🇬🇧" : "FI 🇫🇮"}
          </button>

          <button
            className={styles.secondaryAction}
            onClick={() => navigate("/estimates/new")}
          >
            Send Estimate
          </button>

          <button className={styles.primary} onClick={() => setOpen(true)}>
            {tr.dashboard.newWorkOrder}
          </button>
        </div>
      </div>

      <div className={styles.cards}>
        <StatCard
          label={tr.dashboard.stats.active}
          value={stats.active}
          hint={tr.dashboard.stats.inProgressHint}
          icon={<IconPlay />}
          className={styles.cardActive}
        />
        <StatCard
          label={tr.dashboard.stats.planned}
          value={stats.planned}
          hint={tr.dashboard.stats.plannedHint}
          icon={<IconClock />}
          className={styles.cardPlanned}
        />
        <StatCard
          label={tr.dashboard.stats.done}
          value={stats.done}
          hint={tr.dashboard.stats.doneHint}
          icon={<IconCheck />}
          className={styles.cardDone}
        />
        <StatCard
          label={tr.dashboard.stats.cancelled}
          value={stats.cancelled}
          hint={tr.dashboard.stats.cancelledHint}
          icon={<IconX />}
          className={styles.cardCancelled}
        />
      </div>

      <div className={styles.cards2}>
        <StatCard
          label={tr.dashboard.stats.thisWeek}
          value={stats.last7}
          hint={tr.dashboard.stats.thisWeekHint}
          icon={<IconCalendar />}
          className={styles.cardNeutral}
        />
        <StatCard
          label="Estimates sent"
          value={stats.estimateSent}
          hint="Customer estimate links sent"
          icon={<IconMail />}
          className={styles.cardNeutral}
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <div className={styles.panelTitle}>{tr.dashboard.todaySchedule}</div>
            <div className={styles.panelSub}>{todayISO}</div>
          </div>

          <Link to="/calendar" className={styles.panelLink}>
            {tr.dashboard.openCalendar}
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.empty}>{tr.dashboard.loading}</div>
        ) : todaysSchedule.length === 0 ? (
          <div className={styles.empty}>{tr.dashboard.noJobsToday}</div>
        ) : (
          <div className={styles.todayWrap}>
            <div className={styles.todayLeft}>
              <div className={styles.todayList}>
                {todaysSchedule.slice(0, 8).map((wo: any) => {
                  const customerName =
                    wo.customerName ||
                    (wo.customerId != null
                      ? customerById.get(String(wo.customerId))?.name ?? String(wo.customerId)
                      : "—");

                  const mainMechanicName =
                    wo?.schedule?.mainMechanicId != null
                      ? mechanicById.get(String(wo.schedule.mainMechanicId))?.name ??
                        String(wo.schedule.mainMechanicId)
                      : "—";

                  const time = wo.schedule?.startTime ?? "—";
                  const durationMin = Number(wo.schedule?.durationMin ?? 0);
                  const duration = durationMin > 0 ? `${durationMin} min` : null;
                  const itemLabel = getWorkOrderTitle(wo);

                  const isNow = (() => {
                    if (!wo?.schedule?.date || !wo?.schedule?.startTime || durationMin <= 0) {
                      return false;
                    }
                    const start = new Date(`${wo.schedule.date}T${wo.schedule.startTime}`);
                    if (Number.isNaN(start.getTime())) return false;
                    const end = new Date(start.getTime() + durationMin * 60000);
                    const now = new Date();
                    return now >= start && now <= end;
                  })();

                  return (
                    <div
                      key={String(wo.id)}
                      className={`${styles.todayItem} ${isNow ? styles.todayNow : ""}`}
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/work-orders/${wo.id}`);
                        }
                      }}
                    >
                      <div className={styles.timeline}>
                        <div
                          className={`${styles.timelineDot} ${statusTimelineDot(wo.status, styles)}`}
                        />
                        <div className={styles.timelineLine} />
                      </div>

                      <div className={styles.timeBlock}>
                        <div className={styles.timeMain}>{time}</div>
                        <div className={styles.timeSub}>{duration ?? ""}</div>
                      </div>

                      <div className={styles.infoBlock}>
                        <div className={styles.infoTop}>
                          <div className={styles.plateLine}>
                            <span className={styles.deviceIcon}>
                              {getDeviceIcon(wo.device?.type)}
                            </span>

                            <span className={styles.plateText}>{itemLabel}</span>

                            {customerName && customerName !== "—" ? (
                              <span className={styles.customerInline}>• {customerName}</span>
                            ) : null}

                            <span className={styles.idText}>
                              #{wo.id} • {wo.itemType ?? "device"}
                            </span>
                          </div>

                          <div className={styles.infoTopRight}>
                            {isNow ? <div className={styles.nowBadge}>{tr.status.now}</div> : null}

                            <span
                              className={`${styles.statusPill} ${statusBadgeClass(
                                wo.status,
                                styles
                              )}`}
                            >
                              {fmtStatus(wo.status, tr)}
                            </span>
                          </div>
                        </div>

                        <div className={styles.infoBottom}>
                          <span className={styles.metaItem}>{mainMechanicName}</span>
                          {wo.schedule?.location ? (
                            <>
                              <span className={styles.metaSep}>•</span>
                              <span className={styles.metaItem}>{wo.schedule.location}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.todayRight}>
              <div className={styles.todayTipTitle}>{tr.dashboard.tipTitle}</div>
              <div className={styles.todayTipText}>{tr.dashboard.tipText}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelTitle}>{tr.dashboard.latest}</div>
          <Link to="/work-orders" className={styles.panelLink}>
            {tr.dashboard.viewAll}
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.empty}>{tr.dashboard.loading}</div>
        ) : workOrders.length === 0 ? (
          <div className={styles.empty}>{tr.dashboard.noOrders}</div>
        ) : (
          <div className={styles.list}>
            {workOrders.slice(0, 6).map((wo: any) => {
              const customer =
                wo.customerId != null ? customerById.get(String(wo.customerId)) : null;
              const customerName = customer?.name ?? wo.customerName ?? "";
              const title = getWorkOrderTitle(wo);

              return (
                <div
                  key={wo.id}
                  className={styles.row}
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/work-orders/${wo.id}`);
                    }
                  }}
                >
                  <div className={styles.rowMain}>
                    <div className={styles.plateLine}>
                      <span className={styles.deviceIcon}>
                        {getDeviceIcon(wo.device?.type)}
                      </span>

                      <span className={styles.plate}>{title}</span>

                      {customerName ? (
                        <span className={styles.customerInline}>• {customerName}</span>
                      ) : null}
                    </div>

                    <div className={styles.meta}>#{wo.id} • {fmtDate(wo.createdAt)}</div>

                    <div className={styles.progressTrack}>
                      <div
                        className={`${styles.progressFill} ${statusProgressClass(
                          wo.status,
                          styles
                        )}`}
                      />
                    </div>
                  </div>

                  <div className={styles.rowRight}>
                    <div className={`${styles.badge} ${statusBadgeClass(wo.status, styles)}`}>
                      {fmtStatus(wo.status, tr)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && <NewWorkOrderModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function getWorkOrderTitle(wo: any) {
  const cleanDeviceName = [wo.device?.brand, wo.device?.model].filter(Boolean).join(" ");

  return (
    wo.title ||
    cleanDeviceName ||
    wo.device?.model ||
    wo.device?.brand ||
    wo.deviceName ||
    wo.itemName ||
    wo.plate ||
    wo.identifier ||
    "Repair Ticket"
  );
}

function getDeviceIcon(type?: string) {
  const t = String(type ?? "").toLowerCase();

  if (t.includes("car") || t.includes("vehicle") || t.includes("auto")) {
    return "🚗";
  }
  if (t.includes("phone")) return "📱";
  if (t.includes("laptop")) return "💻";
  if (t.includes("tablet")) return "📲";
  if (t.includes("desktop")) return "🖥️";
  if (t.includes("watch")) return "⌚";

  return "🔧";
}

function normalizeDashboardStatus(status?: string) {
  switch (String(status ?? "").toUpperCase()) {
    case "RECEIVED":
    case "WAITING_APPROVAL":
      return "planned";

    case "DIAGNOSTICS":
    case "IN_REPAIR":
      return "active";

    case "READY":
    case "DELIVERED":
      return "done";

    case "NOT_SERVICED":
      return "cancelled";

    default:
      return "unknown";
  }
}

function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
  className?: string;
}) {
  const isNumber = typeof value === "number";
  const display = useCountUp(isNumber ? value : 0, 420);

  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardLabel}>{label}</div>
      </div>

      <div className={styles.cardValue}>{isNumber ? display : value}</div>
      <div className={styles.cardHint}>{hint}</div>
    </div>
  );
}

function useCountUp(target: number, durationMs: number) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (tt: number) => {
      const p = Math.min(1, (tt - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (target - from) * eased);
      setV(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return v;
}

function fmtDate(v: any) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toISOString().slice(0, 10);
}

function fmtStatus(s: string, tr: any) {
  switch (String(s ?? "").toUpperCase()) {
    case "RECEIVED":
      return tr.status.planned;
    case "WAITING_APPROVAL":
      return "Waiting Approval";
    case "DIAGNOSTICS":
    case "IN_REPAIR":
      return tr.status.in_progress;
    case "READY":
    case "DELIVERED":
      return tr.status.done;
    case "NOT_SERVICED":
      return tr.status.cancelled;
    default:
      return s;
  }
}

function statusBadgeClass(status: string, styles: any) {
  switch (normalizeDashboardStatus(status)) {
    case "planned":
      return styles.badgePlanned;
    case "active":
      return styles.badgeInProgress;
    case "done":
      return styles.badgeDone;
    case "cancelled":
      return styles.badgeCancelled;
    default:
      return "";
  }
}

function statusTimelineDot(status: string, styles: any) {
  switch (normalizeDashboardStatus(status)) {
    case "planned":
      return styles.dotPlanned;
    case "active":
      return styles.dotInProgress;
    case "done":
      return styles.dotDone;
    case "cancelled":
      return styles.dotCancelled;
    default:
      return "";
  }
}

function statusProgressClass(status: string, styles: any) {
  switch (normalizeDashboardStatus(status)) {
    case "planned":
      return styles.progressPlanned;
    case "active":
      return styles.progressActive;
    case "done":
      return styles.progressDone;
    case "cancelled":
      return styles.progressCancelled;
    default:
      return "";
  }
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M10 8l6 4-6 4V8z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 7h16v14H4z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11h4v4H8z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}