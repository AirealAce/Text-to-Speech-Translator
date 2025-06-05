'use client';

import { Loader2, Play } from 'lucide-react';
import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';

const sampleMessages = [
  {
    ja: "人工知能について教えてください",
    en: "What is artificial intelligence?"
  },
  {
    ja: "光合成のプロセスを説明してください",
    en: "How does photosynthesis work?"
  },
  {
    ja: "量子コンピューターについて説明してください",
    en: "Explain quantum computing"
  },
  {
    ja: "面白い事実を教えてください",
    en: "Tell me a fun fact"
  },
  {
    ja: "この文章を英語に翻訳してください",
    en: "Please translate this to English"
  },
  {
    ja: "日本の文化について教えてください",
    en: "Tell me about Japanese culture"
  },
  {
    ja: "今日の天気はどうですか",
    en: "How's the weather today?"
  },
  {
    ja: "好きな食べ物は何ですか",
    en: "What's your favorite food?"
  }
];

interface CodeProps {
  children: React.ReactNode;
  className?: string;
  node?: any;
  inline?: boolean;
}

interface TextToSpeechProps {
  text: string;
}

function TextToSpeech({ text }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    setIsPlaying(true);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice_id: 'kdmDKE6EkgrWrrykO9Qt', // Alexandra - good for multilingual including Japanese
          model_id: 'eleven_multilingual_v2', // Better for Japanese pronunciation
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioData = await res.arrayBuffer();
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (error) {
      console.error('Speech generation error:', error);
      alert('Failed to generate speech');
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className="p-2 rounded-lg hover:bg-red-950/30 transition-colors disabled:opacity-50 border border-red-900/20"
      title={isPlaying ? "Playing..." : "Play message"}
    >
      <Play className={`w-4 h-4 ${isPlaying ? 'text-red-400' : 'text-red-500/50'}`} />
    </button>
  );
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  // Function to get random messages
  const getRandomMessages = () => {
    const shuffled = [...sampleMessages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // State for sample messages
  const [currentSamples, setCurrentSamples] = useState(getRandomMessages());

  // Function to refresh sample messages
  const refreshSamples = () => {
    setCurrentSamples(getRandomMessages());
  };

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle global Enter key
  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.shiftKey && 
          !(e.target instanceof HTMLTextAreaElement) && 
          !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalEnter);
    return () => document.removeEventListener('keydown', handleGlobalEnter);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        // Ctrl+Enter triggers translation
        e.preventDefault();
        handleTranslate(e as any);
      } else if (e.altKey) {
        // Alt+Enter triggers text-to-speech
        e.preventDefault();
        handleTextToSpeech(e as any);
      }
    }
  };

  const customHandleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    adjustTextareaHeight();
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    handleSubmit(e, {
      options: {
        body: {
          messages: [
            {
              content: `Translate the following text (detect the source language and translate to English. ONLY return the translation, no explanations): ${input}`,
              role: 'user'
            }
          ]
        }
      }
    });
  };

  const handleTextToSpeech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: input,
          voice_id: 'XrExE9yKIg1WjnnlVkGX', // Ishibashi - Strong Japanese Male Voice
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioData = await res.arrayBuffer();
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
      await audio.play();

      // Add only the user message to the chat
      const userMessage = {
        id: String(Date.now()),
        role: 'user',
        content: input
      };

      // @ts-ignore - We know these message types are compatible
      messages.push(userMessage);
      
      // Clear the input
      handleInputChange({ target: { value: '' } } as any);
    } catch (error) {
      console.error('Speech generation error:', error);
      alert('Failed to generate speech');
    }
  };

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-bold text-red-100">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold text-red-100">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-red-100">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold text-red-100">{children}</h4>,
    p: ({ children }) => <p className="text-red-100 whitespace-pre-wrap">{children}</p>,
    strong: ({ children }) => <strong className="font-bold text-red-400">{children}</strong>,
    em: ({ children }) => <em className="italic text-red-300">{children}</em>,
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <code className="block bg-red-950/30 rounded p-2 my-2 text-red-300 whitespace-pre border border-red-900/20" {...props}>
          {children}
        </code>
      ) : (
        <code className="bg-red-950/30 rounded px-1 py-0.5 text-red-300 border border-red-900/20" {...props}>
          {children}
        </code>
      );
    },
    ul: ({ children }) => <ul className="list-disc list-inside text-red-100">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside text-red-100">{children}</ol>,
    li: ({ children }) => <li className="ml-4 text-red-100">{children}</li>,
  };

  return (
    <div className="flex flex-col h-screen bg-black relative">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
        style={{ backgroundImage: 'url(/clouds.webp)' }}
      />
      <div className="relative z-10 flex h-full">
        {/* Left fireworks */}
        <div className="w-48 fixed left-0 top-0 bottom-0 pointer-events-none">
          <div className="h-full w-full border-x-4 border-red-900/50" style={{ 
            backgroundImage: 'url(/fireworks.gif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.4',
            transform: 'scaleX(-1)' // Flip horizontally for variety
          }} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-full mx-24">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <h1 className="text-5xl font-bold text-red-500 mb-8">Mizuru Translate</h1>
              {mounted && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                  {currentSamples.map((sample, index) => (
                    <button
                      key={`${sample.ja}-${index}`}
                      onClick={() => {
                        handleInputChange({ target: { value: sample.ja } } as any);
                        refreshSamples();
                      }}
                      className="p-4 bg-black/50 rounded-lg text-red-400 text-sm hover:bg-red-950/30 transition-colors text-left border border-red-900/20 hover:border-red-500"
                    >
                      <div className="font-medium">{sample.ja}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.role === 'assistant'
                      ? 'bg-black/80'
                      : 'bg-red-950/20'
                  } border-b border-red-900/20`}
                >
                  <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {message.role === 'assistant' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-red-400 mb-1">Mizuru Translate</span>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center text-white shadow-lg border border-red-500/20">
                              🌐
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-red-400 mb-1">You</span>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-950 to-black flex items-center justify-center text-white shadow-lg border border-red-500/20">
                              👤
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="min-h-[20px] text-red-100 markdown-body">
                          <ReactMarkdown components={markdownComponents}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <TextToSpeech text={message.content} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="border-t border-red-900/20 bg-black/90 p-6">
            <form className="max-w-4xl mx-auto relative">
              <div className="relative flex items-center">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={customHandleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Type your message... (Ctrl+Enter to translate, Alt+Enter to speak)"
                  className="w-full p-4 pr-24 rounded-lg bg-red-950/20 text-red-100 placeholder-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-red-900/20 focus:border-red-500/50 resize-none"
                  style={{
                    minHeight: '56px',
                    height: 'auto',
                    maxHeight: '200px'
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={isLoading || !input.trim()}
                    className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 bg-red-950/30 hover:bg-red-900/30 rounded-lg border border-red-900/20"
                    title="Translate (Ctrl+Enter)"
                  >
                    <span className="font-semibold">TR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTextToSpeech}
                    disabled={isLoading || !input.trim()}
                    className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 bg-red-950/30 hover:bg-red-900/30 rounded-lg border border-red-900/20"
                    title="Play text (Alt+Enter)"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right fireworks */}
        <div className="w-48 fixed right-0 top-0 bottom-0 pointer-events-none">
          <div className="h-full w-full border-x-4 border-red-900/50" style={{ 
            backgroundImage: 'url(/fireworks.gif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.4',
            transform: 'scaleY(-1)' // Flip vertically
          }} />
        </div>
      </div>
    </div>
  );
} 