import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, type WorkOrder } from "../../API/endpoints";
import styles from "./CalendarPage.module.css";

export default function CalendarPage() {
  const navigate = useNavigate();

  const { data: workOrders = [], isLoading, isError } = useQuery<WorkOrder[]>({
    queryKey: ["workOrders"],
    queryFn: api.listWorkOrders,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const customerById = useMemo(
    () => new Map(customers.map((c: any) => [String(c.id), c])),
    [customers]
  );

  const todayISO = useMemo(() => toLocalISODate(new Date()), []);

  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(todayISO);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredWorkOrders = useMemo(() => {
    if (statusFilter === "all") return workOrders;
    return workOrders.filter((w) => String(w.status) === statusFilter);
  }, [workOrders, statusFilter]);

  const byDate = useMemo(() => {
    const m = new Map<string, WorkOrder[]>();

    for (const w of filteredWorkOrders) {
      const d = w?.createdAt;
      if (!d) continue;

      const key = toLocalISODate(new Date(d));
      const arr = m.get(key) ?? [];
      arr.push(w);
      m.set(key, arr);
    }

    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) =>
        String(b?.createdAt ?? "").localeCompare(String(a?.createdAt ?? ""))
      );
      m.set(k, arr);
    }

    return m;
  }, [filteredWorkOrders]);

  const calendarDays = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const selectedList = useMemo(() => {
    return (byDate.get(selectedDay) ?? []).slice();
  }, [byDate, selectedDay]);

  const monthLabel = useMemo(() => fmtMonth(monthCursor), [monthCursor]);

  if (isLoading) return <div className={styles.page}>Loading…</div>;
  if (isError) return <div className={styles.page}>Failed to load calendar.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>CALENDAR</div>
          <h1 className={styles.title}>Repair Tickets</h1>
          <div className={styles.sub}>
            Showing tickets by created date. Real appointment time is not available from backend yet.
          </div>
        </div>

        <div className={styles.monthNav}>
          <button
            className={styles.navBtn}
            onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
          >
            ←
          </button>

          <div className={styles.monthLabel}>{monthLabel}</div>

          <button
            className={styles.navBtn}
            onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
          >
            →
          </button>

          <button
            className={styles.todayBtn}
            onClick={() => {
              const now = new Date();
              setMonthCursor(startOfMonth(now));
              setSelectedDay(toLocalISODate(now));
            }}
          >
            Today
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className={styles.filterLabel}>Filter by status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="DIAGNOSTICS">Diagnostics</option>
          <option value="WAITING_APPROVAL">Waiting Approval</option>
          <option value="IN_REPAIR">In Repair</option>
          <option value="READY">Ready</option>
          <option value="DELIVERED">Delivered</option>
          <option value="NOT_SERVICED">Not Serviced</option>
        </select>
      </div>

      <div className={styles.layout}>
        <div className={styles.calendarCard}>
          <div className={styles.weekHeader}>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className={styles.grid}>
            {calendarDays.map((d) => {
              const iso = toLocalISODate(d);

              const isThisMonth = d.getMonth() === monthCursor.getMonth();
              const isToday = iso === todayISO;
              const isSelected = iso === selectedDay;

              const list = byDate.get(iso) ?? [];
              const count = list.length;
              const dot = statusDots(list);

              return (
                <button
                  key={iso}
                  className={[
                    styles.cell,
                    !isThisMonth ? styles.cellDim : "",
                    isToday ? styles.cellToday : "",
                    isSelected ? styles.cellSelected : "",
                  ].join(" ")}
                  onClick={() => setSelectedDay(iso)}
                >
                  <div className={styles.cellTop}>
                    <div className={styles.dayNum}>{d.getDate()}</div>
                    {count > 0 ? <div className={styles.count}>{count}</div> : null}
                  </div>

                  {count > 0 ? (
                    <div className={styles.dots}>
                      {dot.received ? <span className={`${styles.dot} ${styles.dotPlanned}`} /> : null}
                      {dot.inProgress ? <span className={`${styles.dot} ${styles.dotInProgress}`} /> : null}
                      {dot.done ? <span className={`${styles.dot} ${styles.dotDone}`} /> : null}
                      {dot.other ? <span className={`${styles.dot} ${styles.dotCancelled}`} /> : null}
                    </div>
                  ) : (
                    <div className={styles.dots} />
                  )}

                  {count > 0 ? (
                    <div className={styles.preview}>
                      {list.slice(0, 2).map((wo) => (
                        <div key={String(wo.id)} className={styles.previewRow}>
                          <span className={styles.previewTime}>
                            {fmtTime(wo.createdAt)}
                          </span>
                          <span className={styles.previewPlate}>
                            {ticketLabel(wo)}
                          </span>
                        </div>
                      ))}
                      {count > 2 ? (
                        <div className={styles.previewMore}>+{count - 2} more</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className={styles.previewEmpty}>—</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.dayCard}>
          <div className={styles.dayHead}>
            <div>
              <div className={styles.dayTitle}>Day</div>
              <div className={styles.dayDate}>{selectedDay}</div>
            </div>
            <div className={styles.dayCount}>{selectedList.length} tickets</div>
          </div>

          {selectedList.length === 0 ? (
            <div className={styles.empty}>No tickets for this day.</div>
          ) : (
            <div className={styles.dayList}>
              {selectedList.map((wo) => {
                const customerName =
                  wo.customer?.name ||
                  (wo.customerId != null
                    ? customerById.get(String(wo.customerId))?.name ?? String(wo.customerId)
                    : "—");

                return (
                  <div
                    key={String(wo.id)}
                    className={styles.jobRow}
                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(`/work-orders/${wo.id}`);
                      }
                    }}
                  >
                    <div className={styles.jobTime}>
                      <div className={styles.jobTimeMain}>
                        {fmtTime(wo.createdAt)}
                      </div>
                      <div className={styles.jobTimeSub}>
                        {fmtDate(wo.createdAt)}
                      </div>
                    </div>

                    <div className={styles.jobMain}>
                      <div className={styles.jobTitle}>
                        {ticketLabel(wo)}{" "}
                        <span className={styles.jobId}>#{wo.id}</span>
                      </div>
                      <div className={styles.jobMeta}>
                        <span>{customerName}</span>
                        <span className={styles.sep}>•</span>
                        <span>{wo.problemDescription || "No description"}</span>
                      </div>
                    </div>

                    <div className={`${styles.badge} ${badgeClass(String(wo.status), styles)}`}>
                      {fmtStatus(String(wo.status))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ticketLabel(wo: WorkOrder) {
  return [wo.device?.type, wo.device?.brand, wo.device?.model]
    .filter(Boolean)
    .join(" ") || "Repair Ticket";
}

function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function buildMonthGrid(monthStart: Date) {
  const first = new Date(monthStart);
  const day = first.getDay();
  const mondayIndex = (day + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - mondayIndex);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

function fmtMonth(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function fmtStatus(s: string) {
  switch (s) {
    case "RECEIVED":
      return "Received";
    case "DIAGNOSTICS":
      return "Diagnostics";
    case "WAITING_APPROVAL":
      return "Waiting Approval";
    case "IN_REPAIR":
      return "In Repair";
    case "READY":
      return "Ready";
    case "DELIVERED":
      return "Delivered";
    case "NOT_SERVICED":
      return "Not Serviced";
    default:
      return s;
  }
}

function fmtTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function badgeClass(status: string, styles: any) {
  switch (status) {
    case "RECEIVED":
      return styles.badgePlanned;
    case "DIAGNOSTICS":
    case "IN_REPAIR":
      return styles.badgeInProgress;
    case "READY":
    case "DELIVERED":
      return styles.badgeDone;
    case "WAITING_APPROVAL":
    case "NOT_SERVICED":
      return styles.badgeCancelled;
    default:
      return "";
  }
}

function statusDots(list: WorkOrder[]) {
  return {
    received: list.some((w) => w.status === "RECEIVED"),
    inProgress: list.some((w) => w.status === "DIAGNOSTICS" || w.status === "IN_REPAIR"),
    done: list.some((w) => w.status === "READY" || w.status === "DELIVERED"),
    other: list.some((w) => w.status === "WAITING_APPROVAL" || w.status === "NOT_SERVICED"),
  };
}