<script setup lang="ts">
definePageMeta({
  middleware: ['child'],
})

const { user, profile, logout, fetchProfile } = useAuth()
const { child } = useChild()
const { formatAge } = useChildPortfolio()
const { isSupported, permission, isSubscribed, requestPermission, subscribe, checkSubscription, checkSupport } = useNotifications()
const router = useRouter()

const notificationsLoading = ref(false)

onMounted(() => {
  fetchProfile()
  checkSupport()
  checkSubscription()
})

const childAge = computed(() => {
  if (!child.value?.birth_date) return null
  return formatAge(child.value.birth_date)
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const handleEnableNotifications = async () => {
  notificationsLoading.value = true
  const granted = await requestPermission()
  if (granted) {
    await subscribe()
  }
  notificationsLoading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="p-4 max-w-lg mx-auto space-y-6 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <!-- Child Section -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-coral-600 dark:text-coral-400" />
          </div>
          <h2 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Child
          </h2>
        </div>

        <NuxtLink
          to="/settings/child"
          class="block bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-400 to-orange-500 flex items-center justify-center shadow-lg shadow-coral-200 dark:shadow-coral-900/30">
              <UIcon name="i-heroicons-user-circle" class="w-8 h-8 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                {{ child?.name || 'Set up child profile' }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                <template v-if="childAge">{{ childAge }}</template>
                <template v-else>Tap to add profile details</template>
              </div>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-coral-500 transition-colors" />
          </div>
        </NuxtLink>
      </div>

      <!-- Account Section -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-user-circle" class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Account
          </h2>
        </div>

        <NuxtLink
          to="/settings/profile"
          class="block bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Profile Settings
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ profile?.display_name || user?.email || 'Not set' }}
              </div>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </NuxtLink>
      </div>

      <!-- Notifications Section -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-bell" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Notifications
          </h2>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="[
                isSubscribed
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-amber-100 dark:bg-amber-900/30'
              ]"
            >
              <UIcon
                name="i-heroicons-bell"
                class="w-5 h-5"
                :class="[
                  isSubscribed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white">Push Notifications</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                <template v-if="!isSupported">Not supported on this device</template>
                <template v-else-if="isSubscribed">Enabled</template>
                <template v-else-if="permission === 'denied'">Blocked in browser settings</template>
                <template v-else>Get reminders for scheduled doses</template>
              </div>
            </div>
            <UButton
              v-if="isSupported && !isSubscribed && permission !== 'denied'"
              size="sm"
              :loading="notificationsLoading"
              :ui="{ rounded: 'rounded-xl' }"
              class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              @click="handleEnableNotifications"
            >
              Enable
            </UButton>
            <div
              v-else-if="isSubscribed"
              class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-check" class="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <!-- Data Section -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-heart" class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Data
          </h2>
        </div>

        <NuxtLink
          to="/settings/health-events"
          class="block bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-heart" class="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Health Events
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Illnesses, vaccinations, milestones
              </div>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </div>
        </NuxtLink>
      </div>

      <!-- Sign Out -->
      <div class="pt-4">
        <UButton
          color="red"
          variant="soft"
          block
          size="lg"
          :ui="{ rounded: 'rounded-xl' }"
          @click="handleLogout"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          </template>
          Sign Out
        </UButton>
      </div>

      <!-- Version -->
      <p class="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
        Child Health Journal v1.0.0
      </p>
    </div>
  </div>
</template>
