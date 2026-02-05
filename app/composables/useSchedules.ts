import type { Schedule, InsertTables, UpdateTables, ScheduleWithSubstance } from '~/types/database.types'

export const useSchedules = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { child } = useChild()
  const schedules = useState<Schedule[]>('schedules', () => [])
  const loading = useState('schedules-loading', () => false)
  const error = useState<string | null>('schedules-error', () => null)

  const fetchSchedules = async (activeOnly = false) => {
    if (!user.value || !child.value) {
      schedules.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('child_id', child.value.id)
        .order('time')

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      schedules.value = data || []
    } finally {
      loading.value = false
    }
  }

  const fetchSchedulesWithSubstances = async (): Promise<ScheduleWithSubstance[]> => {
    if (!user.value || !child.value) return []

    const { data, error: fetchError } = await supabase
      .from('schedules')
      .select(`
        *,
        substance:substances (*)
      `)
      .eq('child_id', child.value.id)
      .eq('is_active', true)
      .order('time')

    if (fetchError) {
      console.error('Error fetching schedules with substances:', fetchError)
      return []
    }

    return data || []
  }

  const createSchedule = async (schedule: Omit<InsertTables<'schedules'>, 'user_id' | 'child_id'>) => {
    if (!user.value || !child.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('schedules')
        .insert({
          ...schedule,
          user_id: user.value.id,
          child_id: child.value.id,
        })
        .select()
        .single()

      if (insertError) {
        error.value = insertError.message
        return null
      }

      schedules.value = [...schedules.value, data]
      return data
    } finally {
      loading.value = false
    }
  }

  const updateSchedule = async (id: string, updates: UpdateTables<'schedules'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = schedules.value.findIndex(s => s.id === id)
      if (index !== -1) {
        schedules.value[index] = data
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const deleteSchedule = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      schedules.value = schedules.value.filter(s => s.id !== id)
      return true
    } finally {
      loading.value = false
    }
  }

  const toggleActive = async (id: string) => {
    const schedule = schedules.value.find(s => s.id === id)
    if (!schedule) return false

    return updateSchedule(id, { is_active: !schedule.is_active })
  }

  const getSchedulesForSubstance = (substanceId: string) =>
    schedules.value.filter(s => s.substance_id === substanceId)

  const activeSchedules = computed(() =>
    schedules.value.filter(s => s.is_active)
  )

  return {
    schedules,
    activeSchedules,
    loading,
    error,
    fetchSchedules,
    fetchSchedulesWithSubstances,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleActive,
    getSchedulesForSubstance,
  }
}
