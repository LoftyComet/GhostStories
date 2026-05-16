import { archiveEntries } from '../data/archives.js';

export function mountArchives(store) {
  const button = document.querySelector('#archiveButton');
  const root = document.querySelector('#archiveModal');

  button.addEventListener('click', () => {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        archivesOpen: true,
      },
    }));
  });

  store.subscribe((state) => {
    renderArchiveModal(root, store, state);
  });
}

function renderArchiveModal(root, store, state) {
  if (!state.ui.archivesOpen) {
    root.replaceChildren();
    root.className = '';
    return;
  }

  const activeEntry =
    archiveEntries.find((entry) => entry.id === state.ui.activeArchiveId) ?? archiveEntries[0];

  root.className = 'modal-backdrop';
  root.innerHTML = `
    <section class="archive-modal" role="dialog" aria-modal="true" aria-label="纸质资料库">
      <header class="archive-header">
        <div>
          <span class="kicker">ARCHIVES</span>
          <h2>纸质资料库</h2>
        </div>
        <button class="icon-button" id="closeArchive" type="button" aria-label="关闭资料库">×</button>
      </header>
      <div class="archive-body">
        <nav class="archive-list">
          ${archiveEntries
            .map(
              (entry) => `
                <button class="${entry.id === activeEntry.id ? 'active' : ''}" data-entry-id="${entry.id}" type="button">
                  <span>${entry.category}</span>
                  ${entry.title}
                </button>
              `,
            )
            .join('')}
        </nav>
        <article class="archive-paper">
          <h3>${activeEntry.title}</h3>
          ${activeEntry.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}
          <div class="fact-strip">
            ${activeEntry.facts.map((fact) => `<span>${fact}</span>`).join('')}
          </div>
          ${activeEntry.id === 'floor-plan' ? '<img src="./assets/mansion-map.svg" alt="鬼宅平面草图" />' : ''}
        </article>
      </div>
    </section>
  `;

  root.querySelector('#closeArchive').addEventListener('click', () => {
    store.setState((current) => ({
      ...current,
      ui: { ...current.ui, archivesOpen: false },
    }));
  });

  root.querySelectorAll('[data-entry-id]').forEach((item) => {
    item.addEventListener('click', () => {
      store.setState((current) => ({
        ...current,
        ui: {
          ...current.ui,
          activeArchiveId: item.dataset.entryId,
        },
      }));
    });
  });
}
