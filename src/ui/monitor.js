export function mountMonitor(store) {
  const root = document.querySelector('#monitorPanel');

  store.subscribe((state) => {
    const frame = state.ui.monitorFrame;
    root.innerHTML = `
      <div class="panel-title">次级监视器</div>
      <div class="scene-frame scene-${frame.tone}">
        <div class="noise-layer"></div>
        <div class="scene-vignette"></div>
        <div class="scene-caption">
          <strong>${frame.title}</strong>
          <span>${frame.description}</span>
        </div>
      </div>
    `;
  });
}
