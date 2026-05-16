import { GRID_SIZE, mansionObjects } from '../data/mansion.js';

export function mountMap(store) {
  const root = document.querySelector('#mapPanel');

  store.subscribe((state) => {
    const [playerX, playerY] = state.investigator.coordinates;
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const object = mansionObjects.find((item) => item.coordinates[0] === x && item.coordinates[1] === y);
        const classes = ['map-cell'];
        if (playerX === x && playerY === y) {
          classes.push('investigator-cell');
        }
        if (object) {
          classes.push('object-cell');
        }

        cells.push(`
          <span class="${classes.join(' ')}" title="${object?.name ?? `${x},${y}`}">
            ${playerX === x && playerY === y ? 'L' : object ? '•' : ''}
          </span>
        `);
      }
    }

    root.innerHTML = `
      <div class="panel-title">鬼宅网格</div>
      <div class="map-wrap">
        <div class="mini-map" style="--grid-size: ${GRID_SIZE}">${cells.join('')}</div>
      </div>
      <img class="plan-thumb" src="./assets/mansion-map.svg" alt="鬼宅平面草图" />
    `;
  });
}
