export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "voter" | "staff" | "admin";
export type OrderStatus = "pending" | "confirmed" | "failed" | "refunded" | "expired";
export type TicketStatus = "valid" | "used" | "void";

export interface Database {
  public: {
    Tables: {
      event_settings: {
        Row: {
          id: number;
          event_name: string;
          tagline: string | null;
          event_date: string;
          event_time: string;
          venue_name: string;
          venue_address: string | null;
          map_link: string | null;
          hero_image_url: string | null;
          about_html: string | null;
          voting_opens_at: string | null;
          voting_closes_at: string | null;
          results_frozen: boolean;
          ticket_sales_open: boolean;
          social_links: Json;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["event_settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["event_settings"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          email_normalized: string;
          blocked: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          group_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      nominees: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          subtitle: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["nominees"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["nominees"]["Insert"]>;
      };
      votes: {
        Row: {
          id: string;
          voter_id: string;
          category_id: string;
          nominee_id: string;
          created_at: string;
          ip_hash: string | null;
          user_agent: string | null;
          voided: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["votes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["votes"]["Insert"]>;
      };
      vote_counts: {
        Row: {
          category_id: string;
          nominee_id: string;
          count: number;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["vote_counts"]["Row"];
        Update: Partial<Database["public"]["Tables"]["vote_counts"]["Row"]>;
      };
      ticket_tiers: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          capacity: number;
          reserved: number;
          sold: number;
          per_order_max: number;
          sale_starts_at: string | null;
          sale_ends_at: string | null;
          is_active: boolean;
          perks: string[];
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ticket_tiers"]["Row"], "id" | "created_at" | "reserved" | "sold">;
        Update: Partial<Database["public"]["Tables"]["ticket_tiers"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          tier_id: string;
          quantity: number;
          buyer_name: string;
          buyer_email: string;
          buyer_phone: string;
          total_amount: number;
          status: OrderStatus;
          paystack_reference: string | null;
          reserved_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_reference: string;
          amount: number;
          currency: string;
          status: string;
          verified_at: string | null;
          raw_response: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      tickets: {
        Row: {
          id: string;
          order_id: string;
          tier_id: string;
          ticket_code: string;
          qr_payload: string;
          status: TicketStatus;
          checked_in_at: string | null;
          checked_in_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tickets"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tickets"]["Insert"]>;
      };
      checkins: {
        Row: {
          id: string;
          ticket_id: string;
          scanned_by: string;
          scanned_at: string;
          result: string;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["checkins"]["Row"], "id">;
        Update: never;
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at">;
        Update: never;
      };
      rate_limit_attempts: {
        Row: {
          id: string;
          key: string;
          window_start: string;
          count: number;
        };
        Insert: Omit<Database["public"]["Tables"]["rate_limit_attempts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["rate_limit_attempts"]["Insert"]>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cast_vote: {
        Args: { p_category_id: string; p_nominee_id: string; p_ip_hash: string; p_user_agent: string };
        Returns: { success: boolean; error_code: string | null };
      };
      my_votes: {
        Args: Record<string, never>;
        Returns: { category_id: string; nominee_id: string; nominee_name: string }[];
      };
      reserve_tickets: {
        Args: { p_tier_id: string; p_quantity: number; p_buyer_name: string; p_buyer_email: string; p_buyer_phone: string };
        Returns: { order_id: string; error_code: string | null };
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      ticket_status: TicketStatus;
    };
  };
}
