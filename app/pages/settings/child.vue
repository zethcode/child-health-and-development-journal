<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { child, createChild, updateChild, loading, error } = useChild()
const { formatAge, updatePortfolio, fetchProfileLogs, profileLogs, logsLoading } = useChildPortfolio()

const isNewChild = computed(() => !child.value)

// Form state
const form = reactive({
  name: '',
  birth_date: '',
  gender: null as 'male' | 'female' | 'other' | null,
  height_cm: null as number | null,
  weight_kg: null as number | null,
  head_circumference_cm: null as number | null,
  blood_type: null as string | null,
  allergies: [] as string[],
  medical_conditions: '',
  notes: '',
})

// Update note for logging
const updateNote = ref('')
const showUpdateNote = ref(false)

// New allergy input
const newAllergy = ref('')

// Blood type options
const bloodTypeOptions = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
  { label: 'Unknown', value: null },
]

// Gender options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

// History section state
const showHistory = ref(false)

// Computed age display
const ageDisplay = computed(() => {
  if (!form.birth_date) return null
  return formatAge(form.birth_date)
})

// Initialize form from child data
const initForm = () => {
  if (child.value) {
    form.name = child.value.name || ''
    form.birth_date = child.value.birth_date || ''
    form.gender = child.value.gender || null
    form.height_cm = child.value.height_cm || null
    form.weight_kg = child.value.weight_kg || null
    form.head_circumference_cm = child.value.head_circumference_cm || null
    form.blood_type = child.value.blood_type || null
    form.allergies = child.value.allergies || []
    form.medical_conditions = child.value.medical_conditions || ''
    form.notes = child.value.notes || ''
  }
}

onMounted(() => {
  initForm()
  if (child.value) {
    fetchProfileLogs()
  }
})

watch(child, () => {
  initForm()
}, { immediate: true })

// Add allergy
const addAllergy = () => {
  const trimmed = newAllergy.value.trim()
  if (trimmed && !form.allergies.includes(trimmed)) {
    form.allergies.push(trimmed)
  }
  newAllergy.value = ''
}

// Remove allergy
const removeAllergy = (index: number) => {
  form.allergies.splice(index, 1)
}

// Handle form submission
const handleSubmit = async () => {
  if (isNewChild.value) {
    const newChild = await createChild(
      form.name,
      form.birth_date || undefined,
      form.notes || undefined
    )
    if (newChild) {
      // Now update with portfolio fields
      await updatePortfolio({
        gender: form.gender,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        head_circumference_cm: form.head_circumference_cm,
        blood_type: form.blood_type,
        allergies: form.allergies.length > 0 ? form.allergies : null,
        medical_conditions: form.medical_conditions || null,
      }, 'Initial profile setup')
      router.push('/')
    }
  } else {
    const success = await updatePortfolio({
      name: form.name,
      birth_date: form.birth_date || null,
      gender: form.gender,
      height_cm: form.height_cm,
      weight_kg: form.weight_kg,
      head_circumference_cm: form.head_circumference_cm,
      blood_type: form.blood_type,
      allergies: form.allergies.length > 0 ? form.allergies : null,
      medical_conditions: form.medical_conditions || null,
      notes: form.notes || null,
    }, updateNote.value || undefined)

    if (success) {
      updateNote.value = ''
      showUpdateNote.value = false
    }
  }
}

