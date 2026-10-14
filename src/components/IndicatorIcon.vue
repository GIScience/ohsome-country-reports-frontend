<script setup lang="ts">
// Icons for indicators that aren't a graded quality score (see the
// count-badge in IndicatorGaugeCard/IndicatorGroupCard):
// - 'people': a raw count of users (User Activity)
// - 'tag': Tag Distribution
// - 'accuracy': thematic accuracy against a reference dataset - a target
export type IndicatorIconName = 'people' | 'tag' | 'accuracy';

defineProps<{ icon: IndicatorIconName }>();
</script>

<template>
  <svg v-if="icon === 'tag'" class="count-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20.59 13.41 11.83 4.65A2 2 0 0 0 10.41 4.06L4 4a1 1 0 0 0-1 1l.06 6.41a2 2 0 0 0 .59 1.42l8.76 8.76a2 2 0 0 0 2.82 0l5.36-5.36a2 2 0 0 0 0-2.82Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
    <circle cx="7.5" cy="8.5" r="1.15" fill="currentColor" />
  </svg>
  <svg v-else-if="icon === 'accuracy'" class="count-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.6" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
  </svg>
  <svg v-else class="count-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="8.5" r="3" stroke="currentColor" stroke-width="1.6" />
    <path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    <circle cx="16.5" cy="8" r="2.4" stroke="currentColor" stroke-width="1.6" />
    <path d="M14.7 13.7c2.7.4 4.8 2.4 4.8 5.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.count-icon { width: 1.5rem; height: 1.5rem; }
</style>
