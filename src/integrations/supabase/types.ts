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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_items: {
        Row: {
          body: string | null
          cover: string | null
          created_at: string
          cta_url: string | null
          id: string
          item_type: string
          published: boolean
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          cover?: string | null
          created_at?: string
          cta_url?: string | null
          id?: string
          item_type: string
          published?: boolean
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          cover?: string | null
          created_at?: string
          cta_url?: string | null
          id?: string
          item_type?: string
          published?: boolean
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          enabled: boolean
          event_date: string | null
          id: string
          image_url: string | null
          location: string | null
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          enabled?: boolean
          event_date?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          enabled?: boolean
          event_date?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          active: boolean
          address: string | null
          body: string | null
          city: string
          contact_email: string | null
          country: string
          created_at: string
          email: string | null
          featured: boolean
          hero_image: string | null
          id: string
          lat: number | null
          lng: number | null
          phone: string | null
          president: string | null
          published: boolean
          region: string | null
          slug: string
          social: Json | null
          sort_order: number
          summary: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          body?: string | null
          city: string
          contact_email?: string | null
          country: string
          created_at?: string
          email?: string | null
          featured?: boolean
          hero_image?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          president?: string | null
          published?: boolean
          region?: string | null
          slug: string
          social?: Json | null
          sort_order?: number
          summary?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          body?: string | null
          city?: string
          contact_email?: string | null
          country?: string
          created_at?: string
          email?: string | null
          featured?: boolean
          hero_image?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          president?: string | null
          published?: boolean
          region?: string | null
          slug?: string
          social?: Json | null
          sort_order?: number
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          department: string | null
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          body: string | null
          city: string | null
          country: string | null
          cover: string | null
          created_at: string
          ends_at: string | null
          excerpt: string | null
          featured: boolean
          id: string
          published: boolean
          registration_url: string | null
          slug: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          city?: string | null
          country?: string | null
          cover?: string | null
          created_at?: string
          ends_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          registration_url?: string | null
          slug: string
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          city?: string | null
          country?: string | null
          cover?: string | null
          created_at?: string
          ends_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          registration_url?: string | null
          slug?: string
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      featured_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          image_url: string | null
          page_key: string
          updated_at: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_key: string
          updated_at?: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          featured: boolean
          id: string
          image_url: string
          published: boolean
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          image_url: string
          published?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          image_url?: string
          published?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      initiatives: {
        Row: {
          body: string | null
          category: string
          cover: string | null
          created_at: string
          id: string
          published: boolean
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category: string
          cover?: string | null
          created_at?: string
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string
          cover?: string | null
          created_at?: string
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leadership: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          portrait: string | null
          published: boolean
          region: string | null
          role: string
          slug: string
          socials: Json | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          portrait?: string | null
          published?: boolean
          region?: string | null
          role: string
          slug: string
          socials?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          portrait?: string | null
          published?: boolean
          region?: string | null
          role?: string
          slug?: string
          socials?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      membership_enquiries: {
        Row: {
          country: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          organisation: string | null
          tier: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          organisation?: string | null
          tier?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          organisation?: string | null
          tier?: string | null
        }
        Relationships: []
      }
      nav_links: {
        Row: {
          active: boolean
          created_at: string
          external: boolean
          id: string
          label: string
          location: string
          social_platform: string | null
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          external?: boolean
          id?: string
          label: string
          location?: string
          social_platform?: string | null
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          external?: boolean
          id?: string
          label?: string
          location?: string
          social_platform?: string | null
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string | null
          body: string | null
          category: string | null
          cover: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          category?: string | null
          cover?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          category?: string | null
          cover?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subs: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          published: boolean
          sort_order: number
          tier: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          sort_order?: number
          tier?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          tier?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          data: Json
          id: number
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          portrait: string | null
          published: boolean
          quote: string
          role: string | null
          sort_order: number
          updated_at: string
          video_url: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          portrait?: string | null
          published?: boolean
          quote: string
          role?: string | null
          sort_order?: number
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          portrait?: string | null
          published?: boolean
          quote?: string
          role?: string | null
          sort_order?: number
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
