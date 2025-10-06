// src/services/templateService.tsx
import {
  supabase,
  DatabaseTemplate,
  DatabaseGenerationRequest,
} from "@/lib/supabase";

export interface Template {
  id: string;
  name: string;
  exampleImage: string;
  prompt: string;
  category: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface GenerationRequest {
  id: string;
  templateId: string;
  templateName: string;
  userImage: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "error";
  generatedImage?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Funções de conversão entre formatos do banco e da aplicação
const dbTemplateToTemplate = (dbTemplate: DatabaseTemplate): Template => ({
  id: dbTemplate.id,
  name: dbTemplate.name,
  exampleImage: dbTemplate.example_image,
  prompt: dbTemplate.prompt,
  category: dbTemplate.category,
  status: dbTemplate.status,
  createdAt: dbTemplate.created_at,
  updatedAt: dbTemplate.updated_at,
});

const templateToDbTemplate = (
  template: Omit<Template, "id" | "createdAt" | "updatedAt">
): Omit<DatabaseTemplate, "id" | "created_at" | "updated_at"> => ({
  name: template.name,
  example_image: template.exampleImage,
  prompt: template.prompt,
  category: template.category,
  status: template.status,
});

const dbGenerationRequestToGenerationRequest = (
  dbRequest: DatabaseGenerationRequest
): GenerationRequest => ({
  id: dbRequest.id,
  templateId: dbRequest.template_id,
  templateName: dbRequest.template_name,
  userImage: dbRequest.user_image,
  prompt: dbRequest.prompt,
  status: dbRequest.status,
  generatedImage: dbRequest.generated_image,
  error: dbRequest.error,
  createdAt: dbRequest.created_at,
  updatedAt: dbRequest.updated_at,
});

const generationRequestToDbGenerationRequest = (
  request: Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">
): Omit<DatabaseGenerationRequest, "id" | "created_at" | "updated_at"> => ({
  template_id: request.templateId,
  template_name: request.templateName,
  user_image: request.userImage,
  prompt: request.prompt,
  status: request.status,
  generated_image: request.generatedImage,
  error: request.error,
});

// Serviços para Templates
export class TemplateService {
  // Buscar todos os templates ativos
  static async getAllTemplates(): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar templates:", error);
        throw new Error(`Erro ao buscar templates: ${error.message}`);
      }

      return data?.map(dbTemplateToTemplate) || [];
    } catch (error) {
      console.error("Erro no serviço de templates:", error);
      throw error;
    }
  }

  // Buscar template por ID
  static async getTemplateById(id: string): Promise<Template | null> {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Template não encontrado
        }
        console.error("Erro ao buscar template:", error);
        throw new Error(`Erro ao buscar template: ${error.message}`);
      }

      return data ? dbTemplateToTemplate(data) : null;
    } catch (error) {
      console.error("Erro no serviço de template:", error);
      throw error;
    }
  }

  // Criar novo template
  static async createTemplate(
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ): Promise<Template> {
    try {
      const dbTemplate = templateToDbTemplate(template);

      const { data, error } = await supabase
        .from("templates")
        .insert(dbTemplate)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar template:", error);
        throw new Error(`Erro ao criar template: ${error.message}`);
      }

      return dbTemplateToTemplate(data);
    } catch (error) {
      console.error("Erro no serviço de criação de template:", error);
      throw error;
    }
  }

  // Atualizar template
  static async updateTemplate(
    id: string,
    updates: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>
  ): Promise<Template> {
    try {
      const dbUpdates: Partial<
        Omit<DatabaseTemplate, "id" | "created_at" | "updated_at">
      > = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.exampleImage !== undefined)
        dbUpdates.example_image = updates.exampleImage;
      if (updates.prompt !== undefined) dbUpdates.prompt = updates.prompt;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from("templates")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar template:", error);
        throw new Error(`Erro ao atualizar template: ${error.message}`);
      }

      return dbTemplateToTemplate(data);
    } catch (error) {
      console.error("Erro no serviço de atualização de template:", error);
      throw error;
    }
  }

  // Deletar template (soft delete - marca como inativo)
  static async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ status: "inactive" })
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar template:", error);
        throw new Error(`Erro ao deletar template: ${error.message}`);
      }
    } catch (error) {
      console.error("Erro no serviço de deleção de template:", error);
      throw error;
    }
  }

  // Deletar template permanentemente
  static async permanentDeleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("templates").delete().eq("id", id);

      if (error) {
        console.error("Erro ao deletar template permanentemente:", error);
        throw new Error(
          `Erro ao deletar template permanentemente: ${error.message}`
        );
      }
    } catch (error) {
      console.error(
        "Erro no serviço de deleção permanente de template:",
        error
      );
      throw error;
    }
  }
}

// Serviços para Generation Requests
export class GenerationRequestService {
  // Buscar todas as requisições de geração
  static async getAllGenerationRequests(): Promise<GenerationRequest[]> {
    try {
      const { data, error } = await supabase
        .from("generation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar requisições:", error);
        throw new Error(`Erro ao buscar requisições: ${error.message}`);
      }

      return data?.map(dbGenerationRequestToGenerationRequest) || [];
    } catch (error) {
      console.error("Erro no serviço de requisições:", error);
      throw error;
    }
  }

  // Buscar requisição por ID
  static async getGenerationRequestById(
    id: string
  ): Promise<GenerationRequest | null> {
    try {
      const { data, error } = await supabase
        .from("generation_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Requisição não encontrada
        }
        console.error("Erro ao buscar requisição:", error);
        throw new Error(`Erro ao buscar requisição: ${error.message}`);
      }

      return data ? dbGenerationRequestToGenerationRequest(data) : null;
    } catch (error) {
      console.error("Erro no serviço de requisição:", error);
      throw error;
    }
  }

  // Criar nova requisição de geração
  static async createGenerationRequest(
    request: Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">
  ): Promise<GenerationRequest> {
    try {
      const dbRequest = generationRequestToDbGenerationRequest(request);

      const { data, error } = await supabase
        .from("generation_requests")
        .insert(dbRequest)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar requisição:", error);
        throw new Error(`Erro ao criar requisição: ${error.message}`);
      }

      return dbGenerationRequestToGenerationRequest(data);
    } catch (error) {
      console.error("Erro no serviço de criação de requisição:", error);
      throw error;
    }
  }

  // Atualizar requisição de geração
  static async updateGenerationRequest(
    id: string,
    updates: Partial<Omit<GenerationRequest, "id" | "createdAt" | "updatedAt">>
  ): Promise<GenerationRequest> {
    try {
      const dbUpdates: Partial<
        Omit<DatabaseGenerationRequest, "id" | "created_at" | "updated_at">
      > = {};

      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.generatedImage !== undefined)
        dbUpdates.generated_image = updates.generatedImage;
      if (updates.error !== undefined) dbUpdates.error = updates.error;

      const { data, error } = await supabase
        .from("generation_requests")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar requisição:", error);
        throw new Error(`Erro ao atualizar requisição: ${error.message}`);
      }

      return dbGenerationRequestToGenerationRequest(data);
    } catch (error) {
      console.error("Erro no serviço de atualização de requisição:", error);
      throw error;
    }
  }

  // Deletar requisição de geração
  static async deleteGenerationRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("generation_requests")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar requisição:", error);
        throw new Error(`Erro ao deletar requisição: ${error.message}`);
      }
    } catch (error) {
      console.error("Erro no serviço de deleção de requisição:", error);
      throw error;
    }
  }
}
