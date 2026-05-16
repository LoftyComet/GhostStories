import { GRID_SIZE, findObjectByName, getObjectAt, getRoomName } from '../data/mansion.js';

const STATE_LABELS = {
  Random_Exploration: '无目的探索',
  Navigate_to_Target: '定向导航',
  Reach_Target_Area: '场景交互',
  Flee_from_Ghosts: '恐慌逃跑',
};

export function getStateLabel(state) {
  return STATE_LABELS[state] ?? state;
}

export function applyFsmCommand(state, fsmCommand) {
  if (!fsmCommand) {
    return state;
  }

  const target = fsmCommand.target_object ? findObjectByName(fsmCommand.target_object) : null;
  const targetCoordinates = fsmCommand.target_coordinates ?? target?.coordinates ?? null;
  const nextSanity = clamp(
    state.investigator.sanity + Number(fsmCommand.modify_sanity ?? 0),
    0,
    100,
  );

  return {
    ...state,
    investigator: {
      ...state.investigator,
      state: nextSanity <= 0 ? 'Flee_from_Ghosts' : normalizeActionState(fsmCommand.action_state),
      targetObject: target?.name ?? fsmCommand.target_object ?? null,
      targetCoordinates,
      sanity: nextSanity,
      stress: clamp(state.investigator.stress + Math.abs(Number(fsmCommand.modify_sanity ?? 0)), 0, 100),
    },
  };
}

export function advanceInvestigator(state) {
  const investigator = state.investigator;
  const current = investigator.coordinates;
  const nextCoordinates = chooseNextCoordinates(investigator, state.session.tick);
  const targetObject = getObjectAt(nextCoordinates);
  const reachedTarget =
    investigator.targetCoordinates &&
    nextCoordinates[0] === investigator.targetCoordinates[0] &&
    nextCoordinates[1] === investigator.targetCoordinates[1];
  const nextSteps = investigator.steps + 1;
  const pulse = nextSteps % 5 === 0;
  const qte = shouldTriggerQte(targetObject, state.ui.completedQtes)
    ? createBreakerQte()
    : state.ui.qte;
  const sanityDelta = investigator.state === 'Flee_from_Ghosts' ? -3 : targetObject?.effect?.sanity ?? 0;

  return {
    ...state,
    session: {
      ...state.session,
      tick: state.session.tick + 1,
      linkQuality: clamp(state.session.linkQuality + (state.resources.commPower > 52 ? 1 : -2), 35, 100),
    },
    investigator: {
      ...investigator,
      coordinates: nextCoordinates,
      steps: nextSteps,
      lastRoom: getRoomName(nextCoordinates),
      state: reachedTarget ? 'Reach_Target_Area' : investigator.state,
      sanity: clamp(investigator.sanity + sanityDelta, 0, 100),
      stress: clamp(investigator.stress + (pulse ? 2 : 0), 0, 100),
    },
    ui: {
      ...state.ui,
      qte,
    },
  };
}

export function applyPowerSplit(state, commPower) {
  const normalizedComm = clamp(Number(commPower), 20, 80);
  const lightPower = 100 - normalizedComm;

  return {
    ...state,
    resources: {
      ...state.resources,
      commPower: normalizedComm,
      lightPower,
    },
  };
}

export function sootheInvestigator(state) {
  if (state.resources.sootheCharges <= 0) {
    return state;
  }

  return {
    ...state,
    investigator: {
      ...state.investigator,
      state: state.investigator.sanity <= 8 ? 'Random_Exploration' : state.investigator.state,
      sanity: clamp(state.investigator.sanity + 14, 0, 100),
      stress: clamp(state.investigator.stress - 24, 0, 100),
    },
    resources: {
      ...state.resources,
      energy: clamp(state.resources.energy - 8, 0, 100),
      sootheCharges: state.resources.sootheCharges - 1,
    },
  };
}

export function resolveQte(state, success) {
  const qte = state.ui.qte;
  if (!qte) {
    return state;
  }

  return {
    ...state,
    investigator: {
      ...state.investigator,
      state: success ? 'Navigate_to_Target' : 'Flee_from_Ghosts',
      sanity: clamp(state.investigator.sanity + (success ? 5 : -18), 0, 100),
      stress: clamp(state.investigator.stress + (success ? -12 : 26), 0, 100),
    },
    resources: {
      ...state.resources,
      energy: clamp(state.resources.energy + (success ? -6 : -14), 0, 100),
    },
    ui: {
      ...state.ui,
      qte: null,
      completedQtes: success
        ? [...new Set([...state.ui.completedQtes, qte.id])]
        : state.ui.completedQtes,
    },
  };
}

function chooseNextCoordinates(investigator, tick) {
  if (investigator.state === 'Navigate_to_Target' && investigator.targetCoordinates) {
    return moveToward(investigator.coordinates, investigator.targetCoordinates);
  }

  if (investigator.state === 'Flee_from_Ghosts') {
    return randomNeighbor(investigator.coordinates, tick + 3);
  }

  if (investigator.state === 'Reach_Target_Area') {
    return investigator.coordinates;
  }

  return randomNeighbor(investigator.coordinates, tick);
}

function moveToward([x, y], [targetX, targetY]) {
  if (x !== targetX) {
    return clampCoordinates([x + Math.sign(targetX - x), y]);
  }

  if (y !== targetY) {
    return clampCoordinates([x, y + Math.sign(targetY - y)]);
  }

  return [x, y];
}

function randomNeighbor([x, y], tick) {
  const options = [
    [x + 1, y],
    [x, y - 1],
    [x - 1, y],
    [x, y + 1],
  ].map(clampCoordinates);

  return options[tick % options.length];
}

function clampCoordinates([x, y]) {
  return [clamp(x, 0, GRID_SIZE - 1), clamp(y, 0, GRID_SIZE - 1)];
}

function normalizeActionState(actionState) {
  const state = String(actionState ?? 'Random_Exploration').replaceAll(' ', '_');
  if (state === 'Navigate_to_Target' || state === 'Reach_Target_Area' || state === 'Flee_from_Ghosts') {
    return state;
  }

  return 'Random_Exploration';
}

function shouldTriggerQte(targetObject, completedQtes) {
  return targetObject?.id === 'breaker-box' && !completedQtes.includes('breaker-grid');
}

function createBreakerQte() {
  return {
    id: 'breaker-grid',
    title: '备用电源短路',
    prompt: '在 8 秒内切断三处红色节点，让调查员通过卡死的密码门。',
    targetCells: [2, 5, 7],
    selectedCells: [],
    deadline: Date.now() + 8000,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
