<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const { fetchSchedulesWithSubstances, deleteSchedule, toggleActive } = useSchedules()

const schedulesWithSubstances = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const data = await fetchSchedulesWithSubstances()
  schedulesWithSubstances.value = data
  loading.value = false
})

const showDeleteModal = ref(false)
const scheduleToDelete = ref<string | null>(null)

const handleDelete = async () => {
  if (scheduleToDelete.value) {
    await deleteSchedule(scheduleToDelete.value)
    schedulesWithSubstances.value = schedulesWithSubstances.value.filter(
      s => s.id !== scheduleToDelete.value
    )
    scheduleToDelete.value = null
    showDeleteModal.value = false
  }
}

const confirmDelete = (id: string) => {
  scheduleToDelete.value = id
  showDeleteModal.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto space-y-5 pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900/30">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Schedules</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ schedulesWithSubstances.length }} schedule{{ schedulesWithSubstances.length !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <UButton
          to="/schedules/new"
          icon="i-heroicons-plus"
          size="sm"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
        >
          Add
        </UButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <!-- Empty State -->
      <div v-else-if="schedulesWithSubstances.length === 0" class="text-center py-12">
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-10 h-10 text-teal-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No schedules yet</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          Create schedules to automatically generate daily dose reminders.
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

      <!-- Schedules List -->
      <div v-else class="space-y-3">
        <ScheduleCard
          v-for="schedule in schedulesWithSubstances"
          :key="schedule.id"
          :schedule="schedule"
          @delete="confirmDelete"
        />
      </div>

      <!-- Delete Confirmation Modal -->
      <UModal v-model="showDeleteModal">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', rounded: 'rounded-2xl' }">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500" />
              </div>
              <span class="font-semibold text-gray-900 dark:text-white">Delete Schedule</span>
            </div>
          </template>

          <p class="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this schedule? Future doses will no longer be generated.
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="ghost"
                :ui="{ rounded: 'rounded-xl' }"
                @click="showDeleteModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="red"
                :ui="{ rounded: 'rounded-xl' }"
                @click="handleDelete"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </div>
</template>
