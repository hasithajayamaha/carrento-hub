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
      agreements: {
        Row: {
          content: string
          created_at: string | null
          description: string
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          description: string
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          car_id: string
          created_at: string | null
          customer_id: string
          delivery_address: Json | null
          delivery_fee: number | null
          delivery_option: string
          deposit: number
          end_date: string
          id: string
          incident_details: string | null
          incident_photos: string[] | null
          incident_reported: boolean | null
          incident_status: string | null
          incident_timestamp: string | null
          payment_status: string
          rental_period: string
          start_date: string
          status: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          car_id: string
          created_at?: string | null
          customer_id: string
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_option: string
          deposit: number
          end_date: string
          id?: string
          incident_details?: string | null
          incident_photos?: string[] | null
          incident_reported?: boolean | null
          incident_status?: string | null
          incident_timestamp?: string | null
          payment_status?: string
          rental_period: string
          start_date: string
          status?: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          car_id?: string
          created_at?: string | null
          customer_id?: string
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_option?: string
          deposit?: number
          end_date?: string
          id?: string
          incident_details?: string | null
          incident_photos?: string[] | null
          incident_reported?: boolean | null
          incident_status?: string | null
          incident_timestamp?: string | null
          payment_status?: string
          rental_period?: string
          start_date?: string
          status?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          availability: Json
          color: string
          created_at: string | null
          description: string | null
          documents: string[] | null
          id: string
          make: string
          model: string
          owner_id: string
          photos: string[]
          pricing: Json
          specifications: Json
          status: string
          type: string
          updated_at: string | null
          year: number
        }
        Insert: {
          availability: Json
          color: string
          created_at?: string | null
          description?: string | null
          documents?: string[] | null
          id?: string
          make: string
          model: string
          owner_id: string
          photos: string[]
          pricing: Json
          specifications: Json
          status?: string
          type: string
          updated_at?: string | null
          year: number
        }
        Update: {
          availability?: Json
          color?: string
          created_at?: string | null
          description?: string | null
          documents?: string[] | null
          id?: string
          make?: string
          model?: string
          owner_id?: string
          photos?: string[]
          pricing?: Json
          specifications?: Json
          status?: string
          type?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      maintenance: {
        Row: {
          car_id: string
          cost: number | null
          created_at: string | null
          date: string
          description: string
          id: string
          invoice_amount: number | null
          invoice_date: string | null
          invoice_details: Json | null
          invoice_number: string | null
          invoice_status: string | null
          next_service_date: string | null
          notes: string | null
          performed_by: string | null
          photos: string[] | null
          service_center_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          car_id: string
          cost?: number | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_details?: Json | null
          invoice_number?: string | null
          invoice_status?: string | null
          next_service_date?: string | null
          notes?: string | null
          performed_by?: string | null
          photos?: string[] | null
          service_center_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          car_id?: string
          cost?: number | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_details?: Json | null
          invoice_number?: string | null
          invoice_status?: string | null
          next_service_date?: string | null
          notes?: string | null
          performed_by?: string | null
          photos?: string[] | null
          service_center_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_service_center_id_fkey"
            columns: ["service_center_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_notifications: {
        Row: {
          created_at: string | null
          id: string
          maintenance_id: string
          message: string
          read_at: string | null
          recipient_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          maintenance_id: string
          message: string
          read_at?: string | null
          recipient_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          maintenance_id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_notifications_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_agreements: {
        Row: {
          agreement_id: string
          id: string
          signed_at: string | null
          user_id: string
        }
        Insert: {
          agreement_id: string
          id?: string
          signed_at?: string | null
          user_id: string
        }
        Update: {
          agreement_id?: string
          id?: string
          signed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agreements_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      create_user_role: {
        Args: {
          p_user_id: string
          p_role: string
        }
        Returns: undefined
      }
      get_delivery_fee: {
        Args: {
          pickup_location: string
          delivery_location: string
          delivery_time: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "SuperAdmin"
        | "Admin"
        | "SupportStaff"
        | "ServiceCenterStaff"
        | "CarOwner"
        | "Customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
