import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface STTOptions {
  language?: string;
  useWebSpeech?: boolean;
  onPartialResult?: (text: string) => void;
  onFinalResult?: (text: string, metrics?: any) => void;
  onError?: (error: string) => void;
}

interface STTMetrics {
  t_first_partial?: number;
  t_final?: number;
  audio_duration_ms?: number;
  duration_ms?: number;
}

export function useSTT(options: STTOptions = {}) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [useWebSpeech, setUseWebSpeech] = useState(options.useWebSpeech ?? false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const language = options.language || 'ru';

  // Check if Web Speech API is available
  const isWebSpeechAvailable = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  // Start WebSocket streaming STT
  const startWebSocketSTT = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = recorder;

      // Setup WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/stt`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🎙️ STT WebSocket connected');
        // Send language and MIME type config
        ws.send(JSON.stringify({
          type: 'config',
          language,
          mimeType: 'audio/webm',
        }));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.success && response.data) {
            if (response.data.type === 'partial') {
              console.log('📝 Partial:', response.data.text);
              options.onPartialResult?.(response.data.text);
            } else if (response.data.type === 'final') {
              console.log('✅ Final:', response.data.text);
              setTranscribedText(response.data.text);
              options.onFinalResult?.(response.data.text, response.data.metrics);
            }
          } else if (!response.success) {
            console.error('STT error:', response.error);
            options.onError?.(response.error);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Ошибка подключения',
          description: 'Не удалось подключиться к серверу распознавания речи',
          variant: 'destructive',
        });
        // Fallback to Web Speech API
        if (isWebSpeechAvailable()) {
          setUseWebSpeech(true);
          stopWebSocketSTT();
          startWebSpeechSTT();
        }
      };

      ws.onclose = () => {
        console.log('🎙️ STT WebSocket closed');
      };

      // Send audio chunks to WebSocket
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(',')[1];
            if (base64) {
              ws.send(JSON.stringify({
                type: 'audio',
                data: base64,
              }));
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      recorder.onstop = () => {
        // Send finalize message
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'finalize',
          }));
        }
      };

      // Start recording with small chunks
      recorder.start(500); // 500ms chunks
      setIsRecording(true);

      toast({
        title: 'Запись началась',
        description: 'Говорите в микрофон. Нажмите кнопку еще раз для остановки.',
      });
    } catch (error) {
      console.error('Failed to start WebSocket STT:', error);
      options.onError?.('Failed to start recording');
      
      // Fallback to Web Speech API
      if (isWebSpeechAvailable()) {
        setUseWebSpeech(true);
        startWebSpeechSTT();
      } else {
        toast({
          title: 'Ошибка доступа',
          description: 'Не удалось получить доступ к микрофону',
          variant: 'destructive',
        });
      }
    }
  }, [language, options, toast]);

  // Stop WebSocket streaming STT
  const stopWebSocketSTT = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      wsRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  // Start Web Speech API recognition
  const startWebSpeechSTT = useCallback(() => {
    if (!isWebSpeechAvailable()) {
      toast({
        title: 'Недоступно',
        description: 'Web Speech API недоступен в вашем браузере',
        variant: 'destructive',
      });
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = language === 'ru' ? 'ru-RU' : 'de-DE';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('🎙️ Web Speech API started');
        setIsRecording(true);
        toast({
          title: 'Запись началась (Web Speech)',
          description: 'Говорите в микрофон. Нажмите кнопку еще раз для остановки.',
        });
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          console.log('📝 Partial (Web Speech):', interimTranscript);
          options.onPartialResult?.(interimTranscript);
        }

        if (finalTranscript) {
          console.log('✅ Final (Web Speech):', finalTranscript);
          setTranscribedText(prev => prev + finalTranscript);
          options.onFinalResult?.(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Web Speech API error:', event.error);
        options.onError?.(event.error);
        toast({
          title: 'Ошибка распознавания',
          description: `Не удалось распознать речь: ${event.error}`,
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        console.log('🎙️ Web Speech API ended');
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start Web Speech API:', error);
      options.onError?.('Failed to start Web Speech API');
      toast({
        title: 'Ошибка',
        description: 'Не удалось запустить распознавание речи',
        variant: 'destructive',
      });
    }
  }, [language, options, toast]);

  // Stop Web Speech API recognition
  const stopWebSpeechSTT = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Start STT (auto-select method)
  const startRecording = useCallback(() => {
    if (useWebSpeech || !navigator.mediaDevices) {
      startWebSpeechSTT();
    } else {
      startWebSocketSTT();
    }
  }, [useWebSpeech, startWebSpeechSTT, startWebSocketSTT]);

  // Stop STT
  const stopRecording = useCallback(() => {
    if (useWebSpeech) {
      stopWebSpeechSTT();
    } else {
      stopWebSocketSTT();
    }
  }, [useWebSpeech, stopWebSpeechSTT, stopWebSocketSTT]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    transcribedText,
    toggleRecording,
    startRecording,
    stopRecording,
    useWebSpeech,
    setUseWebSpeech,
    isWebSpeechAvailable: isWebSpeechAvailable(),
  };
}
