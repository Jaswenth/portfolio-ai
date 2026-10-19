'use strict';

const comparison = document.querySelector('[data-comparison]');
const slider = document.querySelector('#album-compare');
const output = document.querySelector('#compare-value');

if (comparison && slider && output) {
  function reveal(value) {
    const percent = Math.max(0, Math.min(100, Math.round(value)));
    slider.value = String(percent);
    comparison.style.setProperty('--reveal', `${percent}%`);
    slider.setAttribute('aria-valuetext', `${percent}% sketch, ${100 - percent}% final cover`);
    output.value = `${percent}%`;
  }

  slider.addEventListener('input', () => reveal(Number(slider.value)));

  let activePointer = null;
  function revealAtPointer(event) {
    const bounds = comparison.getBoundingClientRect();
    reveal((event.clientX - bounds.left) / bounds.width * 100);
  }

  comparison.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    activePointer = event.pointerId;
    comparison.setPointerCapture(event.pointerId);
    revealAtPointer(event);
  });
  comparison.addEventListener('pointermove', event => {
    if (event.pointerId === activePointer) revealAtPointer(event);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    comparison.addEventListener(type, event => {
      if (event.pointerId === activePointer) activePointer = null;
    });
  }
}
