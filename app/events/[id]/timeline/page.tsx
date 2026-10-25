'use client';

import React, { use, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, Task, Priority, TaskStatus } from '@/types';
import { getEventById, getTasks, saveTask } from '@/lib/storage';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Plus, 
  Calendar, 
  AlertTriangle,
  Filter,
  X
} from 'lucide-react';

export default function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'critical'>('all');
  
  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('high');

  const loadData = () => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setTasks(getTasks(eventId));
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  if (!event) {
    return <div className="p-8 text-center text-zinc-400">Loading timeline...</div>;
  }

  const toggleTaskStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated: Task = { ...task, status: newStatus };
    saveTask(updated);

    if (newStatus === 'completed') {
      try {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    loadData();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      event_id: event.id,
      title: newTitle,
      description: newDesc,
      due_date: newDueDate,
      priority: newPriority,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    saveTask(newTask);
    setShowAddForm(false);
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    loadData();
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'critical') return t.priority === 'critical' && t.status === 'pending';
    return true;
  });

  const priorityBadge: Record<Priority, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Reverse Timeline & Milestone Schedule</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Scheduled backwards from celebration date ({formatDate(event.event_date)}) by Gemini AI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Milestone</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-zinc-200 text-red-700 hover:bg-red-50'
            }`}
          >
            Critical Pending ({tasks.filter((t) => t.priority === 'critical' && t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-zinc-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Pending ({tasks.filter((t) => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-zinc-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Completed ({tasks.filter((t) => t.status === 'completed').length})
          </button>
        </div>

        {/* Add Task Form Modal */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900">Add New Milestone Task</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm DJ sound setup license"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Ensure volume limit compliance for 10 PM residential guidelines"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                Add Milestone
              </button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400">
              No tasks match this filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const daysUntil = getDaysRemaining(task.due_date);
              const isOverdue = !isCompleted && daysUntil < 0;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    isCompleted
                      ? 'bg-zinc-50/60 border-zinc-200/60 opacity-80'
                      : isOverdue
                        ? 'bg-red-50/30 border-red-200 shadow-xs'
                        : 'bg-white border-zinc-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`mt-0.5 shrink-0 transition-transform hover:scale-110 ${
                        isCompleted ? 'text-emerald-600' : 'text-zinc-300 hover:text-zinc-500'
                      }`}
                      title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-base ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                          {task.title}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${priorityBadge[task.priority]}`}>
                          {task.priority}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 animate-pulse">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block font-medium">Due Date</span>
                      <span className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-zinc-800'}`}>
                        {task.due_date}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isCompleted
                          ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isCompleted ? 'Undo' : 'Complete'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
