// =====================================================
// Akilix – Supabase Database Types (Sprint 2)
// =====================================================
// NOTE: This file is a placeholder. The production types
// should be generated from your live Supabase schema via:
//
//   npx supabase gen types typescript \
//     --project-id <your-project-ref> \
//     --schema public > src/types/database.ts
//
// Or with the CLI linked locally:
//
//   supabase link --project-ref <your-project-ref>
//   supabase gen types typescript --schema public > src/types/database.ts
//
// The shapes below match schema.sql so that client.ts and
// components can type-check *before* you run the real generator.
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // 1. roles
      roles: {
        Row: {
          id: string;
          code: string;
          label: string;
          description: string | null;
          permissions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          label: string;
          description?: string | null;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          label?: string;
          description?: string | null;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 2. profiles
      profiles: {
        Row: {
          id: string;
          role_id: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
          gender: 'male' | 'female' | 'prefer_not_to_say' | null;
          phone_number: string | null;
          phone_verified: boolean;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          location: string | null;
          school_name: string | null;
          teaching_subjects: string[];
          teaching_levels: string[];
          website: string | null;
          social_links: Json;
          stripe_customer_id: string | null;
          mpesa_wallet_number: string | null;
          timezone: string;
          locale: string;
          onboarding_completed: boolean;
          newsletter_opt_in: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          phone_number?: string | null;
          phone_verified?: boolean;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          location?: string | null;
          school_name?: string | null;
          teaching_subjects?: string[];
          teaching_levels?: string[];
          website?: string | null;
          social_links?: Json;
          stripe_customer_id?: string | null;
          mpesa_wallet_number?: string | null;
          timezone?: string;
          locale?: string;
          onboarding_completed?: boolean;
          newsletter_opt_in?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          phone_number?: string | null;
          phone_verified?: boolean;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          location?: string | null;
          school_name?: string | null;
          teaching_subjects?: string[];
          teaching_levels?: string[];
          website?: string | null;
          social_links?: Json;
          stripe_customer_id?: string | null;
          mpesa_wallet_number?: string | null;
          timezone?: string;
          locale?: string;
          onboarding_completed?: boolean;
          newsletter_opt_in?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 3. education_systems
      education_systems: {
        Row: {
          id: string;
          code: string;
          name: string;
          short_name: string;
          country_code: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          short_name: string;
          country_code?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          short_name?: string;
          country_code?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 4. levels
      levels: {
        Row: {
          id: string;
          education_system_id: string;
          code: string;
          name: string;
          short_name: string;
          numeric_grade: number | null;
          color_hex: string | null;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          education_system_id: string;
          code: string;
          name: string;
          short_name: string;
          numeric_grade?: number | null;
          color_hex?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          education_system_id?: string;
          code?: string;
          name?: string;
          short_name?: string;
          numeric_grade?: number | null;
          color_hex?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 5. classes
      classes: {
        Row: {
          id: string;
          level_id: string;
          code: string;
          name: string;
          academic_year: string;
          stream: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          code: string;
          name: string;
          academic_year?: string;
          stream?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          level_id?: string;
          code?: string;
          name?: string;
          academic_year?: string;
          stream?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 6. learning_areas
      learning_areas: {
        Row: {
          id: string;
          level_id: string;
          code: string;
          name: string;
          short_name: string | null;
          description: string | null;
          color_hex: string | null;
          icon: string | null;
          thumbnail_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          code: string;
          name: string;
          short_name?: string | null;
          description?: string | null;
          color_hex?: string | null;
          icon?: string | null;
          thumbnail_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          level_id?: string;
          code?: string;
          name?: string;
          short_name?: string | null;
          description?: string | null;
          color_hex?: string | null;
          icon?: string | null;
          thumbnail_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 7. strands
      strands: {
        Row: {
          id: string;
          learning_area_id: string;
          code: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learning_area_id: string;
          code: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          learning_area_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 8. sub_strands
      sub_strands: {
        Row: {
          id: string;
          strand_id: string;
          code: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          strand_id: string;
          code: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          strand_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 9. topics
      topics: {
        Row: {
          id: string;
          sub_strand_id: string;
          code: string;
          name: string;
          description: string | null;
          keywords: string[];
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sub_strand_id: string;
          code: string;
          name: string;
          description?: string | null;
          keywords?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sub_strand_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          keywords?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 10. resource_types
      resource_types: {
        Row: {
          id: string;
          code: string;
          name: string;
          short_name: string | null;
          description: string | null;
          icon: string | null;
          color_hex: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          short_name?: string | null;
          description?: string | null;
          icon?: string | null;
          color_hex?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          short_name?: string | null;
          description?: string | null;
          icon?: string | null;
          color_hex?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 11. resources
      resources: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string | null;
          description: string | null;
          content: string | null;
          resource_type_id: string;
          author_id: string;
          education_system_id: string | null;
          level_id: string | null;
          class_id: string | null;
          learning_area_id: string | null;
          strand_id: string | null;
          sub_strand_id: string | null;
          topic_id: string | null;
          curriculum_tags: string[];
          subject_tags: string[];
          thumbnail_url: string | null;
          preview_url: string | null;
          cover_url: string | null;
          status: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
          visibility: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
          price: number;
          is_featured: boolean;
          is_trending: boolean;
          view_count: number;
          download_count: number;
          rating_avg: number | null;
          rating_count: number;
          comment_count: number;
          bookmark_count: number;
          pages: number | null;
          duration_seconds: number | null;
          language: string;
          keywords: string[];
          moderation: 'pending' | 'approved' | 'flagged' | 'removed';
          moderation_notes: string | null;
          published_at: string | null;
          rejected_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary?: string | null;
          description?: string | null;
          content?: string | null;
          resource_type_id: string;
          author_id: string;
          education_system_id?: string | null;
          level_id?: string | null;
          class_id?: string | null;
          learning_area_id?: string | null;
          strand_id?: string | null;
          sub_strand_id?: string | null;
          topic_id?: string | null;
          curriculum_tags?: string[];
          subject_tags?: string[];
          thumbnail_url?: string | null;
          preview_url?: string | null;
          cover_url?: string | null;
          status?: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
          visibility?: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
          price?: number;
          is_featured?: boolean;
          is_trending?: boolean;
          view_count?: number;
          download_count?: number;
          rating_avg?: number | null;
          rating_count?: number;
          comment_count?: number;
          bookmark_count?: number;
          pages?: number | null;
          duration_seconds?: number | null;
          language?: string;
          keywords?: string[];
          moderation?: 'pending' | 'approved' | 'flagged' | 'removed';
          moderation_notes?: string | null;
          published_at?: string | null;
          rejected_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          summary?: string | null;
          description?: string | null;
          content?: string | null;
          resource_type_id?: string;
          author_id?: string;
          education_system_id?: string | null;
          level_id?: string | null;
          class_id?: string | null;
          learning_area_id?: string | null;
          strand_id?: string | null;
          sub_strand_id?: string | null;
          topic_id?: string | null;
          curriculum_tags?: string[];
          subject_tags?: string[];
          thumbnail_url?: string | null;
          preview_url?: string | null;
          cover_url?: string | null;
          status?: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
          visibility?: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
          price?: number;
          is_featured?: boolean;
          is_trending?: boolean;
          view_count?: number;
          download_count?: number;
          rating_avg?: number | null;
          rating_count?: number;
          comment_count?: number;
          bookmark_count?: number;
          pages?: number | null;
          duration_seconds?: number | null;
          language?: string;
          keywords?: string[];
          moderation?: 'pending' | 'approved' | 'flagged' | 'removed';
          moderation_notes?: string | null;
          published_at?: string | null;
          rejected_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 12. files
      files: {
        Row: {
          id: string;
          resource_id: string;
          uploader_id: string;
          bucket_name: string;
          storage_path: string;
          object_name: string;
          mime_type: string | null;
          size_bytes: number;
          sha256_hash: string | null;
          version: string;
          is_primary: boolean;
          is_preview: boolean;
          page_count: number | null;
          width_px: number | null;
          height_px: number | null;
          duration_sec: number | null;
          password_hash: string | null;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          uploader_id: string;
          bucket_name: string;
          storage_path: string;
          object_name: string;
          mime_type?: string | null;
          size_bytes: number;
          sha256_hash?: string | null;
          version?: string;
          is_primary?: boolean;
          is_preview?: boolean;
          page_count?: number | null;
          width_px?: number | null;
          height_px?: number | null;
          duration_sec?: number | null;
          password_hash?: string | null;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          uploader_id?: string;
          bucket_name?: string;
          storage_path?: string;
          object_name?: string;
          mime_type?: string | null;
          size_bytes?: number;
          sha256_hash?: string | null;
          version?: string;
          is_primary?: boolean;
          is_preview?: boolean;
          page_count?: number | null;
          width_px?: number | null;
          height_px?: number | null;
          duration_sec?: number | null;
          password_hash?: string | null;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 13. bookmarks
      bookmarks: {
        Row: {
          id: string;
          profile_id: string;
          resource_id: string;
          folder: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          resource_id: string;
          folder?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          resource_id?: string;
          folder?: string | null;
          created_at?: string;
        };
      };

      // 14. ratings
      ratings: {
        Row: {
          id: string;
          profile_id: string;
          resource_id: string;
          score: number;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          resource_id: string;
          score: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          resource_id?: string;
          score?: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 15. comments
      comments: {
        Row: {
          id: string;
          resource_id: string;
          profile_id: string;
          parent_comment_id: string | null;
          body: string;
          moderation: 'pending' | 'approved' | 'flagged' | 'removed';
          flag_count: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          profile_id: string;
          parent_comment_id?: string | null;
          body: string;
          moderation?: 'pending' | 'approved' | 'flagged' | 'removed';
          flag_count?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          profile_id?: string;
          parent_comment_id?: string | null;
          body?: string;
          moderation?: 'pending' | 'approved' | 'flagged' | 'removed';
          flag_count?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 16. downloads
      downloads: {
        Row: {
          id: string;
          profile_id: string | null;
          resource_id: string;
          file_id: string | null;
          session_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          payment_id: string | null;
          subscription_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          resource_id: string;
          file_id?: string | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          payment_id?: string | null;
          subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          resource_id?: string;
          file_id?: string | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          payment_id?: string | null;
          subscription_id?: string | null;
          created_at?: string;
        };
      };

      // 17. subscriptions
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          tier: 'free' | 'basic' | 'premium' | 'enterprise';
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive' | 'expired';
          price: number;
          currency: string;
          interval_unit: string;
          interval_count: number;
          started_at: string | null;
          current_period_end: string | null;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          ended_at: string | null;
          mpesa_msisdn: string | null;
          external_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          tier?: 'free' | 'basic' | 'premium' | 'enterprise';
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive' | 'expired';
          price?: number;
          currency?: string;
          interval_unit?: string;
          interval_count?: number;
          started_at?: string | null;
          current_period_end?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          ended_at?: string | null;
          mpesa_msisdn?: string | null;
          external_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          tier?: 'free' | 'basic' | 'premium' | 'enterprise';
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive' | 'expired';
          price?: number;
          currency?: string;
          interval_unit?: string;
          interval_count?: number;
          started_at?: string | null;
          current_period_end?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          ended_at?: string | null;
          mpesa_msisdn?: string | null;
          external_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 18. payments
      payments: {
        Row: {
          id: string;
          profile_id: string;
          subscription_id: string | null;
          channel: 'mpesa_c2b' | 'mpesa_stk' | 'card' | 'bank' | 'wallet' | 'manual';
          amount: number;
          currency: string;
          status: 'pending' | 'initiated' | 'customer_redirected' | 'confirmed' | 'failed' | 'timed_out' | 'refunded' | 'reversed';
          msisdn: string | null;
          merchant_request_id: string | null;
          checkout_request_id: string | null;
          mpesa_receipt: string | null;
          transaction_date: string | null;
          callback_payload: Json | null;
          short_code: string | null;
          account_reference: string | null;
          transaction_desc: string | null;
          failure_code: string | null;
          failure_message: string | null;
          retries: number;
          reversed_at: string | null;
          reversal_receipt: string | null;
          external_id: string | null;
          ip_address: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          subscription_id?: string | null;
          channel?: 'mpesa_c2b' | 'mpesa_stk' | 'card' | 'bank' | 'wallet' | 'manual';
          amount: number;
          currency?: string;
          status?: 'pending' | 'initiated' | 'customer_redirected' | 'confirmed' | 'failed' | 'timed_out' | 'refunded' | 'reversed';
          msisdn?: string | null;
          merchant_request_id?: string | null;
          checkout_request_id?: string | null;
          mpesa_receipt?: string | null;
          transaction_date?: string | null;
          callback_payload?: Json | null;
          short_code?: string | null;
          account_reference?: string | null;
          transaction_desc?: string | null;
          failure_code?: string | null;
          failure_message?: string | null;
          retries?: number;
          reversed_at?: string | null;
          reversal_receipt?: string | null;
          external_id?: string | null;
          ip_address?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          subscription_id?: string | null;
          channel?: 'mpesa_c2b' | 'mpesa_stk' | 'card' | 'bank' | 'wallet' | 'manual';
          amount?: number;
          currency?: string;
          status?: 'pending' | 'initiated' | 'customer_redirected' | 'confirmed' | 'failed' | 'timed_out' | 'refunded' | 'reversed';
          msisdn?: string | null;
          merchant_request_id?: string | null;
          checkout_request_id?: string | null;
          mpesa_receipt?: string | null;
          transaction_date?: string | null;
          callback_payload?: Json | null;
          short_code?: string | null;
          account_reference?: string | null;
          transaction_desc?: string | null;
          failure_code?: string | null;
          failure_message?: string | null;
          retries?: number;
          reversed_at?: string | null;
          reversal_receipt?: string | null;
          external_id?: string | null;
          ip_address?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 19. blog_posts
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          cover_url: string | null;
          author_id: string;
          status: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
          visibility: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
          tags: string[];
          reading_time_minutes: number | null;
          view_count: number;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[];
          published_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content: string;
          cover_url?: string | null;
          author_id: string;
          status?: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
          visibility?: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
          tags?: string[];
          reading_time_minutes?: number | null;
          view_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[];
          published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          cover_url?: string | null;
          author_id?: string;
          status?: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
          visibility?: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
          tags?: string[];
          reading_time_minutes?: number | null;
          view_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[];
          published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: 'trigger';
      };
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: 'trigger';
      };
      current_profile: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          role_id: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
        };
      };
      current_role_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      can: {
        Args: { p_permission: string };
        Returns: boolean;
      };
    };
    Enums: {
      subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive' | 'expired';
      payment_status: 'pending' | 'initiated' | 'customer_redirected' | 'confirmed' | 'failed' | 'timed_out' | 'refunded' | 'reversed';
      payment_channel: 'mpesa_c2b' | 'mpesa_stk' | 'card' | 'bank' | 'wallet' | 'manual';
      resource_status: 'draft' | 'review' | 'published' | 'unlisted' | 'archived' | 'rejected';
      visibility_level: 'public' | 'logged_in' | 'subscribers' | 'paid' | 'private';
      moderation_status: 'pending' | 'approved' | 'flagged' | 'removed';
      plan_tier: 'free' | 'basic' | 'premium' | 'enterprise';
      gender: 'male' | 'female' | 'prefer_not_to_say';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
