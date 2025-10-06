// src/components/DashboardLayout.tsx
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Image as ImageIcon,
  History,
  Grid3x3,
  LogOut,
  Coins,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: ImageIcon, label: "Nova Imagem", path: "/dashboard" },
    { icon: History, label: "Histórico", path: "/dashboard/history" },
    { icon: Grid3x3, label: "Modelos", path: "/dashboard/models" },
    {
      icon: Settings,
      label: "Gerenciar Templates",
      path: "/dashboard/templates",
    }, // ✅ NOVO ITEM
  ];

  const isLowCredits = user && user.credits < 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-card border-b border-border h-16 flex items-center px-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:inline">
              AI Image Pro
            </span>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>

          {/* User info */}
          <div className="hidden lg:flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isLowCredits ? "bg-warning/20 animate-pulse" : "bg-secondary"
              }`}
            >
              <Coins
                className={`w-5 h-5 ${
                  isLowCredits ? "text-warning" : "text-accent"
                }`}
              />
              <span className="font-semibold">{user?.credits} créditos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
          glass-card border-r border-border w-64 flex flex-col p-4
          lg:relative lg:translate-x-0
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 mt-16 lg:mt-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          {/* Mobile user info */}
          <div className="lg:hidden mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isLowCredits ? "bg-warning/20" : "bg-secondary"
              }`}
            >
              <Coins
                className={`w-5 h-5 ${
                  isLowCredits ? "text-warning" : "text-accent"
                }`}
              />
              <span className="font-semibold">{user?.credits} créditos</span>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "hover:bg-secondary"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isLowCredits && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mt-4">
              <p className="text-sm font-medium text-warning mb-2">
                Créditos baixos!
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Você tem apenas {user?.credits} créditos restantes
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => navigate("/dashboard/plans")}
              >
                Ver Planos
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 mt-4 lg:hidden"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
