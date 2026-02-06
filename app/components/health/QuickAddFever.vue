<script setup lang="ts">
const emit = defineEmits<{
  'close': []
  'saved': []
}>()

const { createHealthEvent } = useHealthEvents()
const { activeSubstances, fetchSubstances } = useSubstances()

const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  temperature: '' as string | number,
  unit: 'C' as 'C' | 'F',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  medicationTaken: false,
  brand: '',
  dosage: '',
  notes: '',
})

onMounted(() => {
  fetchSubstances(true)
})

const autoSeverity = computed(() => {
  const temp = Number(form.temperature)
  if (!temp) return null
  if (form.unit === 'C') {
    if (temp >= 39) return 'high' as const
    if (temp >= 38) return 'medium' as const
    if (temp >= 37.5) return 'low' as const
  } else {
    if (temp >= 102.2) return 'high' as const
    if (temp >= 100.4) return 'medium' as const
    if (temp >= 99.5) return 'low' as const
  }
  return null
})

const severityLabel = computed(() => {
  switch (autoSeverity.value) {
    case 'high': return 'High Fever'
    case 'medium': return 'Moderate Fever'
    case 'low': return 'Low-Grade Fever'
    default: return 'Normal'
  }
})

const severityColor = computed(() => {
  switch (autoSeverity.value) {
    case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    case 'medium': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
    case 'low': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
    default: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
  }
})

const handleSubmit = async () => {
  if (!form.temperature) return

  loading.value = true
  error.value = null

  try {
    const metadata = {
      temperature: Number(form.temperature),
      unit: form.unit,
      medication_taken: form.medicationTaken,
      brand: form.brand || null,
      dosage: form.dosage || null,
      recorded_at: `${form.date}T${form.time}:00`,
    }

    const result = await createHealthEvent({
      type: 'illness',
      title: `Fever ${form.temperature}°${form.unit}`,
      description: form.notes || null,
      start_date: form.date,
      severity: autoSeverity.value,
      metadata,
    })

    if (result) {
      emit('saved')
      emit('close')
    } else {
      error.value = 'Failed to save fever record'
    }
  } catch (e: any) {
    error.value = e.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', rounded: 'rounded-2xl' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
            <UIcon name="i-heroicons-fire" class="w-5 h-5 text-white" />
          </div>
          <div>
            <span class="font-semibold text-gray-900 dark:text-white">Quick Add Fever</span>
            <p class="text-xs text-gray-500">Record temperature reading</p>
          </div>
        </div>
        <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" size="sm" @click="emit('close')" />
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Temperature Input -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <UInput
              v-model="form.temperature"
              type="number"
              step="0.1"
              min="35"
              max="43"
              placeholder="38.5"
              size="xl"
              required
              :ui="{ rounded: 'rounded-xl' }"
            />
          </div>
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              :class="form.unit === 'C' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'"
              @click="form.unit = 'C'"
            >
              °C
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              :class="form.unit === 'F' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'"
              @click="form.unit = 'F'"
            >
              °F
            </button>
          </div>
        </div>

        <!-- Auto severity indicator -->
        <div
          v-if="form.temperature"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          :class="severityColor"
        >
          <div class="w-1.5 h-1.5 rounded-full" :class="autoSeverity === 'high' ? 'bg-red-500' : autoSeverity === 'medium' ? 'bg-orange-500' : autoSeverity === 'low' ? 'bg-yellow-500' : 'bg-emerald-500'" />
          {{ severityLabel }}
        </div>
      </div>

      <!-- Date & Time -->
      <div class="grid grid-cols-2 gap-3">
        <UFormGroup label="Date" name="date">
          <UInput v-model="form.date" type="date" size="lg" :ui="{ rounded: 'rounded-xl' }" />
        </UFormGroup>
        <UFormGroup label="Time" name="time">
          <UInput v-model="form.time" type="time" size="lg" :ui="{ rounded: 'rounded-xl' }" />
        </UFormGroup>
      </div>

      <!-- Medication -->
      <div class="space-y-3">
        <label class="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            v-model="form.medicationTaken"
            class="rounded border-gray-300 text-coral-500 focus:ring-coral-500"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Paracetamol / medication given</span>
        </label>

        <div v-if="form.medicationTaken" class="grid grid-cols-2 gap-3 pl-7">
          <UFormGroup label="Brand" name="brand">
            <UInput
              v-model="form.brand"
              placeholder="e.g., Tylenol"
              size="lg"
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormGroup>
          <UFormGroup label="Dosage" name="dosage">
            <UInput
              v-model="form.dosage"
              placeholder="e.g., 5ml"
              size="lg"
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormGroup>
        </div>
      </div>

      <!-- Notes -->
      <UFormGroup label="Notes" name="notes" hint="Optional">
        <UTextarea
          v-model="form.notes"
          :rows="2"
          placeholder="Any other symptoms or observations..."
          :ui="{ rounded: 'rounded-xl' }"
        />
      </UFormGroup>

      <!-- Error -->
      <UAlert
        v-if="error"
        color="red"
        variant="soft"
        :title="error"
        icon="i-heroicons-exclamation-circle"
        :ui="{ rounded: 'rounded-xl' }"
      />

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2">
        <UButton variant="ghost" :ui="{ rounded: 'rounded-xl' }" @click="emit('close')">
          Cancel
        </UButton>
        <UButton
          type="submit"
          :loading="loading"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          <template #leading>
            <UIcon name="i-heroicons-fire" class="w-4 h-4" />
          </template>
          Record Fever
        </UButton>
      </div>
    </form>
  </UCard>
</template>
