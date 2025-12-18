(function () {
  const WATERMARK_TEXT = 'osunhive';
  const WATERMARK_URL = 'https://github.com/osunhive';
  const SELECTORS = [
    '[id^="thefancy-"]',
    '.fancy-output',
    '.thefancy',
    '.prefixes1',
    '.prefixes2',
    '.suffixes'
  ].join(',');

  const STYLE = `
.osunhive-watermark {
  margin-left: 8px;
  font-size: 0.78em;
  color: #6b6b6b;
  opacity: 0.85;
  vertical-align: baseline;
  text-decoration: none;
  font-style: italic;
}
.osunhive-watermark a {
  color: inherit;
  text-decoration: none;
}
.osunhive-watermark[data-hidden="true"] { display: none; }
`;

  function injectStyle() {
    if (document.getElementById('osunhive-watermark-style')) return;
    const s = document.createElement('style');
    s.id = 'osunhive-watermark-style';
    s.appendChild(document.createTextNode(STYLE));
    document.head.appendChild(s);
  }

  function createWatermarkNode() {
    const wrapper = document.createElement('span');
    wrapper.className = 'osunhive-watermark';
    const a = document.createElement('a');
    a.href = WATERMARK_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = WATERMARK_TEXT;
    wrapper.appendChild(a);
    return wrapper;
  }

  function appendWatermark(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.dataset.osunhiveWatermarked === '1') return;
    try {
      const wm = createWatermarkNode();
      el.appendChild(wm);
      el.dataset.osunhiveWatermarked = '1';
    } catch (e) {
    }
  }

  function scanAndMark() {
    const nodes = document.querySelectorAll(SELECTORS);
    nodes.forEach(appendWatermark);
  }

  function observe() {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            try {
              if (node.matches && node.matches(SELECTORS)) {
                appendWatermark(node);
              }
            } catch (e) {}
            node.querySelectorAll && node.querySelectorAll(SELECTORS).forEach(appendWatermark);
          });
        }
        if (m.type === 'characterData' && m.target && m.target.parentNode) {
          const parent = m.target.parentNode;
          if (parent && parent.matches && parent.matches(SELECTORS)) appendWatermark(parent);
        }
      }
    });
    mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function init() {
    injectStyle();
    scanAndMark();
    observe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OsunhiveWatermark = {
    set(text, url) {
      if (typeof text === 'string') {
        document.querySelectorAll('.osunhive-watermark').forEach((w) => {
          const a = w.querySelector('a');
          if (a) {
            a.textContent = text;
            if (typeof url === 'string') a.href = url;
          } else {
            w.textContent = text;
            if (typeof url === 'string') {
              const link = document.createElement('a');
              link.href = url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.textContent = text;
              w.innerHTML = '';
              w.appendChild(link);
            }
          }
        });
      }
    },
    hide() {
      document.querySelectorAll('.osunhive-watermark').forEach(w => w.dataset.hidden = 'true');
    },
    show() {
      document.querySelectorAll('.osunhive-watermark').forEach(w => delete w.dataset.hidden);
    }
  };
})();
