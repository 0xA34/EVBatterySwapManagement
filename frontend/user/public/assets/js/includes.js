(function () {
  async function loadInclude(selector, url) {
    const container = document.querySelector(selector);
    if (!container) return;
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const html = await response.text();
      container.innerHTML = html;
      const toggle = container.querySelector('.nav-toggle');
      const menu = container.querySelector('#menu');
      if (toggle && menu) {
        toggle.addEventListener('click', function () {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
          menu.classList.toggle('open');
        });
      }
    } catch (e) {
      console.warn('Include failed for', url, e);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadInclude('#include-header', 'partials/header.html');
    loadInclude('#include-footer', 'partials/footer.html');
  });
})();


