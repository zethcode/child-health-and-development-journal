<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const router = useRouter()
const { user, profile, updateProfile, fetchProfile, loading, error } = useAuth()

const form = reactive({
  display_name: '',
  timezone: 'Asia/Manila',
})

const timezoneOptions = [
  { label: 'Asia/Manila (PHT)', value: 'Asia/Manila' },
  { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'America/New_York (EST)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'UTC', value: 'UTC' },
]

onMounted(async () => {
  await fetchProfile()
  if (profile.value) {
    form.display_name = profile.value.display_name || ''
    form.timezone = profile.value.timezone || 'Asia/Manila'
  }
})

const handleSubmit = async () => {
  const success = await updateProfile({
    display_name: form.display_name || null,
    timezone: form.timezone,
  })
  if (success) {
    router.push('/settings')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto pb-24">
      <!-- Header -->
      <div class="mb-6">
        <UButton
          to="/settings"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          size="sm"
          class="mb-2 -ml-2"
        >
          Back
        </UButton>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              Manage your account details
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Account Information -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Account
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup label="Email" name="email">
              <UInput
                :model-value="user?.email || ''"
                size="lg"
                disabled
                :ui="{ rounded: 'rounded-xl' }"
              />
              <template #hint>
                <span class="text-xs text-gray-400">Email cannot be changed</span>
              </template>
            </UFormGroup>
          </UCard>
        </div>

        <!-- Personal Information -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-identification" class="w-4 h-4 text-coral-600 dark:text-coral-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Personal
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup label="Display Name" name="display_name" hint="Optional">
              <UInput
                v-model="form.display_name"
                placeholder="Your name"
                size="lg"
                :ui="{ rounded: 'rounded-xl' }"
              />
            </UFormGroup>
          </UCard>
        </div>

        <!-- Preferences -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Preferences
            </h2>
          </div>

          <UCard :ui="{ body: { padding: 'p-4' }, ring: 'ring-1 ring-gray-200 dark:ring-gray-700', shadow: 'shadow-sm', rounded: 'rounded-2xl' }">
            <UFormGroup label="Timezone" name="timezone">
              <USelectMenu
                v-model="form.timezone"
                :options="timezoneOptions"
                value-attribute="value"
                option-attribute="label"
                size="lg"
                :ui="{ rounded: 'rounded-xl' }"
              />
              <template #hint>
                <span class="text-xs text-gray-400">Used for schedule times and reminders</span>
              </template>
            </UFormGroup>
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
    </div>
  </div>
</template>
