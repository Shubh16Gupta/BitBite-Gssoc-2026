import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import FarmerPortal from "./pages/FarmerPortal";
import BankPortal from "./pages/BankPortal";
import AdminPortal from "./pages/AdminPortal";
import FarmerDashboard from "./components/farmer/FarmerDashboard";
import LoanApplication from "./components/farmer/LoanApplication";
import CropUpload from "./components/farmer/CropUpload";
import LoanStatus from "./components/farmer/LoanStatus";
import Schemes from "./components/farmer/Schemes";
import BankDashboard from "./components/bank/BankDashboard";
import LoanRequests from "./components/bank/LoanRequests";
import LoanDetails from "./components/bank/LoanDetails";
import Monitoring from "./components/bank/Monitoring";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/auth/AdminLogin";
import Login from "./components/auth/Login";
import FarmerSignup from "./components/auth/FarmerSignup";
import BankLogin from "./components/auth/BankLogin";
import OTPVerification from "./components/auth/OTPVerification";
import Directory from "./pages/Directory";
import { useAuth } from "./hooks/useAuth";
import BankRegister from "./components/auth/BankRegister";
import FarmerProfile from "./components/farmer/FarmerProfile";
import MyFields from "./components/farmer/MyFields";
import FieldAnalytics from "./components/farmer/FieldAnalytics";
import Insurance from "./components/farmer/Insurance";
import InsurerLogin from "./components/auth/InsurerLogin";
import InsurerPortal from "./pages/InsurerPortal";
import InsurerDashboard from "./components/insurer/InsurerDashboard";


const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "farmer") return <Navigate to="/farmer" replace />;
    if (user.role === "bank") return <Navigate to="/bank" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="farmer/signup" element={<FarmerSignup />} />
          <Route path="bank/register" element={<BankRegister />} />
          <Route path="bank/login" element={<BankLogin />} />
          <Route path="insurer/login" element={<InsurerLogin />} />
          <Route path="verify-otp" element={<OTPVerification />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="directory" element={<Directory />} />
        </Route>

        {/* Farmer Routes */}
        <Route
          path="/farmer"
          element={
            user?.role === "farmer" ? (
              <FarmerPortal />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<FarmerDashboard />} />
          <Route path="fields" element={<MyFields />} />
          <Route path="fields/:fieldId" element={<FieldAnalytics />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="apply-loan" element={<LoanApplication />} />
          <Route path="upload-crop" element={<CropUpload />} />
          <Route path="loan-status" element={<LoanStatus />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="profile" element={<FarmerProfile />} />{" "}
          {/* ✅ Add this */}
        </Route>

        {/* Bank Routes */}
        <Route
          path="/bank"
          element={
            user?.role === "bank" ? (
              <BankPortal />
            ) : (
              <Navigate to="/bank/login" />
            )
          }
        >
          <Route index element={<BankDashboard />} />
          <Route path="requests" element={<LoanRequests />} />
          <Route path="loan/:id" element={<LoanDetails />} />
          <Route path="monitoring" element={<Monitoring />} />
        </Route>

        {/* Insurance Provider Routes */}
        <Route
          path="/insurer"
          element={
            user?.role === "insurer" ? (
              <InsurerPortal />
            ) : (
              <Navigate to="/insurer/login" />
            )
          }
        >
          <Route index element={<InsurerDashboard />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPortal />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="banks" element={<AdminDashboard />} />
          <Route
            path="users"
            element={
              <div className="p-8">
                <h1 className="text-2xl font-bold text-slate-900">
                  User Management
                </h1>
                <p className="text-slate-500 mt-2">
                  Manage all users on the platform
                </p>
              </div>
            }
          />
          <Route
            path="reports"
            element={
              <div className="p-8">
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 mt-2">
                  View platform analytics and reports
                </p>
              </div>
            }
          />
          <Route
            path="settings"
            element={
              <div className="p-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-2">
                  Configure platform settings
                </p>
              </div>
            }
          />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
