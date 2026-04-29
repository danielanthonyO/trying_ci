import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  api,
  type Device,
  type Customer,
  type WorkOrder,
} from "../../API/endpoints";
import styles from "./DeviceDetailsPage.module.css";

export default function DeviceDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const deviceId = Number(id);

  const { data: device, isLoading: deviceLoading } = useQuery<Device>({
    queryKey: ["device", deviceId],
    queryFn: () => api.getDevice(deviceId),
    enabled: Number.isFinite(deviceId) && deviceId > 0,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const { data: workOrders = [] } = useQuery<WorkOrder[]>({
    queryKey: ["workOrders"],
    queryFn: api.listWorkOrders,
  });

  const customer =
    device?.customerId != null
      ? customers.find((c) => String(c.id) === String(device.customerId))
      : null;

  const relatedWorkOrders = workOrders.filter(
    (wo) =>
      String(wo.deviceId ?? "") === String(device?.id ?? "") ||
      String(wo.device?.id ?? "") === String(device?.id ?? "")
  );

  if (deviceLoading) {
    return <div className={styles.page}>Loading device...</div>;
  }

  if (!device) {
    return (
      <div className={styles.page}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/devices")}
        >
          ← Back to devices
        </button>

        <div className={styles.empty}>Device not found.</div>
      </div>
    );
  }

  const title =
    [device.brand, device.model].filter(Boolean).join(" ") ||
    device.model ||
    device.brand ||
    device.type ||
    "Device";

  const identifierLabel = getIdentifierLabel(device.type);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/devices")}
        >
          ← Back to devices
        </button>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.heroIcon}>{getDeviceIcon(device.type)}</div>

        <div className={styles.heroText}>
          <div className={styles.kicker}>DEVICE</div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.sub}>
            {customer?.name ? customer.name : "No customer assigned"}
          </div>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Device details</div>

          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.label}>ID</span>
              <span className={styles.value}>{device.id}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Type</span>
              <span className={styles.value}>{device.type || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Brand</span>
              <span className={styles.value}>{device.brand || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Model</span>
              <span className={styles.value}>{device.model || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>{identifierLabel}</span>
              <span className={styles.value}>{device.serialNumber || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Created</span>
              <span className={styles.value}>{fmtDate(device.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Customer</div>

          <div className={styles.detailList}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Customer ID</span>
              <span className={styles.value}>{device.customerId ?? "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>{customer?.name || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{customer?.email || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{customer?.phone || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Related work orders</div>

        {relatedWorkOrders.length === 0 ? (
          <div className={styles.empty}>No work orders found for this device.</div>
        ) : (
          <div className={styles.workOrderList}>
            {relatedWorkOrders.map((wo) => (
              <button
                key={wo.id}
                type="button"
                className={styles.workOrderRow}
                onClick={() => navigate(`/work-orders/${wo.id}`)}
              >
                <div>
                  <div className={styles.workOrderTitle}>
                    #{wo.id} {wo.problemDescription || "Work order"}
                  </div>
                  <div className={styles.workOrderMeta}>
                    {fmtDate(wo.createdAt)}
                  </div>
                </div>

                <span
                  className={`${styles.badge} ${statusClass(
                    wo.status,
                    styles
                  )}`}
                >
                  {fmtStatus(wo.status)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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

function getIdentifierLabel(type?: string) {
  const t = String(type ?? "").toLowerCase();

  if (t.includes("car") || t.includes("vehicle") || t.includes("auto")) {
    return "Licence number";
  }

  if (t.includes("phone") || t.includes("tablet") || t.includes("watch")) {
    return "IMEI";
  }

  return "Serial number";
}

function fmtDate(v?: string) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toISOString().slice(0, 10);
}

function fmtStatus(status?: string) {
  switch (String(status ?? "").toUpperCase()) {
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
      return status || "Unknown";
  }
}

function statusClass(status?: string, styles?: any) {
  switch (String(status ?? "").toUpperCase()) {
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