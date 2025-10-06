// src/liv/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do banco de dados
export interface DatabaseTemplate {
  id: string;
  name: string;
  // ❌ REMOVIDO: description: string;
  example_image: string;
  prompt: string;
  category: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface DatabaseGenerationRequest {
  id: string;
  template_id: string;
  template_name: string;
  user_image: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "error";
  generated_image?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

// Definição do schema do banco de dados
export interface Database {
  public: {
    Tables: {
      templates: {
        Row: DatabaseTemplate;
        Insert: Omit<DatabaseTemplate, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<DatabaseTemplate, "id" | "created_at" | "updated_at">
        >;
      };
      generation_requests: {
        Row: DatabaseGenerationRequest;
        Insert: Omit<
          DatabaseGenerationRequest,
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Omit<DatabaseGenerationRequest, "id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
