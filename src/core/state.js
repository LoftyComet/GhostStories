export function createInitialState() {
  return {
    session: {
      startedAt: Date.now(),
      tick: 0,
      linkQuality: 92,
    },
    investigator: {
      name: '林雾',
      coordinates: [1, 10],
      state: 'Random_Exploration',
      targetObject: null,
      targetCoordinates: null,
      sanity: 78,
      stress: 18,
      steps: 0,
      lastRoom: '门厅',
    },
    resources: {
      energy: 100,
      commPower: 56,
      lightPower: 44,
      sootheCharges: 3,
    },
    messages: [
      {
        id: crypto.randomUUID(),
        role: 'system',
        text: '连接建立。调查员林雾已进入鬼宅门厅。你只能通过对讲机和资料库判断现场情况。',
        streaming: false,
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        role: 'investigator',
        text: '我进来了。门自己在身后合上了，先别急着让我乱跑，给我一个明确目标。',
        streaming: false,
        createdAt: Date.now(),
      },
    ],
    ui: {
      archivesOpen: false,
      activeArchiveId: 'client-letter',
      qte: null,
      voiceStatus: 'idle',
      monitorFrame: {
        title: '门厅',
        description: '镜头只有零星噪点，地板上拖着一条湿痕。',
        tone: 'green',
      },
    },
  };
}

export function createMessage(role, text, options = {}) {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    streaming: Boolean(options.streaming),
    createdAt: Date.now(),
  };
}
