import type { IntakeLog, InsertTables, IntakeLogWithSubstance } from '~/types/database.types'

export const useIntakeLogs = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { child } = useChild()
  const todayLogs = useState<IntakeLogWithSubstance[]>('today-logs', () => [])
  const loading = useState('intake-logs-loading', () => false)
  const error = useState<string | null>('intake-logs-error', () => null)

  const fetchTodayLogs = async () => {
    if (!user.value || !child.value) {
      todayLogs.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

      const { data, error: fetchError } = await supabase
        .from('intake_logs')
        .select(`
          *,
          substance:substances (*)
        `)
        .eq('child_id', child.value.id)
        .gte('scheduled_time', startOfDay)
        .lt('scheduled_time', endOfDay)
        .order('scheduled_time')

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      todayLogs.value = data || []
    } finally {
      loading.value = false
    }
  }

  const fetchLogsForDateRange = async (startDate: Date, endDate: Date): Promise<IntakeLogWithSubstance[]> => {
    if (!user.value || !child.value) return []

    const { data, error: fetchError } = await supabase
      .from('intake_logs')
      .select(`
        *,
        substance:substances (*)
      `)
      .eq('child_id', child.value.id)
      .gte('scheduled_time', startDate.toISOString())
      .lt('scheduled_time', endDate.toISOString())
      .order('scheduled_time')

    if (fetchError) {
      console.error('Error fetching logs for date range:', fetchError)
      return []
    }

    return data || []
  }

  const markAsTaken = async (logId: string, notes?: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('intake_logs')
        .update({
          status: 'taken',
          actual_time: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', logId)
        .select(`
          *,
          substance:substances (*)
        `)
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = todayLogs.value.findIndex(l => l.id === logId)
      if (index !== -1) {
        todayLogs.value[index] = data
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const markAsSkipped = async (logId: string, notes?: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('intake_logs')
        .update({
          status: 'skipped',
          notes: notes || null,
        })
        .eq('id', logId)
        .select(`
          *,
          substance:substances (*)
        `)
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = todayLogs.value.findIndex(l => l.id === logId)
      if (index !== -1) {
        todayLogs.value[index] = data
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const createManualLog = async (substanceId: string, scheduledTime: Date, status: 'taken' | 'skipped' = 'taken') => {
    if (!user.value || !child.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('intake_logs')
        .insert({
          user_id: user.value.id,
          child_id: child.value.id,
          substance_id: substanceId,
          scheduled_time: scheduledTime.toISOString(),
          actual_time: status === 'taken' ? new Date().toISOString() : null,
          status,
        })
        .select(`
          *,
          substance:substances (*)
        `)
        .single()

      if (insertError) {
        error.value = insertError.message
        return null
      }

      // Add to today logs if it's for today
      const today = new Date()
      const logDate = new Date(data.scheduled_time)
      if (
        logDate.getFullYear() === today.getFullYear() &&
        logDate.getMonth() === today.getMonth() &&
        logDate.getDate() === today.getDate()
      ) {
        todayLogs.value = [...todayLogs.value, data].sort(
          (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
        )
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const pendingLogs = computed(() =>
    todayLogs.value.filter(l => l.status === 'pending')
  )

  const completedLogs = computed(() =>
    todayLogs.value.filter(l => l.status === 'taken' || l.status === 'skipped')
  )

  const todayProgress = computed(() => {
    const total = todayLogs.value.length
    if (total === 0) return { taken: 0, skipped: 0, pending: 0, total: 0, percentage: 0 }

    const taken = todayLogs.value.filter(l => l.status === 'taken').length
    const skipped = todayLogs.value.filter(l => l.status === 'skipped').length
    const pending = todayLogs.value.filter(l => l.status === 'pending').length

    return {
      taken,
      skipped,
      pending,
      total,
      percentage: Math.round(((taken + skipped) / total) * 100),
    }
  })

  return {
    todayLogs,
    pendingLogs,
    completedLogs,
    todayProgress,
    loading,
    error,
    fetchTodayLogs,
    fetchLogsForDateRange,
    markAsTaken,
    markAsSkipped,
    createManualLog,
  }
}
