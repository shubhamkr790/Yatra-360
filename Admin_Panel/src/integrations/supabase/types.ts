export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string | null
          guide_id: string | null
          id: string
          performed_at: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id?: string | null
          guide_id?: string | null
          id?: string
          performed_at?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string | null
          guide_id?: string | null
          id?: string
          performed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      guide_documents: {
        Row: {
          document_type: string
          document_url: string
          guide_id: string | null
          id: string
          uploaded_at: string | null
          verified: boolean | null
        }
        Insert: {
          document_type: string
          document_url: string
          guide_id?: string | null
          id?: string
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Update: {
          document_type?: string
          document_url?: string
          guide_id?: string | null
          id?: string
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_documents_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_registrations: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          areas_of_expertise: string[]
          availability_schedule: Json | null
          bank_details: Json | null
          bio: string
          certifications: string[] | null
          created_at: string | null
          current_location: Json
          date_of_birth: string
          email: string
          experience_years: number
          full_name: string
          guide_license_url: string | null
          hourly_rate: number
          id: string
          id_proof_url: string
          phone_number: string
          preferred_locations: string[] | null
          profile_picture_url: string | null
          rating: number | null
          review_count: number | null
          spoken_languages: string[]
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_of_expertise: string[]
          availability_schedule?: Json | null
          bank_details?: Json | null
          bio: string
          certifications?: string[] | null
          created_at?: string | null
          current_location: Json
          date_of_birth: string
          email: string
          experience_years: number
          full_name: string
          guide_license_url?: string | null
          hourly_rate: number
          id?: string
          id_proof_url: string
          phone_number: string
          preferred_locations?: string[] | null
          profile_picture_url?: string | null
          rating?: number | null
          review_count?: number | null
          spoken_languages: string[]
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_of_expertise?: string[]
          availability_schedule?: Json | null
          bank_details?: Json | null
          bio?: string
          certifications?: string[] | null
          created_at?: string | null
          current_location?: Json
          date_of_birth?: string
          email?: string
          experience_years?: number
          full_name?: string
          guide_license_url?: string | null
          hourly_rate?: number
          id?: string
          id_proof_url?: string
          phone_number?: string
          preferred_locations?: string[] | null
          profile_picture_url?: string | null
          rating?: number | null
          review_count?: number | null
          spoken_languages?: string[]
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guide_reviews: {
        Row: {
          created_at: string | null
          guide_id: string | null
          id: string
          rating: number | null
          review_text: string | null
          reviewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          guide_id?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          guide_id?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_specializations: {
        Row: {
          description: string | null
          guide_id: string | null
          id: string
          specialization: string
          verified: boolean | null
        }
        Insert: {
          description?: string | null
          guide_id?: string | null
          id?: string
          specialization: string
          verified?: boolean | null
        }
        Update: {
          description?: string | null
          guide_id?: string | null
          id?: string
          specialization?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_specializations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_registrations"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
