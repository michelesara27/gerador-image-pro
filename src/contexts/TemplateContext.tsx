// src/context/TemplateContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  TemplateService,
  GenerationRequestService,
  Template,
  GenerationRequest,
} from "@/services/templateService";
import { toast } from "sonner";

interface TemplateContextType {
  templates: Template[];
  generationRequests: GenerationRequest[];
  loading: boolean;
  error: string | null;

  // Template operations
  addTemplate: (
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTemplate: (
    id: string,
    template: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => Template | undefined;
  refreshTemplates: () => Promise<void>;

  // Generation request operations
  addGenerationRequest: (
    request: Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>;
  updateGenerationRequest: (
    id: string,
    updates: Partial<Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  getGenerationRequestById: (id: string) => GenerationRequest | undefined;
  refreshGenerationRequests: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined
);

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplates must be used within TemplateProvider");
  }
  return context;
};

// Templates padrão para demonstração
const defaultTemplates: Template[] = [
  {
    id: "template-1",
    name: "Retrato Artístico",
    description:
      "Transforme sua foto em um retrato artístico com estilo clássico",
    exampleImage:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MzMzZWE7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZjQ2ZTU7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+UmV0cmF0byBBcnTDrXN0aWNvPC90ZXh0Pjwvc3ZnPg==",
    prompt:
      "artistic portrait, classical painting style, oil painting, renaissance art, detailed brushstrokes, warm lighting, professional portrait",
    category: "artistic",
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-2",
    name: "Estilo Cyberpunk",
    description: "Transforme sua imagem em arte futurística cyberpunk",
    exampleImage:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImN5YmVyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmYwMGZmO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDBmZmZmO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjY3liZXIpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtd2VpZ2h0PSJib2xkIj5DeWJlcnB1bms8L3RleHQ+PC9zdmc+",
    prompt:
      "cyberpunk style, neon lights, futuristic, digital art, synthwave, neon colors, high tech, urban night scene",
    category: "futuristic",
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-3",
    name: "Aquarela Suave",
    description: "Efeito de aquarela delicada e artística",
    exampleImage:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9IndhdGVyIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODdDRUVCO3N0b3Atb3BhY2l0eTowLjgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkI2QzE7c3RvcC1vcGFjaXR5OjAuNiIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI3dhdGVyKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0QTVTNjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+QXF1YXJlbGE8L3RleHQ+PC9zdmc+",
    prompt:
      "watercolor painting, soft brushstrokes, delicate colors, artistic, hand-painted, flowing colors, gentle texture",
    category: "artistic",
    createdAt: new Date().toISOString(),
  },
];

interface TemplateProviderProps {
  children: ReactNode;
}

export function TemplateProvider({ children }: TemplateProviderProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [generationRequests, setGenerationRequests] = useState<
    GenerationRequest[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar templates do Supabase
  const refreshTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templatesData = await TemplateService.getAllTemplates();
      setTemplates(templatesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar templates";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Carregar requisições de geração do Supabase
  const refreshGenerationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const requestsData =
        await GenerationRequestService.getAllGenerationRequests();
      setGenerationRequests(requestsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar requisições";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    refreshTemplates();
    refreshGenerationRequests();
  }, []);

  // Template operations
  const addTemplate = async (
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setLoading(true);
      setError(null);
      const newTemplate = await TemplateService.createTemplate(template);
      setTemplates((prev) => [newTemplate, ...prev]);
      toast.success("Template criado com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar template";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTemplate = await TemplateService.updateTemplate(id, updates);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? updatedTemplate : t))
      );
      toast.success("Template atualizado com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar template";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await TemplateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template removido com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover template";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTemplateById = (id: string): Template | undefined => {
    return templates.find((t) => t.id === id);
  };

  // Generation request operations
  const addGenerationRequest = async (
    request: Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const newRequest = await GenerationRequestService.createGenerationRequest(
        request
      );
      setGenerationRequests((prev) => [newRequest, ...prev]);
      return newRequest.id;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar requisição";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGenerationRequest = async (
    id: string,
    updates: Partial<Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRequest =
        await GenerationRequestService.updateGenerationRequest(id, updates);
      setGenerationRequests((prev) =>
        prev.map((r) => (r.id === id ? updatedRequest : r))
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar requisição";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGenerationRequestById = (
    id: string
  ): GenerationRequest | undefined => {
    return generationRequests.find((r) => r.id === id);
  };

  const value: TemplateContextType = {
    templates,
    generationRequests,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    refreshTemplates,
    addGenerationRequest,
    updateGenerationRequest,
    getGenerationRequestById,
    refreshGenerationRequests,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}
