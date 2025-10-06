// src/pages/History.tsx
import { useState } from "react";
import { useImages } from "@/contexts/ImageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const History = () => {
  const { generatedImages, models } = useImages();
  const [filterModel, setFilterModel] = useState<string | null>(null);

  const filteredImages = filterModel
    ? generatedImages.filter((img) => img.modelUsed === filterModel)
    : generatedImages;

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-image-${id}.jpg`;
    link.click();
    toast.success("Download iniciado!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Histórico</h1>
            <p className="text-muted-foreground">
              {filteredImages.length} imagens geradas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterModel || ""}
              onChange={(e) => setFilterModel(e.target.value || null)}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value="">Todos os modelos</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredImages.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma imagem gerada ainda. Comece criando sua primeira imagem!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="glass-card rounded-xl overflow-hidden shadow-card hover:shadow-glow transition-all animate-slide-up"
              >
                <div className="aspect-square relative group">
                  <img
                    src={image.processedImage}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleDownload(image.processedImage, image.id)
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{image.modelName}</span>
                    <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs">
                      Concluído
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(
                      new Date(image.timestamp),
                      "dd MMM yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
