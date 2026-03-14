import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewPatient from "./pages/NewPatient";
import PatientPage from "./pages/Patient";
import EditPatientPage from "./pages/EditPatient";
import CaseManagement from "./pages/CaseManagement";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import PatientJoin from "./pages/PatientJoin";
import PatientLogin from "./pages/PatientLogin";
import PatientPortal from "./pages/PatientPortal";
import PatientAccess from "./pages/PatientAccess";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/patient-join" element={<PatientJoin />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/new"
          element={
            <ProtectedRoute>
              <NewPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/:id"
          element={
            <ProtectedRoute>
              <PatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/:id/edit"
          element={
            <ProtectedRoute>
              <EditPatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/case-management/:patientId"
          element={
            <ProtectedRoute>
              <CaseManagement />
            </ProtectedRoute>
          }
          />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
