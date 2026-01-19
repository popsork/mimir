<template>
  <header
    class="h-14 border-b border-muted/20 flex items-center px-4"
    style="--ui-header-height: 3.5rem;"
  >
    <NuxtLink to="/" class="text-lg font-semibold">
      Mimir
    </NuxtLink>

    <LayoutMainNav class="ml-6" />

    <div class="ml-auto">
      <UColorModeButton />
    </div>
  </header>
</template>
