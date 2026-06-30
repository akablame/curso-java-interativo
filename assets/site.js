(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  function ensureSkipTarget() {
    let target = document.getElementById('main-content');
    if (!target) {
      target = document.querySelector('main, .playground-layout, .builder-layout, .editor-wrap, .container.section, .page-header + .container');
    }
    if (!target) return;
    target.id = target.id || 'main-content';
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  }

  function enhanceNavigation() {
    document.querySelectorAll('.nav-toggle').forEach((toggle, index) => {
      const nav = toggle.closest('.navbar');
      const links = nav && nav.querySelector('.navbar-links');
      if (!links) return;

      links.id = links.id || `site-nav-${index + 1}`;
      toggle.type = 'button';
      toggle.setAttribute('aria-controls', links.id);
      toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
      toggle.setAttribute('aria-label', links.classList.contains('open') ? 'Fechar menu' : 'Abrir menu');

      const close = () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      };

      toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      });

      links.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
    });
  }

  function markCurrentPage() {
    const here = new URL(window.location.href);
    document.querySelectorAll('.navbar-links a[href], .sidebar-nav a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const target = new URL(href, here);
      const samePath = target.pathname.replace(/\/$/, '/index.html') === here.pathname.replace(/\/$/, '/index.html');
      const sameHash = !target.hash || target.hash === here.hash;
      if (samePath && sameHash) {
        link.classList.add('active');
        link.setAttribute('aria-current', target.hash ? 'location' : 'page');
      }
    });
  }

  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', Array.from(rel).join(' '));
    });
  }

  function labelUnnamedControls() {
    document.querySelectorAll('input, textarea, select').forEach((control) => {
      if (control.type === 'hidden') return;
      if (control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby') || control.hasAttribute('title')) return;
      const escapedId = control.id && window.CSS && CSS.escape ? CSS.escape(control.id) : control.id;
      if (control.id && document.querySelector(`label[for="${escapedId}"]`)) return;
      if (control.closest('label')) return;

      const label = control.getAttribute('placeholder') || control.getAttribute('name') || control.id || 'Campo';
      control.setAttribute('aria-label', label.replace(/\s+/g, ' ').trim());
    });
  }

  function enhancePseudoButtons() {
    document.querySelectorAll('[onclick]').forEach((element) => {
      const nativeInteractive = element.matches('button, a[href], input, select, textarea, summary');
      if (nativeInteractive) return;

      if (!element.hasAttribute('role')) element.setAttribute('role', 'button');
      if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          element.click();
        }
      });
    });
  }

  function titleIframes() {
    document.querySelectorAll('iframe:not([title])').forEach((frame, index) => {
      frame.setAttribute('title', index === 0 ? 'Pré-visualização do código' : `Conteúdo incorporado ${index + 1}`);
    });
  }

  ready(() => {
    ensureSkipTarget();
    enhanceNavigation();
    markCurrentPage();
    hardenExternalLinks();
    labelUnnamedControls();
    enhancePseudoButtons();
    titleIframes();
  });
})();
