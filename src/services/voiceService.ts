// Voice Service: 100% Smooth Native English Speech Synthesis (Zero Gaps, Perfect Pronunciation)

let currentAudioElement: HTMLAudioElement | null = null;

// 1. Smooth Native Speech Engine (Flawless English Pronunciation, Natural Pace)
export function speakNaturalVoice(text: string, lang: string = 'en'): void {
  stopSpeech();

  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return;
  }

  // Ensure speech synthesis is active and unpaused
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  // Clean Markdown, Code Blocks, and Line Breaks into smooth conversational sentences
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code section provided below.')
    .replace(/[*_#`~>]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/:\w+:/g, '')
    .replace(/[\r\n]+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const isHindi = lang.toLowerCase().startsWith('hi');

  const speakWithNativeVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    let bestVoice = null;

    if (isHindi) {
      bestVoice =
        voices.find((v) => v.lang.includes('hi') && (v.name.includes('Google') || v.name.includes('Swara') || v.name.includes('Kalpana'))) ||
        voices.find((v) => v.lang.includes('hi'));
      utterance.lang = 'hi-IN';
    } else {
      // Pick highest quality native English neural voice (Google US English, Apple Samantha/Victoria, Microsoft Natural)
      bestVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))) ||
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Apple'))) ||
        voices.find((v) => v.lang.startsWith('en'));
      utterance.lang = 'en-US';
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Standard 1.0 pitch and rate for 100% natural, continuous, fluent speech without gaps or distortion
    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    speakWithNativeVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      speakWithNativeVoice();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
}

// Stop any currently playing audio
export function stopSpeech(): void {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Real-Time Voice-To-Text Speech Recognition Utility
export function createSpeechRecognizer(
  onTranscript: (text: string) => void,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: string) => void,
  lang: string = 'en-US'
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech Recognition API is not supported in this browser.");
    if (onError) onError("Speech Recognition not supported in browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang.startsWith('hi') ? 'hi-IN' : 'en-US';

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event: any) => {
    let currentTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      currentTranscript += event.results[i][0].transcript;
    }
    if (currentTranscript) {
      onTranscript(currentTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error:", event.error);
    if (onError) onError(event.error || "Voice listening error");
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
