import { findObjectByName, mansionObjects } from '../data/mansion.js';

export async function requestInvestigatorResponse(playerText, snapshot) {
  await delay(320);

  const normalizedText = playerText.trim();
  const matchedObject = matchCommandToObject(normalizedText);
  const soothe = /冷静|安抚|稳住|别怕/.test(normalizedText);

  if (soothe) {
    return {
      text_response: '收到……我把呼吸压下来了。你继续盯资料，如果我说的方向和图纸冲突，直接纠正我。',
      fsm_command: {
        action_state: snapshot.investigator.state,
        target_object: snapshot.investigator.targetObject,
        target_coordinates: snapshot.investigator.targetCoordinates,
        modify_sanity: 6,
      },
    };
  }

  if (matchedObject) {
    return {
      text_response: buildTargetResponse(matchedObject),
      fsm_command: {
        action_state: 'Navigate_to_Target',
        target_object: matchedObject.name,
        target_coordinates: matchedObject.coordinates,
        modify_sanity: matchedObject.effect?.sanity ?? 0,
      },
    };
  }

  return {
    text_response: '我先慢慢往前探。这里所有声音都有回音，别只信我说的位置，你最好同时看平面图。',
    fsm_command: {
      action_state: 'Random_Exploration',
      target_object: null,
      target_coordinates: null,
      modify_sanity: -1,
    },
  };
}

export function getStructuredOutputSchema() {
  return {
    type: 'object',
    required: ['text_response', 'fsm_command'],
    properties: {
      text_response: { type: 'string' },
      fsm_command: {
        type: 'object',
        required: ['action_state', 'target_object', 'target_coordinates', 'modify_sanity'],
        properties: {
          action_state: { type: 'string' },
          target_object: { type: ['string', 'null'] },
          target_coordinates: {
            type: ['array', 'null'],
            items: { type: 'number' },
          },
          modify_sanity: { type: 'number' },
        },
      },
    },
  };
}

function matchCommandToObject(text) {
  const directMatch = findObjectByName(text);
  if (directMatch) {
    return directMatch;
  }

  if (/厨房|钥匙/.test(text)) {
    return findObjectByName('生锈钥匙');
  }

  if (/配电|电源|电箱|密码门/.test(text)) {
    return findObjectByName('配电箱');
  }

  if (/肖像|画像|书房/.test(text)) {
    return findObjectByName('家主肖像');
  }

  if (/地下|旧门|入口/.test(text)) {
    return findObjectByName('地下室入口');
  }

  return mansionObjects.find((item) => text.includes(item.name.slice(0, 2))) ?? null;
}

function buildTargetResponse(target) {
  const lines = {
    vanity: '行，我去看那张梳妆台。镜子一直反光，但屋里明明没有灯。',
    'kitchen-key': '我往厨房走。地上有水，像刚有人从后门拖着脚进来。',
    'breaker-box': '我去配电箱。要是门卡住，你得从终端那边帮我切备用电路。',
    'ancestral-portrait': '我去书房看肖像。它眼睛的位置很怪，像被人用刀尖重新描过。',
    'basement-door': '我去找地下室入口。敲击声越来越像从我脚底传上来。',
  };

  return lines[target.id] ?? `我去检查${target.name}。你盯住资料，别让我被这里的方向骗了。`;
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
