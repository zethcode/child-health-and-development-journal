<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const {
  healthEvents: events,
  loading,
  fetchHealthEvents,
  createHealthEvent,
  updateHealthEvent,
  deleteHealthEvent: removeEvent,
  linkSubstanceToEvent,
  unlinkSubstanceFromEvent,
  fetchHealthEventWithSubstances,
} = useHealthEvents()
const { child } = useChild()
const user = useSupabaseUser()
const { fetchSubstances, activeSubstances } = useSubstances()

const showModal = ref(false)
const editingEvent = ref<any>(null)
const selectedMedicines = ref<string[]>([])
const eventSubstancesMap = ref<Record<string, any[]>>({})
const expandedEvents = ref<Set<string>>(new Set())

const form = reactive({
  type: 'illness' as 'illness' | 'vaccination' | 'milestone' | 'appointment' | 'treatment' | 'other',
  title: '',
  description: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  severity: null as 'low' | 'medium' | 'high' | null,
})

const typeOptions = [
  { label: 'Illness', value: 'illness', icon: 'i-heroicons-face-frown', gradient: 'from-red-400 to-rose-500' },
  { label: 'Treatment', value: 'treatment', icon: 'i-heroicons-heart', gradient: 'from-pink-400 to-pink-500' },
  { label: 'Vaccination', value: 'vaccination', icon: 'i-heroicons-shield-check', gradient: 'from-blue-400 to-blue-500' },
  { label: 'Milestone', value: 'milestone', icon: 'i-heroicons-star', gradient: 'from-amber-400 to-orange-500' },
  { label: 'Appointment', value: 'appointment', icon: 'i-heroicons-calendar', gradient: 'from-teal-400 to-teal-500' },
  { label: 'Other', value: 'other', icon: 'i-heroicons-document-text', gradient: 'from-gray-400 to-gray-500' },
]

const showMedicineSelect = computed(() => form.type === 'illness' || form.type === 'treatment')

const toggleExpanded = async (eventId: string) => {
  if (expandedEvents.value.has(eventId)) {
    expandedEvents.value.delete(eventId)
  } else {
    // Fetch substances for this event if not already loaded
    if (!eventSubstancesMap.value[eventId]) {
      const eventWithSubs = await fetchHealthEventWithSubstances(eventId)
      if (eventWithSubs) {
        eventSubstancesMap.value[eventId] = eventWithSubs.health_event_substances || []
      }
    }
    expandedEvents.value.add(eventId)
  }
}

