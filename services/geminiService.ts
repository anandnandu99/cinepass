
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface AIRecommendation {
  id: string;
  reason: string;
}

export const getMovieRecommendations = async (userMood: string, preferredGenres: string[]): Promise<AIRecommendation[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User mood: ${userMood}. Preferred genres: ${preferredGenres.join(', ')}. Recommend 3 movie IDs. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["id", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Recommendation failed:", error);
    return [];
  }
};

export const solveComplexBooking = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: query,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text;
};

export const getNearbyCinemasWithMaps = async (lat: number, lng: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What are the best cinemas nearby? Include their key features and accessibility.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
      }
    }
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.maps?.title || "Cinema Info",
    uri: chunk.maps?.uri
  })) || [];

  return { text: response.text, sources };
};

// Fix: Implemented getCinemaInfo as used in App.tsx
export const getCinemaInfo = async (name: string, location: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide detailed information about ${name} cinema in ${location}. Include amenities, specialized screens like IMAX or 4DX, and parking info.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title,
    uri: chunk.web?.uri
  })) || [];

  return { text: response.text, sources };
};

export const chatWithGrounding = async (message: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: { tools: [{ googleSearch: {} }] },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title,
    uri: chunk.web?.uri
  })) || [];

  return { text: response.text, sources };
};

export const speakText = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say warmly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const bytes = decode(base64Audio);
    const buffer = await decodeAudioData(bytes, audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }
};

// Fix: Implemented generateMovieArt for CineLab
export const generateMovieArt = async (prompt: string, aspectRatio: string, imageSize: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      }
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// Fix: Implemented editMovieImage for CineLab
export const editMovieImage = async (base64Data: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const data = base64Data.split(',')[1] || base64Data;
  const mimeType = base64Data.split(';')[0].split(':')[1] || 'image/png';
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: prompt },
      ],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// Fix: Implemented generateVeoVideo for CineLab
export const generateVeoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

// Fix: Implemented analyzeMedia for CineLab
export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const data = base64Data.split(',')[1] || base64Data;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: prompt },
      ],
    },
  });
  
  return response.text;
};

function decode(b64: string) {
  const s = atob(b64);
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
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
