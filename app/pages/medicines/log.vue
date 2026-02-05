<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const router = useRouter()
const { fetchSubstances, activeSubstances } = useSubstances()
const { createManualLog, loading, error } = useIntakeLogs()

const form = reactive({
  substance_id: '',
  scheduled_time: new Date().toISOString().slice(0, 16),
  status: 'taken' as 'taken' | 'skipped',
})

onMounted(() => {
  fetchSubstances(true)
})

const handleSubmit = async () => {
  if (!form.substance_id) return

  const result = await createManualLog(
    form.substance_id,
    new Date(form.scheduled_time),
    form.status
  )

  if (result) {
    router.push('/')
  }
}

const substanceOptions = computed(() =>
  activeSubstances.value.map(s => ({
    label: `${s.name}${s.dosage ? ` (${s.dosage}${s.unit})` : ''}`,
    value: s.id,
    type: s.type,
  }))
)

const selectedSubstance = computed(() =>
  activeSubstances.value.find(s => s.id === form.substance_id)
)

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
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto pb-24">
      <!-- Header -->
      <div class="mb-6">
        <UButton
          to="/"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          class="mb-2 -ml-2"
        >
          Back
        </UButton>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
            <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Log Intake</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              Manually record a dose
            </p>
          </div>
        </div>
      </div>

      <!-- No medicines warning -->
      <div v-if="activeSubstances.length === 0 && !loading" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <UIcon name="i-heroicons-beaker" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Add a medicine first before logging</p>
        <UButton
          to="/medicines/new"
          :ui="{ rounded: 'rounded-xl' }"
          class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600"
        >
          Add Medicine
        </UButton>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Medicine Selection -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-beaker" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Medicine
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup name="substance_id" required>
              <USelectMenu
                v-model="form.substance_id"
                :options="substanceOptions"
                value-attribute="value"
                option-attribute="label"
                placeholder="Select a medicine"
                size="lg"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>

            <!-- Selected medicine preview -->
            <div v-if="selectedSubstance" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div class="flex items-center gap-2">
                <UIcon :name="getTypeIcon(selectedSubstance.type)" class="w-4 h-4 text-gray-500" />
                <span class="text-sm text-gray-600 dark:text-gray-300 capitalize">{{ selectedSubstance.type }}</span>
                <span v-if="selectedSubstance.dosage" class="text-sm text-gray-500">
                  · {{ selectedSubstance.dosage }}{{ selectedSubstance.unit }}
                </span>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Date & Time -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-coral-600 dark:text-coral-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Date & Time
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup name="scheduled_time" required>
              <UInput
                v-model="form.scheduled_time"
                type="datetime-local"
                size="lg"
                required
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>
          </UCard>
        </div>

        <!-- Status -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Status
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="p-4 rounded-xl border-2 transition-all text-center"
                :class="[
                  form.status === 'taken'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                ]"
                @click="form.status = 'taken'"
              >
                <div class="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-emerald-100 dark:bg-emerald-900/30">
                  <UIcon name="i-heroicons-check" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Taken</span>
              </button>

              <button
                type="button"
                class="p-4 rounded-xl border-2 transition-all text-center"
                :class="[
                  form.status === 'skipped'
                    ? 'border-gray-400 bg-gray-50 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                ]"
                @click="form.status = 'skipped'"
              >
                <div class="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-gray-100 dark:bg-gray-700">
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Skipped</span>
              </button>
            </div>
          </UCard>
        </div>

        <!-- Error -->
        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          icon="i-heroicons-exclamation-circle"
          :ui="{ rounded: 'rounded-xl' }"
        />

        <!-- Submit -->
        <UButton
          type="submit"
          block
          size="xl"
          :loading="loading"
          :disabled="!form.substance_id"
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
          Log Intake
        </UButton>
      </form>
    </div>
  </div>
</template>
