import { api, type WorkOrder } from "../endpoints";

export const fetchOrders = async (): Promise<WorkOrder[]> => {
  return api.listWorkOrders();
};

export const fetchOrder = async (id: string): Promise<WorkOrder> => {
  return api.getWorkOrder(id);
};