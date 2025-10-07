// src/contexts/Model.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ImageModel } from "./ImageContext";
import { ModelService } from "@/services/modelService";
import { toast } from "sonner";

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

  // Carregar modelos do Supabase
  const refreshModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const modelsData = await ModelService.getAllModels();
      setModels(modelsData);
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
      const newModel = await ModelService.createModel(model);
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
      const updatedModel = await ModelService.updateModel(id, updates);
      setModels((prev) => prev.map((m) => (m.id === id ? updatedModel : m)));
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
      await ModelService.deleteModel(id);
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
