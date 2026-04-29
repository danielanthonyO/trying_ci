import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../API/endpoints";
import styles from "./EstimatePage.module.css";

export default function EstimatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!id) return <Navigate to="/" />;

  const { data: estimate, isLoading, isError } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: () => api.getWorkOrder(id),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const { data: woParts = [] } = useQuery({
    queryKey: ["woParts", id],
    queryFn: () => api.listWOParts(id),
  });

  const { data: woLabors = [] } = useQuery({
    queryKey: ["woLabors", id],
    queryFn: () => api.listWOLabors(id),
  });

  const customerById = useMemo(
    () => new Map(customers.map((c: any) => [String(c.id), c])),
    [customers]
  );

  const sendEstimate = useMutation({
    mutationFn: () => api.sendEstimate(id),
    onSuccess: (updated: any) => {
      qc.invalidateQueries({ queryKey: ["workOrder", id] });
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      alert(
        updated?.estimateLink
          ? `Estimate link created:\n\n${updated.estimateLink}`
          : "Estimate sent."
      );
    },
  });

  if (isLoading) return <div className={styles.page}>Loading…</div>;
  if (isError || !estimate) return <div className={styles.page}>Estimate not found.</div>;

  const customer =
    estimate.customerId != null
      ? customerById.get(String(estimate.customerId))
      : null;

  const partsTotal = woParts.reduce(
    (sum: number, p: any) => sum + Number(p.qty ?? 1) * Number(p.unitPrice ?? p.price ?? 0),
    0
  );

  const laborTotal = woLabors.reduce(
    (sum: number, l: any) => sum + Number(l.qty ?? 1) * Number(l.unitPrice ?? l.price ?? 0),
    0
  );

  const subTotal = partsTotal + laborTotal;
  const vatAmount = subTotal * 0.24;
  const total = subTotal + vatAmount;

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.titleWrap}>
          <div className={styles.kicker}>Estimate</div>
          <h2 className={styles.title}>
            #{estimate.id} — {estimate.title ?? "Estimate"}
          </h2>
          <div className={styles.status}>
            Customer: {customer?.name ?? "Not selected"}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={() => navigate("/")}>
            ← Back
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => sendEstimate.mutate()}
            disabled={sendEstimate.isPending}
          >
            {sendEstimate.isPending ? "Sending..." : "Send Estimate"}
          </button>
        </div>
      </div>

      <Card title="Parts">
        {woParts.length === 0 ? (
          <div className={styles.muted}>No parts added</div>
        ) : (
          <div className={styles.rowList}>
            {woParts.map((p: any) => (
              <InfoRow
                key={p.id}
                label={`${p.name ?? `Part #${p.partId}`} × ${p.qty ?? 1}`}
                value={`€${(Number(p.qty ?? 1) * Number(p.unitPrice ?? p.price ?? 0)).toFixed(2)}`}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="Labor">
        {woLabors.length === 0 ? (
          <div className={styles.muted}>No labor added</div>
        ) : (
          <div className={styles.rowList}>
            {woLabors.map((l: any) => (
              <InfoRow
                key={l.id}
                label={`${l.name ?? `Labor #${l.workTypeId}`} × ${l.qty ?? 1}`}
                value={`€${(Number(l.qty ?? 1) * Number(l.unitPrice ?? l.price ?? 0)).toFixed(2)}`}
              />
            ))}
          </div>
        )}
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