<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { login, loading, error } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  const success = await login(email.value, password.value)
  if (success) {
    router.push('/')
  }
}
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
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Sign in to your health journal</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </UFormGroup>

        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          icon="i-heroicons-exclamation-circle"
          :ui="{ rounded: 'rounded-xl' }"
        />

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
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          </template>
          Sign In
        </UButton>
      </form>
    </div>

    <!-- Footer -->
    <p class="text-center text-gray-500 dark:text-gray-400">
      Don't have an account?
      <NuxtLink to="/register" class="text-coral-600 dark:text-coral-400 font-semibold hover:underline">
        Create one
      </NuxtLink>
    </p>
  </div>
</template>
