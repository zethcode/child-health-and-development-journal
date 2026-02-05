<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const route = useRoute()
const router = useRouter()
const { fetchSubstances, activeSubstances } = useSubstances()
const { createSchedule, loading, error } = useSchedules()

const preselectedSubstance = route.query.substance as string | undefined

const form = reactive({
  substance_id: preselectedSubstance || '',
  time: '08:00',
  days_of_week: [0, 1, 2, 3, 4, 5, 6] as number[],
  reminder_minutes_before: 15,
})

const dayOptions = [
  { label: 'S', fullLabel: 'Sun', value: 0 },
  { label: 'M', fullLabel: 'Mon', value: 1 },
  { label: 'T', fullLabel: 'Tue', value: 2 },
  { label: 'W', fullLabel: 'Wed', value: 3 },
  { label: 'T', fullLabel: 'Thu', value: 4 },
  { label: 'F', fullLabel: 'Fri', value: 5 },
  { label: 'S', fullLabel: 'Sat', value: 6 },
]

const reminderOptions = [
  { label: 'No reminder', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
]

onMounted(() => {
  fetchSubstances(true)
})

const toggleDay = (day: number) => {
  const index = form.days_of_week.indexOf(day)
  if (index === -1) {
    form.days_of_week.push(day)
  } else {
    form.days_of_week.splice(index, 1)
  }
  form.days_of_week.sort((a, b) => a - b)
}

const selectAllDays = () => {
  form.days_of_week = [0, 1, 2, 3, 4, 5, 6]
}

const selectWeekdays = () => {
  form.days_of_week = [1, 2, 3, 4, 5]
}

const selectWeekends = () => {
  form.days_of_week = [0, 6]
}

const handleSubmit = async () => {
  if (!form.substance_id) return
  if (form.days_of_week.length === 0) return

  const schedule = await createSchedule({
    substance_id: form.substance_id,
    time: form.time,
    days_of_week: form.days_of_week,
    reminder_minutes_before: form.reminder_minutes_before,
    is_active: true,
  })

  if (schedule) {
    router.push('/schedules')
  }
}

const substanceOptions = computed(() =>
  activeSubstances.value.map(s => ({
    label: s.name,
    value: s.id,
    type: s.type,
  }))
)

const selectedSubstance = computed(() =>
  activeSubstances.value.find(s => s.id === form.substance_id)
)

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'medicine':
      return 'i-heroicons-beaker'
    case 'vitamin':
      return 'i-heroicons-sun'
    case 'supplement':
      return 'i-heroicons-sparkles'
    default:
      return 'i-heroicons-cube'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto pb-24">
      <!-- Header -->
      <div class="mb-6">
        <UButton
          to="/schedules"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          class="mb-2 -ml-2"
        >
          Back
        </UButton>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900/30">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Add Schedule</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              Set up recurring dose times
            </p>
          </div>
        </div>
      </div>

      <!-- No medicines warning -->
      <div v-if="activeSubstances.length === 0 && !loading" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <UIcon name="i-heroicons-beaker" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Add a medicine first before creating a schedule</p>
        <UButton
          to="/medicines/new"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
        >
          Add Medicine
        </UButton>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Medicine Selection -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-beaker" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Medicine
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup name="substance_id" required>
              <USelectMenu
                v-model="form.substance_id"
                :options="substanceOptions"
                value-attribute="value"
                option-attribute="label"
                placeholder="Select a medicine"
                size="lg"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>

            <!-- Selected medicine preview -->
            <div v-if="selectedSubstance" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div class="flex items-center gap-2">
                <UIcon :name="getTypeIcon(selectedSubstance.type)" class="w-4 h-4 text-gray-500" />
                <span class="text-sm text-gray-600 dark:text-gray-300 capitalize">{{ selectedSubstance.type }}</span>
                <span v-if="selectedSubstance.dosage" class="text-sm text-gray-500">
                  · {{ selectedSubstance.dosage }}{{ selectedSubstance.unit }}
                </span>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Time Selection -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-coral-600 dark:text-coral-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Time
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup name="time" required>
              <UInput
                v-model="form.time"
                type="time"
                size="lg"
                required
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>
          </UCard>
        </div>

        <!-- Days Selection -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Days
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <div class="space-y-4">
              <!-- Day toggles -->
              <div class="flex justify-between">
                <button
                  v-for="day in dayOptions"
                  :key="day.value"
                  type="button"
                  class="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
                  :class="[
                    form.days_of_week.includes(day.value)
                      ? 'bg-gradient-to-br from-coral-500 to-orange-500 text-white shadow-lg shadow-coral-200 dark:shadow-coral-900/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]"
                  @click="toggleDay(day.value)"
                >
                  {{ day.label }}
                </button>
              </div>

              <!-- Quick select buttons -->
              <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  class="text-xs font-medium text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 px-2 py-1 rounded-lg hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-colors"
                  @click="selectAllDays"
                >
                  Every day
                </button>
                <button
                  type="button"
                  class="text-xs font-medium text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 px-2 py-1 rounded-lg hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-colors"
                  @click="selectWeekdays"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  class="text-xs font-medium text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 px-2 py-1 rounded-lg hover:bg-coral-50 dark:hover:bg-coral-900/20 transition-colors"
                  @click="selectWeekends"
                >
                  Weekends
                </button>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Reminder Selection -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-bell" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Reminder
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup name="reminder">
              <USelectMenu
                v-model="form.reminder_minutes_before"
                :options="reminderOptions"
                value-attribute="value"
                option-attribute="label"
                size="lg"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>
          </UCard>
        </div>

        <!-- Errors -->
        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          icon="i-heroicons-exclamation-circle"
          :ui="{ rounded: 'rounded-xl' }"
        />

        <UAlert
          v-if="form.days_of_week.length === 0"
          color="amber"
          variant="soft"
          title="Please select at least one day"
          icon="i-heroicons-exclamation-triangle"
          :ui="{ rounded: 'rounded-xl' }"
        />

        <!-- Submit -->
        <UButton
          type="submit"
          block
          size="xl"
          :loading="loading"
          :disabled="!form.substance_id || form.days_of_week.length === 0"
          :ui="{
            rounded: 'rounded-xl',
            padding: { xl: 'py-4 px-6' },
            font: 'font-semibold',
          }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 shadow-lg shadow-coral-200 dark:shadow-coral-900/30"
        >
          <template #leading>
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          </template>
          Create Schedule
        </UButton>
      </form>
    </div>
  </div>
</template>
