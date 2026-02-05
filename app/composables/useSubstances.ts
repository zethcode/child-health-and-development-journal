import type { Substance, InsertTables, UpdateTables, SubstanceWithSchedules } from '~/types/database.types'

export const useSubstances = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { child } = useChild()
  const substances = useState<Substance[]>('substances', () => [])
  const loading = useState('substances-loading', () => false)
  const error = useState<string | null>('substances-error', () => null)

  const fetchSubstances = async (activeOnly = false) => {
    if (!user.value || !child.value) {
      substances.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('substances')
        .select('*')
        .eq('child_id', child.value.id)
        .order('name')

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      substances.value = data || []
    } finally {
      loading.value = false
    }
  }

  const fetchSubstancesWithSchedules = async (): Promise<SubstanceWithSchedules[]> => {
    if (!user.value || !child.value) return []

    const { data, error: fetchError } = await supabase
      .from('substances')
      .select(`
        *,
        schedules (*)
      `)
      .eq('child_id', child.value.id)
      .eq('is_active', true)
      .order('name')

    if (fetchError) {
      console.error('Error fetching substances with schedules:', fetchError)
      return []
    }

    return data || []
  }

  const createSubstance = async (substance: Omit<InsertTables<'substances'>, 'user_id' | 'child_id'>) => {
    if (!user.value || !child.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('substances')
        .insert({
          ...substance,
          user_id: user.value.id,
          child_id: child.value.id,
        })
        .select()
        .single()

      if (insertError) {
        error.value = insertError.message
        return null
      }

      substances.value = [...substances.value, data]
      return data
    } finally {
      loading.value = false
    }
  }

  const updateSubstance = async (id: string, updates: UpdateTables<'substances'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('substances')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = substances.value.findIndex(s => s.id === id)
      if (index !== -1) {
        substances.value[index] = data
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const deleteSubstance = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('substances')
        .delete()
        .eq('id', id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      substances.value = substances.value.filter(s => s.id !== id)
      return true
    } finally {
      loading.value = false
    }
  }

  const toggleActive = async (id: string) => {
    const substance = substances.value.find(s => s.id === id)
    if (!substance) return false

    return updateSubstance(id, { is_active: !substance.is_active })
  }

  const activeSubstances = computed(() =>
    substances.value.filter(s => s.is_active)
  )

  const substancesByType = computed(() => ({
    medicine: substances.value.filter(s => s.type === 'medicine'),
    vitamin: substances.value.filter(s => s.type === 'vitamin'),
    supplement: substances.value.filter(s => s.type === 'supplement'),
  }))

  return {
    substances,
    activeSubstances,
    substancesByType,
    loading,
    error,
    fetchSubstances,
    fetchSubstancesWithSchedules,
    createSubstance,
    updateSubstance,
    deleteSubstance,
    toggleActive,
  }
}
