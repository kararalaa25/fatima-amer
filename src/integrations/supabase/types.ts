export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dental_chart: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          quadrant: number
          status: string
          tooth_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          quadrant: number
          status?: string
          tooth_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          quadrant?: number
          status?: string
          tooth_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dental_chart_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      initial_photos: {
        Row: {
          created_at: string
          id: string
          image_type: string | null
          image_url: string
          patient_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          patient_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initial_photos_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number
          ap_relation: string | null
          canine_relation: string | null
          chief_complaint: string | null
          created_at: string
          habits: string | null
          horizontal_relation: string | null
          id: string
          incisor_relation: string | null
          lips: string | null
          lower_buccal: string | null
          lower_labial: string | null
          lower_space_available: number | null
          lower_space_required: number | null
          molar_relation: string | null
          name: string
          oral_hygiene: string | null
          overbite_mm: number | null
          overjet_mm: number | null
          tongue_position: string | null
          tongue_size: string | null
          updated_at: string
          upper_buccal: string | null
          upper_labial: string | null
          upper_space_available: number | null
          upper_space_required: number | null
          vertical_relation: string | null
        }
        Insert: {
          age: number
          ap_relation?: string | null
          canine_relation?: string | null
          chief_complaint?: string | null
          created_at?: string
          habits?: string | null
          horizontal_relation?: string | null
          id?: string
          incisor_relation?: string | null
          lips?: string | null
          lower_buccal?: string | null
          lower_labial?: string | null
          lower_space_available?: number | null
          lower_space_required?: number | null
          molar_relation?: string | null
          name: string
          oral_hygiene?: string | null
          overbite_mm?: number | null
          overjet_mm?: number | null
          tongue_position?: string | null
          tongue_size?: string | null
          updated_at?: string
          upper_buccal?: string | null
          upper_labial?: string | null
          upper_space_available?: number | null
          upper_space_required?: number | null
          vertical_relation?: string | null
        }
        Update: {
          age?: number
          ap_relation?: string | null
          canine_relation?: string | null
          chief_complaint?: string | null
          created_at?: string
          habits?: string | null
          horizontal_relation?: string | null
          id?: string
          incisor_relation?: string | null
          lips?: string | null
          lower_buccal?: string | null
          lower_labial?: string | null
          lower_space_available?: number | null
          lower_space_required?: number | null
          molar_relation?: string | null
          name?: string
          oral_hygiene?: string | null
          overbite_mm?: number | null
          overjet_mm?: number | null
          tongue_position?: string | null
          tongue_size?: string | null
          updated_at?: string
          upper_buccal?: string | null
          upper_labial?: string | null
          upper_space_available?: number | null
          upper_space_required?: number | null
          vertical_relation?: string | null
        }
        Relationships: []
      }
      session_images: {
        Row: {
          created_at: string
          id: string
          image_type: string | null
          image_url: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          session_date: string
          treatment_performed: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          session_date?: string
          treatment_performed?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          session_date?: string
          treatment_performed?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          appliance_types: string[] | null
          created_at: string
          estimated_duration: string | null
          extraction_plan: string | null
          id: string
          patient_id: string
          primary_goals: string | null
          special_instructions: string | null
          updated_at: string
        }
        Insert: {
          appliance_types?: string[] | null
          created_at?: string
          estimated_duration?: string | null
          extraction_plan?: string | null
          id?: string
          patient_id: string
          primary_goals?: string | null
          special_instructions?: string | null
          updated_at?: string
        }
        Update: {
          appliance_types?: string[] | null
          created_at?: string
          estimated_duration?: string | null
          extraction_plan?: string | null
          id?: string
          patient_id?: string
          primary_goals?: string | null
          special_instructions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
