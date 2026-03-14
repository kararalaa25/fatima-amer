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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          quadrant: number
          status?: string
          tooth_number: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          quadrant?: number
          status?: string
          tooth_number?: number
          updated_at?: string
          user_id?: string | null
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
      doctors: {
        Row: {
          created_at: string
          doctor_code: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_code: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_code?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      initial_photos: {
        Row: {
          created_at: string
          id: string
          image_type: string | null
          image_url: string
          patient_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          patient_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          patient_id?: string
          user_id?: string | null
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
      patient_accounts: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          is_registered: boolean
          patient_id: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          is_registered?: boolean
          patient_id: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          is_registered?: boolean
          patient_id?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_accounts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number
          ap_relation: string | null
          canine_class_subdivision: string | null
          canine_relation: string | null
          ceph_anb: number | null
          ceph_facial_angle: number | null
          ceph_fma: number | null
          ceph_gonial_angle: number | null
          ceph_sn_mp: number | null
          ceph_sna: number | null
          ceph_snb: number | null
          ceph_wits: number | null
          chief_complaint: string | null
          created_at: string
          crossbite_anterior: string | null
          crossbite_posterior: string | null
          current_medications: string[] | null
          date_of_birth: string | null
          doctor_id: string | null
          habits: string | null
          horizontal_relation: string | null
          id: string
          incisor_relation: string | null
          lip_strain: boolean | null
          lips: string | null
          lower_buccal: string | null
          lower_labial: string | null
          lower_space_available: number | null
          lower_space_required: number | null
          max_jaw_opening: number | null
          medical_history: string[] | null
          mentolabial_sulcus: string | null
          midline_discrepancy: number | null
          midline_shift: string | null
          molar_class_subdivision: string | null
          molar_relation: string | null
          name: string
          nasolabial_angle: number | null
          oral_hygiene: string | null
          overbite_mm: number | null
          overjet_mm: number | null
          patient_code: string | null
          phone_number: string | null
          tongue_position: string | null
          tongue_size: string | null
          updated_at: string
          upper_buccal: string | null
          upper_labial: string | null
          upper_space_available: number | null
          upper_space_required: number | null
          user_id: string | null
          vertical_relation: string | null
        }
        Insert: {
          address?: string | null
          age: number
          ap_relation?: string | null
          canine_class_subdivision?: string | null
          canine_relation?: string | null
          ceph_anb?: number | null
          ceph_facial_angle?: number | null
          ceph_fma?: number | null
          ceph_gonial_angle?: number | null
          ceph_sn_mp?: number | null
          ceph_sna?: number | null
          ceph_snb?: number | null
          ceph_wits?: number | null
          chief_complaint?: string | null
          created_at?: string
          crossbite_anterior?: string | null
          crossbite_posterior?: string | null
          current_medications?: string[] | null
          date_of_birth?: string | null
          doctor_id?: string | null
          habits?: string | null
          horizontal_relation?: string | null
          id?: string
          incisor_relation?: string | null
          lip_strain?: boolean | null
          lips?: string | null
          lower_buccal?: string | null
          lower_labial?: string | null
          lower_space_available?: number | null
          lower_space_required?: number | null
          max_jaw_opening?: number | null
          medical_history?: string[] | null
          mentolabial_sulcus?: string | null
          midline_discrepancy?: number | null
          midline_shift?: string | null
          molar_class_subdivision?: string | null
          molar_relation?: string | null
          name: string
          nasolabial_angle?: number | null
          oral_hygiene?: string | null
          overbite_mm?: number | null
          overjet_mm?: number | null
          patient_code?: string | null
          phone_number?: string | null
          tongue_position?: string | null
          tongue_size?: string | null
          updated_at?: string
          upper_buccal?: string | null
          upper_labial?: string | null
          upper_space_available?: number | null
          upper_space_required?: number | null
          user_id?: string | null
          vertical_relation?: string | null
        }
        Update: {
          address?: string | null
          age?: number
          ap_relation?: string | null
          canine_class_subdivision?: string | null
          canine_relation?: string | null
          ceph_anb?: number | null
          ceph_facial_angle?: number | null
          ceph_fma?: number | null
          ceph_gonial_angle?: number | null
          ceph_sn_mp?: number | null
          ceph_sna?: number | null
          ceph_snb?: number | null
          ceph_wits?: number | null
          chief_complaint?: string | null
          created_at?: string
          crossbite_anterior?: string | null
          crossbite_posterior?: string | null
          current_medications?: string[] | null
          date_of_birth?: string | null
          doctor_id?: string | null
          habits?: string | null
          horizontal_relation?: string | null
          id?: string
          incisor_relation?: string | null
          lip_strain?: boolean | null
          lips?: string | null
          lower_buccal?: string | null
          lower_labial?: string | null
          lower_space_available?: number | null
          lower_space_required?: number | null
          max_jaw_opening?: number | null
          medical_history?: string[] | null
          mentolabial_sulcus?: string | null
          midline_discrepancy?: number | null
          midline_shift?: string | null
          molar_class_subdivision?: string | null
          molar_relation?: string | null
          name?: string
          nasolabial_angle?: number | null
          oral_hygiene?: string | null
          overbite_mm?: number | null
          overjet_mm?: number | null
          patient_code?: string | null
          phone_number?: string | null
          tongue_position?: string | null
          tongue_size?: string | null
          updated_at?: string
          upper_buccal?: string | null
          upper_labial?: string | null
          upper_space_available?: number | null
          upper_space_required?: number | null
          user_id?: string | null
          vertical_relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_activated: boolean | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_activated?: boolean | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_activated?: boolean | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          session_id?: string
          user_id?: string | null
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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          session_date?: string
          treatment_performed?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          session_date?: string
          treatment_performed?: string | null
          updated_at?: string
          user_id?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_doctor_code: { Args: never; Returns: string }
      generate_patient_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_activated: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "doctor" | "user"
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
    Enums: {
      app_role: ["admin", "doctor", "user"],
    },
  },
} as const
