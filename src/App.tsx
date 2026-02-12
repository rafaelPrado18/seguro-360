import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Clientes from "./pages/Clientes";
import Apolices from "./pages/Apolices";
import Sinistros from "./pages/Sinistros";
import Comissoes from "./pages/Comissoes";
import Renovacoes from "./pages/Renovacoes";
import Agenda from "./pages/Agenda";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Leads from "./pages/Leads";
import WhatsApp from "./pages/WhatsApp";
import WhatsAppTemplates from "./pages/WhatsAppTemplates";
import GerenciarStatus from "./pages/GerenciarStatus";
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
          <Route path="/leads" element={<Leads />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/whatsapp/templates" element={<WhatsAppTemplates />} />
          <Route path="/gerenciar-status" element={<GerenciarStatus />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/apolices" element={<Apolices />} />
          <Route path="/sinistros" element={<Sinistros />} />
          <Route path="/comissoes" element={<Comissoes />} />
          <Route path="/renovacoes" element={<Renovacoes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
