export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const { child, fetchChild } = useChild()

  // Skip for auth pages
  if (to.path === '/login' || to.path === '/register' || to.path === '/confirm') {
    return
  }

  // Wait for user to be loaded
  if (!user.value) {
    return
  }

  // Fetch child if not loaded
  if (!child.value) {
    await fetchChild()
  }

  // Redirect to onboarding if no child exists (except for settings)
  if (!child.value && !to.path.startsWith('/settings')) {
    return navigateTo('/settings/child')
  }
})
