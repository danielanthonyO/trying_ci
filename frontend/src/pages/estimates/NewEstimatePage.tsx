import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../API/endpoints";
import styles from "./EstimatePage.module.css";

export default function NewEstimatePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedPartId, setSelectedPartId] = useState("");
  const [partQty, setPartQty] = useState("1");

  const [selectedWorkTypeId, setSelectedWorkTypeId] = useState("");
  const [laborQty, setLaborQty] = useState("1");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const { data: partsCatalog = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: api.listParts,
  });

  const { data: workTypes = [] } = useQuery({
    queryKey: ["workTypes"],
    queryFn: api.listWorkTypes,
  });

  const [estimateParts, setEstimateParts] = useState<any[]>([]);
  const [estimateLabors, setEstimateLabors] = useState<any[]>([]);

  const partById = useMemo(
    () => new Map(partsCatalog.map((p: any) => [String(p.id), p])),
    [partsCatalog]
  );

  const workTypeById = useMemo(
    () => new Map(workTypes.map((w: any) => [String(w.id), w])),
    [workTypes]
  );

  function addPart() {
    if (!selectedPartId) return;
    const qty = Math.max(1, Number(partQty || 1));
    const part = partById.get(String(selectedPartId));
    if (!part) return;

    setEstimateParts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        partId: part.id,
        name: part.name,
        qty,
        unitPrice: Number(part.price ?? 0),
      },
    ]);

    setSelectedPartId("");
    setPartQty("1");
  }

  function addLabor() {
    if (!selectedWorkTypeId) return;
    const qty = Math.max(1, Number(laborQty || 1));
    const wt = workTypeById.get(String(selectedWorkTypeId));
    if (!wt) return;

    setEstimateLabors((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        workTypeId: wt.id,
        name: wt.name,
        qty,
        unitPrice: Number(wt.price ?? 0),
      },
    ]);

    setSelectedWorkTypeId("");
    setLaborQty("1");
  }

  function removePart(id: string) {
    setEstimateParts((prev) => prev.filter((p) => p.id !== id));
  }

  function removeLabor(id: string) {
    setEstimateLabors((prev) => prev.filter((l) => l.id !== id));
  }

  const partsTotal = estimateParts.reduce(
    (sum, p) => sum + Number(p.qty) * Number(p.unitPrice),
    0
  );

  const laborTotal = estimateLabors.reduce(
    (sum, l) => sum + Number(l.qty) * Number(l.unitPrice),
    0
  );

  const subTotal = partsTotal + laborTotal;
  const vatRate = 0.24;
  const vatAmount = subTotal * vatRate;
  const total = subTotal + vatAmount;

  const createEstimate = useMutation({
    mutationFn: async () => {
      const estimateToken = `est-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const created = await api.createWorkOrder({
        recordType: "estimate",
        customerId: customerId || null,
        title: title.trim() || "Estimate",
        faultDescription: notes.trim() || "",
        estimateStatus: "not_sent",
        estimateToken,
        estimateLink: `${window.location.origin}/estimate/${estimateToken}`,
        trackingLink: `${window.location.origin}/track/${estimateToken}`,
        estimateTotals: {
          partsTotal,
          laborTotal,
          subTotal,
          vatRate,
          vatAmount,
          total,
        },
        status: "planned",
        createdAt: new Date().toISOString(),
        mechanicIds: [],
        schedule: null,
      });

      for (const p of estimateParts) {
        await api.addWOPart({
          workOrderId: created.id,
          partId: p.partId,
          qty: p.qty,
          unitPrice: p.unitPrice,
          name: p.name,
        });
      }

      for (const l of estimateLabors) {
        await api.addWOLabor({
          workOrderId: created.id,
          workTypeId: l.workTypeId,
          qty: l.qty,
          unitPrice: l.unitPrice,
          name: l.name,
        });
      }

      return created;
    },
    onSuccess: (created: any) => {
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["woParts", String(created.id)] });
      qc.invalidateQueries({ queryKey: ["woLabors", String(created.id)] });
      navigate(`/estimates/${created.id}`);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.titleWrap}>
          <div className={styles.kicker}>Estimate</div>
          <h2 className={styles.title}>New Estimate</h2>
         
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={() => navigate("/")}>
            ← Back
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => createEstimate.mutate()}
            disabled={!customerId || estimateParts.length + estimateLabors.length === 0 || createEstimate.isPending}
          >
            {createEstimate.isPending ? "Creating..." : "Create Estimate"}
          </button>
        </div>
      </div>

      <Card title="Customer">
        <select
          className={styles.input}
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select customer</option>
          {customers.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.email ? `• ${c.email}` : ""}
            </option>
          ))}
        </select>
      </Card>

      <Card title="Estimate title">
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: BMW brake estimate / iPhone screen replacement"
        />
      </Card>

      <Card title="Parts">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <select
            className={styles.input}
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          >
            <option value="">Select part</option>
            {partsCatalog.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} • €{Number(p.price ?? 0).toFixed(2)}
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            type="number"
            min="1"
            value={partQty}
            onChange={(e) => setPartQty(e.target.value)}
            style={{ width: 100 }}
          />

          <button className={styles.secondaryBtn} onClick={addPart}>
            Add Part
          </button>
        </div>

        {estimateParts.length === 0 ? (
          <div className={styles.muted}>No parts added</div>
        ) : (
          <div className={styles.rowList}>
            {estimateParts.map((p) => (
              <div key={p.id} className={styles.row}>
                <span className={styles.rowLabel}>
                  {p.name} × {p.qty}
                </span>
                <span className={styles.rowValue}>
                  €{(Number(p.qty) * Number(p.unitPrice)).toFixed(2)}
                  <button
                    style={{ marginLeft: 10 }}
                    className={styles.secondaryBtn}
                    onClick={() => removePart(p.id)}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Labor">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <select
            className={styles.input}
            value={selectedWorkTypeId}
            onChange={(e) => setSelectedWorkTypeId(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          >
            <option value="">Select labor</option>
            {workTypes.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.name} • €{Number(w.price ?? 0).toFixed(2)}
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            type="number"
            min="1"
            value={laborQty}
            onChange={(e) => setLaborQty(e.target.value)}
            style={{ width: 100 }}
          />

          <button className={styles.secondaryBtn} onClick={addLabor}>
            Add Labor
          </button>
        </div>

        {estimateLabors.length === 0 ? (
          <div className={styles.muted}>No labor added</div>
        ) : (
          <div className={styles.rowList}>
            {estimateLabors.map((l) => (
              <div key={l.id} className={styles.row}>
                <span className={styles.rowLabel}>
                  {l.name} × {l.qty}
                </span>
                <span className={styles.rowValue}>
                  €{(Number(l.qty) * Number(l.unitPrice)).toFixed(2)}
                  <button
                    style={{ marginLeft: 10 }}
                    className={styles.secondaryBtn}
                    onClick={() => removeLabor(l.id)}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Notes">
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional note"
        />
      </Card>

      <Card title="Totals">
        <div className={styles.rowList}>
          <InfoRow label="Parts total" value={`€${partsTotal.toFixed(2)}`} />
          <InfoRow label="Labor total" value={`€${laborTotal.toFixed(2)}`} />
          <InfoRow label="Subtotal" value={`€${subTotal.toFixed(2)}`} />
          <InfoRow label="VAT (24%)" value={`€${vatAmount.toFixed(2)}`} />
          <InfoRow label="Total" value={`€${total.toFixed(2)}`} />
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