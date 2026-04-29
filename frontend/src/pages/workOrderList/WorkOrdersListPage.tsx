import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type WorkOrder } from "../../API/endpoints";
import Modal from "../../components/Modal";

import pageStyles from "./WorkOrdersListPage.module.css";
import modalStyles from "./WorkOrderDetailsModal.module.css";

type RepairStatus =
  | "RECEIVED"
  | "DIAGNOSTICS"
  | "WAITING_APPROVAL"
  | "IN_REPAIR"
  | "READY"
  | "DELIVERED"
  | "NOT_SERVICED";

function statusPillClass(status: string) {
  return status === "RECEIVED"
    ? pageStyles.pillPlanned
    : status === "DIAGNOSTICS" || status === "IN_REPAIR"
    ? pageStyles.pillInProgress
    : status === "READY" || status === "DELIVERED"
    ? pageStyles.pillDone
    : status === "WAITING_APPROVAL" || status === "NOT_SERVICED"
    ? pageStyles.pillCancelled
    : "";
}

function fmtStatus(status?: string) {
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
      return status ?? "—";
  }
}

function fmtDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function money(value: number) {
  return `€${Number(value || 0).toFixed(2)}`;
}

function getTicketTitle(wo: WorkOrder) {
  return (
    [wo.device?.type, wo.device?.brand, wo.device?.model].filter(Boolean).join(" ") ||
    `Ticket #${wo.id}`
  );
}

