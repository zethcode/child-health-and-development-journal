<script setup lang="ts">
import type { ChildProfileLog } from '~/types/database.types'

const props = defineProps<{
  log: ChildProfileLog
}>()

defineEmits<{
  delete: [id: string]
}>()

const { getFieldLabel, formatFieldValue } = useChildPortfolio()

const formattedDate = computed(() => {
  const date = new Date(props.log.changed_at)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})

const formattedTime = computed(() => {
  const date = new Date(props.log.changed_at)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
})

const changeEntries = computed(() => {
  return Object.entries(props.log.changes || {}).map(([field, change]) => ({
    field,
    label: getFieldLabel(field),
    oldValue: formatFieldValue(field, change.old),
    newValue: formatFieldValue(field, change.new),
  }))
})

const isExpanded = ref(false)
</script>

<template>
  <div class="profile-log-entry group">
    <!-- Header -->
    <button
      class="w-full flex items-start gap-3 text-left"
      @click="isExpanded = !isExpanded"
    >
      <!-- Timeline dot -->
      <div class="flex flex-col items-center pt-1">
        <div class="w-3 h-3 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 ring-4 ring-coral-100 dark:ring-coral-900/30" />
        <div v-if="changeEntries.length > 1" class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 pb-4">
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formattedDate }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {{ formattedTime }}
            </span>
          </div>
          <UIcon
            :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
            class="w-4 h-4 text-gray-400 transition-transform"
          />
        </div>

        <!-- Preview (collapsed) -->
        <div v-if="!isExpanded" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          <span class="font-medium">{{ changeEntries.length }}</span>
          {{ changeEntries.length === 1 ? 'field' : 'fields' }} updated
          <span v-if="log.notes" class="text-gray-400 dark:text-gray-500">
            · "{{ log.notes.slice(0, 30) }}{{ log.notes.length > 30 ? '...' : '' }}"
          </span>
        </div>

        <!-- Expanded content -->
        <div v-if="isExpanded" class="mt-3 space-y-2">
          <div
            v-for="(entry, index) in changeEntries"
            :key="entry.field"
            class="flex items-start gap-2 text-sm"
          >
            <!-- Tree connector -->
            <span class="text-gray-300 dark:text-gray-600 font-mono select-none shrink-0">
              {{ index === changeEntries.length - 1 ? '└─' : '├─' }}
            </span>

            <!-- Change detail -->
            <div class="flex-1 min-w-0">
              <span class="font-medium text-gray-700 dark:text-gray-300">
                {{ entry.label }}:
              </span>
              <span class="text-gray-500 dark:text-gray-400 ml-1">
                {{ entry.oldValue }}
              </span>
              <UIcon name="i-heroicons-arrow-right" class="w-3 h-3 text-coral-500 mx-1 inline" />
              <span class="text-coral-600 dark:text-coral-400 font-medium">
                {{ entry.newValue }}
              </span>
            </div>
          </div>

          <!-- Note -->
          <div v-if="log.notes" class="flex items-start gap-2 text-sm mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-gray-400 mt-0.5" />
            <p class="text-gray-600 dark:text-gray-400 italic">
              "{{ log.notes }}"
            </p>
          </div>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
.profile-log-entry {
  @apply relative;
}
</style>
