import type { Profile } from '~/types/database.types'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('profile', () => null)
  const loading = useState('auth-loading', () => false)
  const error = useState<string | null>('auth-error', () => null)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return
    }

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.value.id)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
      return
    }

    profile.value = data
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        error.value = signInError.message
        return false
      }

      await fetchProfile()
      return true
    } finally {
      loading.value = false
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (signUpError) {
        error.value = signUpError.message
        return false
      }

      return true
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        error.value = signOutError.message
        return false
      }

      profile.value = null
      return true
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value) return false

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.value.id)

      if (updateError) {
        error.value = updateError.message
        return false
      }

      await fetchProfile()
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
  }
}
