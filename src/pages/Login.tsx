import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import logoHataseg from "@/assets/logo-hataseg.png";
import { toast } from "@/hooks/use-toast";

const MOCK_USERS = [
  { email: "admin@hataseg.com", senha: "admin123", nome: "Admin Geral", cargo: "Administrador" },
  { email: "andre@hataseg.com", senha: "andre123", nome: "André Oliveira", cargo: "Corretor — Novo" },
  { email: "beatriz@hataseg.com", senha: "beatriz123", nome: "Beatriz Costa", cargo: "Corretor — Renovação" },
  { email: "carlos@hataseg.com", senha: "carlos123", nome: "Carlos Neto", cargo: "Corretor — Sinistro" },
  { email: "diana@hataseg.com", senha: "diana123", nome: "Diana Alves", cargo: "Corretor — Financeiro" },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.email === email.toLowerCase().trim() && u.senha === senha
      );

      if (user) {
        toast({ title: `Bem-vindo, ${user.nome}!`, description: user.cargo });
        navigate("/");
      } else {
        toast({
          title: "Credenciais inválidas",
          description: "Verifique seu email e senha.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 800);
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha" className="text-sm">Senha</Label>
                  <button type="button" className="text-xs text-accent hover:underline">
                    Esqueceu a senha?
                  </button>
                </div>
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

            {/* Demo credentials */}
            <div className="border-t border-border pt-4">
              <p className="text-[11px] text-muted-foreground text-center mb-3">Credenciais de demonstração</p>
              <div className="grid grid-cols-1 gap-1.5">
                {MOCK_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    className="flex items-center justify-between px-3 py-2 rounded-md text-xs bg-muted/50 hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      setEmail(u.email);
                      setSenha(u.senha);
                    }}
                  >
                    <span className="font-medium text-foreground">{u.nome}</span>
                    <span className="text-muted-foreground">{u.cargo}</span>
                  </button>
                ))}
              </div>
            </div>
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
