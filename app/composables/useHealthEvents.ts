import type { HealthEvent, InsertTables, UpdateTables, HealthEventWithSubstances } from '~/types/database.types'

export const useHealthEvents = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { child } = useChild()
  const healthEvents = useState<HealthEvent[]>('health-events', () => [])
  const loading = useState('health-events-loading', () => false)
  const error = useState<string | null>('health-events-error', () => null)

  const fetchHealthEvents = async () => {
    if (!user.value || !child.value) {
      healthEvents.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('health_events')
        .select('*')
        .eq('child_id', child.value.id)
        .order('start_date', { ascending: false })

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      healthEvents.value = data || []
    } finally {
      loading.value = false
    }
  }

  const createHealthEvent = async (event: Omit<InsertTables<'health_events'>, 'user_id' | 'child_id'>) => {
    if (!user.value || !child.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('health_events')
        .insert({
          ...event,
          user_id: user.value.id,
          child_id: child.value.id,
        })
        .select()
        .single()

      if (insertError) {
        error.value = insertError.message
        return null
      }

      healthEvents.value = [data, ...healthEvents.value]
      return data
    } finally {
      loading.value = false
    }
  }

  const updateHealthEvent = async (id: string, updates: UpdateTables<'health_events'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('health_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = healthEvents.value.findIndex(e => e.id === id)
      if (index !== -1) {
        healthEvents.value[index] = data
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const deleteHealthEvent = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('health_events')
        .delete()
        .eq('id', id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      healthEvents.value = healthEvents.value.filter(e => e.id !== id)
      return true
    } finally {
      loading.value = false
    }
  }

  const fetchHealthEventWithSubstances = async (eventId: string): Promise<HealthEventWithSubstances | null> => {
    const { data, error: fetchError } = await supabase
      .from('health_events')
      .select(`
        *,
        health_event_substances (
          *,
          substance:substances (*)
        )
      `)
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('Error fetching health event with substances:', fetchError)
      return null
    }

    return data as HealthEventWithSubstances
  }

  const linkSubstanceToEvent = async (healthEventId: string, substanceId: string, dosageOverride?: string, notes?: string) => {
    const { data, error: insertError } = await supabase
      .from('health_event_substances')
      .insert({
        health_event_id: healthEventId,
        substance_id: substanceId,
        dosage_override: dosageOverride || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (insertError) {
      error.value = insertError.message
      return null
    }

    return data
  }

  const unlinkSubstanceFromEvent = async (healthEventId: string, substanceId: string) => {
    const { error: deleteError } = await supabase
      .from('health_event_substances')
      .delete()
      .eq('health_event_id', healthEventId)
      .eq('substance_id', substanceId)

    if (deleteError) {
      error.value = deleteError.message
      return false
    }

    return true
  }

  const fetchEventsWithSubstances = async (): Promise<HealthEventWithSubstances[]> => {
    if (!user.value || !child.value) return []

    const { data, error: fetchError } = await supabase
      .from('health_events')
      .select(`
        *,
        health_event_substances (
          *,
          substance:substances (*)
        )
      `)
      .eq('child_id', child.value.id)
      .order('start_date', { ascending: false })

    if (fetchError) {
      console.error('Error fetching events with substances:', fetchError)
      return []
    }

    return (data || []) as HealthEventWithSubstances[]
  }

  const activeIllnesses = computed(() =>
    healthEvents.value.filter(e => e.type === 'illness' && !e.end_date)
  )

  const upcomingAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0]!
    return healthEvents.value.filter(e => e.type === 'appointment' && e.start_date >= today)
  })

  return {
    healthEvents,
    loading,
    error,
    activeIllnesses,
    upcomingAppointments,
    fetchHealthEvents,
    createHealthEvent,
    updateHealthEvent,
    deleteHealthEvent,
    fetchHealthEventWithSubstances,
    fetchEventsWithSubstances,
    linkSubstanceToEvent,
    unlinkSubstanceFromEvent,
  }
}
