import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { start, end, types } = query

  if (!start || !end) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing start or end date',
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

  const events: any[] = []
  const typeFilters = types ? (types as string).split(',') : ['intakes', 'health_events']

  // Fetch intake logs
  if (typeFilters.includes('intakes')) {
    const { data: intakeLogs } = await client
      .from('intake_logs')
      .select(`
        *,
        substance:substances (*)
      `)
      .eq('child_id', child.id)
      .gte('scheduled_time', start as string)
      .lte('scheduled_time', end as string)

    if (intakeLogs) {
      intakeLogs.forEach(log => {
        events.push({
          id: log.id,
          type: 'intake',
          title: log.substance.name,
          date: log.scheduled_time,
          status: log.status,
          substanceType: log.substance.type,
          dosage: log.substance.dosage,
          unit: log.substance.unit,
        })
      })
    }
  }

  // Fetch health events
  if (typeFilters.includes('health_events')) {
    const startDate = (start as string).split('T')[0]
    const endDate = (end as string).split('T')[0]

    const { data: healthEvents } = await client
      .from('health_events')
      .select('*')
      .eq('child_id', child.id)
      .gte('start_date', startDate)
      .lte('start_date', endDate)

    if (healthEvents) {
      healthEvents.forEach(event => {
        events.push({
          id: event.id,
          type: 'health_event',
          title: event.title,
          date: event.start_date,
          eventType: event.type,
          severity: event.severity,
          description: event.description,
          endDate: event.end_date,
        })
      })
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return events
})
