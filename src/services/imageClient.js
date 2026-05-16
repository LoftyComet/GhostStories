const toneClassByRoom = {
  门厅: 'green',
  西侧卧室: 'red',
  厨房: 'amber',
  书房: 'blue',
  走廊尽头: 'green',
  地下室入口: 'red',
};

export function buildSceneFrame({ room, object }) {
  const targetName = object?.name ?? '空走廊';
  const descriptions = {
    古董梳妆台: '低饱和画面里，镜面没有映出调查员，只映出一截倒写的门牌。',
    生锈钥匙: '灶台下方闪过一点铜色，旁边积水像从墙内渗出。',
    配电箱: '墙面被电弧照亮一瞬，三根红线接入了错误的保险位。',
    家主肖像: '肖像的眼眶区域发白，画布背后露出烧焦的木纹。',
    地下室入口: '地板接缝透出冷光，像有人在下面贴着门缝呼吸。',
    空走廊: '监视器只有雪花点，偶尔能看见拖痕横穿画面。',
  };

  return {
    title: `${room} / ${targetName}`,
    description: descriptions[targetName] ?? descriptions['空走廊'],
    tone: toneClassByRoom[room] ?? 'green',
  };
}
