// src/utils/imageProcessing.tsx
import { ImageModel } from "@/contexts/ImageContext";

export const processImage = async (
  imageDataUrl: string,
  model: ImageModel
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      // Apply filters
      const {
        brightness,
        contrast,
        saturate,
        blur,
        sepia,
        grayscale,
        hueRotate,
      } = model.filterSettings;

      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
      if (blur !== undefined) filterString += ` blur(${blur}px)`;
      if (sepia !== undefined) filterString += ` sepia(${sepia}%)`;
      if (grayscale !== undefined) filterString += ` grayscale(${grayscale}%)`;
      if (hueRotate !== undefined)
        filterString += ` hue-rotate(${hueRotate}deg)`;

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      // Add subtle vignette effect for some models
      if (
        model.id === "linkedin-headshot" ||
        model.id === "editorial-magazine"
      ) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.3,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.7
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = imageDataUrl;
  });
};

export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 6 * 1024 * 1024; // 6MB
  const minSize = 1 * 1024; // 1KB
  const minWidth = 512; // Largura mínima em pixels
  const minHeight = 512; // Altura mínima em pixels

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato não suportado. Use JPG, PNG ou WEBP.",
    };
  }

  if (file.size < minSize) {
    return { valid: false, error: "Arquivo muito pequeno. Mínimo 1KB." };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Arquivo muito grande. Máximo 6MB." };
  }

  // Validação de dimensões mínimas
  return new Promise<{ valid: boolean; error?: string }>((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Imagem muito pequena. Dimensões mínimas: ${minWidth}x${minHeight} pixels. Atual: ${img.width}x${img.height} pixels.`,
        });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      resolve({ valid: false, error: "Erro ao carregar a imagem." });
    };
    img.src = URL.createObjectURL(file);
  }) as any;
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
