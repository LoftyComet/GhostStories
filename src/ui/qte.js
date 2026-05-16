import { resolveQte } from '../core/fsm.js';

export function mountQte(store) {
  const root = document.querySelector('#qteOverlay');
  let timer = null;

  store.subscribe((state) => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    if (!state.ui.qte) {
      root.replaceChildren();
      root.className = '';
      return;
    }

    renderQte(root, store, state.ui.qte);
    timer = window.setInterval(() => {
      if (Date.now() > store.getState().ui.qte?.deadline) {
        store.setState((current) => resolveQte(current, false));
      } else {
        renderQte(root, store, store.getState().ui.qte);
      }
    }, 250);
  });
}

function renderQte(root, store, qte) {
  const remaining = Math.max(0, Math.ceil((qte.deadline - Date.now()) / 1000));
  const selected = new Set(qte.selectedCells);
  root.className = 'qte-backdrop';
  root.innerHTML = `
    <section class="qte-panel" role="dialog" aria-modal="true" aria-label="限时操作">
      <div class="panel-title">${qte.title} / ${remaining}s</div>
      <p>${qte.prompt}</p>
      <div class="breaker-grid">
        ${Array.from({ length: 9 })
          .map((_, index) => {
            const isTarget = qte.targetCells.includes(index);
            const isSelected = selected.has(index);
            return `<button class="${isTarget ? 'target' : ''} ${isSelected ? 'selected' : ''}" data-cell="${index}" type="button"></button>`;
          })
          .join('')}
      </div>
    </section>
  `;

  root.querySelectorAll('[data-cell]').forEach((button) => {
    button.addEventListener('click', () => {
      const cell = Number(button.dataset.cell);
      const current = store.getState();
      const currentQte = current.ui.qte;
      if (!currentQte) {
        return;
      }

      const nextSelected = currentQte.selectedCells.includes(cell)
        ? currentQte.selectedCells.filter((item) => item !== cell)
        : [...currentQte.selectedCells, cell];
      const success = currentQte.targetCells.every((item) => nextSelected.includes(item));

      if (success) {
        store.setState((state) => resolveQte(state, true));
        return;
      }

      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          qte: {
            ...state.ui.qte,
            selectedCells: nextSelected,
          },
        },
      }));
    });
  });
}
