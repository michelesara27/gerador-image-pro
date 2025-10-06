// src/pages/Result.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTemplates } from "@/contexts/TemplateContext";
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Result() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { getGenerationRequestById } = useTemplates();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      const generationRequest = getGenerationRequestById(requestId);
      if (generationRequest) {
        setRequest(generationRequest);
      } else {
        toast.error("Requisição não encontrada");
        navigate("/dashboard");
      }
      setLoading(false);
    }
  }, [requestId, getGenerationRequestById, navigate]);

  const handleDownload = () => {
    if (request?.generatedImage) {
      const link = document.createElement("a");
      link.href = request.generatedImage;
      link.download = `imagem-gerada-${request.templateName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download iniciado!");
    }
  };

  const handleShare = async () => {
    if (navigator.share && request?.generatedImage) {
      try {
        await navigator.share({
          title: `Imagem gerada com ${request.templateName}`,
          text: "Confira esta imagem que gerei!",
          url: window.location.href,
        });
      } catch (error) {
        // Fallback para copiar URL
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleNewGeneration = () => {
    navigate("/dashboard");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Aguardando";
      case "processing":
        return "Processando";
      case "completed":
        return "Concluído";
      case "error":
        return "Erro";
      default:
        return "Desconhecido";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando resultado...</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Resultado não encontrado
            </h2>
            <p className="text-muted-foreground mb-4">
              A requisição solicitada não foi encontrada.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Imagem Gerada
              </h1>
              <p className="text-muted-foreground">
                Template: {request.templateName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1">{getStatusText(request.status)}</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagem Original */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Imagem Original</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={request.userImage}
                  alt="Imagem original"
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagem Gerada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Imagem Gerada</span>
                {request.status === "completed" && request.generatedImage && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center space-x-1"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Compartilhar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                {request.status === "completed" && request.generatedImage ? (
                  <img
                    src={request.generatedImage}
                    alt="Imagem gerada"
                    className="w-full h-full object-cover"
                  />
                ) : request.status === "processing" ||
                  request.status === "pending" ? (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-lg font-medium">Gerando imagem...</p>
                    <p className="text-sm text-muted-foreground">
                      Isso pode levar até 60 segundos
                    </p>
                  </div>
                ) : request.status === "error" ? (
                  <div className="text-center">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-lg font-medium">Erro na geração</p>
                    <p className="text-sm text-muted-foreground">
                      {request.error ||
                        "Ocorreu um erro durante o processamento"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">
                      Aguardando processamento
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Geração */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Detalhes da Geração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md mx-auto">
              <h4 className="font-medium mb-4 text-center">
                Informações da Geração
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Data de criação:
                  </span>
                  <span>
                    {new Date(request.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template:</span>
                  <span>{request.templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={getStatusColor(request.status)}
                    variant="outline"
                  >
                    {getStatusIcon(request.status)}
                    <span className="ml-1">
                      {getStatusText(request.status)}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleNewGeneration}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Gerar Nova Imagem</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
