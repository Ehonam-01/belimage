export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Project, "id">>;
      };
      assets: {
        Row: Asset;
        Insert: Omit<Asset, "id" | "created_at">;
        Update: Partial<Omit<Asset, "id">>;
      };
      generations: {
        Row: Generation;
        Insert: Omit<Generation, "id" | "created_at">;
        Update: Partial<Omit<Generation, "id">>;
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, "id" | "created_at">;
        Update: Partial<Omit<CreditTransaction, "id">>;
      };
      error_logs: {
        Row: ErrorLog;
        Insert: Omit<ErrorLog, "id" | "created_at">;
        Update: Partial<Omit<ErrorLog, "id">>;
      };
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status:
    | "draft"
    | "analyzing"
    | "content"
    | "generating"
    | "composing"
    | "completed"
    | "failed";
  poster_type: string | null;
  reference_model_url: string | null;
  reference_analysis: Record<string, unknown> | null;
  user_content: Record<string, unknown> | null;
  content_blueprint: Record<string, unknown> | null;
  creative_blueprint: Record<string, unknown> | null;
  generated_images: Record<string, unknown>[] | null;
  composition_data: Record<string, unknown> | null;
  final_url: string | null;
  credits_consumed: number;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  project_id: string;
  user_id: string;
  file_url: string;
  file_type: "image" | "logo" | "photo";
  role: string | null;
  label: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export interface Generation {
  id: string;
  project_id: string;
  user_id: string;
  variant_index: number;
  status: "pending" | "processing" | "completed" | "failed";
  provider_used: string | null;
  prompt_sent: string | null;
  negative_prompt: string | null;
  result_url: string | null;
  error_message: string | null;
  credits_cost: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "generation" | "bonus" | "refund" | "admin_adjustment";
  reference_id: string | null;
  description: string | null;
  balance_after: number;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  user_id: string | null;
  service: string;
  error_type: string;
  error_message: string | null;
  context: Record<string, unknown> | null;
  severity: "low" | "medium" | "high" | "critical";
  created_at: string;
}
