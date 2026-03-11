// ---------------------------------------------------------------------------
// Nav drag-to-reorder — drag items to change order, persisted to localStorage
// ---------------------------------------------------------------------------
(function initNavDnd() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const ORDER_KEY = 'nav-order';
  let dragSrc = null;

  function getItems() {
    return [...nav.querySelectorAll('.nav-item')];
  }

  function saveOrder() {
    const order = getItems().map((item) => item.dataset.view).filter(Boolean);
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }

  function restoreOrder() {
    const stored = localStorage.getItem(ORDER_KEY);
    if (!stored) return;
    try {
      const order = JSON.parse(stored);
      order.forEach((view) => {
        const el = nav.querySelector(`[data-view="${view}"]`);
        if (el) nav.appendChild(el);
      });
    } catch (e) {}
  }

  function clearIndicators() {
    getItems().forEach((item) => item.classList.remove('drag-over'));
  }

  function bindItem(item) {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', (e) => {
      dragSrc = item;
      e.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => item.classList.add('dragging'));
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      clearIndicators();
      dragSrc = null;
      saveOrder();
    });

    item.addEventListener('dragover', (e) => {
      if (!dragSrc || dragSrc === item) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearIndicators();
      item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', (e) => {
      if (!item.contains(e.relatedTarget)) item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!dragSrc || dragSrc === item) return;
      clearIndicators();
      const items = getItems();
      const srcIdx = items.indexOf(dragSrc);
      const tgtIdx = items.indexOf(item);
      nav.insertBefore(dragSrc, srcIdx > tgtIdx ? item : item.nextSibling);
    });
  }

  restoreOrder();
  nav.querySelectorAll('.nav-item').forEach(bindItem);
})();
