<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const { child } = useChild()
const { todayLogs, todayProgress, fetchTodayLogs, markAsTaken, markAsSkipped, loading } = useIntakeLogs()
const { fetchSubstances, activeSubstances } = useSubstances()
const { formatAge } = useChildPortfolio()

// Fetch data on mount
onMounted(async () => {
  await Promise.all([fetchTodayLogs(), fetchSubstances(true)])
})

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const handleMarkTaken = async (logId: string) => {
  await markAsTaken(logId)
}

const handleMarkSkipped = async (logId: string) => {
  await markAsSkipped(logId)
}

const today = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const childAge = computed(() => {
  if (!child.value?.birth_date) return null
  return formatAge(child.value.birth_date)
})

const pendingLogs = computed(() => todayLogs.value.filter(l => l.status === 'pending'))
const completedLogs = computed(() => todayLogs.value.filter(l => l.status !== 'pending'))

const progressPercentage = computed(() => {
  if (todayProgress.value.total === 0) return 0
  return Math.round((todayProgress.value.taken + todayProgress.value.skipped) / todayProgress.value.total * 100)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <!-- Header with greeting -->
      <div class="pt-2">
        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ greeting }}</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ child?.name || 'Your Child' }}'s Day
        </h1>
        <div class="flex items-center gap-2 mt-1">
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-coral-500" />
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ today }}</span>
          <span v-if="childAge" class="text-xs text-coral-500 font-medium ml-2">
            {{ childAge }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
      </div>

      <!-- Progress Card -->
      <div
        v-else-if="todayLogs.length > 0"
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral-500 to-orange-500 p-5 text-white shadow-lg shadow-coral-200 dark:shadow-coral-900/30"
      >
        <!-- Background decoration -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-white/80 text-sm font-medium">Daily Progress</p>
              <p class="text-3xl font-bold">{{ progressPercentage }}%</p>
            </div>
            <div class="text-right">
              <p class="text-white/80 text-sm">{{ todayProgress.taken + todayProgress.skipped }}/{{ todayProgress.total }}</p>
              <p class="text-xs text-white/60">doses tracked</p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            />
          </div>

          <!-- Stats row -->
          <div class="flex justify-between mt-4 text-sm">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-white" />
              <span class="text-white/90">{{ todayProgress.taken }} taken</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-white/50" />
              <span class="text-white/90">{{ todayProgress.skipped }} skipped</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-amber-300" />
              <span class="text-white/90">{{ todayProgress.pending }} pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State: No medicines -->
      <div
        v-if="!loading && todayLogs.length === 0 && activeSubstances.length === 0"
        class="text-center py-12 px-6"
      >
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-coral-100 to-orange-100 dark:from-coral-900/30 dark:to-orange-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-beaker" class="w-10 h-10 text-coral-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No medicines yet</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          Start by adding medicines, vitamins, or supplements to track for {{ child?.name || 'your child' }}.
        </p>
        <UButton
          to="/medicines/new"
          size="lg"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
        >
          <template #leading>
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          </template>
          Add First Medicine
        </UButton>
      </div>

      <!-- Empty State: No schedules -->
      <div
        v-else-if="!loading && todayLogs.length === 0 && activeSubstances.length > 0"
        class="text-center py-12 px-6"
      >
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-calendar" class="w-10 h-10 text-teal-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No doses scheduled</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          Set up daily schedules to automatically track when doses are due.
        </p>
        <UButton
          to="/schedules/new"
          size="lg"
          color="teal"
          :ui="{ rounded: 'rounded-xl' }"
        >
          <template #leading>
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          </template>
          Create Schedule
        </UButton>
      </div>

      <!-- Pending Section -->
      <div v-if="pendingLogs.length > 0" class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Pending
          </h2>
          <UBadge color="amber" variant="soft" size="xs">
            {{ pendingLogs.length }}
          </UBadge>
        </div>

        <div class="space-y-2">
          <IntakeCard
            v-for="log in pendingLogs"
            :key="log.id"
            :log="log"
            @mark-taken="handleMarkTaken"
            @mark-skipped="handleMarkSkipped"
          />
        </div>
      </div>

      <!-- Completed Section -->
      <div v-if="completedLogs.length > 0" class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Completed
          </h2>
          <UBadge color="emerald" variant="soft" size="xs">
            {{ completedLogs.length }}
          </UBadge>
        </div>

        <div class="space-y-2">
          <IntakeCard
            v-for="log in completedLogs"
            :key="log.id"
            :log="log"
            :readonly="true"
          />
        </div>
      </div>

      <!-- Quick Add FAB -->
      <div class="fixed bottom-20 right-4 z-10">
        <UButton
          to="/medicines/log"
          icon="i-heroicons-plus"
          size="xl"
          :ui="{ rounded: 'rounded-full', padding: { xl: 'p-4' } }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 shadow-lg shadow-coral-300 dark:shadow-coral-900/50"
        />
      </div>
    </div>
  </div>
</template>
