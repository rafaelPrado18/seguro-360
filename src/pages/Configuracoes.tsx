import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Building2, User, Bell, Shield, Database } from "lucide-react";

const Configuracoes = () => {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
          <p className="text-sm text-muted-foreground">Gerencie as preferências do sistema</p>
        </div>

        {/* Dados da Corretora */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Dados da Corretora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Razão Social</Label>
                <Input defaultValue="Corretora de Seguros Alpha Ltda" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CNPJ</Label>
                <Input defaultValue="12.345.678/0001-90" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">SUSEP</Label>
                <Input defaultValue="10.123456-7" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone</Label>
                <Input defaultValue="(11) 3333-4567" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Endereço</Label>
              <Input defaultValue="Av. Paulista, 1000 - 10º andar - São Paulo/SP" className="h-9 text-sm" />
            </div>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Renovações próximas (30 dias)", desc: "Notificar sobre apólices prestes a vencer", default: true },
              { label: "Novos sinistros", desc: "Alertar quando um sinistro for aberto", default: true },
              { label: "Comissões recebidas", desc: "Notificar sobre créditos de comissão", default: false },
              { label: "Aniversário de clientes", desc: "Lembrete de aniversário de segurados", default: true },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked={n.default} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Usuários do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gerencie os usuários que têm acesso ao CRM. Para adicionar ou gerenciar usuários, conecte o Lovable Cloud.</p>
            <Button variant="outline" size="sm" className="mt-3">Gerenciar Usuários</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Configuracoes;
