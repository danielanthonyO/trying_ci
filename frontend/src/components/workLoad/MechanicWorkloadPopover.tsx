import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../API/endpoints";
import styles from "../../pages/calender/CalendarPage.module.css";

export default function MechanicWorkloadPopover({
  mechanicId,
  mechanicName,
}: {
  mechanicId: string;
  mechanicName: string;
}) {
  const { data: workOrders = [] } = useQuery({
    queryKey: ["workOrders"],
    queryFn: api.listWorkOrders,
  });

  const stats = useMemo(() => {
    const assigned = workOrders.filter(
      (wo: any) =>
        wo.schedule &&
        String(wo.schedule.mainMechanicId) === String(mechanicId)
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
      jobs: assigned.length,
      hours: (totalMinutes / 60).toFixed(1),
      planned,
      inProgress,
      done,
      cancelled,
    };
  }, [workOrders, mechanicId]);

  return (
    <div className={styles.workloadPopover}>
      <div className={styles.workloadHeader}>{mechanicName} workload</div>

      <div className={styles.workloadGrid}>
        <div className={styles.workloadItem}>
          <span className={styles.workloadLabel}>Jobs</span>
          <span className={styles.workloadValue}>{stats.jobs}</span>
        </div>

        <div className={styles.workloadItem}>
          <span className={styles.workloadLabel}>Hours</span>
          <span className={styles.workloadValue}>{stats.hours}</span>
        </div>

        <div className={styles.workloadItem}>
          <span className={styles.workloadLabel}>Planned</span>
          <span className={styles.workloadValue}>{stats.planned}</span>
        </div>

        <div className={styles.workloadItem}>
          <span className={styles.workloadLabel}>In progress</span>
          <span className={styles.workloadValue}>{stats.inProgress}</span>
        </div>

        <div className={styles.workloadItem}>
          <span className={styles.workloadLabel}>Done</span>
          <span className={styles.workloadValue}>{stats.done}</span>
        </div>

        <div className={styles.workloadItem}>
          <span className={styles.workloadLabel}>Cancelled</span>
          <span className={styles.workloadValue}>{stats.cancelled}</span>
        </div>
      </div>
    </div>
  );
}