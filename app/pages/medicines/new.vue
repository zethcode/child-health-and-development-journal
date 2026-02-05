<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const router = useRouter()
const { createSubstance, loading, error } = useSubstances()

const form = reactive({
  name: '',
  type: 'medicine' as 'medicine' | 'vitamin' | 'supplement',
  dosage: '',
  unit: 'ml',
  instructions: '',
})

const typeOptions = [
  {
    label: 'Medicine',
    value: 'medicine',
    icon: 'i-heroicons-beaker',
    gradient: 'from-blue-400 to-blue-500',
    description: 'Prescription or OTC medications',
  },
  {
    label: 'Vitamin',
    value: 'vitamin',
    icon: 'i-heroicons-sun',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Daily vitamins and minerals',
  },
  {
    label: 'Supplement',
    value: 'supplement',
    icon: 'i-heroicons-sparkles',
    gradient: 'from-purple-400 to-purple-500',
    description: 'Probiotics, herbs, and more',
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

const handleSubmit = async () => {
  const substance = await createSubstance({
    name: form.name,
    type: form.type,
    dosage: form.dosage || null,
    unit: form.dosage ? form.unit : null,
    instructions: form.instructions || null,
    is_active: true,
  })

  if (substance) {
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
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Add {{ selectedType.label }}</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              {{ selectedType.description }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
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

        <!-- Name -->
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
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          </template>
          Add {{ selectedType.label }}
        </UButton>
      </form>
    </div>
  </div>
</template>
