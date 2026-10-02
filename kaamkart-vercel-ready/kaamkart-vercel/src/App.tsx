import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { RegisterChoice } from "./pages/RegisterChoice";
import { RegisterCustomer } from "./pages/RegisterCustomer";
import { RegisterWorker } from "./pages/RegisterWorker";
import { Login } from "./pages/Login";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { JobBids } from "./pages/JobBids";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-concrete">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<RegisterChoice />} />
            <Route path="/register/customer" element={<RegisterCustomer />} />
            <Route path="/register/worker" element={<RegisterWorker />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/customer"
              element={
                <ProtectedRoute allow={["CUSTOMER"]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/jobs/:jobId"
              element={
                <ProtectedRoute allow={["CUSTOMER"]}>
                  <JobBids />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker"
              element={
                <ProtectedRoute allow={["WORKER"]}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
