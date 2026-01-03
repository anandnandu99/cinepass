
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { generateMovieArt, editMovieImage, generateVeoVideo, analyzeMedia } from '../services/geminiService';

const CineLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'image' | 'video' | 'edit' | 'analyze'>('image');
  const [aspect, setAspect] = useState('16:9');
  const [size, setSize] = useState('1K');
  const [file, setFile] = useState<File | null>(null);
  const [analysisText, setAnalysisText] = useState('');

  // Reset aspect when switching to video mode as Veo only supports 16:9 and 9:16
  useEffect(() => {
    if (mode === 'video') {
      setAspect('16:9');
    }
  }, [mode]);

  const ensureApiKey = async () => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleAction = async () => {
    if (!prompt.trim() && (mode === 'image' || mode === 'video')) return;
    
    setLoading(true);
    setResult(null);
    setAnalysisText('');

    try {
      // Mandatory key selection for Pro Image and Video models
      if (mode === 'image' || mode === 'video') {
        await ensureApiKey();
      }

      if (mode === 'image') {
        const res = await generateMovieArt(prompt, aspect, size);
        setResult(res);
      } else if (mode === 'video') {
        const res = await generateVeoVideo(prompt, aspect as any);
        setResult(res);
      } else if (mode === 'edit' && file) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const res = await editMovieImage(reader.result as string, prompt);
            setResult(res);
            setLoading(false);
          } catch (err) {
            handleError(err);
            setLoading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      } else if (mode === 'analyze' && file) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const res = await analyzeMedia(reader.result as string, file.type, prompt || "What is in this media?");
            setAnalysisText(res || '');
            setLoading(false);
          } catch (err) {
            handleError(err);
            setLoading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  const handleError = async (e: any) => {
    console.error("CineLab Action failed:", e);
    const errorMsg = e.message || "";
    if (errorMsg.includes("403") || errorMsg.includes("permission") || errorMsg.includes("not found")) {
      setAnalysisText("Access denied. Please ensure you have selected a valid API key with appropriate permissions (Paid GCP project required for Veo/Pro models).");
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    } else {
      setAnalysisText("An error occurred during generation. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-white">CineLab AI Studio</h2>
        <p className="text-slate-400">Create, edit, and analyze cinematic assets with Google's latest models.</p>
        <div className="flex justify-center">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">
                Billing Documentation & API Requirements
            </a>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {(['image', 'video', 'edit', 'analyze'] as const).map(m => (
          <button 
            key={m} onClick={() => { setMode(m); setResult(null); setAnalysisText(''); }}
            className={`px-6 py-2 rounded-full font-bold uppercase text-xs transition-all ${mode === m ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-300">AI Prompt</label>
          <textarea 
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none h-32 transition-all"
            placeholder={mode === 'image' ? "Describe your cinematic masterpiece..." : mode === 'analyze' ? "What do you want to know about this media?" : "Instructions for AI..."}
          />
        </div>

        {(mode === 'edit' || mode === 'analyze') && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300">Upload Media</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Aspect Ratio</label>
            <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-indigo-500">
              {(mode === 'video' ? ['9:16', '16:9'] : ['1:1', '3:4', '4:3', '9:16', '16:9']).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {mode === 'image' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Resolution</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-indigo-500">
                {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        <button 
          onClick={handleAction} disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Processing with Gemini...</span>
            </>
          ) : 'Execute CineLab Task'}
        </button>
      </div>

      {(result || analysisText) && (
        <div className="animate-fadeIn space-y-6 bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-md">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ICONS.Sparkles /> AI Result
          </h3>
          {mode === 'video' && result ? (
            <div className="space-y-4">
               <video src={result} controls className="w-full rounded-2xl shadow-xl border border-slate-700" />
               <a href={result} download className="block text-center text-sm text-indigo-400 hover:underline">Download MP4</a>
            </div>
          ) : result ? (
            <img src={result} className="w-full rounded-2xl shadow-xl border border-slate-700" alt="Generated asset" />
          ) : (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm italic bg-slate-900/50 p-4 rounded-xl border border-slate-700">{analysisText}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CineLab;
