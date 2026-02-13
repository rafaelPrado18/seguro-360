import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScopeGuard, AdminGuard, SuperAdminGuard } from "@/components/layout/ScopeGuard";
import Login from "./pages/Login";
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
import Usuarios from "./pages/Usuarios";
import WhatsAppInstancias from "./pages/WhatsAppInstancias";
import Empresas from "./pages/Empresas";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/leads" element={<ScopeGuard scope="leads"><Leads /></ScopeGuard>} />
        <Route path="/whatsapp" element={<ScopeGuard scope="whatsapp"><WhatsApp /></ScopeGuard>} />
        <Route path="/whatsapp/templates" element={<ScopeGuard scope="whatsapp"><WhatsAppTemplates /></ScopeGuard>} />
        <Route path="/gerenciar-status" element={<AdminGuard><GerenciarStatus /></AdminGuard>} />
        <Route path="/whatsapp/instancias" element={<AdminGuard><WhatsAppInstancias /></AdminGuard>} />
        <Route path="/clientes" element={<ScopeGuard scope="clientes"><Clientes /></ScopeGuard>} />
        <Route path="/apolices" element={<ScopeGuard scope="apolices"><Apolices /></ScopeGuard>} />
        <Route path="/sinistros" element={<ScopeGuard scope="sinistros"><Sinistros /></ScopeGuard>} />
        <Route path="/comissoes" element={<ScopeGuard scope="comissoes"><Comissoes /></ScopeGuard>} />
        <Route path="/renovacoes" element={<ScopeGuard scope="renovacoes"><Renovacoes /></ScopeGuard>} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/relatorios" element={<ScopeGuard scope="relatorios"><Relatorios /></ScopeGuard>} />
        <Route path="/usuarios" element={<AdminGuard><Usuarios /></AdminGuard>} />
        <Route path="/configuracoes" element={<AdminGuard><Configuracoes /></AdminGuard>} />
        <Route path="/empresas" element={<SuperAdminGuard><Empresas /></SuperAdminGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
