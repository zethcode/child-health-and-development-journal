<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const supabase = useSupabaseClient()
const { child } = useChild()

const selectedDate = ref(new Date())
const events = ref<any[]>([])
const loading = ref(false)

const filters = reactive({
  intakes: true,
  healthEvents: true,
})

const healthSubFilters = reactive({
  illness: true,
  treatment: true,
  vaccination: true,
  milestone: true,
  appointment: true,
  other: true,
})

const healthSubFilterOptions = [
  { key: 'illness' as const, label: 'Illness', color: 'bg-red-500' },
  { key: 'treatment' as const, label: 'Treatment', color: 'bg-pink-500' },
  { key: 'vaccination' as const, label: 'Vaccination', color: 'bg-blue-500' },
  { key: 'milestone' as const, label: 'Milestone', color: 'bg-purple-500' },
  { key: 'appointment' as const, label: 'Appointment', color: 'bg-teal-500' },
  { key: 'other' as const, label: 'Other', color: 'bg-gray-500' },
]

// Get the calendar days for the current month view
const calendarDays = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: Date[] = []

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // Add all days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add days from next month to complete the last week
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
  }

  return days
})

const currentMonthLabel = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const prevMonth = () => {
  selectedDate.value = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  selectedDate.value = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth() + 1,
    1
  )
}

const goToToday = () => {
  selectedDate.value = new Date()
}

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isCurrentMonth = (date: Date) => {
  return date.getMonth() === selectedDate.value.getMonth()
}

const isSelected = (date: Date) => {
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const selectDate = (date: Date) => {
  selectedDate.value = date
}

const getEventsForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return events.value.filter(e => {
    // Apply health event sub-filters
    if (e.type === 'health' && !healthSubFilters[e.eventType as keyof typeof healthSubFilters]) {
      return false
    }
    if (e.type === 'health' && e.endDate) {
      // Multi-day health event: check if date falls within [start_date, end_date]
      const startStr = new Date(e.date).toISOString().split('T')[0]
      const endStr = new Date(e.endDate).toISOString().split('T')[0]
      return dateStr >= startStr && dateStr <= endStr
    }
    const eventDate = new Date(e.date).toISOString().split('T')[0]
    return eventDate === dateStr
  })
}

const getEventDayPosition = (event: any, date: Date): 'start' | 'middle' | 'end' | 'single' => {
  if (!event.endDate) return 'single'
  const dateStr = date.toISOString().split('T')[0]
  const startStr = new Date(event.date).toISOString().split('T')[0]
  const endStr = new Date(event.endDate).toISOString().split('T')[0]
  if (startStr === endStr) return 'single'
  if (dateStr === startStr) return 'start'
  if (dateStr === endStr) return 'end'
  return 'middle'
}

const selectedDateEvents = computed(() => {
  return getEventsForDate(selectedDate.value)
})

const fetchEvents = async () => {
  if (!child.value) return

  loading.value = true

  const startOfMonth = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth(),
    1
  )
  const endOfMonth = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth() + 1,
    0
  )

  const allEvents: any[] = []

  // Fetch intake logs
  if (filters.intakes) {
    const { data: intakeLogs } = await supabase
      .from('intake_logs')
      .select(`
        *,
        substance:substances (*)
      `)
      .eq('child_id', child.value.id)
      .gte('scheduled_time', startOfMonth.toISOString())
      .lte('scheduled_time', endOfMonth.toISOString())

    if (intakeLogs) {
      intakeLogs.forEach(log => {
        allEvents.push({
          id: log.id,
          type: 'intake',
          title: log.substance.name,
          date: log.scheduled_time,
          status: log.status,
          substance: log.substance,
        })
      })
    }
  }

  // Fetch health events (including multi-day events that overlap with the month)
  if (filters.healthEvents) {
    const monthStart = startOfMonth.toISOString().split('T')[0]
    const monthEnd = endOfMonth.toISOString().split('T')[0]

    // Fetch events that start within the month OR span into the month
    const { data: healthEvents } = await supabase
      .from('health_events')
      .select('*')
      .eq('child_id', child.value.id)
      .lte('start_date', monthEnd)
      .or(`end_date.gte.${monthStart},end_date.is.null`)

    if (healthEvents) {
      // Filter: events without end_date must start within the month
      healthEvents.forEach(event => {
        if (!event.end_date) {
          const eventStart = event.start_date
          if (eventStart < monthStart || eventStart > monthEnd) return
        }
        allEvents.push({
          id: event.id,
          type: 'health',
          title: event.title,
          date: event.start_date,
          endDate: event.end_date,
          eventType: event.type,
          severity: event.severity,
        })
      })
    }
  }

  events.value = allEvents
  loading.value = false
}

