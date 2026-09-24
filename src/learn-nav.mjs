// Highlight the last learning section whose heading passed the reading line.
// Geometry is recalculated when answers expand, the window resizes, or history
// restores a scroll position. Native anchor navigation remains available.
const sidebar = document.querySelector('.guide aside');
const links = [...document.querySelectorAll('.guide aside a[href^="#step-"]')];
const steps = links.map(link => document.getElementById(link.hash.slice(1)));
let active = -1;
let scheduled = false;

function update() {
  scheduled = false;
  const readingLine = Math.min(160, window.innerHeight * 0.25);
  let next = 0;
  steps.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= readingLine) next = index;
  });
  if (next === active) return;
  active = next;
  links.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  // Keep the selected item visible within a short desktop sidebar without
  // moving the page, keyboard focus, or browser history.
  if (sidebar && window.matchMedia('(min-width: 761px)').matches) {
    const item = links[active].getBoundingClientRect();
    const box = sidebar.getBoundingClientRect();
    if (item.top < box.top) sidebar.scrollTop += item.top - box.top - 8;
    else if (item.bottom > box.bottom) sidebar.scrollTop += item.bottom - box.bottom + 8;
  }
}
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(update);
}
if (links.length) {
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  document.querySelectorAll('details').forEach(answer => answer.addEventListener('toggle', scheduleUpdate));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    steps.filter(Boolean).forEach(section => observer.observe(section));
  }
  update();
}
