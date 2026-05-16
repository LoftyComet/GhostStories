import { advanceInvestigator, applyFsmCommand, sootheInvestigator } from '../core/fsm.js';
import { createMessage } from '../core/state.js';
import { getObjectAt } from '../data/mansion.js';
import { pulseLines, quickCommands } from '../data/story.js';
import { requestInvestigatorResponse } from '../services/aiClient.js';
import { buildSceneFrame } from '../services/imageClient.js';
import { createSpeechClient } from '../services/speechClient.js';

export function mountTerminal(store) {
  const log = document.querySelector('#terminalLog');
  const form = document.querySelector('#commandForm');
  const input = document.querySelector('#commandInput');
  const voiceButton = document.querySelector('#voiceButton');
  const speechClient = createSpeechClient();

  store.subscribe((state) => {
    renderMessages(log, state.messages);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      return;
    }

    input.value = '';
    await submitPlayerCommand(store, text);
  });

  voiceButton.addEventListener('click', async () => {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, voiceStatus: 'listening' },
    }));

    try {
      const transcript = await speechClient.listenOnce();
      input.value = transcript;
      input.focus();
    } catch {
      addSystemMessage(store, '语音通道不稳定，请改用键盘输入。');
    } finally {
      store.setState((state) => ({
        ...state,
        ui: { ...state.ui, voiceStatus: 'idle' },
      }));
    }
  });

  renderQuickCommands(store, form);
}

async function submitPlayerCommand(store, text) {
  store.setState((state) => ({
    ...state,
    messages: [...state.messages, createMessage('player', text)],
  }));

  if (/冷静|安抚|稳住|别怕/.test(text)) {
    store.setState((state) => sootheInvestigator(state));
  }

  const response = await requestInvestigatorResponse(text, store.getState());
  const message = createMessage('investigator', '', { streaming: true });
  const nextState = applyFsmCommand(store.getState(), response.fsm_command);

  store.setState({
    ...nextState,
    messages: [...nextState.messages, message],
  });

  await streamMessage(store, message.id, response.text_response);
  runInvestigatorStep(store);
}

function runInvestigatorStep(store) {
  const before = store.getState();
  let nextState = advanceInvestigator(before);
  const object = getObjectAt(nextState.investigator.coordinates);

  if (object) {
    nextState = {
      ...nextState,
      messages: [
        ...nextState.messages,
        createMessage('system', `客观坐标命中：${object.room} / ${object.name}。线索：${object.clue}`),
      ],
      ui: {
        ...nextState.ui,
        monitorFrame: buildSceneFrame({
          room: nextState.investigator.lastRoom,
          object,
        }),
      },
    };
  } else if (nextState.investigator.steps % 5 === 0) {
    nextState = {
      ...nextState,
      messages: [
        ...nextState.messages,
        createMessage('investigator', pulseLines[nextState.session.tick % pulseLines.length]),
      ],
      ui: {
        ...nextState.ui,
        monitorFrame: buildSceneFrame({
          room: nextState.investigator.lastRoom,
          object: null,
        }),
      },
    };
  }

  store.setState(nextState);
}

function renderMessages(log, messages) {
  const fragment = document.createDocumentFragment();

  messages.forEach((message) => {
    const item = document.createElement('article');
    item.className = `terminal-message ${message.role}`;

    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = getMessageLabel(message.role);

    const text = document.createElement('p');
    text.textContent = message.text;

    item.append(label, text);
    fragment.append(item);
  });

  log.replaceChildren(fragment);
  log.scrollTop = log.scrollHeight;
}

async function streamMessage(store, messageId, fullText) {
  for (let index = 1; index <= fullText.length; index += 1) {
    const visibleText = fullText.slice(0, index);
    store.setState((state) => ({
      ...state,
      messages: state.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              text: visibleText,
              streaming: index < fullText.length,
            }
          : message,
      ),
    }));
    await wait(18);
  }
}

function renderQuickCommands(store, form) {
  const list = document.createElement('div');
  list.className = 'quick-commands';

  quickCommands.forEach((command) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = command;
    button.addEventListener('click', () => {
      submitPlayerCommand(store, command);
    });
    list.append(button);
  });

  form.before(list);
}

function addSystemMessage(store, text) {
  store.setState((state) => ({
    ...state,
    messages: [...state.messages, createMessage('system', text)],
  }));
}

function getMessageLabel(role) {
  const labels = {
    system: 'SYS',
    investigator: 'LIN',
    player: 'YOU',
  };

  return labels[role] ?? 'LOG';
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
