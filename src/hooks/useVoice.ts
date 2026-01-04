import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item: (index: number) => SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface UseVoiceOptions {
  lang?: string;
}

export interface UseVoiceReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  error: string | null;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  speak: (text: string, options?: SpeechSynthesisOptions) => void;
  cancelSpeech: () => void;
}

const joinText = (left: string, right: string) => {
  if (!left && !right) return "";
  if (!left) return right;
  if (!right) return left;
  return `${left} ${right}`.trim();
};

const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as SpeechRecognitionWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/**
 * useVoice provides a lightweight wrapper around the Web Speech API
 * for speech recognition and speech synthesis.
 */
export const useVoice = (options: UseVoiceOptions = {}): UseVoiceReturn => {
  const { lang = "en-US" } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    setIsSupported(getSpeechRecognitionConstructor() !== null);
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    finalTranscriptRef.current = "";
    setTranscript("");
    setFinalTranscript("");
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) return;

    setError(null);
    resetTranscript();

    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = new SpeechRecognitionCtor();
      recognitionRef.current = recognition;
    }

    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const segment = result[0]?.transcript.trim() ?? "";
        if (!segment) continue;

        if (result.isFinal) {
          finalText = joinText(finalText, segment);
        } else {
          interimText = joinText(interimText, segment);
        }
      }

      const nextFinal = joinText(finalTranscriptRef.current, finalText);
      const combined = joinText(nextFinal, interimText);

      if (finalText) {
        finalTranscriptRef.current = nextFinal;
        setFinalTranscript(nextFinal);
      }

      transcriptRef.current = combined;
      setTranscript(combined);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error || "Speech recognition error.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!finalTranscriptRef.current && transcriptRef.current.trim()) {
        const fallback = transcriptRef.current.trim();
        finalTranscriptRef.current = fallback;
        setFinalTranscript(fallback);
        setTranscript(fallback);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setError("Failed to start voice input.");
      setIsListening(false);
    }
  }, [isListening, lang, resetTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback(
    (text: string, speechOptions?: SpeechSynthesisOptions) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (typeof window === "undefined") return;
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = speechOptions?.lang ?? lang;

      if (speechOptions?.rate !== undefined) {
        utterance.rate = speechOptions.rate;
      }
      if (speechOptions?.pitch !== undefined) {
        utterance.pitch = speechOptions.pitch;
      }
      if (speechOptions?.volume !== undefined) {
        utterance.volume = speechOptions.volume;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  const cancelSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    error,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    cancelSpeech,
  };
};