watch([selectedDate, () => filters.intakes, () => filters.healthEvents], () => {
  fetchEvents()
}, { immediate: true })

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'taken':
      return 'bg-emerald-500'
    case 'skipped':
      return 'bg-gray-400'
    case 'missed':
      return 'bg-red-500'
    default:
      return 'bg-amber-500'
  }
}

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'illness':
      return 'bg-red-500'
    case 'treatment':
      return 'bg-pink-500'
    case 'vaccination':
      return 'bg-blue-500'
    case 'milestone':
      return 'bg-purple-500'
    case 'appointment':
      return 'bg-teal-500'
    default:
      return 'bg-gray-500'
  }
}

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'illness':
      return 'i-heroicons-face-frown'
    case 'treatment':
      return 'i-heroicons-heart'
    case 'vaccination':
      return 'i-heroicons-shield-check'
    case 'milestone':
      return 'i-heroicons-star'
    case 'appointment':
      return 'i-heroicons-calendar'
    default:
      return 'i-heroicons-document'
  }
}

const selectedDateLabel = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto space-y-5 pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900/30">
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        </div>
        <UButton
          variant="soft"
          size="sm"
          :ui="{ rounded: 'rounded-xl' }"
          @click="goToToday"
        >
          Today
        </UButton>
      </div>

      <!-- Filters -->
      <div class="flex gap-3">
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          :class="[
            filters.intakes
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700'
          ]"
          @click="filters.intakes = !filters.intakes"
        >
          <div class="w-2 h-2 rounded-full" :class="filters.intakes ? 'bg-emerald-500' : 'bg-gray-300'" />
          Intakes
        </button>
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          :class="[
            filters.healthEvents
              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700'
          ]"
          @click="filters.healthEvents = !filters.healthEvents"
        >
          <div class="w-2 h-2 rounded-full" :class="filters.healthEvents ? 'bg-rose-500' : 'bg-gray-300'" />
          Health Events
        </button>
      </div>

      <!-- Health Event Sub-Filters -->
      <div v-if="filters.healthEvents" class="flex gap-2 flex-wrap">
        <button
          v-for="option in healthSubFilterOptions"
          :key="option.key"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="[
            healthSubFilters[option.key]
              ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-500'
          ]"
          @click="healthSubFilters[option.key] = !healthSubFilters[option.key]"
        >
          <div
            class="w-1.5 h-1.5 rounded-full transition-all"
            :class="healthSubFilters[option.key] ? option.color : 'bg-gray-300'"
          />
          {{ option.label }}
        </button>
      </div>

      <!-- Calendar Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
        <!-- Month Navigation -->
        <div class="flex items-center justify-between mb-4">
          <UButton
            icon="i-heroicons-chevron-left"
            variant="ghost"
            color="gray"
            size="sm"
            :ui="{ rounded: 'rounded-xl' }"
            @click="prevMonth"
          />
          <span class="font-semibold text-gray-900 dark:text-white">{{ currentMonthLabel }}</span>
          <UButton
            icon="i-heroicons-chevron-right"
            variant="ghost"
            color="gray"
            size="sm"
            :ui="{ rounded: 'rounded-xl' }"
            @click="nextMonth"
          />
        </div>

        <!-- Week day headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="(day, i) in weekDays"
            :key="i"
            class="text-center text-xs font-semibold py-2"
            :class="[i === 0 || i === 6 ? 'text-coral-500' : 'text-gray-400 dark:text-gray-500']"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(date, index) in calendarDays"
            :key="index"
            class="aspect-square p-1 rounded-xl transition-all relative flex flex-col items-center justify-center"
            :class="[
              isCurrentMonth(date)
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-300 dark:text-gray-600',
              isSelected(date)
                ? 'bg-gradient-to-br from-coral-500 to-orange-500 text-white shadow-lg shadow-coral-200 dark:shadow-coral-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700',
              isToday(date) && !isSelected(date) ? 'ring-2 ring-coral-400 ring-inset' : '',
            ]"
            @click="selectDate(date)"
          >
            <span class="text-sm font-medium">{{ date.getDate() }}</span>
            <!-- Event indicators -->
            <div class="flex gap-0.5 mt-0.5 h-1.5">
              <span
                v-for="(event, i) in getEventsForDate(date).slice(0, 3)"
                :key="i"
                class="h-1.5 transition-all"
                :class="[
                  isSelected(date)
                    ? 'bg-white/70'
                    : event.type === 'intake'
                      ? getStatusColor(event.status)
                      : getEventTypeColor(event.eventType),
                  event.type === 'health' && getEventDayPosition(event, date) === 'middle'
                    ? 'w-3 rounded-sm opacity-60'
                    : event.type === 'health' && getEventDayPosition(event, date) === 'start'
                      ? 'w-2 rounded-l-full'
                      : event.type === 'health' && getEventDayPosition(event, date) === 'end'
                        ? 'w-2 rounded-r-full'
                        : 'w-1.5 rounded-full'
                ]"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Selected Day Events -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-queue-list" class="w-4 h-4 text-coral-600 dark:text-coral-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {{ selectedDateLabel }}
          </h2>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
        </div>

        <!-- Empty state -->
        <div v-else-if="selectedDateEvents.length === 0" class="text-center py-10">
          <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <UIcon name="i-heroicons-calendar" class="w-7 h-7 text-gray-400" />
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">No events on this day</p>
        </div>

        <!-- Events list -->
        <div v-else class="space-y-2">
          <div
            v-for="event in selectedDateEvents"
            :key="event.id"
            class="bg-white dark:bg-gray-800 rounded-xl p-3 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <!-- Status/Type indicator -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :class="[
                  event.type === 'intake'
                    ? event.status === 'taken'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      : event.status === 'skipped'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    : event.eventType === 'illness'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : event.eventType === 'treatment'
                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600'
                        : event.eventType === 'vaccination'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                          : event.eventType === 'milestone'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                            : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'
                ]"
              >
                <UIcon
                  :name="event.type === 'intake' ? 'i-heroicons-beaker' : getEventTypeIcon(event.eventType)"
                  class="w-5 h-5"
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <span class="font-medium text-gray-900 dark:text-white block truncate">
                  {{ event.title }}
                </span>
                <span v-if="event.type === 'intake'" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatTime(event.date) }}
                  <span v-if="event.substance?.dosage">
                    · {{ event.substance.dosage }}{{ event.substance.unit }}
                  </span>
                </span>
                <span v-else class="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {{ event.eventType }}
                  <span v-if="event.endDate && getEventDayPosition(event, selectedDate) !== 'single'" class="text-xs opacity-70">
                    ({{ getEventDayPosition(event, selectedDate) === 'start' ? 'started' : getEventDayPosition(event, selectedDate) === 'end' ? 'ended' : 'ongoing' }})
                  </span>
                </span>
              </div>

              <!-- Badge -->
              <UBadge
                v-if="event.type === 'intake'"
                :color="event.status === 'taken' ? 'emerald' : event.status === 'skipped' ? 'gray' : 'amber'"
                variant="soft"
                size="xs"
                :ui="{ rounded: 'rounded-full' }"
              >
                {{ event.status }}
              </UBadge>
              <UBadge
                v-else
                :color="event.eventType === 'illness' ? 'red' : event.eventType === 'treatment' ? 'pink' : event.eventType === 'vaccination' ? 'blue' : event.eventType === 'appointment' ? 'teal' : 'purple'"
                variant="soft"
                size="xs"
                :ui="{ rounded: 'rounded-full' }"
              >
                {{ event.eventType }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
