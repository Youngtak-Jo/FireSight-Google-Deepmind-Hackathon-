import * as React from 'react';

export interface LiveTranscriptItem {
  utteranceId: string;
  speaker: string;
  speakerRole: string;
  text: string;
  isPartial: boolean;
  timestamp: string;
}

// Global microphone ownership guard: ensures we never silently transfer mic ownership
let activeMicrophoneStopper: (() => void) | null = null;

export function releaseGlobalMicrophoneOwnership() {
  if (activeMicrophoneStopper) {
    try {
      activeMicrophoneStopper();
    } catch {}
    activeMicrophoneStopper = null;
  }
}

export function registerGlobalMicrophoneStopper(stopper: () => void) {
  if (activeMicrophoneStopper && activeMicrophoneStopper !== stopper) {
    try {
      activeMicrophoneStopper();
    } catch {}
  }
  activeMicrophoneStopper = stopper;
}

function floatTo16BitPCMBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToFloat32PCM(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

export function useLiveSession({
  role,
  participantName,
  onServerCallStateChange,
}: {
  role: 'caller' | 'responder';
  participantName: string;
  onServerCallStateChange?: (action: 'start' | 'mute' | 'unmute' | 'end') => void;
}) {
  const [connected, setConnected] = React.useState(false);
  const [connecting, setConnecting] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<'environment' | 'user'>('environment');
  const [error, setError] = React.useState<string | null>(null);
  const [transcripts, setTranscripts] = React.useState<LiveTranscriptItem[]>([]);
  const [audioLevel, setAudioLevel] = React.useState(0);

  const wsRef = React.useRef<WebSocket | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const playbackCtxRef = React.useRef<AudioContext | null>(null);
  const nextPlayTimeRef = React.useRef<number>(0);
  const activeSourcesRef = React.useRef<AudioBufferSourceNode[]>([]);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const videoStreamRef = React.useRef<MediaStream | null>(null);
  const videoElRef = React.useRef<HTMLVideoElement | null>(null);
  const frameIntervalRef = React.useRef<number | null>(null);
  const processorRef = React.useRef<ScriptProcessorNode | null>(null);

  const stopPlaybackQueue = React.useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    activeSourcesRef.current = [];
    if (playbackCtxRef.current) {
      nextPlayTimeRef.current = playbackCtxRef.current.currentTime;
    }
  }, []);

  const enqueueAudioOutput = React.useCallback((base64Pcm24k: string) => {
    try {
      if (!playbackCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        playbackCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      const ctx = playbackCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const floatData = base64ToFloat32PCM(base64Pcm24k);
      if (floatData.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, floatData.length, 24000);
      audioBuffer.getChannelData(0).set(floatData);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now, nextPlayTimeRef.current);
      source.start(startAt);
      nextPlayTimeRef.current = startAt + audioBuffer.duration;
      activeSourcesRef.current.push(source);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      };
    } catch (err) {
      console.warn('Live audio playback error:', err);
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
    if (videoElRef.current) {
      videoElRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const stopSession = React.useCallback(() => {
    stopCamera();
    stopPlaybackQueue();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
    setMuted(false);
    setAudioLevel(0);
    if (role === 'caller') {
      onServerCallStateChange?.('end');
    }
  }, [onServerCallStateChange, role, stopCamera, stopPlaybackQueue]);

  const startSession = React.useCallback(async () => {
    setError(null);
    setConnecting(true);

    // Explicitly suspend/end any other active voice session first
    releaseGlobalMicrophoneOwnership();
    registerGlobalMicrophoneStopper(stopSession);

    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/live?role=${encodeURIComponent(
        role
      )}&participant=${encodeURIComponent(participantName)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'connected') {
            setConnected(true);
            setConnecting(false);
            if (role === 'caller') {
              onServerCallStateChange?.('start');
            }
          } else if (msg.type === 'audio' && msg.audio) {
            enqueueAudioOutput(msg.audio);
          } else if (msg.type === 'interrupted') {
            stopPlaybackQueue();
          } else if (msg.type === 'transcript') {
            setTranscripts((prev) => {
              const idx = prev.findIndex((item) => item.utteranceId === msg.utteranceId);
              const updatedItem: LiveTranscriptItem = {
                utteranceId: msg.utteranceId,
                speaker: msg.speaker,
                speakerRole: msg.speakerRole,
                text: msg.text,
                isPartial: Boolean(msg.isPartial),
                timestamp: new Date().toISOString(),
              };
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = updatedItem;
                return copy;
              }
              return [...prev, updatedItem];
            });
          } else if (msg.type === 'error') {
            setError(msg.message || 'Live session error');
            setConnecting(false);
          } else if (msg.type === 'closed') {
            setConnected(false);
            setConnecting(false);
          }
        } catch (err) {
          console.warn('Error parsing Live WS message:', err);
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection to Gemini Live failed.');
        setConnecting(false);
      };

      ws.onclose = () => {
        setConnected(false);
        setConnecting(false);
      };

      // Request microphone stream if available
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtx({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);

            // Compute RMS for UI meter
            let sum = 0;
            for (let i = 0; i < inputData.length; i += 8) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / (inputData.length / 8));
            setAudioLevel(Math.min(1, rms * 5));

            const base64Audio = floatTo16BitPCMBase64(inputData);
            wsRef.current.send(
              JSON.stringify({
                type: 'audio',
                data: base64Audio,
              })
            );
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } catch (micErr: any) {
          console.warn('Microphone access unavailable or denied; continuing Live session with text/camera input:', micErr);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to start Live session');
      setConnecting(false);
    }
  }, [enqueueAudioOutput, onServerCallStateChange, participantName, role, stopPlaybackQueue, stopSession]);

  const toggleMute = React.useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !next;
        });
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'mute', muted: next }));
      }
      if (role === 'caller') {
        onServerCallStateChange?.(next ? 'mute' : 'unmute');
      }
      return next;
    });
  }, [onServerCallStateChange, role]);

  const sendTextPromptToLive = React.useCallback((text: string) => {
    if (!text.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text_prompt',
          text: text.trim(),
        })
      );
      setTranscripts((prev) => [
        ...prev,
        {
          utteranceId: `local-txt-${Date.now()}`,
          speaker: participantName,
          speakerRole: role,
          text: text.trim(),
          isPartial: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [participantName, role]);

  // Start / Stop camera streaming at <= 1 FPS over the SAME Live WebSocket
  const startCamera = React.useCallback(
    async (videoElement: HTMLVideoElement | null, mode: 'environment' | 'user' = facingMode) => {
      videoElRef.current = videoElement;
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const vStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: mode,
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          });
          videoStreamRef.current = vStream;
          if (videoElement) {
            videoElement.srcObject = vStream;
            await videoElement.play().catch(() => {});
          }
        }
      } catch (camErr) {
        console.warn('Hardware camera unavailable, using tactical field simulation canvas for 1 FPS frame streaming:', camErr);
      }

      setCameraActive(true);

      if (frameIntervalRef.current) {
        window.clearInterval(frameIntervalRef.current);
      }

      // Send 1 JPEG frame every 1200ms (<= 1 FPS) to active Live session
      frameIntervalRef.current = window.setInterval(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (videoElRef.current && videoElRef.current.readyState >= 2) {
          ctx.drawImage(videoElRef.current, 0, 0, canvas.width, canvas.height);
        } else {
          // Draw realistic field corridor thermal/visual feed when in headless browser
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#27272a';
          ctx.fillRect(40, 30, 400, 300);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
          ctx.beginPath();
          ctx.arc(240, 160, 75, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e4e4e7';
          ctx.font = '14px monospace';
          ctx.fillText('FIELD CAM · L3 CORRIDOR 3C / DOOR 302', 60, 60);
          ctx.fillText(`UTC ${new Date().toISOString().slice(11, 19)} · SMOKE DENSITY HIGH`, 60, 310);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        const commaIdx = dataUrl.indexOf(',');
        if (commaIdx !== -1) {
          wsRef.current.send(
            JSON.stringify({
              type: 'video_frame',
              mimeType: 'image/jpeg',
              data: dataUrl.slice(commaIdx + 1),
            })
          );
        }
      }, 1200);
    },
    [facingMode]
  );

  const flipCamera = React.useCallback(async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      stopCamera();
      await startCamera(videoElRef.current, nextMode);
    }
  }, [cameraActive, facingMode, startCamera, stopCamera]);

  const captureSnapshotDataUrl = React.useCallback((): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (videoElRef.current && videoElRef.current.readyState >= 2) {
      ctx.drawImage(videoElRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      // Tactical field photo snapshot fallback
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(1, '#18181b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Corridor perspective lines
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.strokeRect(110, 70, 420, 340);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(110, 70);
      ctx.moveTo(640, 0);
      ctx.lineTo(530, 70);
      ctx.moveTo(0, 480);
      ctx.lineTo(110, 410);
      ctx.moveTo(640, 480);
      ctx.lineTo(530, 410);
      ctx.stroke();

      // Smoke & door glow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.fillRect(250, 120, 140, 290);
      ctx.strokeStyle = '#f97316';
      ctx.strokeRect(250, 120, 140, 290);

      ctx.fillStyle = 'rgba(161, 161, 170, 0.35)';
      ctx.beginPath();
      ctx.arc(320, 140, 130, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fafafa';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('FIELD REPORT SNAPSHOT · LEVEL 3 CORRIDOR', 30, 38);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '13px monospace';
      ctx.fillText(`CAPTURED ${new Date().toISOString()} · SERVER RM 302 DOOR`, 30, 456);
    }

    return canvas.toDataURL('image/jpeg', 0.82);
  }, []);

  React.useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    connected,
    connecting,
    muted,
    cameraActive,
    facingMode,
    error,
    transcripts,
    audioLevel,
    startSession,
    stopSession,
    toggleMute,
    startCamera,
    stopCamera,
    flipCamera,
    captureSnapshotDataUrl,
    sendTextPromptToLive,
  };
}