export default function WorkOrdersListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [qText, setQText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RepairStatus>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");

  const q = useQuery({
    queryKey: ["workOrders"],
    queryFn: api.listWorkOrders,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: api.listCustomers,
  });

  const customerById = useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers]
  );

  const itemsSorted = useMemo(() => {
    const arr = Array.isArray(q.data) ? q.data : [];
    return [...arr].sort((a, b) =>
      String(b.updatedAt ?? b.createdAt ?? "").localeCompare(
        String(a.updatedAt ?? a.createdAt ?? "")
      )
    );
  }, [q.data]);

  const items = useMemo(() => {
    const t = qText.trim().toLowerCase();

    return itemsSorted.filter((wo) => {
      if (statusFilter !== "all" && String(wo.status ?? "") !== statusFilter) {
        return false;
      }

      if (customerFilter !== "all" && String(wo.customerId ?? "") !== customerFilter) {
        return false;
      }

      if (!t) return true;

      const customerName =
        wo.customer?.name ||
        (wo.customerId != null
          ? customerById.get(String(wo.customerId))?.name ?? ""
          : "");

      const hay = [
        String(wo.id ?? ""),
        String(wo.problemDescription ?? ""),
        String(wo.status ?? ""),
        String(customerName ?? ""),
        String(wo.device?.type ?? ""),
        String(wo.device?.brand ?? ""),
        String(wo.device?.model ?? ""),
        String(wo.device?.serialNumber ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(t);
    });
  }, [itemsSorted, qText, statusFilter, customerFilter, customerById]);

  const patchStatus = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: RepairStatus;
      note?: string;
    }) => api.updateWorkOrderStatus(id, { status, note }),

    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["workOrders"] });
      await qc.cancelQueries({ queryKey: ["workOrder", id] });

      const prevList = qc.getQueryData<WorkOrder[]>(["workOrders"]);
      const prevOne = qc.getQueryData<WorkOrder>(["workOrder", id]);

      qc.setQueryData<WorkOrder[]>(["workOrders"], (old) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.map((wo) =>
          String(wo.id) === String(id)
            ? { ...wo, status, updatedAt: new Date().toISOString() }
            : wo
        );
      });

      qc.setQueryData<WorkOrder>(["workOrder", id], (old) =>
        old ? { ...old, status, updatedAt: new Date().toISOString() } : old
      );

      setSelected((old) =>
        old && String(old.id) === String(id)
          ? { ...old, status, updatedAt: new Date().toISOString() }
          : old
      );

      return { prevList, prevOne };
    },

    onError: (_err, vars, ctx) => {
      if (ctx?.prevList) qc.setQueryData(["workOrders"], ctx.prevList);
      if (ctx?.prevOne) qc.setQueryData(["workOrder", vars.id], ctx.prevOne);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["workOrder", vars.id] });
    },
  });

  if (q.isLoading) return <div className={pageStyles.loading}>Loading…</div>;

  if (q.isError) {
    return (
      <div className={pageStyles.error}>
        Failed to load repair tickets: {String((q.error as Error)?.message ?? q.error)}
      </div>
    );
  }

  return (
    <div className={pageStyles.page}>
      <h2 className={pageStyles.title}>Repair Tickets</h2>

      <div className={pageStyles.toolbar}>
        <input
          className={pageStyles.searchInput}
          placeholder="Search by id / customer / device / problem / status…"
          value={qText}
          onChange={(e) => setQText(e.target.value)}
        />

        <select
          className={pageStyles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | RepairStatus)}
          title="Filter by status"
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

        <select
          className={pageStyles.filterSelect}
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          title="Filter by customer"
        >
          <option value="all">All customers</option>
          {customers.map((c) => (
            <option key={String(c.id)} value={String(c.id)}>
              {c.name ?? String(c.id)}
            </option>
          ))}
        </select>

        <div className={pageStyles.count}>
          Showing {items.length} / {itemsSorted.length}
        </div>
      </div>

      <div className={pageStyles.list}>
        {items.map((wo) => {
          const customerName =
            wo.customer?.name ||
            (wo.customerId != null
              ? customerById.get(String(wo.customerId))?.name ?? String(wo.customerId)
              : "—");

          return (
            <div key={String(wo.id)} className={pageStyles.rowCard}>
              <div className={pageStyles.rowLeft}>
                <div className={pageStyles.rowTitle}>
                  #{wo.id} — {getTicketTitle(wo)}
                </div>

                <div className={pageStyles.meta}>
                  <span>
                    Status:{" "}
                    <span className={`${pageStyles.pill} ${statusPillClass(String(wo.status))}`}>
                      <span className={pageStyles.pillDot} />
                      {fmtStatus(wo.status)}
                    </span>
                  </span>

                  <span>
                    Customer: <b>{customerName}</b>
                  </span>

                  <span>
                    Updated: <b>{fmtDateTime(wo.updatedAt ?? wo.createdAt)}</b>
                  </span>
                </div>

                <div className={pageStyles.problemLine}>
                  {wo.problemDescription || "No problem description"}
                </div>
              </div>

              <div className={pageStyles.rowRight}>
                <select
                  className={pageStyles.statusSelect}
                  value={(wo.status ?? "RECEIVED") as RepairStatus}
                  onChange={(e) =>
                    patchStatus.mutate({
                      id: String(wo.id),
                      status: e.target.value as RepairStatus,
                    })
                  }
                  disabled={patchStatus.isPending}
                  title="Change status"
                >
                  <option value="RECEIVED">Received</option>
                  <option value="DIAGNOSTICS">Diagnostics</option>
                  <option value="WAITING_APPROVAL">Waiting Approval</option>
                  <option value="IN_REPAIR">In Repair</option>
                  <option value="READY">Ready</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="NOT_SERVICED">Not Serviced</option>
                </select>

                <button className={pageStyles.detailsBtn} onClick={() => setSelected(wo)}>
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <WorkOrderDetailsModal
          wo={selected}
          onClose={() => setSelected(null)}
          onEdit={() => navigate(`/work-orders/${selected.id}`)}
        />
      )}
    </div>
  );
}