const severityOptions = [
  { label: 'None', value: null },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

onMounted(async () => {
  await Promise.all([fetchHealthEvents(), fetchSubstances(true)])
})

const titleError = computed(() => {
  if (form.title && form.title.trim().length < 2) return 'Title must be at least 2 characters'
  return null
})

const dateError = computed(() => {
  if (form.end_date && form.start_date && form.end_date < form.start_date) {
    return 'End date must be after start date'
  }
  return null
})

const isFormValid = computed(() => form.title.trim().length >= 2 && !dateError.value)

const resetForm = () => {
  form.type = 'illness'
  form.title = ''
  form.description = ''
  form.start_date = new Date().toISOString().split('T')[0]
  form.end_date = ''
  form.severity = null
  selectedMedicines.value = []
  editingEvent.value = null
}

const openNewModal = () => {
  resetForm()
  showModal.value = true
}

const openEditModal = async (event: any) => {
  editingEvent.value = event
  form.type = event.type
  form.title = event.title
  form.description = event.description || ''
  form.start_date = event.start_date
  form.end_date = event.end_date || ''
  form.severity = event.severity
  // Load linked medicines for editing
  selectedMedicines.value = []
  if (event.type === 'illness' || event.type === 'treatment') {
    const eventWithSubs = await fetchHealthEventWithSubstances(event.id)
    if (eventWithSubs?.health_event_substances) {
      selectedMedicines.value = eventWithSubs.health_event_substances.map((s: any) => s.substance_id)
    }
  }
  showModal.value = true
}

const handleSubmit = async () => {
  if (!user.value || !child.value || !isFormValid.value) return

  const eventData = {
    type: form.type,
    title: form.title,
    description: form.description || null,
    start_date: form.start_date,
    end_date: form.end_date || null,
    severity: form.type === 'illness' ? form.severity : null,
  }

  let eventId: string | null = null

  if (editingEvent.value) {
    const result = await updateHealthEvent(editingEvent.value.id, eventData)
    eventId = result?.id || editingEvent.value.id
  } else {
    const result = await createHealthEvent(eventData)
    eventId = result?.id || null
  }

  // Handle medicine linking for illness/treatment types
  if (eventId && (form.type === 'illness' || form.type === 'treatment')) {
    // Get current links
    const currentEvent = await fetchHealthEventWithSubstances(eventId)
    const currentLinks = currentEvent?.health_event_substances?.map((s: any) => s.substance_id) || []

    // Remove unlinked medicines
    for (const substanceId of currentLinks) {
      if (!selectedMedicines.value.includes(substanceId)) {
        await unlinkSubstanceFromEvent(eventId, substanceId)
      }
    }

    // Add new links
    for (const substanceId of selectedMedicines.value) {
      if (!currentLinks.includes(substanceId)) {
        await linkSubstanceToEvent(eventId, substanceId)
      }
    }

    // Update cache
    delete eventSubstancesMap.value[eventId]
  }

  showModal.value = false
  resetForm()
}

const deleteEvent = async (id: string) => {
  await removeEvent(id)
}

const getTypeConfig = (type: string) => {
  return typeOptions.find(t => t.value === type) || typeOptions[typeOptions.length - 1]
}

const getTypeShadow = (type: string) => {
  switch (type) {
    case 'illness':
      return 'shadow-red-200 dark:shadow-red-900/30'
    case 'treatment':
      return 'shadow-pink-200 dark:shadow-pink-900/30'
    case 'vaccination':
      return 'shadow-blue-200 dark:shadow-blue-900/30'
    case 'milestone':
      return 'shadow-amber-200 dark:shadow-amber-900/30'
    case 'appointment':
      return 'shadow-teal-200 dark:shadow-teal-900/30'
    default:
      return 'shadow-gray-200 dark:shadow-gray-900/30'
  }
}

const getSeverityColor = (severity: string | null) => {
  switch (severity) {
    case 'low':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    case 'medium':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    default:
      return ''
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const selectedTypeConfig = computed(() => getTypeConfig(form.type))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto pb-24">
      <!-- Header -->
      <div class="mb-6">
        <UButton
          to="/settings"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          class="mb-2 -ml-2"
        >
          Back
        </UButton>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
              <UIcon name="i-heroicons-heart" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Health Events</h1>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                {{ events.length }} event{{ events.length !== 1 ? 's' : '' }} recorded
              </p>
            </div>
          </div>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            :ui="{ rounded: 'rounded-xl' }"
            class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
            @click="openNewModal"
          >
            Add
          </UButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="events.length === 0" class="text-center py-12">
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-heart" class="w-10 h-10 text-rose-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No health events yet</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          Track illnesses, vaccinations, milestones, and appointments.
        </p>
        <UButton
          size="lg"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
          @click="openNewModal"
        >
          <template #leading>
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          </template>
          Add Health Event
        </UButton>
      </div>

      <!-- Events List -->
      <div v-else class="space-y-3">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm transition-all hover:shadow-md"
        >
          <div class="flex items-start gap-3">
            <!-- Type Icon -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br"
              :class="[getTypeConfig(event.type).gradient, getTypeShadow(event.type)]"
            >
              <UIcon :name="getTypeConfig(event.type).icon" class="w-6 h-6 text-white" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ event.title }}
                </span>
                <UBadge
                  v-if="event.severity"
                  size="xs"
                  :ui="{ rounded: 'rounded-full' }"
                  :class="getSeverityColor(event.severity)"
                >
                  {{ event.severity }}
                </UBadge>
              </div>

              <div class="flex items-center gap-2 mb-1">
                <div class="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-gray-500" />
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {{ formatDate(event.start_date) }}
                    <template v-if="event.end_date"> - {{ formatDate(event.end_date) }}</template>
                  </span>
                </div>
                <span class="text-xs text-gray-400 capitalize">{{ event.type }}</span>
              </div>

              <p v-if="event.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ event.description }}
              </p>

              <!-- Linked medicines toggle -->
              <button
                v-if="event.type === 'illness' || event.type === 'treatment'"
                type="button"
                class="flex items-center gap-1 mt-1.5 text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700"
                @click.stop="toggleExpanded(event.id)"
              >
                <UIcon name="i-heroicons-link" class="w-3 h-3" />
                <span>Medicines</span>
                <UIcon
                  :name="expandedEvents.has(event.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="w-3 h-3"
                />
              </button>

              <!-- Expanded linked medicines -->
              <div v-if="expandedEvents.has(event.id) && eventSubstancesMap[event.id]" class="mt-1.5 flex flex-wrap gap-1">
                <UBadge
                  v-for="link in eventSubstancesMap[event.id]"
                  :key="link.id"
                  color="pink"
                  variant="soft"
                  size="xs"
                  :ui="{ rounded: 'rounded-full' }"
                >
                  {{ link.substance?.name || 'Unknown' }}
                  <span v-if="link.dosage_override" class="ml-0.5 opacity-70">{{ link.dosage_override }}</span>
                </UBadge>
                <span v-if="eventSubstancesMap[event.id].length === 0" class="text-xs text-gray-400">
                  No medicines linked
                </span>
              </div>
            </div>

            <!-- Menu -->
            <UDropdown
              :items="[
                [{ label: 'Edit', icon: 'i-heroicons-pencil', click: () => openEditModal(event) }],
                [{ label: 'Delete', icon: 'i-heroicons-trash', click: () => deleteEvent(event.id) }],
              ]"
              :popper="{ placement: 'bottom-end' }"
            >
              <UButton
                icon="i-heroicons-ellipsis-vertical"
                variant="ghost"
                color="gray"
                size="sm"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UDropdown>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <UModal v-model="showModal">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', rounded: 'rounded-2xl' }">
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-all duration-300"
                :class="selectedTypeConfig.gradient"
              >
                <UIcon :name="selectedTypeConfig.icon" class="w-5 h-5 text-white" />
              </div>
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ editingEvent ? 'Edit' : 'Add' }} Health Event
              </span>
            </div>
          </template>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Type Selection -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="type in typeOptions"
                  :key="type.value"
                  type="button"
                  class="flex flex-col items-center p-2 rounded-xl border-2 transition-all"
                  :class="[
                    form.type === type.value
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  ]"
                  @click="form.type = type.value as typeof form.type"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center mb-1 bg-gradient-to-br"
                    :class="type.gradient"
                  >
                    <UIcon :name="type.icon" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400">{{ type.label }}</span>
                </button>
              </div>
            </div>

            <UFormGroup label="Title" name="title" required :error="titleError">
              <UInput
                v-model="form.title"
                placeholder="e.g., Fever, MMR vaccine"
                size="lg"
                required
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Start Date" name="start_date" required>
                <UInput
                  v-model="form.start_date"
                  type="date"
                  size="lg"
                  required
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>

              <UFormGroup label="End Date" name="end_date" hint="Optional" :error="dateError">
                <UInput
                  v-model="form.end_date"
                  type="date"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>
            </div>

            <UFormGroup v-if="form.type === 'illness' || form.type === 'treatment'" label="Severity" name="severity">
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="option in severityOptions"
                  :key="option.value || 'none'"
                  type="button"
                  class="py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all"
                  :class="[
                    form.severity === option.value
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20 text-coral-700 dark:text-coral-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800'
                  ]"
                  @click="form.severity = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </UFormGroup>

            <!-- Medicine Linking (for illness and treatment types) -->
            <div v-if="showMedicineSelect && activeSubstances.length > 0" class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Link Medicines</label>
              <div class="space-y-1.5 max-h-36 overflow-y-auto">
                <label
                  v-for="substance in activeSubstances"
                  :key="substance.id"
                  class="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all"
                  :class="[
                    selectedMedicines.includes(substance.id)
                      ? 'bg-pink-50 dark:bg-pink-900/20 ring-1 ring-pink-200 dark:ring-pink-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  ]"
                >
                  <input
                    type="checkbox"
                    :value="substance.id"
                    v-model="selectedMedicines"
                    class="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ substance.name }}</span>
                    <span v-if="substance.dosage" class="text-xs text-gray-500 ml-1">
                      {{ substance.dosage }}{{ substance.unit }}
                    </span>
                  </div>
                </label>
              </div>
              <p v-if="selectedMedicines.length > 0" class="text-xs text-gray-500">
                {{ selectedMedicines.length }} medicine{{ selectedMedicines.length !== 1 ? 's' : '' }} linked
              </p>
            </div>

            <UFormGroup label="Notes" name="description" hint="Optional">
              <UTextarea
                v-model="form.description"
                :rows="2"
                placeholder="Additional details..."
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>

            <div class="flex justify-end gap-3 pt-2">
              <UButton
                variant="ghost"
                :ui="{ rounded: 'rounded-xl' }"
                @click="showModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :disabled="!isFormValid"
                :ui="{ rounded: 'rounded-xl' }"
                class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 disabled:opacity-50"
              >
                {{ editingEvent ? 'Save Changes' : 'Add Event' }}
              </UButton>
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
  </div>
</template>
