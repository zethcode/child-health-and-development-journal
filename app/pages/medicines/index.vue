<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const { substances, substancesByType, fetchSubstances, loading, toggleActive, deleteSubstance } = useSubstances()

const searchQuery = ref('')

onMounted(() => {
  fetchSubstances()
})

const showDeleteModal = ref(false)
const substanceToDelete = ref<string | null>(null)

const handleDelete = async () => {
  if (substanceToDelete.value) {
    await deleteSubstance(substanceToDelete.value)
    substanceToDelete.value = null
    showDeleteModal.value = false
  }
}

const confirmDelete = (id: string) => {
  substanceToDelete.value = id
  showDeleteModal.value = true
}

const activeTab = ref(0)

const tabs = [
  {
    label: 'All',
    icon: 'i-heroicons-squares-2x2',
    count: computed(() => substances.value.length),
  },
  {
    label: 'Medicines',
    icon: 'i-heroicons-beaker',
    count: computed(() => substancesByType.value.medicine.length),
  },
  {
    label: 'Vitamins',
    icon: 'i-heroicons-sun',
    count: computed(() => substancesByType.value.vitamin.length),
  },
  {
    label: 'Supplements',
    icon: 'i-heroicons-sparkles',
    count: computed(() => substancesByType.value.supplement.length),
  },
]

const tabFilteredSubstances = computed(() => {
  switch (activeTab.value) {
    case 1:
      return substancesByType.value.medicine
    case 2:
      return substancesByType.value.vitamin
    case 3:
      return substancesByType.value.supplement
    default:
      return substances.value
  }
})

const filteredSubstances = computed(() => {
  if (!searchQuery.value.trim()) return tabFilteredSubstances.value
  const query = searchQuery.value.toLowerCase()
  return tabFilteredSubstances.value.filter(s =>
    s.name.toLowerCase().includes(query) ||
    (s.description && s.description.toLowerCase().includes(query)) ||
    (s.instructions && s.instructions.toLowerCase().includes(query))
  )
})

const emptyMessages = [
  'No items added yet',
  'No medicines added',
  'No vitamins added',
  'No supplements added',
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto space-y-5 pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <UIcon name="i-heroicons-beaker" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Medicines</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ substances.length }} item{{ substances.length !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <UButton
          to="/medicines/new"
          icon="i-heroicons-plus"
          size="sm"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
        >
          Add
        </UButton>
      </div>

      <!-- Custom Tabs -->
      <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.label"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
          :class="[
            activeTab === index
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md ring-1 ring-gray-200 dark:ring-gray-700'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
          ]"
          @click="activeTab = index"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span
            v-if="tab.count.value > 0"
            class="ml-1 px-1.5 py-0.5 text-xs rounded-full"
            :class="[
              activeTab === index
                ? 'bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ tab.count.value }}
          </span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <UInput
          v-model="searchQuery"
          placeholder="Search by name, description, or instructions..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          :ui="{ rounded: 'rounded-xl', icon: { trailing: { pointer: '' } } }"
        >
          <template v-if="searchQuery" #trailing>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              color="gray"
              size="xs"
              :padded="false"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Substances List -->
      <div v-else-if="filteredSubstances.length > 0" class="space-y-3">
        <SubstanceCard
          v-for="substance in filteredSubstances"
          :key="substance.id"
          :substance="substance"
          @toggle-active="toggleActive"
          @delete="confirmDelete"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <UIcon :name="searchQuery ? 'i-heroicons-magnifying-glass' : tabs[activeTab].icon" class="w-8 h-8 text-gray-400" />
        </div>
        <p v-if="searchQuery" class="text-gray-500 dark:text-gray-400 mb-4">
          No results for "{{ searchQuery }}"
        </p>
        <template v-else>
          <p class="text-gray-500 dark:text-gray-400 mb-2">{{ emptyMessages[activeTab] }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Add medicines, vitamins, or supplements to start tracking.
          </p>
          <UButton
            to="/medicines/new"
            variant="soft"
            :ui="{ rounded: 'rounded-xl' }"
          >
            <template #leading>
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </template>
            Add {{ activeTab === 0 ? 'Medicine' : tabs[activeTab].label.slice(0, -1) }}
          </UButton>
        </template>
      </div>

      <!-- Delete Confirmation Modal -->
      <UModal v-model="showDeleteModal">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', rounded: 'rounded-2xl' }">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500" />
              </div>
              <span class="font-semibold text-gray-900 dark:text-white">Delete Medicine</span>
            </div>
          </template>

          <p class="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this medicine? This will also delete all associated schedules and intake logs.
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
