import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import WorkOrdersListPage from "./pages/workOrderList/WorkOrdersListPage";
import WorkOrderPage from "./components/workOrders/NewWorkOrderPage";
import CalendarPage from "./pages/calender/CalendarPage";
// import WorkOrderPreviewPage from "./pages/workOderPreview/WorkOrderPreviewPage";
import MechanicWorkloadPage from "./pages/workload/MechanicWorkloadPage";
import NewEstimatePage from "./pages/estimates/NewEstimatePage";
import EstimatePage from "./pages/estimates/EstimatePage";
import Customers from "./pages/Customers/Customers";
import Devices from "./pages/Devices/Devices";
import CreateDevicePage from "./pages/Devices/CreateDevicePage";
import DeviceDetailsPage from "./pages/Devices/DeviceDetailsPage";
import PartList from "./pages/Parts/PartList";
import Users from "./pages/Users/Users";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/work-orders" element={<WorkOrdersListPage />} />
          <Route path="/work-orders/:id" element={<WorkOrderPage />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetailsPage />} />
          <Route path="/devices/new" element={<CreateDevicePage />} />
          <Route path="/parts" element={<PartList />} />
          <Route path="/users" element={<Users />} />
        </Route>

        {/* <Route
          path="/work-orders/:id/preview"
          element={<WorkOrderPreviewPage />}
        /> */}

        <Route path="/mechanic-workload" element={<MechanicWorkloadPage />} />
        <Route path="/estimates/new" element={<NewEstimatePage />} />
        <Route path="/estimates/:id" element={<EstimatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
