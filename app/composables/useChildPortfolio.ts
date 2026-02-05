import type { Child, ChildProfileLog } from '~/types/database.types'

// Field labels for display
const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  birth_date: 'Birth Date',
  gender: 'Gender',
  height_cm: 'Height',
  weight_kg: 'Weight',
  head_circumference_cm: 'Head Circumference',
  blood_type: 'Blood Type',
  allergies: 'Allergies',
  medical_conditions: 'Medical Conditions',
  notes: 'Notes',
}

// Field units for display
const FIELD_UNITS: Record<string, string> = {
  height_cm: 'cm',
  weight_kg: 'kg',
  head_circumference_cm: 'cm',
}

export const useChildPortfolio = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { child, fetchChild } = useChild()

  const profileLogs = useState<ChildProfileLog[]>('profile-logs', () => [])
  const logsLoading = useState('profile-logs-loading', () => false)
  const logsError = useState<string | null>('profile-logs-error', () => null)

  /**
   * Calculate age from birth date
   */
  const calculateAge = (birthDate: string | null): { years: number; months: number; days: number } | null => {
    if (!birthDate) return null

    const birth = new Date(birthDate)
    const today = new Date()

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    return { years, months, days }
  }

  /**
   * Format age for display
   */
  const formatAge = (birthDate: string | null): string => {
    const age = calculateAge(birthDate)
    if (!age) return ''

    if (age.years === 0 && age.months === 0) {
      return `${age.days} day${age.days !== 1 ? 's' : ''} old`
    }

    if (age.years === 0) {
      const parts = []
      parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`)
      if (age.days > 0) {
        parts.push(`${age.days} day${age.days !== 1 ? 's' : ''}`)
      }
      return parts.join(', ') + ' old'
    }

    const parts = []
    parts.push(`${age.years} year${age.years !== 1 ? 's' : ''}`)
    if (age.months > 0) {
      parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`)
    }
    return parts.join(', ') + ' old'
  }

  /**
   * Get field label for display
   */
  const getFieldLabel = (field: string): string => {
    return FIELD_LABELS[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Format field value for display (with units)
   */
  const formatFieldValue = (field: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '—'
    }

    // Handle arrays (like allergies)
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '—'
    }

    // Add units if applicable
    const unit = FIELD_UNITS[field]
    if (unit && typeof value === 'number') {
      return `${value} ${unit}`
    }

    // Format gender
    if (field === 'gender' && typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }

    return String(value)
  }

  /**
   * Detect changes between old and new values
   */
  const detectChanges = (
    oldData: Partial<Child>,
    newData: Partial<Child>
  ): Record<string, { old: unknown; new: unknown }> => {
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    const trackableFields = [
      'name', 'birth_date', 'gender', 'height_cm', 'weight_kg',
      'head_circumference_cm', 'blood_type', 'allergies', 'medical_conditions', 'notes'
    ]

    for (const field of trackableFields) {
      const oldVal = oldData[field as keyof Child]
      const newVal = newData[field as keyof Child]

      // Compare arrays
      if (Array.isArray(oldVal) || Array.isArray(newVal)) {
        const oldArr = (oldVal as string[] | null) || []
        const newArr = (newVal as string[] | null) || []
        if (JSON.stringify(oldArr.sort()) !== JSON.stringify(newArr.sort())) {
          changes[field] = { old: oldArr, new: newArr }
        }
        continue
      }

      // Compare other values (normalize null/undefined/empty string)
      const normalizedOld = oldVal === undefined || oldVal === '' ? null : oldVal
      const normalizedNew = newVal === undefined || newVal === '' ? null : newVal

      if (normalizedOld !== normalizedNew) {
        changes[field] = { old: normalizedOld, new: normalizedNew }
      }
    }

    return changes
  }

  /**
   * Update child portfolio and create a log entry
   */
  const updatePortfolio = async (
    updates: Partial<Child>,
    logNotes?: string
  ): Promise<boolean> => {
    if (!user.value || !child.value) return false

    // Detect what changed
    const changes = detectChanges(child.value, updates)

    // If nothing changed, skip
    if (Object.keys(changes).length === 0) {
      return true
    }

    try {
      // Update the child record
      const { error: updateError } = await supabase
        .from('children')
        .update(updates)
        .eq('id', child.value.id)

      if (updateError) {
        console.error('Error updating child:', updateError)
        return false
      }

      // Create log entry
      const { error: logError } = await supabase
        .from('child_profile_logs')
        .insert({
          user_id: user.value.id,
          child_id: child.value.id,
          changes,
          notes: logNotes || null,
        })

      if (logError) {
        console.error('Error creating log:', logError)
        // Don't fail the whole operation if log fails
      }

      // Refresh data
      await fetchChild()
      await fetchProfileLogs()

      return true
    } catch (err) {
      console.error('Error in updatePortfolio:', err)
      return false
    }
  }

  /**
   * Fetch profile change logs
   */
  const fetchProfileLogs = async (limit: number = 20): Promise<void> => {
    if (!user.value || !child.value) {
      profileLogs.value = []
      return
    }

    logsLoading.value = true
    logsError.value = null

    try {
      const { data, error } = await supabase
        .from('child_profile_logs')
        .select('*')
        .eq('child_id', child.value.id)
        .order('changed_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching profile logs:', error)
        logsError.value = error.message
        return
      }

      profileLogs.value = data || []
    } finally {
      logsLoading.value = false
    }
  }

  /**
   * Delete a profile log entry
   */
  const deleteProfileLog = async (logId: string): Promise<boolean> => {
    if (!user.value) return false

    try {
      const { error } = await supabase
        .from('child_profile_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        console.error('Error deleting log:', error)
        return false
      }

      await fetchProfileLogs()
      return true
    } catch (err) {
      console.error('Error in deleteProfileLog:', err)
      return false
    }
  }

  return {
    // State
    profileLogs,
    logsLoading,
    logsError,

    // Methods
    calculateAge,
    formatAge,
    getFieldLabel,
    formatFieldValue,
    detectChanges,
    updatePortfolio,
    fetchProfileLogs,
    deleteProfileLog,
  }
}
