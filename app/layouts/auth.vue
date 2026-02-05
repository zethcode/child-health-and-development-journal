<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-coral-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <!-- Background decoration -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-coral-200/30 dark:bg-coral-900/20 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl" />
    </div>

    <div class="w-full max-w-md relative">
      <slot />
    </div>
  </div>
</template>
