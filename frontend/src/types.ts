export type WorkOrderStatus = "planned" | "in_progress" | "waiting_pickup" | "done";

export type Vehicle = {
  id: number;
  plate: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  engineCode?: string;
  powerKw?: number;
  vin?: string;
};

export type Customer = { id: number; name: string; phone?: string; email?: string };
export type Mechanic = { id: number; name: string };

export type Schedule = {
  date: string;        // "2026-01-09"
  startTime: string;   // "08:00"
  durationMin: number; // 120
  location?: string;
  mainMechanicId?: number;
};

export type WorkOrder = {
  id: number;
  plate: string;
  vehicleId: number | null;
  status: WorkOrderStatus;
  createdAt: string;
  faultDescription: string;
  customerId: number | null;
  mechanicIds: number[];
  schedule: Schedule | null;
};

export type Part = { id: number; name: string; sku?: string; price: number };
export type WorkType = { id: number; name: string; price: number; defaultDurationMin?: number };

export type WorkOrderPart = {
  id: number;
  workOrderId: number;
  partId: number;
  qty: number;
  waitCustomerApproval: boolean;
};

export type WorkOrderLabor = {
  id: number;
  workOrderId: number;
  workTypeId: number;
  qty: number;
  waitCustomerApproval: boolean;
};

export type WorkOrderNote = {
  id: number;
  workOrderId: number;
  type: "internal" | "customer";
  text: string;
  createdAt: string;
};