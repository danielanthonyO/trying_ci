import axios from "axios";

const BASE_URL = "http://localhost:3000";

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AuthUser {
  id?: number;
  userId?: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface Customer {
  id: number;
  name: string;
  type?: string;
  phone?: string | null;
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Device {
  id: number;
  customerId: number;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: Customer;
}

export interface CreateDevicePayload {
  customerId: number;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export interface UpdateDevicePayload {
  customerId?: number;
  type?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export interface TicketHistoryItem {
  id: number;
  ticketId?: number;
  status: string;
  note?: string | null;
  createdAt: string;
}

export interface CostEstimate {
  id: number;
  ticketId: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
  status: string;
  approvalToken?: string | null;
  decidedAt?: string | null;
  expiresAt?: string | null;
  laborCost: number;
  partsCost: number;
  note?: string | null;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalCost: number;
}

export interface WorkOrder {
  id: number;
  customerId: number;
  deviceId: number;
  problemDescription: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  assignedToId?: number | null;
  customer?: Customer;
  device?: Device;
  history?: TicketHistoryItem[];
  estimate?: CostEstimate | null;
}

export interface CreateWorkOrderPayload {
  customerId: number;
  deviceId: number;
  problemDescription: string;
}

export interface UpdateWorkOrderStatusPayload {
  status:
    | "RECEIVED"
    | "DIAGNOSTICS"
    | "WAITING_APPROVAL"
    | "IN_REPAIR"
    | "READY"
    | "DELIVERED"
    | "NOT_SERVICED";
  note?: string;
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await http.post("/auth/login", { email, password });
    return res.data;
  },

  async register(email: string, password: string, role: string) {
    const res = await http.post("/auth/register", { email, password, role });
    return res.data;
  },

  async me(): Promise<AuthUser> {
    const res = await http.get("/auth/me", {
      headers: authHeader(),
    });
    return res.data;
  },

  async listWorkOrders(): Promise<WorkOrder[]> {
    const res = await http.get("/orders", {
      headers: authHeader(),
    });
    return res.data;
  },

  async getWorkOrder(id: string | number): Promise<WorkOrder> {
    const res = await http.get(`/orders/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async createWorkOrder(payload: CreateWorkOrderPayload): Promise<WorkOrder> {
    const res = await http.post("/orders", payload, {
      headers: authHeader(),
    });
    return res.data;
  },

  async updateWorkOrderStatus(
    id: string | number,
    payload: UpdateWorkOrderStatusPayload
  ): Promise<WorkOrder> {
    const res = await http.patch(`/orders/${id}/status`, payload, {
      headers: authHeader(),
    });
    return res.data;
  },

  async patchWorkOrder(
    id: string | number,
    payload: Partial<UpdateWorkOrderStatusPayload>
  ): Promise<WorkOrder> {
    const statusPayload: UpdateWorkOrderStatusPayload = {
      status: payload.status ?? "RECEIVED",
    };

    if (typeof payload.note === "string" && payload.note.trim()) {
      statusPayload.note = payload.note.trim();
    }

    return api.updateWorkOrderStatus(id, statusPayload);
  },

  async listCustomers(): Promise<Customer[]> {
    const res = await http.get("/customers", {
      headers: authHeader(),
    });
    return res.data;
  },

  async listDevices(): Promise<Device[]> {
    const res = await http.get("/devices", {
      headers: authHeader(),
    });
    return res.data;
  },

  async getDevice(id: string | number): Promise<Device> {
    const res = await http.get(`/devices/${id}`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async createDevice(payload: CreateDevicePayload): Promise<Device> {
    const res = await http.post("/devices", payload, {
      headers: authHeader(),
    });
    return res.data;
  },

  async updateDevice(
    id: string | number,
    payload: UpdateDevicePayload
  ): Promise<Device> {
    const res = await http.patch(`/devices/${id}`, payload, {
      headers: authHeader(),
    });
    return res.data;
  },

  async deleteDevice(id: string | number): Promise<void> {
    await http.delete(`/devices/${id}`, {
      headers: authHeader(),
    });
  },

  async listMechanics(): Promise<any[]> {
    return [];
  },

  async listParts(): Promise<any[]> {
    return [];
  },

  async listWorkTypes(): Promise<any[]> {
    return [];
  },

  async listWOParts(_id: string | number): Promise<any[]> {
    return [];
  },

  async listWOLabors(_id: string | number): Promise<any[]> {
    return [];
  },

  async findVehicleByPlate(_plate: string): Promise<any | null> {
    return null;
  },
};