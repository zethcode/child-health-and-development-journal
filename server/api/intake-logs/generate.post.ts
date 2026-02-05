import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { date } = body
  const targetDate = date ? new Date(date) : new Date()

  // Get the user's child
  const { data: child } = await client
    .from('children')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!child) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No child profile found',
    })
  }

  // Get active schedules
  const dayOfWeek = targetDate.getDay()
  const { data: schedules, error: schedulesError } = await client
    .from('schedules')
    .select(`
      *,
      substance:substances (*)
    `)
    .eq('child_id', child.id)
    .eq('is_active', true)
    .lte('start_date', targetDate.toISOString().split('T')[0])
    .or(`end_date.is.null,end_date.gte.${targetDate.toISOString().split('T')[0]}`)
    .contains('days_of_week', [dayOfWeek])

  if (schedulesError) {
    throw createError({
      statusCode: 500,
      statusMessage: schedulesError.message,
    })
  }

  if (!schedules || schedules.length === 0) {
    return { created: 0, logs: [] }
  }

  // Check for existing logs for today
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).toISOString()
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1).toISOString()

  const { data: existingLogs } = await client
    .from('intake_logs')
    .select('schedule_id, scheduled_time')
    .eq('child_id', child.id)
    .gte('scheduled_time', startOfDay)
    .lt('scheduled_time', endOfDay)

  const existingScheduleIds = new Set(existingLogs?.map(l => l.schedule_id) || [])

  // Generate logs for schedules that don't have one
  const logsToCreate = []

  for (const schedule of schedules) {
    if (existingScheduleIds.has(schedule.id)) continue

    // Parse the schedule time and create the scheduled_time
    const [hours, minutes] = schedule.time.split(':').map(Number)
    const scheduledTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hours, minutes)

    logsToCreate.push({
      user_id: user.id,
      child_id: child.id,
      substance_id: schedule.substance_id,
      schedule_id: schedule.id,
      scheduled_time: scheduledTime.toISOString(),
      status: 'pending' as const,
    })
  }

  if (logsToCreate.length === 0) {
    return { created: 0, logs: [] }
  }

  const { data: createdLogs, error: createError } = await client
    .from('intake_logs')
    .insert(logsToCreate)
    .select(`
      *,
      substance:substances (*)
    `)

  if (createError) {
    throw createError({
      statusCode: 500,
      statusMessage: createError.message,
    })
  }

  return {
    created: createdLogs?.length || 0,
    logs: createdLogs || [],
  }
})
