// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, Zap } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, register, loginDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          toast.success("Login realizado com sucesso!");
          navigate("/dashboard");
        } else {
          toast.error("Email ou senha incorretos");
        }
      } else {
        if (!formData.name) {
          toast.error("Por favor, preencha seu nome");
          setLoading(false);
          return;
        }
        const success = await register(
          formData.name,
          formData.email,
          formData.password
        );
        if (success) {
          toast.success("Conta criada! Você ganhou 10 créditos grátis! 🎉");
          navigate("/dashboard");
        } else {
          toast.error("Este email já está cadastrado");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const success = await loginDemo();
      if (success) {
        toast.success("Bem-vindo ao modo demo! 🎉");
        navigate("/dashboard");
      } else {
        toast.error("Erro ao acessar modo demo");
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 animate-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            AI Image Pro
          </h1>
          <p className="text-muted-foreground">
            Transforme suas imagens com inteligência artificial
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={isLogin ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={!isLogin ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setIsLogin(false)}
            >
              Registrar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-accent/50 hover:bg-accent/10"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <Zap className="w-4 h-4 mr-2 text-accent" />
              Entrar como Demo
            </Button>
          </form>

          {isLogin && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Não tem uma conta?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-primary hover:underline"
              >
                Registre-se grátis
              </button>
            </p>
          )}

          <div className="mt-6 space-y-3">
            {!isLogin && (
              <div className="p-4 rounded-lg bg-gradient-card border border-primary/20">
                <p className="text-sm text-center">
                  🎁 <span className="font-semibold">10 créditos grátis</span>{" "}
                  ao criar sua conta!
                </p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-center mb-2">
                <Zap className="w-4 h-4 inline mr-1 text-accent" />
                <span className="font-semibold">Modo Demo</span>
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Explore todas as funcionalidades com 25 créditos e exemplos
                pré-carregados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
