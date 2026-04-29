const BASE_URL = "http://localhost:4000";

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  
  findVehicleByPlate: (plate: string) =>
    http<any[]>(`/vehicles?plate=${encodeURIComponent(plate)}`).then(a => a[0] ?? null),


  listWorkOrders: () => http(`/workOrders?_sort=createdAt&_order=desc`),
  getWorkOrder: (id: number) => http(`/workOrders/${id}`),
  createWorkOrder: (data: any) =>
    http(`/workOrders`, { method: "POST", body: JSON.stringify(data) }),
  patchWorkOrder: (id: number, patch: any) =>
    http(`/workOrders/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  // related lists
  listCustomers: () => http(`/customers`),
  listMechanics: () => http(`/mechanics`),
  listParts: () => http(`/parts`),
  listWorkTypes: () => http(`/workTypes`),

  // child tables
  listWOParts: (workOrderId: number) => http(`/workOrderParts?workOrderId=${workOrderId}`),
  addWOPart: (data: any) => http(`/workOrderParts`, { method: "POST", body: JSON.stringify(data) }),

  listWOLabors: (workOrderId: number) => http(`/workOrderLabors?workOrderId=${workOrderId}`),
  addWOLabor: (data: any) => http(`/workOrderLabors`, { method: "POST", body: JSON.stringify(data) }),

  listWONotes: (workOrderId: number) => http(`/workOrderNotes?workOrderId=${workOrderId}`),
  addWONote: (data: any) => http(`/workOrderNotes`, { method: "POST", body: JSON.stringify(data) }),
};