// src/contexts/ImageContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

export interface ImageModel {
  id: string;
  name: string;
  description: string;
  category: string;
  filterSettings: {
    brightness: number;
    contrast: number;
    saturate: number;
    blur?: number;
    sepia?: number;
    grayscale?: number;
    hueRotate?: number;
  };
}

export interface GeneratedImage {
  id: string;
  originalImage: string;
  processedImage: string;
  modelUsed: string;
  modelName: string;
  timestamp: string;
  status: "completed";
}

interface ImageContextType {
  models: ImageModel[];
  generatedImages: GeneratedImage[];
  addGeneratedImage: (image: GeneratedImage) => void;
  getImagesByModel: (modelId: string) => GeneratedImage[];
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImages must be used within ImageProvider");
  }
  return context;
};

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

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("ai_image_history");
    if (stored) {
      setGeneratedImages(JSON.parse(stored));
    }
  }, []);

  const addGeneratedImage = (image: GeneratedImage) => {
    const updated = [image, ...generatedImages];
    setGeneratedImages(updated);
    localStorage.setItem("ai_image_history", JSON.stringify(updated));
  };

  const getImagesByModel = (modelId: string) => {
    return generatedImages.filter((img) => img.modelUsed === modelId);
  };

  return (
    <ImageContext.Provider
      value={{
        models: defaultModels,
        generatedImages,
        addGeneratedImage,
        getImagesByModel,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
