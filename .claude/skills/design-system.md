---
name: design-system
description: Child Health Journal design system guidelines for consistent UI implementation
---

# Child Health Journal Design System

## Color Palette

### Primary Colors
```
Coral (Primary):
  50: #fff7ed
  100: #ffedd5
  400: #fb923c
  500: #f97316
  600: #ea580c

Gradient: from-coral-500 to-orange-500
Shadow: shadow-coral-200 dark:shadow-coral-900/30
```

### Type Colors
```
Medicine (Blue):
  Gradient: from-blue-400 to-blue-500
  Shadow: shadow-blue-200 dark:shadow-blue-900/30
  Light BG: bg-blue-100 dark:bg-blue-900/30

Vitamin (Amber/Orange):
  Gradient: from-amber-400 to-orange-500
  Shadow: shadow-amber-200 dark:shadow-amber-900/30
  Light BG: bg-amber-100 dark:bg-amber-900/30

Supplement (Purple):
  Gradient: from-purple-400 to-purple-500
  Shadow: shadow-purple-200 dark:shadow-purple-900/30
  Light BG: bg-purple-100 dark:bg-purple-900/30
```

### Semantic Colors
```
Success: emerald-500
Warning: amber-500
Error: red-500
Info: teal-500
```

## Page Background
Always use gradient background:
```html
<div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
```

## Typography

### Font Family
- DM Sans (imported via Google Fonts)

### Headings
- Page title: `text-xl font-bold` or `text-2xl font-bold`
- Section header: `text-sm font-semibold uppercase tracking-wider`

## Spacing & Layout

### Page Container
```html
<div class="p-4 max-w-lg mx-auto space-y-6 pb-24">
```

### Section Spacing
- Between sections: `space-y-6`
- Within cards: `space-y-4`
- Between cards in list: `space-y-3` or `space-y-2`

## Components

### Section Headers
```html
<div class="flex items-center gap-2">
  <div class="w-8 h-8 rounded-xl bg-{color}-100 dark:bg-{color}-900/30 flex items-center justify-center">
    <UIcon name="{icon}" class="w-4 h-4 text-{color}-600 dark:text-{color}-400" />
  </div>
  <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
    Section Title
  </h2>
</div>
```

### Page Header with Icon
```html
<div class="flex items-center gap-3">
  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-{color}-400 to-{color}-500 flex items-center justify-center shadow-lg shadow-{color}-200 dark:shadow-{color}-900/30">
    <UIcon name="{icon}" class="w-5 h-5 text-white" />
  </div>
  <div>
    <h1 class="text-xl font-bold text-gray-900 dark:text-white">Title</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">Subtitle</p>
  </div>
</div>
```

### Cards
```html
<div class="bg-white dark:bg-gray-800 rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
```

Or with UCard:
```html
<UCard :ui="{
  body: { padding: 'p-4 sm:p-5' },
  ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
  shadow: 'shadow-sm',
  rounded: 'rounded-2xl'
}">
```

### Gradient Buttons
```html
<UButton
  :ui="{ rounded: 'rounded-xl' }"
  class="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 shadow-lg shadow-coral-200 dark:shadow-coral-900/30"
>
```

### Gradient Icon Containers
```html
<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-{color}-400 to-{color}-500 flex items-center justify-center shadow-lg shadow-{color}-200 dark:shadow-{color}-900/30">
  <UIcon name="{icon}" class="w-6 h-6 text-white" />
</div>
```

### Form Inputs
All inputs use: `:ui="{ rounded: 'rounded-xl' }"`

### Badges
```html
<UBadge color="{color}" variant="soft" size="xs" :ui="{ rounded: 'rounded-full' }">
```

### Empty States
```html
<div class="text-center py-12">
  <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <UIcon name="{icon}" class="w-8 h-8 text-gray-400" />
  </div>
  <p class="text-gray-500 dark:text-gray-400 mb-4">Message</p>
</div>
```

## Border Radius
- Small elements: `rounded-xl` (12px)
- Cards/Containers: `rounded-2xl` (16px)
- Large decorative: `rounded-3xl` (24px)
- Pills/Badges: `rounded-full`

## Shadows
- Cards: `shadow-sm`
- Elevated elements: `shadow-lg`
- Gradient icons: `shadow-lg shadow-{color}-200 dark:shadow-{color}-900/30`

## Transitions
- Default: `transition-all`
- Colors: `transition-colors`
- Duration: default or `duration-200`

## Dark Mode
Always provide dark mode variants:
- Backgrounds: `dark:bg-gray-800` or `dark:bg-gray-900`
- Text: `dark:text-white`, `dark:text-gray-300`, `dark:text-gray-400`
- Borders: `dark:ring-gray-700`, `dark:border-gray-700`
- Colored backgrounds: `dark:bg-{color}-900/30`
