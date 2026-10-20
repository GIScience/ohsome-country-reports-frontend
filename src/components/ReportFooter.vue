<script setup lang="ts">
import heigitLogo from '../assets/images/heigit-logo.svg';
import ohsomeLogo from '../assets/images/ohsome-narrow.svg';
</script>

<template>
  <footer class="footer">
    <div class="footer-left">
      <a class="footer-btn" href="mailto:ohsome@heigit.org">{{ $t('footer.contact') }}</a>
      <a class="footer-btn" href="https://heigit.org/privacy-policy/" target="_blank">{{ $t('footer.privacy') }}</a>
      <a class="footer-btn" href="https://heigit.org/imprint/" target="_blank">{{ $t('footer.imprint') }}</a>
    </div>

    <div class="footer-center">
      <a
        href="https://ohsome-dashboard.heigit.org/en/#backend=ohsomeApi&groupBy=none&time=%2F2026-01-02T11%3A00Z%2FP1M&key=natural&value=tree&types=node&measure=count"
        target="_blank"
        class="ohsome-link"
      >
        <img :src="ohsomeLogo" alt="ohsome">
        <span class="ohsome-text">DASHBOARD</span>
      </a>
    </div>

    <div class="footer-right">
      <a class="heigit-link" href="https://heigit.org/" target="_blank" rel="noopener noreferrer">
        <img :src="heigitLogo" alt="HeiGIT" class="heigit-logo" />
      </a>
      <span class="footer-divider" aria-hidden="true"></span>
      <span class="footer-copyright">© {{ new Date().getFullYear() }} HeiGIT gGmbH</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 0.6rem 1.1rem;
  background: var(--paper-raised);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  border-radius: var(--radius);

  /* Three equal-weight columns, so the dashboard link sits exactly in the
     middle no matter how wide the left/right groups are. */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;

  font-size: 0.78rem;
  font-family: var(--font-body);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-self: start;
}

/* Same height as .ohsome-link so every button in the footer lines up. */
.footer-btn {
  display: inline-flex;
  align-items: center;
  height: 2rem;
  padding: 0 0.7rem;
  white-space: nowrap;
  border: 1px solid var(--line-strong);
  background: transparent;
  text-decoration: none;
  color: var(--ink-soft);
  font-weight: 600;
  border-radius: var(--radius);
}

.footer-btn:hover {
  border-color: var(--accent);
  color: var(--ink);
}

.footer-right {
  color: var(--ink-faint);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-self: end;
}

.heigit-link { display: block; line-height: 0; }
.heigit-logo { height: 2.4rem; width: auto; display: block; }
.footer-divider { width: 1px; height: 1.6rem; background: var(--line-strong); }
.footer-copyright { white-space: nowrap; }

.footer-center {
  justify-self: center;
}

.ohsome-link {
  height: 2rem;
  box-sizing: border-box;
  padding: 0 0.6rem;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
  border-radius: var(--radius);

  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  text-decoration: none;
  color: var(--ink-soft);
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 0.04em;
}

.ohsome-link img {
  height: 22px;
  display: block;
}

.ohsome-link:hover {
  background: var(--paper);
}

.ohsome-text {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .footer {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.5rem;
    font-size: 0.7rem;
  }

  .footer-left,
  .footer-right {
    justify-self: center;
  }

  .footer-btn {
    height: 1.7rem;
    padding: 0 0.5rem;
    font-size: 0.7rem;
  }

  .footer-center {
    display: none;
  }

  .heigit-logo { height: 2rem; }
}
</style>
