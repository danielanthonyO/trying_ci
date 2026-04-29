import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

type Props = { onClose: () => void };

export default function NewWorkOrderModal({ onClose }: Props) {
  const [plate, setPlate] = useState("");
  const [desc, setDesc] = useState("");
  const [vehiclePreview, setVehiclePreview] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const navigate = useNavigate();
  const qc = useQueryClient();

  const canCreate = useMemo(() => plate.trim().length >= 3, [plate]);

  async function lookup() {
    setChecking(true);
    try {
      const v = await api.findVehicleByPlate(plate.trim().toUpperCase());
      setVehiclePreview(v);
    } finally {
      setChecking(false);
    }
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const normalizedPlate = plate.trim().toUpperCase();
      const vehicle = vehiclePreview ?? (await api.findVehicleByPlate(normalizedPlate));

      const created = await api.createWorkOrder({
        plate: normalizedPlate,
        vehicleId: vehicle?.id ?? null,
        status: "planned",
        createdAt: new Date().toISOString(),
        faultDescription: desc,
        customerId: null,
        mechanicIds: [],
        schedule: null,
      });

      return created;
    },
    onSuccess: (created: any) => {
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      onClose();
      navigate(`/work-orders/${created.id}`);
    },
  });

  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>New Work Order</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <label>
          License plate *
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onBlur={lookup}
            placeholder="ABC-123"
            style={{ width: "100%" }}
          />
        </label>

        {checking ? (
          <p>Checking vehicle…</p>
        ) : vehiclePreview ? (
          <div style={card}>
            <b>Vehicle info</b>
            <div>{vehiclePreview.make} {vehiclePreview.model} {vehiclePreview.year}</div>
            <div>{vehiclePreview.fuel} • {vehiclePreview.powerKw} kW • {vehiclePreview.engineCode}</div>
            <div>VIN: {vehiclePreview.vin}</div>
          </div>
        ) : (
          <div style={{ fontSize: 13, opacity: 0.75 }}>No vehicle found for this plate (still OK, you can create work order).</div>
        )}

        <label>
          Description (optional)
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. oil change, brake inspection…"
            style={{ width: "100%", minHeight: 90 }}
          />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={!canCreate || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center"
};

const modal: React.CSSProperties = {
  width: 560, background: "white", borderRadius: 12, padding: 16, display: "grid", gap: 12
};

const card: React.CSSProperties = {
  border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa"
};