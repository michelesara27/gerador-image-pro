// src/contexts/ModelContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ImageModel } from "./ImageContext";
import { toast } from "sonner";

// Mock data para os modelos (substituir por chamadas API quando necessário)
const defaultModels: ImageModel[] = [
  {
    id: "corporate-portrait",
    name: "Retrato Corporativo",
    description:
      "Tons profissionais, fundo neutro, ideal para perfis corporativos",
    category: "professional",
    filterSettings: {
      brightness: 110,
      contrast: 115,
      saturate: 80,
    },
  },
  {
    id: "product-photo",
    name: "Foto de Produto",
    description:
      "Fundo branco limpo, iluminação comercial perfeita para e-commerce",
    category: "commercial",
    filterSettings: {
      brightness: 120,
      contrast: 125,
      saturate: 110,
      blur: 0,
    },
  },
  {
    id: "linkedin-headshot",
    name: "Headshot LinkedIn",
    description:
      "Estilo profissional, close no rosto, perfeito para redes profissionais",
    category: "professional",
    filterSettings: {
      brightness: 105,
      contrast: 120,
      saturate: 90,
    },
  },
  {
    id: "editorial-magazine",
    name: "Editorial Magazine",
    description: "Dramático, alta moda, tons vibrantes para publicações",
    category: "artistic",
    filterSettings: {
      brightness: 95,
      contrast: 130,
      saturate: 110,
      hueRotate: 5,
    },
  },
  {
    id: "digital-avatar",
    name: "Avatar Digital",
    description: "Estilo artístico ilustrativo, cores vibrantes e modernas",
    category: "artistic",
    filterSettings: {
      brightness: 110,
      contrast: 125,
      saturate: 140,
      hueRotate: 10,
    },
  },
  {
    id: "minimalist",
    name: "Minimalista",
    description: "Clean, cores suaves, estética minimalista contemporânea",
    category: "minimal",
    filterSettings: {
      brightness: 115,
      contrast: 105,
      saturate: 70,
      sepia: 10,
    },
  },
];

interface ModelContextType {
  models: ImageModel[];
  loading: boolean;
  error: string | null;
  addModel: (model: Omit<ImageModel, "id">) => Promise<void>;
  updateModel: (
    id: string,
    updates: Partial<Omit<ImageModel, "id">>
  ) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  getModelById: (id: string) => ImageModel | undefined;
  refreshModels: () => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const useModels = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModels must be used within ModelProvider");
  }
  return context;
};

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const [models, setModels] = useState<ImageModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar modelos (mock data por enquanto)
  const refreshModels = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setModels(defaultModels);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar modelos";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    refreshModels();
  }, []);

  // Operações de modelo
  const addModel = async (model: Omit<ImageModel, "id">) => {
    try {
      setLoading(true);
      setError(null);

      // Simular criação de modelo
      const newModel: ImageModel = {
        ...model,
        id: `model-${Date.now()}`,
      };

      setModels((prev) => [newModel, ...prev]);
      toast.success("Modelo criado com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar modelo";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateModel = async (
    id: string,
    updates: Partial<Omit<ImageModel, "id">>
  ) => {
    try {
      setLoading(true);
      setError(null);

      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );

      toast.success("Modelo atualizado com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar modelo";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      setModels((prev) => prev.filter((m) => m.id !== id));
      toast.success("Modelo removido com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover modelo";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getModelById = (id: string): ImageModel | undefined => {
    return models.find((m) => m.id === id);
  };

  const value: ModelContextType = {
    models,
    loading,
    error,
    addModel,
    updateModel,
    deleteModel,
    getModelById,
    refreshModels,
  };

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
}