function WorkOrderDetailsModal({
  wo,
  onClose,
  onEdit,
}: {
  wo: WorkOrder;
  onClose: () => void;
  onEdit: () => void;
}) {
  const workOrderId = String(wo.id);
  const [tab, setTab] = useState<"main" | "problem" | "history" | "estimate">("main");

  const { data: fullWo } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => api.getWorkOrder(workOrderId),
    enabled: !!workOrderId,
    initialData: wo,
  });

  const ticket = fullWo ?? wo;

  const footer = (
    <div className={modalStyles.footer}>
      <button className={modalStyles.footerBtn} onClick={onEdit}>
        Open Details Page
      </button>
    </div>
  );

  return (
    <Modal
      title={`Repair Ticket #${ticket.id} — ${getTicketTitle(ticket)}`}
      onClose={onClose}
      footer={footer}
      width={900}
    >
      <div className={modalStyles.tabs}>
        <button
          className={`${modalStyles.tab} ${tab === "main" ? modalStyles.tabActive : ""}`}
          onClick={() => setTab("main")}
        >
          Main
        </button>
        <button
          className={`${modalStyles.tab} ${tab === "problem" ? modalStyles.tabActive : ""}`}
          onClick={() => setTab("problem")}
        >
          Problem
        </button>
        <button
          className={`${modalStyles.tab} ${tab === "history" ? modalStyles.tabActive : ""}`}
          onClick={() => setTab("history")}
        >
          History ({ticket.history?.length ?? 0})
        </button>
        <button
          className={`${modalStyles.tab} ${tab === "estimate" ? modalStyles.tabActive : ""}`}
          onClick={() => setTab("estimate")}
        >
          Estimate
        </button>
      </div>

      <div className={modalStyles.tabBody}>
        {tab === "main" && (
          <div>
            <div className={modalStyles.sectionTitle}>Main</div>

            <div className={modalStyles.grid2}>
              <div className={modalStyles.field}>
                <div className={modalStyles.label}>Status</div>
                <div className={modalStyles.value}>
                  <span className={`${pageStyles.pill} ${statusPillClass(String(ticket.status))}`}>
                    <span className={pageStyles.pillDot} />
                    {fmtStatus(ticket.status)}
                  </span>
                </div>
              </div>

              <div className={modalStyles.field}>
                <div className={modalStyles.label}>Updated</div>
                <div className={modalStyles.value}>
                  {fmtDateTime(ticket.updatedAt ?? ticket.createdAt)}
                </div>
              </div>

              <div className={modalStyles.field}>
                <div className={modalStyles.label}>Customer</div>
                <div className={modalStyles.value}>
                  {ticket.customer?.name ?? `Customer #${ticket.customerId}`}
                </div>
              </div>

              <div className={modalStyles.field}>
                <div className={modalStyles.label}>Device</div>
                <div className={modalStyles.value}>{getTicketTitle(ticket)}</div>
              </div>

              <div className={modalStyles.field}>
                <div className={modalStyles.label}>Ticket ID</div>
                <div className={modalStyles.value}>{ticket.id}</div>
              </div>

              <div className={modalStyles.field}>
                <div className={modalStyles.label}>Device ID</div>
                <div className={modalStyles.value}>{ticket.deviceId}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "problem" && (
          <div>
            <div className={modalStyles.sectionTitle}>Problem description</div>
            {ticket.problemDescription ? (
              <div>{ticket.problemDescription}</div>
            ) : (
              <div className={modalStyles.muted}>Not set</div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            <div className={modalStyles.sectionTitle}>History</div>
            {!ticket.history || ticket.history.length === 0 ? (
              <div className={modalStyles.muted}>No history</div>
            ) : (
              <div className={modalStyles.lineList}>
                {ticket.history.map((item) => (
                  <div key={item.id} className={modalStyles.lineItem}>
                    <div className={modalStyles.lineLeft}>
                      {fmtDateTime(item.createdAt)}
                    </div>
                    <div className={modalStyles.lineRight}>
                      {fmtStatus(item.status)}
                      {item.note ? ` — ${item.note}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "estimate" && (
          <div>
            <div className={modalStyles.sectionTitle}>Estimate</div>
            {!ticket.estimate ? (
              <div className={modalStyles.muted}>No estimate</div>
            ) : (
              <div className={modalStyles.miniList}>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Status</div>
                  <div className={modalStyles.value}>{ticket.estimate.status}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Labor Cost</div>
                  <div className={modalStyles.value}>{money(ticket.estimate.laborCost)}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Parts Cost</div>
                  <div className={modalStyles.value}>{money(ticket.estimate.partsCost)}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Subtotal</div>
                  <div className={modalStyles.value}>{money(ticket.estimate.subtotal)}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>VAT</div>
                  <div className={modalStyles.value}>{money(ticket.estimate.vatAmount)}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Total</div>
                  <div className={modalStyles.value}>{money(ticket.estimate.totalCost)}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Currency</div>
                  <div className={modalStyles.value}>{ticket.estimate.currency}</div>
                </div>
                <div className={modalStyles.miniRow}>
                  <div className={modalStyles.label}>Note</div>
                  <div className={modalStyles.value}>{ticket.estimate.note ?? "—"}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}