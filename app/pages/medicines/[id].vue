<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { updateSubstance, loading, error } = useSubstances()

const substanceId = route.params.id as string
const substance = ref<any>(null)
const loadingData = ref(true)

const form = reactive({
  name: '',
  type: 'medicine' as 'medicine' | 'vitamin' | 'supplement',
  dosage: '',
  unit: 'ml',
  description: '',
  instructions: '',
  is_active: true,
})

const typeOptions = [
  {
    label: 'Medicine',
    value: 'medicine',
    icon: 'i-heroicons-beaker',
    gradient: 'from-blue-400 to-blue-500',
  },
  {
    label: 'Vitamin',
    value: 'vitamin',
    icon: 'i-heroicons-sun',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    label: 'Supplement',
    value: 'supplement',
    icon: 'i-heroicons-sparkles',
    gradient: 'from-purple-400 to-purple-500',
  },
]

const unitOptions = [
  { label: 'ml', value: 'ml' },
  { label: 'mg', value: 'mg' },
  { label: 'tablet(s)', value: 'tablet' },
  { label: 'drop(s)', value: 'drop' },
  { label: 'tsp', value: 'tsp' },
  { label: 'tbsp', value: 'tbsp' },
]

const selectedType = computed(() => {
  return typeOptions.find(t => t.value === form.type) || typeOptions[0]
})

const nameError = computed(() => {
  if (form.name && form.name.trim().length < 2) return 'Name must be at least 2 characters'
  return null
})

const isValid = computed(() => form.name.trim().length >= 2)

onMounted(async () => {
  const { data } = await supabase
    .from('substances')
    .select('*')
    .eq('id', substanceId)
    .single()

  if (data) {
    substance.value = data
    form.name = data.name
    form.type = data.type
    form.dosage = data.dosage || ''
    form.unit = data.unit || 'ml'
    form.description = data.description || ''
    form.instructions = data.instructions || ''
    form.is_active = data.is_active
  }

  loadingData.value = false
})

const handleSubmit = async () => {
  if (!isValid.value) return
  const result = await updateSubstance(substanceId, {
    name: form.name,
    type: form.type,
    dosage: form.dosage || null,
    unit: form.dosage ? form.unit : null,
    description: form.description || null,
    instructions: form.instructions || null,
    is_active: form.is_active,
  })

  if (result) {
    router.push('/medicines')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto pb-24">
      <!-- Header -->
      <div class="mb-6">
        <UButton
          to="/medicines"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          class="mb-2 -ml-2"
        >
          Back
        </UButton>
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-all duration-300"
            :class="selectedType.gradient"
          >
            <UIcon :name="selectedType.icon" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit {{ selectedType.label }}</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              Update details and settings
            </p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingData" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <!-- Form -->
      <form v-else-if="substance" @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Type Selection -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="type in typeOptions"
              :key="type.value"
              type="button"
              class="relative p-4 rounded-2xl border-2 transition-all text-center"
              :class="[
                form.type === type.value
                  ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              ]"
              @click="form.type = type.value as typeof form.type"
            >
              <div
                class="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br"
                :class="type.gradient"
              >
                <UIcon :name="type.icon" class="w-5 h-5 text-white" />
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ type.label }}</span>
              <div
                v-if="form.type === type.value"
                class="absolute top-2 right-2 w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center"
              >
                <UIcon name="i-heroicons-check" class="w-3 h-3 text-white" />
              </div>
            </button>
          </div>
        </div>

        <!-- Details Card -->
        <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
          <div class="space-y-4">
            <UFormGroup label="Name" name="name" required>
              <UInput
                v-model="form.name"
                placeholder="e.g., Paracetamol, Vitamin D3"
                size="lg"
                required
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Dosage" name="dosage" hint="Optional">
                <UInput
                  v-model="form.dosage"
                  placeholder="e.g., 5"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>

              <UFormGroup label="Unit" name="unit">
                <USelectMenu
                  v-model="form.unit"
                  :options="unitOptions"
                  value-attribute="value"
                  option-attribute="label"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Description" name="description" hint="Optional">
              <UTextarea
                v-model="form.description"
                placeholder="e.g., Reduces fever and relieves pain"
                :rows="2"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>

            <UFormGroup label="Instructions" name="instructions" hint="Optional">
              <UTextarea
                v-model="form.instructions"
                placeholder="e.g., Take with food, shake well before use"
                :rows="3"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>
          </div>
        </UCard>

        <!-- Status Card -->
        <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Active Status</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ form.is_active ? 'Currently taking this' : 'Not currently taking' }}
              </p>
            </div>
            <UToggle v-model="form.is_active" color="coral" />
          </div>
        </UCard>

        <!-- Error Alert -->
        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          icon="i-heroicons-exclamation-circle"
          :ui="{ rounded: 'rounded-xl' }"
        />

        <!-- Submit Button -->
        <UButton
          type="submit"
          block
          size="xl"
          :loading="loading"
          :ui="{
            rounded: 'rounded-xl',
            padding: { xl: 'py-4 px-6' },
            font: 'font-semibold',
          }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 shadow-lg shadow-coral-200 dark:shadow-coral-900/30"
        >
          <template #leading>
            <UIcon name="i-heroicons-check" class="w-5 h-5" />
          </template>
          Save Changes
        </UButton>
      </form>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-circle" class="w-8 h-8 text-red-500" />
        </div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Medicine not found</p>
        <UButton to="/medicines" variant="soft" :ui="{ rounded: 'rounded-xl' }">
          Back to Medicines
        </UButton>
      </div>
    </div>
  </div>
</template>
