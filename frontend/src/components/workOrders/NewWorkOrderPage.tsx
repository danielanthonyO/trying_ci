import React, { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../API/endpoints";
import styles from "./NewWorkOrderPage.module.css";

export default function WorkOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  if (!id) return <Navigate to="/" />;

  const { data: wo, isLoading, isError } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: () => api.getWorkOrder(id),
  });

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const patchStatus = useMutation({
    mutationFn: (payload: {
      status:
        | "RECEIVED"
        | "DIAGNOSTICS"
        | "WAITING_APPROVAL"
        | "IN_REPAIR"
        | "READY"
        | "DELIVERED"
        | "NOT_SERVICED";
      note?: string;
    }) => api.updateWorkOrderStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workOrder", id] });
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      showToast("✅ Status updated");
    },
    onError: () => {
      showToast("❌ Status update failed");
    },
  });

  if (isLoading) return <div className={styles.page}>Loading…</div>;
  if (isError || !wo) return <div className={styles.page}>Repair ticket not found.</div>;

  const deviceTitle =
    [wo.device?.type, wo.device?.brand, wo.device?.model].filter(Boolean).join(" ") ||
    `Ticket #${wo.id}`;

  const statusClass = statusBadgeClass(wo.status, styles);

  return (
    <div className={styles.page}>
      {toast && (
        <div className={styles.toast}>
          {toast}
        </div>
      )}

      <div className={styles.topbar}>
        <div className={styles.titleWrap}>
          <div className={styles.kicker}>Repair ticket</div>
          <h2 className={styles.title}>
            #{wo.id} — {deviceTitle}
          </h2>
          <div className={styles.status}>
            Status:{" "}
            <span className={`${styles.pill} ${statusClass}`}>
              <span className={styles.pillDot} />
              {fmtStatus(wo.status)}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => navigate("/work-orders")}
          >
            ← Back
          </button>

          <button
            className={styles.secondaryBtn}
            onClick={() =>
              patchStatus.mutate({
                status: "DIAGNOSTICS",
                note: "Diagnostics started",
              })
            }
            disabled={wo.status !== "RECEIVED" || patchStatus.isPending}
          >
            Diagnostics
          </button>

          <button
            className={styles.secondaryBtn}
            onClick={() =>
              patchStatus.mutate({
                status: "IN_REPAIR",
                note: "Repair started",
              })
            }
            disabled={
              !["RECEIVED", "DIAGNOSTICS", "WAITING_APPROVAL"].includes(String(wo.status)) ||
              patchStatus.isPending
            }
          >
            Start Repair
          </button>

          <button
            className={styles.primaryBtn}
            onClick={() =>
              patchStatus.mutate({
                status: "READY",
                note: "Device ready for pickup",
              })
            }
            disabled={wo.status === "READY" || patchStatus.isPending}
          >
            Mark Ready
          </button>
        </div>
      </div>

      <Card title="Problem description">
        {wo.problemDescription ? (
          <div>{wo.problemDescription}</div>
        ) : (
          <div className={styles.muted}>No problem description</div>
        )}
      </Card>

      <div className={styles.grid2}>
        <Card title="Customer">
          {wo.customer ? (
            <div className={styles.rowList}>
              <InfoRow label="Name" value={wo.customer.name ?? "—"} />
              <InfoRow label="Email" value={wo.customer.email ?? "—"} />
              <InfoRow label="Phone" value={wo.customer.phone ?? "—"} />
              <InfoRow label="Type" value={wo.customer.type ?? "—"} />
            </div>
          ) : (
            <div className={styles.muted}>Customer not found</div>
          )}
        </Card>

        <Card title="Device">
          {wo.device ? (
            <div className={styles.rowList}>
              <InfoRow label="Type" value={wo.device.type ?? "—"} />
              <InfoRow label="Brand" value={wo.device.brand ?? "—"} />
              <InfoRow label="Model" value={wo.device.model ?? "—"} />
              <InfoRow label="Serial Number" value={wo.device.serialNumber ?? "—"} />
            </div>
          ) : (
            <div className={styles.muted}>Device not found</div>
          )}
        </Card>
      </div>

      <Card title="Estimate">
        {wo.estimate ? (
          <div className={styles.rowList}>
            <InfoRow label="Status" value={wo.estimate.status ?? "—"} />
            <InfoRow label="Labor cost" value={money(wo.estimate.laborCost)} />
            <InfoRow label="Parts cost" value={money(wo.estimate.partsCost)} />
            <InfoRow label="Subtotal" value={money(wo.estimate.subtotal)} />
            <InfoRow label="VAT amount" value={money(wo.estimate.vatAmount)} />
            <InfoRow label="Total" value={money(wo.estimate.totalCost)} />
            <InfoRow label="Currency" value={wo.estimate.currency ?? "EUR"} />
            <InfoRow label="Note" value={wo.estimate.note ?? "—"} />
          </div>
        ) : (
          <div className={styles.muted}>No estimate created</div>
        )}
      </Card>

      <Card title="History">
        {wo.history && wo.history.length > 0 ? (
          <div className={styles.historyList}>
            {wo.history.map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.historyTime}>{fmtDateTime(item.createdAt)}</div>
                <div className={styles.historyContent}>
                  <div className={styles.historyStatus}>{fmtStatus(item.status)}</div>
                  <div className={styles.historyNote}>{item.note || "No note"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.muted}>No history yet</div>
        )}
      </Card>

      <Card title="Ticket info">
        <div className={styles.rowList}>
          <InfoRow label="Ticket ID" value={String(wo.id)} />
          <InfoRow label="Customer ID" value={String(wo.customerId)} />
          <InfoRow label="Device ID" value={String(wo.deviceId)} />
          <InfoRow label="Created at" value={fmtDateTime(wo.createdAt)} />
          <InfoRow label="Updated at" value={fmtDateTime(wo.updatedAt)} />
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

function fmtStatus(status: string) {
  switch (status) {
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
      return status || "—";
  }
}

function fmtDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function money(value: number) {
  return `€${Number(value || 0).toFixed(2)}`;
}

function statusBadgeClass(status: string, styles: any) {
  switch (status) {
    case "RECEIVED":
      return styles.pillPlanned;
    case "DIAGNOSTICS":
      return styles.pillInProgress;
    case "WAITING_APPROVAL":
      return styles.pillCancelled;
    case "IN_REPAIR":
      return styles.pillInProgress;
    case "READY":
      return styles.pillDone;
    case "DELIVERED":
      return styles.pillDone;
    case "NOT_SERVICED":
      return styles.pillCancelled;
    default:
      return "";
  }
}