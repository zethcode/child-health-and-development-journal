<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const user = useSupabaseUser()

// Redirect to home if already logged in
watch(user, (newUser) => {
  if (newUser) {
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 bg-gradient-to-br from-coral-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-coral-200 dark:shadow-coral-900/30">
          <UIcon name="i-heroicons-heart" class="w-10 h-10 text-white" />
        </div>
      </div>
    </div>

    <!-- Confirmation Card -->
    <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
          <UIcon name="i-heroicons-check" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Email Confirmed!</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Your account has been verified. Redirecting you to the app...
        </p>
        <div class="pt-2">
          <UButton
            to="/"
            variant="soft"
            color="emerald"
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </template>
            Go to Dashboard
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
