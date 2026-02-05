<script setup lang="ts">
import type { ScheduleWithSubstance } from '~/types/database.types'

const props = defineProps<{
  schedule: ScheduleWithSubstance
}>()

const emit = defineEmits<{
  'delete': [id: string]
}>()

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

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

const getTypeGradient = (type: string) => {
  switch (type) {
    case 'medicine':
      return 'from-blue-400 to-blue-500'
    case 'vitamin':
      return 'from-amber-400 to-orange-500'
    case 'supplement':
      return 'from-purple-400 to-purple-500'
    default:
      return 'from-gray-400 to-gray-500'
  }
}

const getTypeShadow = (type: string) => {
  switch (type) {
    case 'medicine':
      return 'shadow-blue-200 dark:shadow-blue-900/30'
    case 'vitamin':
      return 'shadow-amber-200 dark:shadow-amber-900/30'
    case 'supplement':
      return 'shadow-purple-200 dark:shadow-purple-900/30'
    default:
      return 'shadow-gray-200 dark:shadow-gray-900/30'
  }
}

const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const formatDaysLabel = (days: number[]) => {
  if (days.length === 7) return 'Every day'
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays'
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends'
  return null
}

const items = [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => navigateTo(`/schedules/${props.schedule.id}`),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => emit('delete', props.schedule.id),
    },
  ],
]
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm transition-all hover:shadow-md"
    :class="{ 'opacity-60': !schedule.is_active }"
  >
    <div class="flex items-start gap-3">
      <!-- Gradient Icon -->
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br"
        :class="[getTypeGradient(schedule.substance.type), getTypeShadow(schedule.substance.type)]"
      >
        <UIcon :name="getTypeIcon(schedule.substance.type)" class="w-6 h-6 text-white" />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink
            :to="`/schedules/${schedule.id}`"
            class="font-semibold text-gray-900 dark:text-white truncate hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
          >
            {{ schedule.substance.name }}
          </NuxtLink>
          <UBadge
            v-if="!schedule.is_active"
            color="gray"
            variant="soft"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            Paused
          </UBadge>
        </div>

        <!-- Time -->
        <div class="flex items-center gap-2 mb-2">
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-coral-100 dark:bg-coral-900/30 rounded-lg">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-coral-600 dark:text-coral-400" />
            <span class="text-sm font-bold text-coral-700 dark:text-coral-300">
              {{ formatTime(schedule.time) }}
            </span>
          </div>
          <span v-if="schedule.substance.dosage" class="text-sm text-gray-500 dark:text-gray-400">
            {{ schedule.substance.dosage }}{{ schedule.substance.unit }}
          </span>
        </div>

        <!-- Days of week -->
        <div class="flex items-center gap-1">
          <template v-if="formatDaysLabel(schedule.days_of_week)">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDaysLabel(schedule.days_of_week) }}
            </span>
          </template>
          <template v-else>
            <div
              v-for="(day, index) in dayNames"
              :key="index"
              class="w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center transition-colors"
              :class="[
                schedule.days_of_week.includes(index)
                  ? 'bg-coral-100 dark:bg-coral-900/40 text-coral-600 dark:text-coral-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              ]"
            >
              {{ day }}
            </div>
          </template>
        </div>
      </div>

      <!-- Menu -->
      <UDropdown :items="items" :popper="{ placement: 'bottom-end' }">
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
</template>
