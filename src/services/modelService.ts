import { supabase } from "@/lib/supabase";
import { ImageModel } from "@/contexts/ImageContext";

export interface DatabaseImageModel {
  id: string;
  name: string;
  description: string;
  category: string;
  filter_settings: {
    brightness: number;
    contrast: number;
    saturate: number;
    blur?: number;
    sepia?: number;
    grayscale?: number;
    hueRotate?: number;
  };
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Funções de conversão
const dbModelToImageModel = (dbModel: DatabaseImageModel): ImageModel => ({
  id: dbModel.id,
  name: dbModel.name,
  description: dbModel.description,
  category: dbModel.category,
  filterSettings: dbModel.filter_settings,
});

const imageModelToDbModel = (
  model: Omit<ImageModel, "id">
): Omit<DatabaseImageModel, "id" | "created_at" | "updated_at"> => ({
  name: model.name,
  description: model.description,
  category: model.category,
  filter_settings: model.filterSettings,
  status: "active",
});

export class ModelService {
  // Buscar todos os modelos ativos
  static async getAllModels(): Promise<ImageModel[]> {
    try {
      const { data, error } = await supabase
        .from("image_models")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar modelos:", error);
        throw new Error(`Erro ao buscar modelos: ${error.message}`);
      }

      return data?.map(dbModelToImageModel) || [];
    } catch (error) {
      console.error("Erro no serviço de modelos:", error);
      throw error;
    }
  }

  // Buscar modelo por ID
  static async getModelById(id: string): Promise<ImageModel | null> {
    try {
      const { data, error } = await supabase
        .from("image_models")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Erro ao buscar modelo:", error);
        throw new Error(`Erro ao buscar modelo: ${error.message}`);
      }

      return data ? dbModelToImageModel(data) : null;
    } catch (error) {
      console.error("Erro no serviço de modelo:", error);
      throw error;
    }
  }

  // Criar novo modelo
  static async createModel(model: Omit<ImageModel, "id">): Promise<ImageModel> {
    try {
      const dbModel = imageModelToDbModel(model);

      const { data, error } = await supabase
        .from("image_models")
        .insert(dbModel)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar modelo:", error);
        throw new Error(`Erro ao criar modelo: ${error.message}`);
      }

      return dbModelToImageModel(data);
    } catch (error) {
      console.error("Erro no serviço de criação de modelo:", error);
      throw error;
    }
  }

  // Atualizar modelo
  static async updateModel(
    id: string,
    updates: Partial<Omit<ImageModel, "id">>
  ): Promise<ImageModel> {
    try {
      const dbUpdates: Partial<
        Omit<DatabaseImageModel, "id" | "created_at" | "updated_at">
      > = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined)
        dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.filterSettings !== undefined)
        dbUpdates.filter_settings = updates.filterSettings;

      const { data, error } = await supabase
        .from("image_models")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar modelo:", error);
        throw new Error(`Erro ao atualizar modelo: ${error.message}`);
      }

      return dbModelToImageModel(data);
    } catch (error) {
      console.error("Erro no serviço de atualização de modelo:", error);
      throw error;
    }
  }

  // Deletar modelo (soft delete)
  static async deleteModel(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("image_models")
        .update({ status: "inactive" })
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar modelo:", error);
        throw new Error(`Erro ao deletar modelo: ${error.message}`);
      }
    } catch (error) {
      console.error("Erro no serviço de deleção de modelo:", error);
      throw error;
    }
  }
}
