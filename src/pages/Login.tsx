import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import logoHataseg from "@/assets/logo-hataseg.png";
import { toast } from "@/hooks/use-toast";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://crm-hataseg.com.br/v1/create/authorization/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: senha,   // aqui estava errado
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast({
          title: "Erro no login",
          description: data?.message || "Credenciais inválidas.",
          variant: "destructive",
        });
        return;
      }

      // ================================
      // SALVAR COOKIES DO USUÁRIO
      // ================================
      document.cookie = `userToken=${data.userToken}; path=/;`;
      document.cookie = `userId=${data.userId}; path=/;`;
      document.cookie = `userName=${data.name}; path=/;`;
      document.cookie = `userEmail=${email}; path=/;`;
      document.cookie = `assignedConsultant=${data.email}; path=/;`;
      document.cookie = `userFunction=${data.function}; path=/;`;
      document.cookie = `userStatus=online; path=/;`;

      toast({
        title: `Bem vindo ${data.name}!`,
        description: `${data.function}`,
      });

      // ================================
      // ATUALIZAR STATUS DO USUÁRIO
      // ================================
      try {
        const statusResponse = await fetch("https://crm-hataseg.com.br/v1/update/agent/status", {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${data.userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentName: data.name,
            email: email,
            status: "online",
            userId: data.userId,
          }),
        });

        if (statusResponse.status === 204) {
          console.log("Status atualizado ✔");
        } else {
          const err = await statusResponse.json().catch(() => null);
          console.warn("Falha ao atualizar status:", err);
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
      }

      // ================================
      // REDIRECIONAR
      // ================================
      navigate("/");
      window.location.reload();

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao tentar fazer login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img src={logoHataseg} alt="HataSeg" className="h-16 w-16 object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">HataSeg</h1>
          <p className="text-sm text-muted-foreground">Seguros & Previdência</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardContent className="pt-6 pb-8 px-6 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Entrar na sua conta</h2>
              <p className="text-xs text-muted-foreground mt-1">Insira suas credenciais para acessar o sistema</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-10 font-semibold"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground">
          © 2026 HataSeg · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Login;
