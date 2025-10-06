// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ImageProvider } from "./contexts/ImageContext";
import { TemplateProvider } from "./contexts/TemplateContext";
import { ModelProvider } from "./contexts/ModelContext"; // ✅ NOVO
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Models from "./pages/Models";
import Templates from "./pages/Templates";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <ImageProvider>
            <TemplateProvider>
              <ModelProvider>
                {" "}
                {/* ✅ NOVO PROVIDER */}
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/history" element={<History />} />
                  <Route path="/dashboard/models" element={<Models />} />
                  <Route path="/dashboard/templates" element={<Templates />} />
                  <Route
                    path="/dashboard/result/:requestId"
                    element={<Result />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ModelProvider>{" "}
              {/* ✅ FECHAMENTO DO NOVO PROVIDER */}
            </TemplateProvider>
          </ImageProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
