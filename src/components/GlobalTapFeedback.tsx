import React, { useEffect } from 'react';

const INTERACTIVE_SELECTOR = [
  'button',
  '[role="button"]',
  '[role="tab"]',
  'a[href]',
  'summary',
  'select',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
  '.cursor-pointer',
].join(', ');

const BLINK_DURATION_MS = 360;

export const GlobalTapFeedback: React.FC = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const activeTimeouts = new WeakMap<HTMLElement, number>();

    const triggerBlinkFeedback = (targetEl: HTMLElement | null) => {
      if (
        !targetEl ||
        targetEl.hasAttribute('disabled') ||
        targetEl.getAttribute('aria-disabled') === 'true'
      ) {
        return;
      }

      const prevTimer = activeTimeouts.get(targetEl);
      if (prevTimer) {
        window.clearTimeout(prevTimer);
      }

      // Reset class to replay the blink animation cleanly on every tap/click
      targetEl.classList.remove('tathastu-tap-active');
      void targetEl.offsetWidth;
      targetEl.classList.add('tathastu-tap-active');

      const timer = window.setTimeout(() => {
        targetEl.classList.remove('tathastu-tap-active');
        activeTimeouts.delete(targetEl);
      }, BLINK_DURATION_MS);

      activeTimeouts.set(targetEl, timer);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const rawTarget = e.target as HTMLElement | null;
      if (!rawTarget?.closest) return;
      const interactiveEl = rawTarget.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      if (!interactiveEl) return;
      triggerBlinkFeedback(interactiveEl);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const activeEl = document.activeElement as HTMLElement | null;
      if (!activeEl?.matches?.(INTERACTIVE_SELECTOR)) return;
      triggerBlinkFeedback(activeEl);
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true, capture: true });
    document.addEventListener('keydown', handleKeyDown, { passive: true, capture: true });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return null;
};
