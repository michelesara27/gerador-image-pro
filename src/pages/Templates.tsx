// src/pages/Templates.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import { useTemplates } from "../contexts/TemplateContext";
import { TemplateValidator, ValidationResult } from "../utils/validation";
import { Template } from "../services/templateService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

export default function Templates() {
  const navigate = useNavigate();
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    loading,
    error,
  } = useTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    category: "portrait",
    exampleImage: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "portrait", label: "Retrato" },
    { value: "artistic", label: "Artístico" },
    { value: "futuristic", label: "Futurista" },
    { value: "nature", label: "Natureza" },
    { value: "abstract", label: "Abstrato" },
    { value: "vintage", label: "Vintage" },
    { value: "cartoon", label: "Cartoon" },
    { value: "realistic", label: "Realista" },
    { value: "fantasy", label: "Fantasia" },
    { value: "other", label: "Outros" },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      prompt: "",
      category: "portrait",
      exampleImage: "",
    });
    setFormErrors([]);
    setEditingTemplate(null);
  };

  const openModal = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        prompt: template.prompt,
        category: template.category,
        exampleImage: template.exampleImage || "",
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const validation: ValidationResult = TemplateValidator.validateTemplate({
      name: TemplateValidator.sanitizeInput(formData.name),
      prompt: TemplateValidator.sanitizeInput(formData.prompt),
      category: formData.category,
      exampleImage: formData.exampleImage,
    });

    setFormErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsSubmitting(true);

    try {
      const templateData = {
        name: TemplateValidator.sanitizeInput(formData.name),
        prompt: TemplateValidator.sanitizeInput(formData.prompt),
        category: formData.category,
        exampleImage: formData.exampleImage || undefined,
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        toast.success("Template atualizado com sucesso!");
      } else {
        await addTemplate(templateData);
        toast.success("Template criado com sucesso!");
      }

      closeModal();
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast.error("Erro ao salvar template. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (template: Template) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o template "${template.name}"?`
      )
    ) {
      try {
        await deleteTemplate(template.id);
        toast.success("Template excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir template:", error);
        toast.error("Erro ao excluir template. Tente novamente.");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        // 6MB limit
        toast.error("Imagem deve ter no máximo 6MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          exampleImage: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((cat) => cat.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      portrait: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      artistic:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      futuristic:
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      nature:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      abstract: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      vintage:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      cartoon:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      realistic:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      fantasy:
        "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[category] || colors.other;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
              Erro ao carregar templates
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Gerenciar Templates
              </h1>
              <p className="text-muted-foreground">
                Crie e gerencie seus templates de geração de imagem
              </p>
            </div>
          </div>
          <Button
            onClick={() => openModal()}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">
                Erro ao carregar templates
              </p>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-semibold">
                Nenhum template encontrado
              </p>
              <p>
                {searchTerm || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie seu primeiro template para começar"}
              </p>
            </div>
            {!searchTerm && selectedCategory === "all" && (
              <Button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-gradient-card border border-border rounded-xl p-6 hover:shadow-glow transition-all duration-300 animate-scale-in"
              >
                <div className="space-y-4">
                  <div className="relative">
                    {template.exampleImage ? (
                      <img
                        src={template.exampleImage}
                        alt={template.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-secondary rounded-lg">
                        <Eye className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-secondary text-xs font-medium">
                      {getCategoryLabel(template.category)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      Criado em{" "}
                      {new Date(template.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal(template)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-scale-in">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold gradient-text">
                  {editingTemplate ? "Editar Template" : "Novo Template"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Error Messages */}
                {formErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-4 h-4 text-destructive mr-2" />
                      <span className="font-medium text-destructive">
                        Corrija os seguintes erros:
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-destructive/80">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Template *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Ex: Retrato Artístico"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      >
                        {categories.slice(1).map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prompt">Prompt *</Label>
                      <Textarea
                        id="prompt"
                        value={formData.prompt}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            prompt: e.target.value,
                          }))
                        }
                        placeholder="artistic portrait, elegant style, professional lighting..."
                        rows={6}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exampleImage">Imagem de Exemplo</Label>
                      <div className="mt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-24 border-2 border-dashed hover:bg-accent/50"
                        >
                          {formData.exampleImage ? (
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-2 rounded overflow-hidden">
                                <img
                                  src={formData.exampleImage}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm text-green-600">
                                Imagem carregada
                              </span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Clique para fazer upload
                              </span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-glow"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {editingTemplate
                          ? "Atualizar Template"
                          : "Criar Template"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
