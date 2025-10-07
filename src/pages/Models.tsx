// src/pages/Models.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useImages } from "@/contexts/ImageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// Dados locais para modelos
const localModels = [
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
];

const Models = () => {
  const navigate = useNavigate();
  const { getImagesByModel } = useImages();
  const [models, setModels] = useState(localModels);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "professional", label: "Profissional" },
    { value: "commercial", label: "Comercial" },
    { value: "artistic", label: "Artístico" },
    { value: "minimal", label: "Minimalista" },
  ];

  const categoryNames: Record<string, string> = {
    professional: "Profissional",
    commercial: "Comercial",
    artistic: "Artístico",
    minimal: "Minimalista",
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteModel = async (model: any) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o modelo "${model.name}"?`)
    ) {
      try {
        setModels((prev) => prev.filter((m) => m.id !== model.id));
        toast.success("Modelo excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir modelo.");
      }
    }
  };

  const handleCreateModel = async () => {
    const newModel = {
      id: `model-${Date.now()}`,
      name: "Novo Modelo Personalizado",
      description: "Descrição do novo modelo personalizado",
      category: "professional",
      filterSettings: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        hueRotate: 0,
      },
    };

    try {
      setModels((prev) => [newModel, ...prev]);
      toast.success("Modelo criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar modelo.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Modelos</h1>
            <p className="text-muted-foreground">
              Gerencie seus modelos de processamento de imagem
            </p>
          </div>

          <Button
            onClick={handleCreateModel}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-purple-600 shadow-glow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Modelo
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Modelos */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-semibold">Nenhum modelo encontrado</p>
              <p>
                {searchTerm || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie seu primeiro modelo para começar"}
              </p>
            </div>
            {!searchTerm && selectedCategory === "all" && (
              <Button
                onClick={handleCreateModel}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Modelo
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(
              filteredModels.reduce((acc, model) => {
                if (!acc[model.category]) {
                  acc[model.category] = [];
                }
                acc[model.category].push(model);
                return acc;
              }, {} as Record<string, typeof models>)
            ).map(([category, categoryModels]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  {categoryNames[category] || category}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categoryModels.map((model) => {
                    const usageCount = getImagesByModel(model.id).length;
                    return (
                      <div
                        key={model.id}
                        className="glass-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-all animate-slide-up group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">
                              {model.name}
                            </h3>
                            <p className="text-muted-foreground mb-3">
                              {model.description}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteModel(model)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Brilho
                            </span>
                            <span className="font-medium">
                              {model.filterSettings.brightness}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Contraste
                            </span>
                            <span className="font-medium">
                              {model.filterSettings.contrast}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Saturação
                            </span>
                            <span className="font-medium">
                              {model.filterSettings.saturate}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Vezes usado
                            </p>
                            <p className="font-semibold">{usageCount}</p>
                          </div>
                          <Button
                            onClick={() => navigate("/dashboard")}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Usar Modelo
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card Informativo */}
        <div className="glass-card rounded-2xl p-8 text-center bg-gradient-card border-2 border-primary/20">
          <h3 className="text-xl font-bold mb-2">Modelos de Processamento</h3>
          <p className="text-muted-foreground mb-4">
            Cada modelo aplica filtros específicos para transformar suas imagens
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {models.length} modelos disponíveis
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Models;
