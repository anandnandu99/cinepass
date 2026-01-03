
import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { chatWithGrounding, speakText, solveComplexBooking } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GroundingSource } from '../types';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string, sources?: GroundingSource[], isThinking?: boolean }[]>([
    { role: 'bot', text: "Hello! I'm CineBot. I can help with movie news, nearby cinemas, or even complex planning. Try asking: 'Find me a 4DX show near a vegan restaurant'!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Intent detection: if the query seems complex, use thinking mode
      let responseText: string;
      let sources: GroundingSource[] = [];
      
      if (userMsg.length > 50 || userMsg.includes('restaurant') || userMsg.includes('group') || userMsg.includes('plan')) {
        setMessages(prev => [...prev, { role: 'bot', text: "Deep thinking in progress...", isThinking: true }]);
        responseText = await solveComplexBooking(userMsg);
        setMessages(prev => prev.filter(m => !m.isThinking));
      } else {
        const res = await chatWithGrounding(userMsg);
        responseText = res.text;
        sources = res.sources;
      }

      setMessages(prev => [...prev, { role: 'bot', text: responseText, sources }]);
      if (responseText.length < 150) speakText(responseText);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to Gemini. Please check your API key." }]);
    }
    setIsTyping(false);
  };

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      sessionRef.current?.close();
      setIsLiveMode(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      let nextStartTime = 0;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLiveMode(true);
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
              const inputCtx = new AudioContext({ sampleRate: 16000 });
              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              processor.onaudioprocess = (e) => {
                const data = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(data.length);
                for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
                const base64 = encode(new Uint8Array(int16.buffer));
                sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
              };
              source.connect(processor);
              processor.connect(inputCtx.destination);
            });
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
              source.start(nextStartTime);
              nextStartTime += audioBuffer.duration;
            }
          },
          onclose: () => setIsLiveMode(false),
          onerror: () => setIsLiveMode(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setIsLiveMode(false);
    }
  };

  function decode(b64: string) {
    const s = atob(b64);
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, ch: number) {
    const i16 = new Int16Array(data.buffer);
    const frames = i16.length / ch;
    const buf = ctx.createBuffer(ch, frames, rate);
    for (let c = 0; c < ch; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < frames; i++) d[i] = i16[i * ch + c] / 32768.0;
    }
    return buf;
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[60] group">
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
        <ICONS.Sparkles />
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-28 md:right-8 md:w-[400px] md:h-[600px] bg-slate-900 border border-slate-800 md:rounded-3xl shadow-2xl flex flex-col z-[70] overflow-hidden animate-slideUp">
          <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ICONS.Sparkles />
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">CineBot Pro</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-tighter">{isLiveMode ? 'LIVE CONVERSATION' : 'SEARCH & REASONING ACTIVE'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}><ICONS.Close /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-800 text-slate-100 border border-slate-700'} ${m.isThinking ? 'animate-pulse border-indigo-500' : ''}`}>
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700 space-y-2">
                      <p className="text-[10px] text-slate-500 font-black uppercase">Verified Sources:</p>
                      {m.sources.map((s, idx) => (
                        <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-indigo-400 hover:text-white truncate">
                          🌐 {s.title || s.uri}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div className="flex gap-1 p-2"><div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" /></div>}
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
            <button 
              onClick={toggleLiveMode}
              className={`p-3 rounded-xl transition-colors ${isLiveMode ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </button>
            <input 
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for advice, news, or help..."
              className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none border border-slate-700 focus:border-indigo-500 text-white"
            />
            <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
