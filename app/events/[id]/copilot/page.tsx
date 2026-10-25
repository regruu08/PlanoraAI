'use client';

import React, { use, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { 
  PlanoraEvent, 
  BudgetItem, 
  Task, 
  Vendor, 
  Idea, 
  AIMessage 
} from '@/types';
import { 
  getEventById, 
  getBudgets, 
  getTasks, 
  getVendors, 
  getIdeas, 
  getAIMessages, 
  saveAIMessage, 
  clearAIMessages 
} from '@/lib/storage';
import { formatINR, getDaysRemaining, calculatePercentage } from '@/lib/utils';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Store, 
  Wallet, 
  Lightbulb, 
  ArrowRight
} from 'lucide-react';

export default function CopilotPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [loaded, setLoaded] = useState(false);
  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(() => {
    const evt = getEventById(eventId);
    setEvent(evt || null);
    if (evt) {
      setBudgets(getBudgets(eventId));
      setTasks(getTasks(eventId));
      setVendors(getVendors(eventId));
      setIdeas(getIdeas(eventId));

      const storedMsgs = getAIMessages(eventId);
      if (storedMsgs.length > 0) {
        setMessages(storedMsgs);
      } else {
        // Welcome message with context grounding
        const initialMsg: AIMessage = {
          id: `msg-init-${Date.now()}`,
          event_id: eventId,
          role: 'assistant',
          content: `Namaste! Main **Planora AI** hoon — aapka personal celebration planning copilot. 

Maine aapke **${evt.name}** ka poora blueprint load kar liya hai:
- 📅 **Date**: ${evt.event_date} (${getDaysRemaining(evt.event_date)} days to go)
- 📍 **Location**: ${evt.location} &bull; 👥 **Guests**: ${evt.guest_count}
- 💰 **Budget**: ${formatINR(evt.total_budget)}
- 🎨 **Theme**: ${evt.theme || 'Custom celebration'}

Main aapke live budget, timeline milestones, aur vendor checklists se 100% synchronized hoon. Aap mujhse urgent tasks, contract negotiations, budget savings ya creative ideas ke baare me English ya Hinglish me kuch bhi pooch sakte hain!`,
          created_at: new Date().toISOString(),
        };
        setMessages([initialMsg]);
        saveAIMessage(initialMsg);
      }
    }
    setLoaded(true);
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleResetChat = () => {
    if (!event) return;
    if (confirm('Are you sure you want to reset the chat conversation?')) {
      clearAIMessages(event.id);
      loadData();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = (textToSend || input).trim();
    if (!msgText || isSending || !event) return;

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
    setError('');

    try {
      const response = await fetch(`/api/events/${event.id}/ai/chat`, {
        method: 'POST',
        signal: AbortSignal.timeout(60000),
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

      if (!response.ok) {
        throw new Error(data.error || 'Your message could not be sent.');
      }

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
      setError(err instanceof Error ? err.message : 'Connection interrupted. Please try again.');
      setInput(msgText);
    } finally {
      setIsSending(false);
    }
  };

  // Quick suggestion prompts tailored for Hack2Skill Challenge 5
  const quickPrompts = [
    {
      category: 'Urgent',
      text: 'Mere event me abhi sabse urgent kya hai?',
      icon: Clock,
    },
    {
      category: 'Vendors',
      text: 'Photographer book karne se pehle kya poochu?',
      icon: Store,
    },
    {
      category: 'Budget',
      text: 'Decoration budget reduce kaise karun bina quality kharab kiye?',
      icon: Wallet,
    },
    {
      category: 'Food',
      text: 'Catering tasting aur menu finalizing me kya verify karein?',
      icon: Sparkles,
    },
    {
      category: 'Risk',
      text: 'Budget me kaha overspending ka sabse bada risk hai?',
      icon: ShieldCheck,
    },
  ];

  // Grounding metrics computed live for display in copilot inspector
  const totalAllocated = useMemo(() => budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((acc, b) => acc + (b.actual_amount || 0), 0), [budgets]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending'), [tasks]);
  const neededVendors = useMemo(() => vendors.filter(v => v.status === 'needed' || v.status === 'contacted'), [vendors]);
  const savedIdeas = useMemo(() => ideas.filter(i => i.is_saved), [ideas]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50/50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400 text-sm font-medium">Initializing AI Copilot command center...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50/50">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Event Not Found</h2>
          <p className="text-sm text-zinc-500 mt-2">The requested celebration plan could not be located.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Main Grid: Chat Workspace + Grounding Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px] h-[calc(100vh-220px)] max-h-[850px]">
          
          {/* Chat Workspace Column (Takes 3 columns on large screens) */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            
            {/* Command Center Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-zinc-900">Planora AI Copilot</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Grounded
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Trained celebration strategist &bull; English &amp; Hinglish fluent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetChat}
                  title="Clear Chat History"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-800 font-bold ml-2">Dismiss</button>
              </div>
            )}

            {/* Scrollable Messages Area */}
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
                          ? 'bg-zinc-900 text-white shadow-2xs'
                          : 'bg-rose-600 text-white shadow-2xs'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-zinc-900 text-white rounded-tr-none shadow-xs'
                          : 'bg-zinc-50/80 border border-zinc-200/70 text-zinc-800 rounded-tl-none whitespace-pre-wrap shadow-2xs'
                      }`}
                    >
                      {msg.content.split('\n').map((line, idx) => {
                        // Formats bullet points
                        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                        const isNumber = /^\d+\.\s/.test(line.trim());
                        
                        // Parse bold markdown
                        const formattedParts = line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className={isUser ? 'font-bold text-white' : 'font-bold text-zinc-900'}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        });

                        return (
                          <div 
                            key={idx} 
                            className={`${isBullet ? 'pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-rose-500' : ''} ${isNumber ? 'pl-2' : ''} ${idx > 0 ? 'mt-1.5' : ''}`}
                          >
                            {formattedParts}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-sm text-zinc-600 flex items-center gap-2.5 shadow-2xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                    <span>Analyzing event parameters &amp; crafting advice...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggested Prompts Carousel */}
            <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 shrink-0">
                Suggested:
              </span>
              {quickPrompts.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.text)}
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white border border-zinc-200/80 hover:border-rose-300 hover:bg-rose-50/50 text-zinc-700 rounded-full shrink-0 transition-colors disabled:opacity-50 shadow-2xs"
                  >
                    <Icon className="w-3 h-3 text-rose-500" />
                    <span>{p.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Bar */}
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
                  aria-label="Message your planning copilot"
                  placeholder="Ask anything about budgets, vendor terms, timeline priorities in English or Hinglish..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending}
                  className="flex-1 px-4 py-3 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-zinc-50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm shadow-rose-200 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Live Grounding Inspector (Proves grounding to Hackathon judges) */}
          <div className="hidden lg:flex flex-col gap-4 overflow-y-auto">
            {/* Grounding Status Card */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Grounding Context</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  Real-time
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-semibold block text-[11px]">Event Target</span>
                  <span className="font-bold text-zinc-900 text-sm">{event.name}</span>
                  <span className="text-zinc-500 block">{event.location} &bull; {event.guest_count} guests</span>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-500">Budget Health</span>
                    <span className="font-bold text-zinc-900">{formatINR(totalSpent)} / {formatINR(event.total_budget)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mb-1.5">
                    Allocated: {formatINR(totalAllocated)}
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div 
                      className={`h-full ${totalSpent > event.total_budget ? 'bg-rose-600' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, calculatePercentage(totalSpent, event.total_budget))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-sm font-extrabold text-amber-600 block">{pendingTasks.length}</span>
                    <span className="text-[9px] text-zinc-500 font-semibold">Tasks</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-sm font-extrabold text-rose-600 block">{neededVendors.length}</span>
                    <span className="text-[9px] text-zinc-500 font-semibold">Vendors</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-sm font-extrabold text-purple-600 block">{savedIdeas.length}</span>
                    <span className="text-[9px] text-zinc-500 font-semibold">Saved Ideas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                Quick Event Hub
              </span>

              <div className="space-y-1.5 text-xs">
                <Link
                  href={`/events/${event.id}/budget`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 text-zinc-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-rose-500" />
                    <span>Budget &amp; Spend</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link
                  href={`/events/${event.id}/timeline`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 text-zinc-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Milestone Timeline</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link
                  href={`/events/${event.id}/vendors`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 text-zinc-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-purple-500" />
                    <span>Vendor Checklists</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link
                  href={`/events/${event.id}/ideas`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 text-zinc-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Personalized Ideas</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </div>
            </div>

            {/* Judge Tip */}
            <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>PromptWars Live Demo Tip</span>
              </div>
              <p className="text-amber-800/90 text-[11px] leading-relaxed">
                Click any suggested prompt above or ask in Hinglish: <em>&ldquo;Photographer ka checklist batao&rdquo;</em> to see instant contextual guidance.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
