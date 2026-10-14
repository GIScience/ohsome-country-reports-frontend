<script setup lang="ts">
// Small "i" button on an indicator card that opens the indicator's OQAPI
// documentation page (see indicatorDocsUrl in helpers.ts) in a new tab.
// Clicks/keys are stopped here so they don't also select the card it sits on.
defineProps<{
  href: string;
  label: string;
}>();
</script>

<template>
  <a
    class="info-link"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :title="label"
    :aria-label="label"
    @click.stop
    @keydown.stop
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 11v5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="12" cy="7.6" r="1.15" fill="currentColor" />
    </svg>
  </a>
</template>

<style scoped>
.info-link {
  flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.4rem; height: 1.4rem;
  border-radius: 50%;
  color: var(--ink-faint);
  transition: color 0.15s ease, background 0.15s ease;
}
.info-link:hover { color: var(--accent); background: var(--accent-soft); }
.info-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; color: var(--accent); }
.info-link svg { width: 1.05rem; height: 1.05rem; }
</style>
