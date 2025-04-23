//src/lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      healthcare_providers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          subscription_tier: 'base' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'trial'
          max_patients: number
          custom_domain: string | null
          branding_settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          subscription_tier?: 'base' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial'
          max_patients?: number
          custom_domain?: string | null
          branding_settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          subscription_tier?: 'base' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial'
          max_patients?: number
          custom_domain?: string | null
          branding_settings?: Json | null
        }
      }
      patients: {
        Row: {
          id: string
          created_at: string
          provider_id: string
          email: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          health_conditions: string[] | null
          medications: string[] | null
          dietary_restrictions: string[] | null
          consent_status: 'active' | 'pending' | 'revoked'
          consent_date: string | null
          preferred_frequency: 'daily' | 'weekly' | 'monthly' | null
        }
        Insert: {
          id?: string
          created_at?: string
          provider_id: string
          email: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          health_conditions?: string[] | null
          medications?: string[] | null
          dietary_restrictions?: string[] | null
          consent_status?: 'active' | 'pending' | 'revoked'
          consent_date?: string | null
          preferred_frequency?: 'daily' | 'weekly' | 'monthly' | null
        }
        Update: {
          id?: string
          created_at?: string
          provider_id?: string
          email?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          health_conditions?: string[] | null
          medications?: string[] | null
          dietary_restrictions?: string[] | null
          consent_status?: 'active' | 'pending' | 'revoked'
          consent_date?: string | null
          preferred_frequency?: 'daily' | 'weekly' | 'monthly' | null
        }
      }
      newsletter_templates: {
        Row: {
          id: string
          created_at: string
          provider_id: string
          name: string
          subject: string
          content: Json | null           // Can be null for MJML templates
          mjml_content: string | null    // New field for MJML templates
          template_type: 'react-email' | 'mjml-markup' | 'mjml-react'
          target_conditions: string[] | null
          target_medications: string[] | null
          target_dietary: string[] | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          provider_id: string
          name: string
          subject: string
          content?: Json | null          // Optional for MJML templates
          mjml_content?: string | null   // New field for MJML templates
          template_type?: 'react-email' | 'mjml-markup' | 'mjml-react'
          target_conditions?: string[] | null
          target_medications?: string[] | null
          target_dietary?: string[] | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          provider_id?: string
          name?: string
          subject?: string
          content?: Json | null          // Optional for MJML templates
          mjml_content?: string | null   // New field for MJML templates
          template_type?: 'react-email' | 'mjml-markup' | 'mjml-react'
          target_conditions?: string[] | null
          target_medications?: string[] | null
          target_dietary?: string[] | null
          is_active?: boolean
        }
      }
      newsletter_campaigns: {
        Row: {
          id: string
          created_at: string
          provider_id: string
          template_id: string
          name: string
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
          scheduled_date: string | null
          sent_date: string | null
          target_patient_count: number
          actual_send_count: number
          open_count: number
          click_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          provider_id: string
          template_id: string
          name: string
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
          scheduled_date?: string | null
          sent_date?: string | null
          target_patient_count?: number
          actual_send_count?: number
          open_count?: number
          click_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          provider_id?: string
          template_id?: string
          name?: string
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
          scheduled_date?: string | null
          sent_date?: string | null
          target_patient_count?: number
          actual_send_count?: number
          open_count?: number
          click_count?: number
        }
      }
      newsletter_analytics: {
        Row: {
          id: string
          created_at: string
          campaign_id: string
          patient_id: string
          email_sent: boolean
          email_delivered: boolean
          email_opened: boolean
          links_clicked: string[] | null
          open_timestamp: string | null
          click_timestamps: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          campaign_id: string
          patient_id: string
          email_sent?: boolean
          email_delivered?: boolean
          email_opened?: boolean
          links_clicked?: string[] | null
          open_timestamp?: string | null
          click_timestamps?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          campaign_id?: string
          patient_id?: string
          email_sent?: boolean
          email_delivered?: boolean
          email_opened?: boolean
          links_clicked?: string[] | null
          open_timestamp?: string | null
          click_timestamps?: Json | null
        }
      }
      health_outcomes: {
        Row: {
          id: string
          created_at: string
          provider_id: string
          patient_id: string
          condition: string
          measurement_type: string
          measurement_value: number
          measurement_date: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          provider_id: string
          patient_id: string
          condition: string
          measurement_type: string
          measurement_value: number
          measurement_date: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          provider_id?: string
          patient_id?: string
          condition?: string
          measurement_type?: string
          measurement_value?: number
          measurement_date?: string
          notes?: string | null
        }
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
  }
}
