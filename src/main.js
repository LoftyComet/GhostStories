import { createInitialState } from './core/state.js';
import { createStore } from './core/store.js';
import { mountArchives } from './ui/archives.js';
import { mountHud } from './ui/hud.js';
import { mountMap } from './ui/map.js';
import { mountMonitor } from './ui/monitor.js';
import { mountQte } from './ui/qte.js';
import { mountTerminal } from './ui/terminal.js';

const store = createStore(createInitialState());

mountTerminal(store);
mountHud(store);
mountMonitor(store);
mountMap(store);
mountArchives(store);
mountQte(store);

window.__GHOST_HOUSE_STORE__ = store;