// Section icons and colors for visual hierarchy
const sectionConfig = {
  basic: { icon: 'i-heroicons-user', color: 'coral' },
  measurements: { icon: 'i-heroicons-chart-bar', color: 'teal' },
  medical: { icon: 'i-heroicons-heart', color: 'rose' },
  history: { icon: 'i-heroicons-clock', color: 'amber' },
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto pb-24">
      <!-- Header -->
      <div class="mb-6">
        <UButton
          v-if="!isNewChild"
          to="/settings"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          class="mb-2 -ml-2"
        >
          Back
        </UButton>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center shadow-lg shadow-coral-200 dark:shadow-coral-900/30">
            <UIcon name="i-heroicons-user-circle" class="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isNewChild ? 'Add Your Child' : 'Child Portfolio' }}
            </h1>
            <p v-if="isNewChild" class="text-gray-500 dark:text-gray-400 text-sm">
              Let's set up your child's profile
            </p>
            <p v-else-if="ageDisplay" class="text-coral-600 dark:text-coral-400 text-sm font-medium">
              {{ ageDisplay }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
              <UIcon :name="sectionConfig.basic.icon" class="w-4 h-4 text-coral-600 dark:text-coral-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Basic Information
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm' }">
            <div class="space-y-4">
              <UFormGroup label="Child's Name" name="name" required>
                <UInput
                  v-model="form.name"
                  placeholder="Enter your child's name"
                  size="lg"
                  required
                  :ui="{
                    rounded: 'rounded-xl',
                    color: { white: { outline: 'focus:ring-coral-500 focus:border-coral-500' } }
                  }"
                />
              </UFormGroup>

              <div class="grid grid-cols-2 gap-4">
                <UFormGroup label="Birth Date" name="birth_date">
                  <UInput
                    v-model="form.birth_date"
                    type="date"
                    size="lg"
                    :ui="{ rounded: 'rounded-xl' }"
                  />
                </UFormGroup>

                <UFormGroup label="Gender" name="gender">
                  <USelectMenu
                    v-model="form.gender"
                    :options="genderOptions"
                    placeholder="Select"
                    size="lg"
                    value-attribute="value"
                    option-attribute="label"
                    :ui="{ rounded: 'rounded-xl' }"
                  />
                </UFormGroup>
              </div>

              <!-- Age Badge -->
              <div v-if="ageDisplay" class="flex items-center gap-2 p-3 bg-gradient-to-r from-coral-50 to-orange-50 dark:from-coral-900/20 dark:to-orange-900/20 rounded-xl border border-coral-100 dark:border-coral-800">
                <UIcon name="i-heroicons-cake" class="w-5 h-5 text-coral-500" />
                <span class="text-sm font-medium text-coral-700 dark:text-coral-300">
                  {{ ageDisplay }}
                </span>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Measurements Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <UIcon :name="sectionConfig.measurements.icon" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Measurements
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm' }">
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Height (cm)" name="height_cm">
                <UInput
                  v-model.number="form.height_cm"
                  type="number"
                  step="0.1"
                  min="0"
                  max="250"
                  placeholder="85.5"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                >
                  <template #trailing>
                    <span class="text-gray-400 text-sm">cm</span>
                  </template>
                </UInput>
              </UFormGroup>

              <UFormGroup label="Weight (kg)" name="weight_kg">
                <UInput
                  v-model.number="form.weight_kg"
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  placeholder="12.5"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                >
                  <template #trailing>
                    <span class="text-gray-400 text-sm">kg</span>
                  </template>
                </UInput>
              </UFormGroup>

              <UFormGroup label="Head Circumference" name="head_circumference_cm" class="col-span-2 sm:col-span-1">
                <UInput
                  v-model.number="form.head_circumference_cm"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="45.0"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                >
                  <template #trailing>
                    <span class="text-gray-400 text-sm">cm</span>
                  </template>
                </UInput>
              </UFormGroup>
            </div>

            <!-- Visual measurement display -->
            <div v-if="form.height_cm || form.weight_kg" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-around">
                <div v-if="form.height_cm" class="text-center">
                  <div class="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900/30">
                    <UIcon name="i-heroicons-arrows-up-down" class="w-6 h-6 text-white" />
                  </div>
                  <p class="mt-2 text-lg font-bold text-gray-900 dark:text-white">{{ form.height_cm }} cm</p>
                  <p class="text-xs text-gray-500">Height</p>
                </div>
                <div v-if="form.weight_kg" class="text-center">
                  <div class="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                    <UIcon name="i-heroicons-scale" class="w-6 h-6 text-white" />
                  </div>
                  <p class="mt-2 text-lg font-bold text-gray-900 dark:text-white">{{ form.weight_kg }} kg</p>
                  <p class="text-xs text-gray-500">Weight</p>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Medical Information Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <UIcon :name="sectionConfig.medical.icon" class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Medical Information
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm' }">
            <div class="space-y-4">
              <UFormGroup label="Blood Type" name="blood_type">
                <USelectMenu
                  v-model="form.blood_type"
                  :options="bloodTypeOptions"
                  placeholder="Select blood type"
                  size="lg"
                  value-attribute="value"
                  option-attribute="label"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>

              <!-- Allergies -->
              <UFormGroup label="Allergies" name="allergies">
                <div class="space-y-3">
                  <!-- Allergy tags -->
                  <div v-if="form.allergies.length > 0" class="flex flex-wrap gap-2">
                    <span
                      v-for="(allergy, index) in form.allergies"
                      :key="index"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-sm font-medium"
                    >
                      <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5" />
                      {{ allergy }}
                      <button
                        type="button"
                        class="ml-1 hover:bg-rose-200 dark:hover:bg-rose-800 rounded-full p-0.5 transition-colors"
                        @click="removeAllergy(index)"
                      >
                        <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>

                  <!-- Add allergy input -->
                  <div class="flex gap-2">
                    <UInput
                      v-model="newAllergy"
                      placeholder="Add an allergy (e.g., Peanuts)"
                      size="lg"
                      class="flex-1"
                      :ui="{ rounded: 'rounded-xl' }"
                      @keyup.enter.prevent="addAllergy"
                    />
                    <UButton
                      type="button"
                      color="rose"
                      variant="soft"
                      size="lg"
                      icon="i-heroicons-plus"
                      :ui="{ rounded: 'rounded-xl' }"
                      :disabled="!newAllergy.trim()"
                      @click="addAllergy"
                    />
                  </div>
                </div>
              </UFormGroup>

              <UFormGroup label="Medical Conditions" name="medical_conditions">
                <UTextarea
                  v-model="form.medical_conditions"
                  placeholder="Any medical conditions, chronic illnesses, or important health notes..."
                  :rows="3"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>

              <UFormGroup label="Additional Notes" name="notes">
                <UTextarea
                  v-model="form.notes"
                  placeholder="Any other notes about your child..."
                  :rows="2"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>
            </div>
          </UCard>
        </div>

        <!-- Update Note (for existing profiles) -->
        <div v-if="!isNewChild" class="space-y-4">
          <button
            type="button"
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
            @click="showUpdateNote = !showUpdateNote"
          >
            <UIcon :name="showUpdateNote ? 'i-heroicons-minus-circle' : 'i-heroicons-plus-circle'" class="w-4 h-4" />
            {{ showUpdateNote ? 'Hide' : 'Add' }} update note
          </button>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <UCard v-if="showUpdateNote" :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-amber-200 dark:ring-amber-800', background: 'bg-amber-50 dark:bg-amber-900/20' }">
              <UFormGroup label="Update Note" name="update_note" hint="Optional - describe why you're updating">
                <UInput
                  v-model="updateNote"
                  placeholder="e.g., Monthly checkup measurement"
                  size="lg"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </UFormGroup>
            </UCard>
          </Transition>
        </div>

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
            <UIcon :name="isNewChild ? 'i-heroicons-sparkles' : 'i-heroicons-check'" class="w-5 h-5" />
          </template>
          {{ isNewChild ? 'Get Started' : 'Save Changes' }}
        </UButton>

        <!-- Update History Section (existing profiles only) -->
        <div v-if="!isNewChild" class="space-y-4 pt-4">
          <button
            type="button"
            class="w-full flex items-center justify-between gap-2 py-3"
            @click="showHistory = !showHistory"
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <UIcon :name="sectionConfig.history.icon" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Update History
              </h2>
              <UBadge v-if="profileLogs.length > 0" color="amber" variant="soft" size="xs">
                {{ profileLogs.length }}
              </UBadge>
            </div>
            <UIcon
              :name="showHistory ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showHistory }"
            />
          </button>

          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[2000px]"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-[2000px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="showHistory" class="overflow-hidden">
              <UCard :ui="{ body: { padding: 'p-4 sm:p-5' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm' }">
                <!-- Loading -->
                <div v-if="logsLoading" class="flex items-center justify-center py-8">
                  <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
                </div>

                <!-- Empty state -->
                <div v-else-if="profileLogs.length === 0" class="text-center py-8">
                  <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    No update history yet
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Changes will appear here after your first update
                  </p>
                </div>

                <!-- Log entries -->
                <div v-else class="space-y-1">
                  <ProfileLogEntry
                    v-for="log in profileLogs"
                    :key="log.id"
                    :log="log"
                  />
                </div>
              </UCard>
            </div>
          </Transition>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Custom coral color utilities for gradient buttons */
:deep(.bg-gradient-to-r) {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
</style>
