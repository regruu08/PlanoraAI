'use client';

import React, { use, useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, BudgetItem, Task, Vendor, Idea, AIMessage } from '@/types';
import { 
  getEventById, 
  getBudgets, 
  getTasks, 
  getVendors, 
  getIdeas, 
  getAIMessages, 
  saveAIMessage 
} from '@/lib/storage';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  AlertCircle, 
  Clock, 
  Wallet, 
  Store, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function CopilotPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setBudgets(getBudgets(eventId));
      setTasks(getTasks(eventId));
      setVendors(getVendors(eventId));
      setIdeas(getIdeas(eventId));
      
      const storedMsgs = getAIMessages(eventId);
      if (storedMsgs.length > 0) {
        setMessages(storedMsgs);
      } else {
        // Welcome message
        const initialMsg: AIMessage = {
          id: `msg-init-${Date.now()}`,
          event_id: eventId,
          role: 'assistant',
          content: `Namaste! Main Planora AI hoon. Maine aapke **${evt.name}** ka poora plan review kar liya hai (Date: ${evt.event_date}, Guests: ${evt.guest_count}, Budget: ₹${evt.total_budget.toLocaleString('en-IN')}).\n\nAap mujhse urgent tasks, vendor checklists, ya budget reduction ke baare me kuch bhi pooch sakte hain. Neeche diye gaye suggestions try karein ya seedha type karein!`,
          created_at: new Date().toISOString(),
        };
        setMessages([initialMsg]);
        saveAIMessage(initialMsg);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!event) {
    return <div className="p-8 text-center text-zinc-400">Loading AI Copilot...</div>;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = (textToSend || input).trim();
    if (!msgText || isSending) return;

    const userMsg: AIMessage = {
      id: `msg-u-${Date.now()}`,
      event_id: event.id,
      role: 'user',
      content: msgText,
      created_at: new Date().toISOString(),
    };

    const newMsgList = [...messages, userMsg];
    setMessages(newMsgList);
    saveAIMessage(userMsg);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch(`/api/events/${event.id}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          budgets,
          tasks,
          vendors,
          ideas,
          message: msgText,
        }),
      });

      const data = await response.json();

      const replyContent = data.reply || 'Planora AI could not generate a response. Please retry.';

      const botMsg: AIMessage = {
        id: `msg-b-${Date.now()}`,
        event_id: event.id,
        role: 'assistant',
        content: replyContent,
        created_at: new Date().toISOString(),
      };

      setMessages([...newMsgList, botMsg]);
      saveAIMessage(botMsg);
    } catch (err) {
      console.error('Copilot send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Quick suggestion prompts from Section 10 & 38
  const quickPrompts = [
    'Mere event me abhi sabse urgent kya hai?',
    'Photographer book karne se pehle kya poochu?',
    'Decoration budget reduce kaise karun?',
    'Budget me kaha overspending ho sakti hai?',
    'Catering tasting me kya verify karein?',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-140px)]">
        
        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-3xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-6 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                  <span>Planora AI Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                </h3>
                <span className="text-[11px] text-zinc-500">
                  Contextual Agent &bull; Access to live event budget, tasks &amp; vendors
                </span>
              </div>
            </div>

            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-100">
              {event.name}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                      isUser
                        ? 'bg-zinc-800 text-white'
                        : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-zinc-900 text-white rounded-tr-none'
                        : 'bg-zinc-50 border border-zinc-200/80 text-zinc-800 rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-sm text-zinc-500 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                  <span>Planora AI is analyzing event context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-zinc-400 shrink-0 uppercase tracking-wider">
              Suggestions:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="px-3 py-1 text-xs font-medium bg-white border border-zinc-200 hover:border-rose-300 hover:bg-rose-50/50 text-zinc-700 rounded-full shrink-0 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-zinc-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask anything about your celebration, budget, or vendors in English or Hinglish..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSending}
                className="flex-1 px-4 py-3 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-zinc-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="p-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm shadow-rose-200 disabled:opacity-50 transition-all"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
