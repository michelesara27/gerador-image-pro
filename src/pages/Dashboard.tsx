// src/pages/Dashboard.tsx
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTemplates } from "@/contexts/TemplateContext";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Sparkles,
  Check,
  Loader2,
  Download,
  X,
  // ❌ REMOVIDO: Settings import
} from "lucide-react";
import { toast } from "sonner";
import { validateImageFile, fileToDataUrl } from "@/utils/imageProcessing";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, updateCredits } = useAuth();
  const { templates, addGenerationRequest, updateGenerationRequest } =
    useTemplates();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      const dataUrl = await fileToDataUrl(file);
      setUploadedImage(dataUrl);
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar imagem");
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedTemplate || !user) return;

    if (user.credits < 1) {
      toast.error("Créditos insuficientes!");
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setProcessing(true);
    setProgress(0);

    // Criar requisição de geração
    const requestId = await addGenerationRequest({
      templateId: template.id,
      templateName: template.name,
      userImage: uploadedImage,
      prompt: template.prompt,
      status: "processing",
    });

    // Simular progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Preparar dados para o webhook
      const webhookData = {
        template_id: template.id,
        template_name: template.name,
        prompt: template.prompt,
        user_image: uploadedImage,
        user_id: user.id,
      };

      // Enviar para o webhook
      const response = await fetch(
        "https://gerador-yara.michelesara27.workers.dev/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        }
      );

      if (!response.ok) {
        throw new Error("Erro na requisição ao webhook");
      }

      const result = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      // Deduzir crédito
      updateCredits(-1);

      // Atualizar requisição com sucesso
      updateGenerationRequest(requestId, {
        status: "completed",
        generatedImage: result.generated_image || result.image_url,
      });

      setTimeout(() => {
        setProcessing(false);
        toast.success("Imagem gerada com sucesso! 🎉");
        // Navegar para a página de resultado
        navigate(`/dashboard/result/${requestId}`);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setProcessing(false);

      // Atualizar requisição com erro
      updateGenerationRequest(requestId, {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });

      toast.error("Erro ao gerar imagem. Tente novamente.");
    }
  };

  const handleNewImage = () => {
    setUploadedImage(null);
    setSelectedTemplate(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nova Imagem</h1>
            <p className="text-muted-foreground">
              Faça upload de uma imagem e escolha um template para transformá-la
            </p>
          </div>
          {/* ❌ REMOVIDO: Botão Gerenciar Templates */}
        </div>

        {/* Upload Area */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <div
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${dragActive ? "border-primary bg-primary/10" : "border-border"}
              ${uploadedImage ? "border-success" : ""}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-lg"
                />
                <div className="flex items-center justify-center gap-2 text-success">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Imagem carregada</span>
                </div>
                <Button variant="outline" onClick={handleNewImage}>
                  Trocar Imagem
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-1">
                    Arraste uma imagem ou clique para fazer upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG ou WEBP (mín. 1KB, máx. 6MB)
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Template Selection */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Escolha um Template</h2>
            {templates.length === 0 && (
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/templates")}
                className="text-sm"
              >
                Criar Primeiro Template
              </Button>
            )}
          </div>

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  disabled={!uploadedImage}
                  className={`
                    p-6 rounded-xl border-2 text-left transition-all
                    ${
                      selectedTemplate === template.id
                        ? "border-primary bg-gradient-card shadow-glow"
                        : "border-border hover:border-primary/50"
                    }
                    ${
                      !uploadedImage
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <div className="space-y-3">
                    <img
                      src={template.exampleImage}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {template.name}
                        </h3>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-secondary text-xs inline-block">
                      {template.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhum template encontrado. Crie seu primeiro template para
                começar.
              </p>
              <Button
                onClick={() => navigate("/dashboard/templates")}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Criar Template
              </Button>
            </div>
          )}
        </div>

        {/* Generate Button */}
        {uploadedImage && selectedTemplate && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={processing}
              className="px-8 shadow-glow"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando {progress}%
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Imagem (1 crédito)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
