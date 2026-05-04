import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import CaseDetail from "./pages/CaseDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminBackdoor from "./pages/AdminBackdoor";
import AdminCaseEditor from "./pages/AdminCaseEditor";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery/:category" element={<CategoryPage />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/:slug" element={<AdminBackdoor />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/case/new" element={<AdminCaseEditor />} />
          <Route path="/admin/case/:id" element={<AdminCaseEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
