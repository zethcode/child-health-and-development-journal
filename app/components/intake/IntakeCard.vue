<script setup lang="ts">
import type { IntakeLogWithSubstance } from '~/types/database.types'

const props = defineProps<{
  log: IntakeLogWithSubstance
  readonly?: boolean
}>()

const emit = defineEmits<{
  'mark-taken': [id: string]
  'mark-skipped': [id: string]
}>()

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'taken':
      return { color: 'emerald' as const, label: 'Taken', icon: 'i-heroicons-check' }
    case 'skipped':
      return { color: 'gray' as const, label: 'Skipped', icon: 'i-heroicons-minus' }
    case 'missed':
      return { color: 'red' as const, label: 'Missed', icon: 'i-heroicons-x-mark' }
    default:
      return { color: 'amber' as const, label: 'Pending', icon: 'i-heroicons-clock' }
  }
}

const statusBadge = computed(() => getStatusBadge(props.log.status))

const isPastDue = computed(() => {
  if (props.log.status !== 'pending') return false
  return new Date(props.log.scheduled_time) < new Date()
})
</script>

<template>
  <div
    class="relative bg-white dark:bg-gray-800 rounded-2xl p-4 transition-all ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm"
    :class="[
      log.status === 'taken' ? 'opacity-75' : '',
      isPastDue ? 'ring-amber-300 dark:ring-amber-700' : '',
    ]"
  >
    <!-- Past due indicator -->
    <div
      v-if="isPastDue"
      class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl"
    />

    <div class="flex items-center gap-3">
      <!-- Gradient Icon -->
      <div
        class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br"
        :class="[getTypeGradient(log.substance.type), getTypeShadow(log.substance.type)]"
      >
        <UIcon :name="getTypeIcon(log.substance.type)" class="w-5 h-5 text-white" />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900 dark:text-white truncate">
            {{ log.substance.name }}
          </span>
          <UBadge
            v-if="readonly"
            :color="statusBadge.color"
            variant="soft"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ statusBadge.label }}
          </UBadge>
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
            {{ formatTime(log.scheduled_time) }}
          </span>
          <span v-if="log.substance.dosage" class="text-sm text-gray-500 dark:text-gray-400">
            · {{ log.substance.dosage }}{{ log.substance.unit }}
          </span>
        </div>
      </div>

      <!-- Actions for pending -->
      <div v-if="!readonly && log.status === 'pending'" class="flex gap-2 shrink-0">
        <UButton
          icon="i-heroicons-check"
          color="emerald"
          variant="soft"
          size="sm"
          :ui="{ rounded: 'rounded-xl' }"
          @click="emit('mark-taken', log.id)"
        />
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="soft"
          size="sm"
          :ui="{ rounded: 'rounded-xl' }"
          @click="emit('mark-skipped', log.id)"
        />
      </div>

      <!-- Status indicator for readonly -->
      <div
        v-if="readonly"
        class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        :class="[
          log.status === 'taken' ? 'bg-emerald-100 dark:bg-emerald-900/30' : '',
          log.status === 'skipped' ? 'bg-gray-100 dark:bg-gray-700' : '',
          log.status === 'missed' ? 'bg-red-100 dark:bg-red-900/30' : '',
        ]"
      >
        <UIcon
          :name="statusBadge.icon"
          class="w-4 h-4"
          :class="[
            log.status === 'taken' ? 'text-emerald-500' : '',
            log.status === 'skipped' ? 'text-gray-400' : '',
            log.status === 'missed' ? 'text-red-500' : '',
          ]"
        />
      </div>
    </div>
  </div>
</template>
