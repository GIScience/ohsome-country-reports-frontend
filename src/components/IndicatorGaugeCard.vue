<script setup lang="ts">
import { computed } from 'vue';
import IndicatorIcon, { type IndicatorIconName } from './IndicatorIcon.vue';

const props = withDefaults(defineProps<{
  title: string;
  displayValue: string;
  ringPct: number;
  level: 'good' | 'warn' | 'bad' | 'neutral';
  active: boolean;
  // Icon in the badge shown for non-quality indicators (level 'neutral'):
  // 'people' (default, User Activity), 'tag' (Tag Distribution), 'accuracy'
  // (thematic accuracy).
  icon?: IndicatorIconName;
  // Whether the badge shows displayValue under the icon. Off for indicators
  // whose number isn't meant to be shown (Tag Distribution,
  // roads-thematic-accuracy).
  showValue?: boolean;
  // True when every boundary in the current layer has no data for this
  // indicator - shown but not clickable, same treatment as an unavailable
  // grid-layer pill (.layer-switch button:disabled in MainView.vue).
  disabled?: boolean;
}>(), {
  icon: 'people',
  showValue: true,
  disabled: false
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  if (!props.disabled) emit('click');
}

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const dashOffset = computed(() => CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, props.ringPct)) / 100));
</script>

<template>
  <article
    class="indicator-card"
    :class="{ active, disabled }"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- A percentage ring implies a graded quality score, which doesn't apply
         to a raw count (see isNoQualityDescription in MainView.vue) - a
         people icon plus the number reads as "a count of something",
         not "a score out of 100" that happens to be empty. -->
    <div v-if="level === 'neutral'" class="count-badge">
      <IndicatorIcon :icon="icon" />
      <div v-if="showValue" class="count-value">{{ displayValue }}</div>
    </div>
    <div v-else class="gaugewrap">
      <svg viewBox="0 0 72 72">
        <circle class="ring-track" cx="36" cy="36" r="30" />
        <circle
          class="ring-value"
          :class="'level-' + level"
          cx="36" cy="36" r="30"
          :stroke-dasharray="CIRCUMFERENCE.toFixed(1)"
          :stroke-dashoffset="dashOffset.toFixed(1)"
        />
      </svg>
      <div class="gauge-pct">{{ displayValue }}</div>
    </div>
    <div class="indicator-body">
      <div class="indicator-title-row">
        <div class="indicator-title">{{ title }}</div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.indicator-card {
  background: var(--paper-raised);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.indicator-card:hover { border-color: var(--line-strong); }
.indicator-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), var(--shadow); }
.indicator-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* Same treatment as an unavailable grid-layer pill (.layer-switch
   button:disabled in MainView.vue) - dashed border, muted text, not
   selectable, but still visible in the list rather than removed outright. */
.indicator-card.disabled {
  cursor: not-allowed;
  border-style: dashed;
}
.indicator-card.disabled:hover { border-color: var(--line); }
.indicator-card.disabled .indicator-title,
.indicator-card.disabled .count-value { color: var(--disabled); }

.gaugewrap { flex: none; position: relative; width: 4.6rem; height: 4.6rem; }
.gaugewrap svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: var(--line); stroke-width: 8; }
.ring-value { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.5s ease; }
.ring-value.level-good { stroke: var(--good); }
.ring-value.level-warn { stroke: var(--warn); }
.ring-value.level-bad { stroke: var(--bad); }

.gauge-pct {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-weight: 600; font-size: 0.95rem;
  color: var(--ink);
  text-align: center;
  padding: 0 0.3rem;
}

.count-badge {
  flex: none; width: 4.6rem; height: 4.6rem;
  border-radius: 50%; background: var(--line);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
  color: var(--ink-soft);
}
/* Raw counts can run to 4-5 digits (vs. a 2-3 digit percentage) - shrink to fit. */
.count-value {
  font-family: var(--font-mono); font-weight: 700; font-size: 0.68rem;
  color: var(--ink); text-align: center; padding: 0 0.2rem; line-height: 1.1;
}

.indicator-body { flex: 1; min-width: 0; }
.indicator-title-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.indicator-title { font-size: 0.9rem; font-weight: 700; color: var(--ink); }
</style>
