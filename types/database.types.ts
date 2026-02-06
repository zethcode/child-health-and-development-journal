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
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          timezone: string
          notification_enabled: boolean
          default_reminder_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          timezone?: string
          notification_enabled?: boolean
          default_reminder_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          timezone?: string
          notification_enabled?: boolean
          default_reminder_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | null
          height_cm: number | null
          weight_kg: number | null
          head_circumference_cm: number | null
          blood_type: string | null
          allergies: string[] | null
          medical_conditions: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height_cm?: number | null
          weight_kg?: number | null
          head_circumference_cm?: number | null
          blood_type?: string | null
          allergies?: string[] | null
          medical_conditions?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height_cm?: number | null
          weight_kg?: number | null
          head_circumference_cm?: number | null
          blood_type?: string | null
          allergies?: string[] | null
          medical_conditions?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      child_profile_logs: {
        Row: {
          id: string
          user_id: string
          child_id: string
          changed_at: string
          changes: Record<string, { old: unknown; new: unknown }>
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          changed_at?: string
          changes: Record<string, { old: unknown; new: unknown }>
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string
          changed_at?: string
          changes?: Record<string, { old: unknown; new: unknown }>
          notes?: string | null
          created_at?: string
        }
      }
      substances: {
        Row: {
          id: string
          user_id: string
          child_id: string
          name: string
          type: 'medicine' | 'vitamin' | 'supplement'
          dosage: string | null
          unit: string | null
          description: string | null
          instructions: string | null
          is_active: boolean
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          name: string
          type: 'medicine' | 'vitamin' | 'supplement'
          dosage?: string | null
          unit?: string | null
          description?: string | null
          instructions?: string | null
          is_active?: boolean
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string
          name?: string
          type?: 'medicine' | 'vitamin' | 'supplement'
          dosage?: string | null
          unit?: string | null
          description?: string | null
          instructions?: string | null
          is_active?: boolean
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          substance_id: string
          child_id: string
          time: string
          days_of_week: number[]
          start_date: string
          end_date: string | null
          reminder_minutes_before: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          substance_id: string
          child_id: string
          time: string
          days_of_week: number[]
          start_date?: string
          end_date?: string | null
          reminder_minutes_before?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          substance_id?: string
          child_id?: string
          time?: string
          days_of_week?: number[]
          start_date?: string
          end_date?: string | null
          reminder_minutes_before?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      intake_logs: {
        Row: {
          id: string
          user_id: string
          child_id: string
          substance_id: string
          schedule_id: string | null
          scheduled_time: string
          actual_time: string | null
          status: 'pending' | 'taken' | 'skipped' | 'missed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          substance_id: string
          schedule_id?: string | null
          scheduled_time: string
          actual_time?: string | null
          status?: 'pending' | 'taken' | 'skipped' | 'missed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string
          substance_id?: string
          schedule_id?: string | null
          scheduled_time?: string
          actual_time?: string | null
          status?: 'pending' | 'taken' | 'skipped' | 'missed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_events: {
        Row: {
          id: string
          user_id: string
          child_id: string
          type: 'illness' | 'vaccination' | 'milestone' | 'appointment' | 'treatment' | 'other'
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          severity: 'low' | 'medium' | 'high' | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          type: 'illness' | 'vaccination' | 'milestone' | 'appointment' | 'treatment' | 'other'
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          severity?: 'low' | 'medium' | 'high' | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string
          type?: 'illness' | 'vaccination' | 'milestone' | 'appointment' | 'treatment' | 'other'
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          severity?: 'low' | 'medium' | 'high' | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      health_event_substances: {
        Row: {
          id: string
          health_event_id: string
          substance_id: string
          dosage_override: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          health_event_id: string
          substance_id: string
          dosage_override?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          health_event_id?: string
          substance_id?: string
          dosage_override?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          device_info: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          device_info?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          device_info?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_notifications: {
        Row: {
          id: string
          user_id: string
          intake_log_id: string | null
          schedule_id: string | null
          send_at: string
          title: string
          body: string
          data: Json | null
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          intake_log_id?: string | null
          schedule_id?: string | null
          send_at: string
          title: string
          body: string
          data?: Json | null
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          intake_log_id?: string | null
          schedule_id?: string | null
          send_at?: string
          title?: string
          body?: string
          data?: Json | null
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error?: string | null
          created_at?: string
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
      substance_type: 'medicine' | 'vitamin' | 'supplement'
      intake_status: 'pending' | 'taken' | 'skipped' | 'missed'
      health_event_type: 'illness' | 'vaccination' | 'milestone' | 'appointment' | 'treatment' | 'other'
      severity_level: 'low' | 'medium' | 'high'
      notification_status: 'pending' | 'sent' | 'failed'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type Child = Tables<'children'>
export type Substance = Tables<'substances'>
export type Schedule = Tables<'schedules'>
export type IntakeLog = Tables<'intake_logs'>
export type HealthEvent = Tables<'health_events'>
export type PushSubscription = Tables<'push_subscriptions'>
export type ScheduledNotification = Tables<'scheduled_notifications'>
export type ChildProfileLog = Tables<'child_profile_logs'>

export type HealthEventSubstance = Tables<'health_event_substances'>

// Extended types with relations
export type SubstanceWithSchedules = Substance & {
  schedules: Schedule[]
}

export type IntakeLogWithSubstance = IntakeLog & {
  substance: Substance
}

export type ScheduleWithSubstance = Schedule & {
  substance: Substance
}

export type HealthEventWithSubstances = HealthEvent & {
  health_event_substances: (HealthEventSubstance & {
    substance: Substance
  })[]
}
