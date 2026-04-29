import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../API/endpoints";

export default function MechanicWorkloadPage() {
  const { data: mechanics = [], isLoading: mechanicsLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: api.listMechanics,
  });

  const { data: workOrders = [], isLoading: workOrdersLoading } = useQuery({
    queryKey: ["workOrders"],
    queryFn: api.listWorkOrders,
  });

  const rows = useMemo(() => {
    return mechanics.map((m: any) => {
      const assigned = workOrders.filter(
        (wo: any) =>
          wo.schedule &&
          String(wo.schedule.mainMechanicId) === String(m.id)
      );

      const totalMinutes = assigned.reduce(
        (sum: number, wo: any) => sum + Number(wo.schedule?.durationMin ?? 0),
        0
      );

      const planned = assigned.filter((wo: any) => wo.status === "planned").length;
      const inProgress = assigned.filter((wo: any) => wo.status === "in_progress").length;
      const done = assigned.filter((wo: any) => wo.status === "done").length;
      const cancelled = assigned.filter((wo: any) => wo.status === "cancelled").length;

      return {
        id: m.id,
        name: m.name,
        jobs: assigned.length,
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(1),
        planned,
        inProgress,
        done,
        cancelled,
      };
    });
  }, [mechanics, workOrders]);

  if (mechanicsLoading || workOrdersLoading) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>WORKLOAD</div>
        <h1 style={{ margin: "6px 0 0" }}>Mechanic workload</h1>
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 14,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th style={thStyle}>Mechanic</th>
              <th style={thStyle}>Jobs</th>
              <th style={thStyle}>Hours</th>
              <th style={thStyle}>Planned</th>
              <th style={thStyle}>In progress</th>
              <th style={thStyle}>Done</th>
              <th style={thStyle}>Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={String(r.id)}>
                <td style={tdStyle}>{r.name}</td>
                <td style={tdStyle}>{r.jobs}</td>
                <td style={tdStyle}>{r.totalHours}</td>
                <td style={tdStyle}>{r.planned}</td>
                <td style={tdStyle}>{r.inProgress}</td>
                <td style={tdStyle}>{r.done}</td>
                <td style={tdStyle}>{r.cancelled}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  No mechanics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 14,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderTop: "1px solid #f0f0f0",
  fontSize: 14,
};