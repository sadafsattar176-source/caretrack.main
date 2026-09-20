import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Loader2,
  ShieldAlert,
  User,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import type { ChatMessage } from '../types';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('caretrack_ai_chat') || sessionStorage.getItem('caretrack_ai_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save chat history to durable localStorage
  useEffect(() => {
    try {
      localStorage.setItem('caretrack_ai_chat', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to cache chat history', e);
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = input.trim();
    if (!cleanText || loading) return;

    setErrorMsg(null);

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/health-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: cleanText,
          conversationHistory: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorText =
          data?.error ||
          data?.details ||
          `AI Health Assistant service error (HTTP ${res.status}). Please try again.`;
        setErrorMsg(errorText);

        const aiMessage: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: data?.reply || `I encountered an issue processing your request: ${errorText}`,
          disclaimer: null,
          isRefusal: Boolean(data?.isRefusal),
          isConfigError: Boolean(data?.isConfigError),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      if (!data) {
        const fallbackText = 'The AI service returned an empty response. Please try again.';
        setErrorMsg(fallbackText);
        const aiMessage: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: 'I apologize, but no response was received from the AI service. Please try asking your health question again.',
          disclaimer: null,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      if (data.error && !data.reply) {
        setErrorMsg(data.error);
        const aiMessage: ChatMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: data.error,
          disclaimer: null,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      const aiMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: data.reply || 'Sorry, I could not process your query at this moment.',
        disclaimer: data.disclaimer || null,
        isRefusal: Boolean(data.isRefusal),
        isConfigError: Boolean(data.isConfigError),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const userFacingError =
        err?.message ||
        'Unable to communicate with the AI Health Assistant service. Please check your connection and try again.';
      setErrorMsg(userFacingError);

      const aiMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: `Unable to connect to the CareTrack AI service (${userFacingError}). Please check your connection or try again in a moment.`,
        disclaimer: null,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem('caretrack_ai_chat');
      sessionStorage.removeItem('caretrack_ai_chat');
    } catch {}
  };

  return (
    <div
      id="ai-assistant-container"
      className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300"
    >
      {/* Chat Header */}
      <div className="p-4 sm:px-6 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-700/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">AI Health Assistant</h2>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                Healthcare Only
              </span>
            </div>
            <p className="text-xs text-slate-500">
              General medical guidance & medication information in English, Urdu & Roman Urdu
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            title="Clear current session chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4 ring-8 ring-sky-50/50 shadow-inner">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              How can I assist your health today?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
              Ask general questions regarding symptoms, medication purposes, nutrition, or preparation for upcoming doctor consultations.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 max-w-md text-left text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Info className="w-4 h-4 text-sky-600" />
                <span>Assistant Guidelines:</span>
              </div>
              <p>• Answers educational and healthcare questions only.</p>
              <p>• Refuses non-health topics like coding, politics, and homework.</p>
              <p>• Supports English, Urdu, and Roman Urdu queries.</p>
              <p>• Does not provide diagnoses or personalized prescriptions.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}>
                {/* Chat Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-700 text-white rounded-br-none shadow-sm'
                      : msg.isRefusal
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-none'
                      : msg.isConfigError
                      ? 'bg-sky-50 text-sky-900 border border-sky-200 rounded-bl-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Exact Medical Disclaimer shown underneath healthcare responses */}
                {msg.role === 'assistant' && msg.disclaimer && (
                  <div className="mt-2 p-2.5 rounded-xl bg-sky-50/90 border border-sky-200/70 text-[11px] text-sky-900 leading-snug flex items-start gap-1.5 shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{msg.disclaimer}</span>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-start animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-bl-none bg-slate-100 text-slate-600 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              <span>Analyzing healthcare query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message if request failed */}
      {errorMsg && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-100 flex items-center gap-2 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-2"
      >
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a healthcare or medication question (English / Urdu)..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition placeholder:text-slate-400"
        />
        <button
          id="btn-chat-send"
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-sky-700 hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-md shadow-sky-700/20 transition cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Send message"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};
