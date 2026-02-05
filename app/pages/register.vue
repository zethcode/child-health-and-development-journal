<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { register, loading, error } = useAuth()
const router = useRouter()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)
const success = ref(false)

const handleSubmit = async () => {
  localError.value = null

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    localError.value = 'Password must be at least 6 characters'
    return
  }

  const result = await register(email.value, password.value, displayName.value || undefined)

  if (result) {
    success.value = true
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
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Start tracking your child's health</p>
    </div>

    <!-- Success State -->
    <div v-if="success" class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
          <UIcon name="i-heroicons-envelope" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Check Your Email</h2>
        <p class="text-gray-500 dark:text-gray-400">
          We've sent a confirmation link to <strong class="text-gray-700 dark:text-gray-200">{{ email }}</strong>.
          Please click the link to activate your account.
        </p>
        <UButton
          to="/login"
          variant="soft"
          block
          size="lg"
          :ui="{ rounded: 'rounded-xl' }"
        >
          Back to Sign In
        </UButton>
      </div>
    </div>

    <!-- Form Card -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Your Name" name="displayName" hint="Optional">
          <UInput
            v-model="displayName"
            placeholder="Your name"
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </UFormGroup>

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
            placeholder="Create a password"
            required
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirmPassword">
          <UInput
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            size="lg"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </UFormGroup>

        <UAlert
          v-if="localError || error"
          color="red"
          variant="soft"
          :title="localError || error"
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
            <UIcon name="i-heroicons-user-plus" class="w-5 h-5" />
          </template>
          Create Account
        </UButton>
      </form>
    </div>

    <!-- Footer -->
    <p class="text-center text-gray-500 dark:text-gray-400">
      Already have an account?
      <NuxtLink to="/login" class="text-coral-600 dark:text-coral-400 font-semibold hover:underline">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
