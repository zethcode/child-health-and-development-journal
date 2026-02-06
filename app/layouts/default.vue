<script setup lang="ts">
const route = useRoute()

const navigation = [
  { name: 'Today', to: '/', icon: 'i-heroicons-home', activeIcon: 'i-heroicons-home-solid' },
  { name: 'Calendar', to: '/calendar', icon: 'i-heroicons-calendar', activeIcon: 'i-heroicons-calendar-solid' },
  { name: 'Medicines', to: '/medicines', icon: 'i-heroicons-beaker', activeIcon: 'i-heroicons-beaker-solid' },
  { name: 'Schedules', to: '/schedules', icon: 'i-heroicons-clock', activeIcon: 'i-heroicons-clock-solid' },
  { name: 'Settings', to: '/settings', icon: 'i-heroicons-cog-6-tooth', activeIcon: 'i-heroicons-cog-6-tooth-solid' },
]

const isActive = (item: typeof navigation[0]) => {
  if (item.to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(item.to)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Main content -->
    <main class="flex-1 pb-20 overflow-y-auto">
      <slot />
    </main>

    <!-- Bottom navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 bottom-nav-safe z-50">
      <div class="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative"
          :class="[
            isActive(item)
              ? 'text-coral-600 dark:text-coral-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
          ]"
        >
          <!-- Active indicator -->
          <div
            v-if="isActive(item)"
            class="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-coral-500 to-orange-500 rounded-full"
          />

          <!-- Icon with background for active state -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            :class="[
              isActive(item)
                ? 'bg-coral-100 dark:bg-coral-900/30'
                : ''
            ]"
          >
            <UIcon
              :name="isActive(item) ? item.activeIcon : item.icon"
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'scale-110': isActive(item) }"
            />
          </div>
          <span class="text-[9px] font-medium mt-0.5">{{ item.name }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
