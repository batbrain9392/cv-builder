/**
 * iOS Safari leaves a white gap below the page when the virtual keyboard
 * dismisses because it doesn't reset the visual viewport offset.
 *
 * Since this app uses `overflow: hidden` on html/body with inner scroll
 * containers, `window.scrollTo` has no effect. Instead, we nudge the
 * nearest scrollable ancestor of the blurred input by +1/−1 px, which
 * forces WebKit to recalculate the visual viewport position.
 *
 * Only activates on iOS (iPhone / iPad with touch), and is a no-op elsewhere.
 */
export function patchIosKeyboardGap(): void {
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIos) return;

  function findScrollParent(el: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = el.parentElement;
    while (node) {
      const { overflowY } = getComputedStyle(node);
      if (overflowY === 'auto' || overflowY === 'scroll') return node;
      node = node.parentElement;
    }
    return null;
  }

  const onBlur = (e: FocusEvent) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const tag = target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;

    requestAnimationFrame(() => {
      const scroller = findScrollParent(target);
      if (scroller) {
        scroller.scrollTop += 1;
        scroller.scrollTop -= 1;
      }
    });
  };

  document.addEventListener('blur', onBlur, true);
}
