import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardTechnicien from "./pages/DashboardTechnicien";
import DashboardEnqueteur from "./pages/DashboardEnqueteur";
import DeclarePhone from "./pages/DeclarePhone";
import VerifyIMEI from "./pages/VerifyIMEI";
import VerificationHistory from "./pages/VerificationHistory";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import PoliceReports from "./pages/PoliceReports";
import AdminPoliceContacts from "./pages/AdminPoliceContacts";
import AdminMLTraining from "./pages/AdminMLTraining";
import NotFound from "./pages/NotFound";
import ChatBot from "./components/ChatBot";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/technicien" element={<ProtectedRoute><DashboardTechnicien /></ProtectedRoute>} />
              <Route path="/dashboard/enqueteur" element={<ProtectedRoute><DashboardEnqueteur /></ProtectedRoute>} />
              <Route path="/declare" element={<ProtectedRoute><DeclarePhone /></ProtectedRoute>} />
              <Route path="/verify" element={<ProtectedRoute><VerifyIMEI /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><VerificationHistory /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/police" element={<AdminRoute><PoliceReports /></AdminRoute>} />
              <Route path="/admin/contacts" element={<AdminRoute><AdminPoliceContacts /></AdminRoute>} />
              <Route path="/admin/ml" element={<AdminRoute><AdminMLTraining /></AdminRoute>} />
              <Route path="/police-reports" element={<ProtectedRoute><PoliceReports /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
