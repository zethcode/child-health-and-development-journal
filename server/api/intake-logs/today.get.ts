import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // Get the user's child
  const { data: child } = await client
    .from('children')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!child) {
    return []
  }

  // Get today's date range
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  // Fetch today's intake logs with substance info
  const { data: logs, error } = await client
    .from('intake_logs')
    .select(`
      *,
      substance:substances (*)
    `)
    .eq('child_id', child.id)
    .gte('scheduled_time', startOfDay)
    .lt('scheduled_time', endOfDay)
    .order('scheduled_time')

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return logs
})
