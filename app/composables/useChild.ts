import type { Child } from '~/types/database.types'

export const useChild = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const child = useState<Child | null>('child', () => null)
  const loading = useState('child-loading', () => false)
  const error = useState<string | null>('child-error', () => null)

  const fetchChild = async () => {
    if (!user.value) {
      child.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.value.id)
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error fetching child:', fetchError)
        error.value = fetchError.message
        return
      }

      child.value = data
    } finally {
      loading.value = false
    }
  }

  const createChild = async (name: string, birthDate?: string, notes?: string) => {
    if (!user.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('children')
        .insert({
          user_id: user.value.id,
          name,
          birth_date: birthDate || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (insertError) {
        error.value = insertError.message
        return null
      }

      child.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  const updateChild = async (updates: Partial<Child>) => {
    if (!user.value || !child.value) return false

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('children')
        .update(updates)
        .eq('id', child.value.id)

      if (updateError) {
        error.value = updateError.message
        return false
      }

      await fetchChild()
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    child,
    loading,
    error,
    fetchChild,
    createChild,
    updateChild,
  }
}
