import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type Customer,
  type CreateDevicePayload,
} from "../../API/endpoints";
import styles from "./CreateDevicePage.module.css";

export default function CreateDevicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  const { data: customers = [], isLoading: customersLoading } = useQuery<
    Customer[]
  >({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const identifierLabel = useMemo(() => getIdentifierLabel(type), [type]);
  const identifierPlaceholder = useMemo(
    () => getIdentifierPlaceholder(type),
    [type]
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateDevicePayload = {
        customerId: Number(customerId),
        type: type.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
      };

      return api.createDevice(payload);
    },
    onSuccess: async (createdDevice) => {
      await queryClient.invalidateQueries({ queryKey: ["devices"] });
      navigate(`/devices/${createdDevice.id}`);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!customerId || !type.trim()) return;

    createMutation.mutate();
  }

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

      <div className={styles.card}>
        <h1 className={styles.title}>Create New Device</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Customer</span>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={customersLoading}
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Type</span>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Car, Phone, Laptop, Tablet..."
              required
            />
          </label>

          <label className={styles.field}>
            <span>Brand</span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Toyota, Apple, Samsung, Lenovo..."
            />
          </label>

          <label className={styles.field}>
            <span>Model</span>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Corolla, iPhone 13, ThinkPad..."
            />
          </label>

          <label className={styles.field}>
            <span>{identifierLabel}</span>
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder={identifierPlaceholder}
            />
          </label>

          {createMutation.isError && (
            <div className={styles.error}>Failed to create device.</div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate("/devices")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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

function getIdentifierPlaceholder(type?: string) {
  const t = String(type ?? "").toLowerCase();

  if (t.includes("car") || t.includes("vehicle") || t.includes("auto")) {
    return "Enter licence number";
  }

  if (t.includes("phone") || t.includes("tablet") || t.includes("watch")) {
    return "Enter IMEI";
  }

  return "Enter serial number";
}