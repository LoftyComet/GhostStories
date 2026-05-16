export function createSpeechClient() {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

  if (!Recognition) {
    return createFallbackSpeechClient();
  }

  return {
    listenOnce() {
      return new Promise((resolve, reject) => {
        const recognition = new Recognition();
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          resolve(event.results[0][0].transcript);
        };
        recognition.onerror = () => reject(new Error('语音识别失败'));
        recognition.start();
      });
    },
  };
}

function createFallbackSpeechClient() {
  return {
    async listenOnce() {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 600);
      });
      return '去检查古董梳妆台';
    },
  };
}
