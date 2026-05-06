import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScopeGuard, AdminGuard, SuperAdminGuard } from "@/components/layout/ScopeGuard";
import { AuthGuard } from "@/components/layout/AuthGuard";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Clientes from "./pages/Clientes";
import Apolices from "./pages/Apolices";
import Sinistros from "./pages/Sinistros";
import Comissoes from "./pages/Comissoes";
import Financeiro from "./pages/Financeiro";
import Renovacoes from "./pages/Renovacoes";
import Agenda from "./pages/Agenda";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Leads from "./pages/Leads";
import WhatsApp from "./pages/WhatsApp";
import WhatsAppTemplates from "./pages/WhatsAppTemplates";
import GerenciarStatus from "./pages/GerenciarStatus";
import GerenciarStatusRenovacao from "./pages/GerenciarStatusRenovacao";
import Usuarios from "./pages/Usuarios";
import WhatsAppInstancias from "./pages/WhatsAppInstancias";
import Empresas from "./pages/Empresas";
import Ponto from "./pages/Ponto";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner position="top-right" richColors closeButton expand visibleToasts={5} duration={8000} />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
        <Route path="/leads" element={<AuthGuard><ScopeGuard scope="leads"><Leads /></ScopeGuard></AuthGuard>} />
        <Route path="/whatsapp" element={<AuthGuard><ScopeGuard scope="whatsapp"><WhatsApp /></ScopeGuard></AuthGuard>} />
        <Route path="/whatsapp/templates" element={<AuthGuard><ScopeGuard scope="whatsapp"><WhatsAppTemplates /></ScopeGuard></AuthGuard>} />
        <Route path="/gerenciar-status" element={<AuthGuard><AdminGuard><GerenciarStatus /></AdminGuard></AuthGuard>} />
        <Route path="/gerenciar-status-renovacao" element={<AuthGuard><AdminGuard><GerenciarStatusRenovacao /></AdminGuard></AuthGuard>} />
        <Route path="/whatsapp/instancias" element={<AuthGuard><AdminGuard><WhatsAppInstancias /></AdminGuard></AuthGuard>} />
        <Route path="/clientes" element={<AuthGuard><ScopeGuard scope="clientes"><Clientes /></ScopeGuard></AuthGuard>} />
        <Route path="/apolices" element={<AuthGuard><ScopeGuard scope="apolices"><Apolices /></ScopeGuard></AuthGuard>} />
        <Route path="/sinistros" element={<AuthGuard><ScopeGuard scope="sinistros"><Sinistros /></ScopeGuard></AuthGuard>} />
        <Route path="/comissoes" element={<AuthGuard><ScopeGuard scope="comissoes"><Comissoes /></ScopeGuard></AuthGuard>} />
        <Route path="/financeiro" element={<AuthGuard><ScopeGuard scope="comissoes"><Financeiro /></ScopeGuard></AuthGuard>} />
        <Route path="/renovacoes" element={<AuthGuard><ScopeGuard scope="renovacoes"><Renovacoes /></ScopeGuard></AuthGuard>} />
        <Route path="/agenda" element={<AuthGuard><Agenda /></AuthGuard>} />
        <Route path="/ponto" element={<AuthGuard><Ponto /></AuthGuard>} />
        <Route path="/relatorios" element={<AuthGuard><Relatorios /></AuthGuard>} />
        <Route path="/usuarios" element={<AuthGuard><AdminGuard><Usuarios /></AdminGuard></AuthGuard>} />
        <Route path="/configuracoes" element={<AuthGuard><AdminGuard><Configuracoes /></AdminGuard></AuthGuard>} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
