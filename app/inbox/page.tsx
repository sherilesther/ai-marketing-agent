'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AutoRule {
  id: string;
  keyword: string;
  reply_text: string;
  is_active: boolean;
}

interface InboxMessage {
  id: string;
  username: string;
  message_text: string;
  ai_suggested_reply: string;
  status: string;
  type: string;
  created_at: string;
}

export default function LeadInboxPage() {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
    fetchMessages();
  }, []);

  const fetchRules = async () => {
    const { data } = await supabase
      .from('auto_reply_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setRules(data);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inbox_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error.message);
    } else if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword || !newReply) return;

    const formattedKeyword = newKeyword.toUpperCase().trim();

    const { data, error } = await supabase
      .from('auto_reply_rules')
      .insert([{ keyword: formattedKeyword, reply_text: newReply, is_active: true }])
      .select();

    if (error) {
      alert('Failed to save rule: ' + error.message);
    } else if (data) {
      setRules([data[0], ...rules]);
      setNewKeyword('');
      setNewReply('');
    }
  };

  const toggleRule = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('auto_reply_rules')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setRules(rules.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r)));
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header & Settings Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Inbox</h1>
          <p className="text-slate-500 text-sm">
            Manage incoming DMs and comments with AI response automation.
          </p>
        </div>

        {/* Refresh & Master Switch */}
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMessages}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border transition"
          >
            🔄 Refresh Inbox
          </button>

          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-lg border">
            <span className="text-sm font-semibold text-slate-700">Instant Auto-Replies</span>
            <button
              onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoReplyEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoReplyEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Reply Rules Panel */}
      {autoReplyEnabled && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-200 space-y-4">
          <h2 className="font-bold text-slate-800 text-lg">⚡ Keyword Trigger Rules</h2>
          <p className="text-xs text-slate-600">
            When an incoming DM or comment contains a keyword, the system sends an instant response without waiting for review.
          </p>

          <form onSubmit={addRule} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Keyword (e.g. PRICE)"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="p-2 border rounded-lg text-sm bg-white"
            />
            <input
              type="text"
              placeholder="Auto-Reply Message / Link"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="p-2 border rounded-lg text-sm bg-white"
            />
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
            >
              + Add Rule
            </button>
          </form>

          {/* Rules List */}
          <div className="space-y-2 pt-2">
            {rules.length === 0 ? (
              <p className="text-xs text-slate-400">No keyword rules created yet.</p>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex justify-between items-center bg-white p-3 rounded-lg border text-xs"
                >
                  <div>
                    <span className="font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded mr-2">
                      IF "{rule.keyword}"
                    </span>
                    <span className="text-slate-600">➔ "{rule.reply_text}"</span>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id, rule.is_active)}
                    className={`px-2 py-1 rounded font-bold ${
                      rule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {rule.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dynamic Messages Feed */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">Incoming Messages & DMs</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border">
            No incoming DMs or comments yet. Run a webhook test to send one!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{msg.username}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {msg.type || 'DM'}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    msg.status === 'Auto-Replied'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {msg.status === 'Auto-Replied' ? '✓ Auto-Replied' : msg.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                "{msg.message_text}"
              </div>

              {msg.ai_suggested_reply && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-pink-600 flex items-center space-x-1">
                    <span>✨ AI Response Sent</span>
                  </span>
                  <div className="bg-pink-50/50 border border-pink-100 p-3 rounded-lg text-xs text-slate-600">
                    {msg.ai_suggested_reply}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}