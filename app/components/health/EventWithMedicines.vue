<script setup lang="ts">
import type { HealthEventWithSubstances } from '~/types/database.types'

const props = defineProps<{
  event: HealthEventWithSubstances
}>()

const expanded = ref(false)

const medicineCount = computed(() => props.event.health_event_substances?.length || 0)

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'illness': return 'i-heroicons-face-frown'
    case 'treatment': return 'i-heroicons-heart'
    case 'vaccination': return 'i-heroicons-shield-check'
    case 'milestone': return 'i-heroicons-star'
    case 'appointment': return 'i-heroicons-calendar'
    default: return 'i-heroicons-document-text'
  }
}

const getTypeGradient = (type: string) => {
  switch (type) {
    case 'illness': return 'from-red-400 to-rose-500'
    case 'treatment': return 'from-pink-400 to-pink-500'
    case 'vaccination': return 'from-blue-400 to-blue-500'
    case 'milestone': return 'from-amber-400 to-orange-500'
    case 'appointment': return 'from-teal-400 to-teal-500'
    default: return 'from-gray-400 to-gray-500'
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm overflow-hidden">
    <!-- Event Header -->
    <div
      class="p-4 flex items-center gap-3 cursor-pointer"
      :class="{ 'pb-2': expanded && medicineCount > 0 }"
      @click="expanded = !expanded"
    >
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br"
        :class="getTypeGradient(event.type)"
      >
        <UIcon :name="getTypeIcon(event.type)" class="w-5 h-5 text-white" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900 dark:text-white truncate">{{ event.title }}</span>
          <UBadge
            v-if="medicineCount > 0"
            color="pink"
            variant="soft"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            <UIcon name="i-heroicons-link" class="w-3 h-3 mr-0.5" />
            {{ medicineCount }}
          </UBadge>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatDate(event.start_date) }}
          <template v-if="event.end_date"> - {{ formatDate(event.end_date) }}</template>
          <span class="ml-1 capitalize">· {{ event.type }}</span>
        </span>
      </div>

      <UIcon
        v-if="medicineCount > 0"
        :name="expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4 text-gray-400 shrink-0"
      />
    </div>

    <!-- Expanded Medicines List -->
    <div
      v-if="expanded && medicineCount > 0"
      class="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700"
    >
      <p class="text-xs text-gray-500 uppercase font-medium mb-2">Linked Medicines</p>
      <div class="space-y-1.5">
        <div
          v-for="link in event.health_event_substances"
          :key="link.id"
          class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <UIcon name="i-heroicons-beaker" class="w-4 h-4 text-pink-500 shrink-0" />
          <div class="flex-1 min-w-0">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ link.substance?.name || 'Unknown' }}
            </span>
            <span v-if="link.dosage_override" class="text-xs text-gray-500 ml-1">
              ({{ link.dosage_override }})
            </span>
          </div>
          <span v-if="link.notes" class="text-xs text-gray-400 truncate max-w-[120px]">
            {{ link.notes }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
