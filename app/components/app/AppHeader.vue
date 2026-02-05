<script setup lang="ts">
const { child } = useChild()
</script>

<template>
  <header class="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-heart" class="w-6 h-6 text-emerald-500" />
        <span class="font-semibold text-gray-900 dark:text-white">Health Journal</span>
      </div>
      <div v-if="child" class="text-sm text-gray-600 dark:text-gray-400">
        {{ child.name }}
      </div>
    </div>
  </header>
</template>
