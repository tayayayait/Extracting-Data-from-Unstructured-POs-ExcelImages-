import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import BatchProcessingPage from "./pages/BatchProcessing";
import VendorManagementPage from "./pages/VendorManagement";
import MappingWizardPage from "./pages/MappingWizard";
import PricingRulesPage from "./pages/PricingRules";
import LogsReportPage from "./pages/LogsReport";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<BatchProcessingPage />} />
            <Route path="/vendors" element={<VendorManagementPage />} />
            <Route path="/mapping" element={<MappingWizardPage />} />
            <Route path="/pricing" element={<PricingRulesPage />} />
            <Route path="/logs" element={<LogsReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
