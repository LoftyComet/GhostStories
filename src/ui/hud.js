import { applyPowerSplit, getStateLabel, sootheInvestigator } from '../core/fsm.js';

export function mountHud(store) {
  const statusPanel = document.querySelector('#statusPanel');
  const powerPanel = document.querySelector('#powerPanel');
  const linkStatus = document.querySelector('#linkStatus');
  const clock = document.querySelector('#systemClock');

  store.subscribe((state) => {
    renderStatus(statusPanel, state, store);
    renderPower(powerPanel, state, store);
    linkStatus.textContent = `LINK ${state.session.linkQuality}%`;
  });

  window.setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  }, 1000);
}

function renderStatus(root, state, store) {
  const { investigator, resources } = state;
  root.innerHTML = `
    <div class="panel-title">调查员状态</div>
    <dl class="status-grid">
      <div><dt>坐标</dt><dd>${investigator.coordinates.join(', ')}</dd></div>
      <div><dt>房间</dt><dd>${investigator.lastRoom}</dd></div>
      <div><dt>状态</dt><dd>${getStateLabel(investigator.state)}</dd></div>
      <div><dt>步数</dt><dd>${investigator.steps}</dd></div>
    </dl>
    <div class="meter-row">
      <span>理智</span>
      <meter min="0" max="100" value="${investigator.sanity}"></meter>
      <strong>${investigator.sanity}</strong>
    </div>
    <div class="meter-row">
      <span>压力</span>
      <meter min="0" max="100" value="${investigator.stress}" class="stress-meter"></meter>
      <strong>${investigator.stress}</strong>
    </div>
    <button class="tool-button" id="sootheButton" type="button">发射安抚音频 (${resources.sootheCharges})</button>
  `;

  root.querySelector('#sootheButton').addEventListener('click', () => {
    store.setState((current) => sootheInvestigator(current));
  });
}

function renderPower(root, state, store) {
  root.innerHTML = `
    <div class="panel-title">电量分配</div>
    <label class="slider-label">
      <span>通讯功率</span>
      <strong>${state.resources.commPower}%</strong>
    </label>
    <input id="commPower" type="range" min="20" max="80" value="${state.resources.commPower}" />
    <div class="power-split">
      <span>对讲 ${state.resources.commPower}%</span>
      <span>照明 ${state.resources.lightPower}%</span>
    </div>
    <div class="meter-row">
      <span>总能源</span>
      <meter min="0" max="100" value="${state.resources.energy}"></meter>
      <strong>${state.resources.energy}</strong>
    </div>
  `;

  root.querySelector('#commPower').addEventListener('input', (event) => {
    store.setState((current) => applyPowerSplit(current, event.target.value));
  });
}
