export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      visparks: {
        Row: {
          created_at: string
          id: string
          summaries: Json
          user_id: string
          video_channel_id: string | null
          video_id: string
          video_title: string
          video_description: string
          video_channel_title: string
          video_thumbnails: Json
          video_published_at: string
          video_default_language: string
        }
        Insert: {
          created_at?: string
          id?: string
          summaries: Json
          user_id: string
          video_channel_id: string | null
          video_id: string
          video_title: string
          video_description: string
          video_channel_title: string
          video_thumbnails: Json
          video_published_at: string
          video_default_language: string
        }
        Update: {
          created_at?: string
          id?: string
          summaries?: Json
          user_id?: string
          video_channel_id?: string | null
          video_id?: string
          video_title?: string
          video_description?: string
          video_channel_title?: string
          video_thumbnails?: Json
          video_published_at?: string
          video_default_language?: string
        }
        Relationships: []
      }
      youtube_push_callback_logs: {
        Row: {
          id: string
          user_id: string
          channel_id: string
          video_id: string
          video_title: string
          processed_at: string
          processing_status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channel_id: string
          video_id: string
          video_title: string
          processed_at?: string
          processing_status?: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          channel_id?: string
          video_id?: string
          video_title?: string
          processed_at?: string
          processing_status?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      youtube_push_subscriptions: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          subscription_id: string
          hub_secret: string
          lease_seconds: number
          created_at: string
          expires_at: string
          updated_at: string
          callback_url: string
          status: string
          retry_count: number
          last_retry_at: string | null
          renewal_error: string | null
          auto_renewal_enabled: boolean
          expires_at_buffer_days: number
          channel_title: string | null
          channel_thumbnail_url: string | null
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          subscription_id: string
          hub_secret: string
          lease_seconds?: number
          created_at?: string
          expires_at: string
          updated_at?: string
          callback_url?: string
          status?: string
          retry_count?: number
          last_retry_at?: string | null
          renewal_error?: string | null
          auto_renewal_enabled?: boolean
          expires_at_buffer_days?: number
          channel_title?: string | null
          channel_thumbnail_url?: string | null
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          subscription_id?: string
          hub_secret?: string
          lease_seconds?: number
          created_at?: string
          expires_at?: string
          updated_at?: string
          callback_url?: string
          status?: string
          retry_count?: number
          last_retry_at?: string | null
          renewal_error?: string | null
          auto_renewal_enabled?: boolean
          expires_at_buffer_days?: number
          channel_title?: string | null
          channel_thumbnail_url?: string | null
        }
        Relationships: []
      }
      video_notifications: {
        Row: {
          id: string
          user_id: string
          video_id: string
          channel_id: string
          video_title: string
          video_url: string
          published_at: string
          summary_generated: boolean
          notification_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          channel_id: string
          video_title: string
          video_url: string
          published_at: string
          summary_generated?: boolean
          notification_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          channel_id?: string
          video_title?: string
          video_url?: string
          published_at?: string
          summary_generated?: boolean
          notification_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_subscriptions_needing_renewal: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          channel_id: string
          user_id: string
          subscription_id: string
          hub_secret: string
          lease_seconds: number
          expires_at: string
          status: string
          retry_count: number
          last_retry_at: string | null
          renewal_error: string | null
          auto_renewal_enabled: boolean
        }[]
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_subscription_status: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
