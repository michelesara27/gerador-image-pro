// src/contexts/ModelContext.tsx
import React, { createContext, useContext, ReactNode } from "react";

// Interface mínima para funcionamento
interface ModelContextType {
  models: any[];
  loading: boolean;
  error: string | null;
}

// Context vazio inicial
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
  const value: ModelContextType = {
    models: [],
    loading: false,
    error: null,
  };

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
}
