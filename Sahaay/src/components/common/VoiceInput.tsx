import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, RefreshCw, Volume2, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  currentValue: string;
}

type SpeechLang = 'en-IN' | 'hi-IN' | 'mr-IN';

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, currentValue }) => {
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<SpeechLang>(() => {
    if (language === 'hi') return 'hi-IN';
    if (language === 'mr') return 'mr-IN';
    return 'en-IN';
  });

  // Keep recognition instance in a ref
  const recognitionRef = useRef<any>(null);

  // Sync default speech language if user changes interface language
  useEffect(() => {
    if (language === 'hi') setSelectedLang('hi-IN');
    else if (language === 'mr') setSelectedLang('mr-IN');
    else setSelectedLang('en-IN');
  }, [language]);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    setErrorMessage(null);

    if (!isSupported) {
      setErrorMessage(t.report.micNotSupported);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false; // Stop when sentence finishes or when user clicks stop
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognition.maxAlternatives = 1;

      let interimTranscript = '';
      let finalTranscript = '';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const newSpeech = (finalTranscript || interimTranscript).trim();
        if (newSpeech) {
          // If there was existing text, append with a space
          const separator = currentValue && !currentValue.endsWith(' ') ? ' ' : '';
          onTranscript(`${currentValue}${separator}${newSpeech}`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t.report.micPermissionDenied);
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Click retry to speak again.');
        } else if (event.error === 'network') {
          setErrorMessage('Speech service network issue. Please verify internet or type manually.');
        } else {
          setErrorMessage(t.report.micError);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage(t.report.micError);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.debug('Recognition stop exception:', e);
      }
    }
    setIsListening(false);
  };

  return (
    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
      {/* Left side: Language selector & feedback */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Globe className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400 shrink-0" />
          <span className="font-medium text-[11px]">{t.report.voiceLangLabel}</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as SpeechLang)}
            disabled={isListening}
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
            <option value="mr-IN">मराठी (Marathi)</option>
          </select>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
            <span>{t.report.listening}</span>
          </div>
        )}
      </div>

      {/* Right side: Mic Action Controls */}
      <div className="flex items-center gap-2">
        {errorMessage && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 max-w-[220px] truncate" title={errorMessage}>
            {errorMessage}
          </span>
        )}

        {isListening ? (
          <button
            type="button"
            onClick={stopListening}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition-all animate-pulse"
          >
            <MicOff className="w-3.5 h-3.5" />
            <span>{t.report.stopListening}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startListening}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium text-xs shadow-sm transition-all hover:scale-[1.02]"
            title="Click to speak your description"
          >
            <Mic className="w-3.5 h-3.5 text-gold-300" />
            <span>{t.report.micButton}</span>
          </button>
        )}
      </div>
    </div>
  );
};
