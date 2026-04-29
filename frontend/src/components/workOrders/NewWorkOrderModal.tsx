import { api } from "../../API/endpoints";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styles from "./NewWorkOrderModal.module.css";

export default function NewWorkOrderModal({ onClose }: { onClose: () => void }) {
  const [customerId, setCustomerId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: api.listDevices,
  });

  const filteredDevices = devices.filter(
    (d: any) => String(d.customerId) === customerId
  );

  const canContinue =
    Number(customerId) > 0 &&
    Number(deviceId) > 0 &&
    problemDescription.trim().length >= 5;

  const createMutation = useMutation({
    mutationFn: async () => {
      setError(null);

      return api.createWorkOrder({
        customerId: Number(customerId),
        deviceId: Number(deviceId),
        problemDescription: problemDescription.trim(),
      });
    },
    onSuccess: (created: any) => {
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      onClose();
      navigate(`/work-orders/${created.id}`);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message
          : "Failed to create work order";

      setError(message);
    },
  });

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>New Work Order</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <label className={styles.label}>
          Customer *
          <select
            className={styles.input}
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setDeviceId("");
            }}
          >
            <option value="">Select customer</option>
            {customers.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} (ID: {customer.id})
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Device *
          <select
            className={styles.input}
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            disabled={!customerId}
          >
            <option value="">
              {customerId ? "Select device" : "Select customer first"}
            </option>
            {filteredDevices.map((device: any) => (
              <option key={device.id} value={device.id}>
                {device.type} — {device.brand ?? ""} {device.model ?? ""}{" "}
                {device.serialNumber ? `(${device.serialNumber})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Problem Description *
          <textarea
            className={styles.textarea}
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="Describe the problem"
          />
        </label>

        {error && <div className={styles.errorBox}>⚠ {error}</div>}

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className={styles.createBtn}
            disabled={!canContinue || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}