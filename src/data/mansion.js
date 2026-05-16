export const GRID_SIZE = 12;

export const mansionObjects = [
  {
    id: 'vanity',
    name: '古董梳妆台',
    type: 'ritual',
    coordinates: [2, 8],
    room: '西侧卧室',
    clue: '镜面背后刻着一串倒写的门牌号：1907。',
    effect: { sanity: -3 },
  },
  {
    id: 'kitchen-key',
    name: '生锈钥匙',
    type: 'tool',
    coordinates: [4, 9],
    room: '厨房',
    clue: '钥匙柄上缠着红线，和委托信里提到的门锁颜色一致。',
    effect: { sanity: 0 },
  },
  {
    id: 'breaker-box',
    name: '配电箱',
    type: 'mechanism',
    coordinates: [9, 6],
    room: '走廊尽头',
    clue: '备用电源还能工作，但接线顺序和图纸不一致。',
    effect: { sanity: -1 },
  },
  {
    id: 'ancestral-portrait',
    name: '家主肖像',
    type: 'haunting',
    coordinates: [8, 3],
    room: '书房',
    clue: '肖像眼睛的位置有刮擦痕，像是有人长期盯着它确认方向。',
    effect: { sanity: -5 },
  },
  {
    id: 'basement-door',
    name: '地下室入口',
    type: 'locked',
    coordinates: [10, 10],
    room: '地下室入口',
    clue: '门后传来规律敲击声，频率像旧钟每五步响一次。',
    effect: { sanity: -2 },
  },
];

export const knownRooms = [
  { name: '门厅', bounds: [[0, 9], [3, 11]] },
  { name: '西侧卧室', bounds: [[0, 6], [3, 8]] },
  { name: '厨房', bounds: [[4, 8], [6, 11]] },
  { name: '书房', bounds: [[6, 1], [9, 5]] },
  { name: '走廊尽头', bounds: [[8, 6], [10, 8]] },
  { name: '地下室入口', bounds: [[9, 9], [11, 11]] },
];

export function findObjectByName(name) {
  if (!name) {
    return null;
  }

  return mansionObjects.find((item) => item.name.includes(name) || name.includes(item.name)) ?? null;
}

export function getObjectAt([x, y]) {
  return mansionObjects.find((item) => item.coordinates[0] === x && item.coordinates[1] === y) ?? null;
}

export function getRoomName([x, y]) {
  const room = knownRooms.find(({ bounds }) => {
    const [[minX, minY], [maxX, maxY]] = bounds;
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  });

  return room?.name ?? '未知走廊';
}
