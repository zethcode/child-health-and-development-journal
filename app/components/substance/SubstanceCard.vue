<script setup lang="ts">
import type { Substance } from '~/types/database.types'

const props = defineProps<{
  substance: Substance
}>()

const emit = defineEmits<{
  'toggle-active': [id: string]
  'delete': [id: string]
}>()

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

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'medicine':
      return 'Medicine'
    case 'vitamin':
      return 'Vitamin'
    case 'supplement':
      return 'Supplement'
    default:
      return type
  }
}

const items = [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => navigateTo(`/medicines/${props.substance.id}`),
    },
    {
      label: 'Add Schedule',
      icon: 'i-heroicons-calendar',
      click: () => navigateTo(`/schedules/new?substance=${props.substance.id}`),
    },
  ],
  [
    {
      label: props.substance.is_active ? 'Mark Inactive' : 'Mark Active',
      icon: props.substance.is_active ? 'i-heroicons-pause' : 'i-heroicons-play',
      click: () => emit('toggle-active', props.substance.id),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => emit('delete', props.substance.id),
    },
  ],
]
</script>

<template>
  <div
    class="relative bg-white dark:bg-gray-800 rounded-2xl p-4 transition-all ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md"
    :class="{ 'opacity-60': !substance.is_active }"
  >
    <div class="flex items-start gap-3">
      <!-- Gradient Icon -->
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br"
        :class="[getTypeGradient(substance.type), getTypeShadow(substance.type)]"
      >
        <UIcon :name="getTypeIcon(substance.type)" class="w-6 h-6 text-white" />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <NuxtLink
            :to="`/medicines/${substance.id}`"
            class="font-semibold text-gray-900 dark:text-white truncate hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
          >
            {{ substance.name }}
          </NuxtLink>
          <UBadge
            v-if="!substance.is_active"
            color="gray"
            variant="soft"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            Inactive
          </UBadge>
        </div>

        <p
          v-if="substance.description"
          class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
        >
          {{ substance.description }}
        </p>

        <div class="flex items-center gap-2 text-sm mt-0.5">
          <span class="text-gray-500 dark:text-gray-400 capitalize">
            {{ getTypeLabel(substance.type) }}
          </span>
          <span v-if="substance.dosage" class="text-gray-400 dark:text-gray-500">·</span>
          <span v-if="substance.dosage" class="font-medium text-gray-700 dark:text-gray-300">
            {{ substance.dosage }}{{ substance.unit }}
          </span>
        </div>

        <!-- Instructions preview -->
        <p
          v-if="substance.instructions"
          class="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2.5 py-1.5"
        >
          {{ substance.instructions }}
        </p>
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
