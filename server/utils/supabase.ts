import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'

export const serverSupabaseClient = (event: H3Event) => {
  const config = useRuntimeConfig()

  return createClient<Database>(
    config.supabaseUrl as string,
    config.supabaseKey as string
  )
}

export const serverSupabaseServiceRole = () => {
  const config = useRuntimeConfig()

  return createClient<Database>(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string
  )
}
