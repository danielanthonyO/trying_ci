import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Device, type Customer } from "../../API/endpoints";
import styles from "./Devices.module.css";

export default function Devices() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: api.listDevices,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const customerById = useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers]
  );

  const filteredDevices = useMemo(() => {
    const s = searchText.trim().toLowerCase();

    return devices.filter((d) => {
      const customerName =
        customerById.get(String(d.customerId))?.name?.toLowerCase() ?? "";

      return (
        (d.type ?? "").toLowerCase().includes(s) ||
        (d.brand ?? "").toLowerCase().includes(s) ||
        (d.model ?? "").toLowerCase().includes(s) ||
        (d.serialNumber ?? "").toLowerCase().includes(s) ||
        customerName.includes(s)
      );
    });
  }, [devices, searchText, customerById]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Devices</h1>

      <div className={styles.topBar}>
        <input
          className={styles.search}
          placeholder="🔍 Search device..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          type="button"
          className={styles.createBtn}
          onClick={() => navigate("/devices/new")}
        >
          Create New Device
        </button>
      </div>

      <div className={styles.grid}>
        {isLoading && <div className={styles.empty}>Loading...</div>}

        {!isLoading && filteredDevices.length === 0 && (
          <div className={styles.empty}>No devices found</div>
        )}

        {filteredDevices.map((device) => {
          const customer = customerById.get(String(device.customerId));
          const title =
            [device.brand, device.model].filter(Boolean).join(" ") ||
            device.type ||
            "Device";

          return (
            <div
              key={device.id}
              className={styles.box}
              onClick={() => navigate(`/devices/${device.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/devices/${device.id}`);
                }
              }}
            >
              <div className={styles.deviceTitle}>{title}</div>
              <div className={styles.deviceMeta}>Type: {device.type || "—"}</div>
              <div className={styles.deviceMeta}>
                Serial: {device.serialNumber || "—"}
              </div>
              <div className={styles.deviceMeta}>
                Customer: {customer?.name || "No customer assigned"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}