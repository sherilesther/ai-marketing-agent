'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [scheduledCount, setScheduledCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [ideasCount, setIdeasCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. Fetch count of scheduled posts
    const { count: scheduled } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Scheduled');

    // 2. Fetch count of leads/inbox messages
    const { count: leads } = await supabase
      .from('inbox_messages')
      .select('*', { count: 'exact', head: true });

    // 3. Fetch count of saved content ideas
    const { count: ideas } = await supabase
      .from('content_ideas')
      .select('*', { count: 'exact', head: true });

    // 4. Fetch 3 recent inbox messages
    const { data: messages } = await supabase
      .from('inbox_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    // 5. Fetch 3 upcoming scheduled posts
    const { data: posts } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'Scheduled')
      .order('scheduled_date', { ascending: true })
      .limit(3);

    setScheduledCount(scheduled || 0);
    setLeadsCount(leads || 0);
    setIdeasCount(ideas || 0);
    if (messages) setRecentMessages(messages);
    if (posts) setUpcomingPosts(posts);

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Marketing AI Control Center</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Your automated social engine is active and monitoring leads.
          </p>
        </div>
        <Link
          href="/content"
          className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-50 transition shadow"
        >
          + Create Content
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Scheduled Queue
          </span>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : scheduledCount}
          </p>
          <p className="text-xs text-indigo-600 font-medium">Ready for dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Leads & DMs Logged
          </span>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : leadsCount}
          </p>
          <p className="text-xs text-emerald-600 font-medium">Auto-replies active</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Idea Library
          </span>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : ideasCount}
          </p>
          <p className="text-xs text-purple-600 font-medium">Saved topics</p>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Queue & Recent Inquiries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Posts Preview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-sm">📅 Next Scheduled Posts</h2>
            <Link href="/scheduler" className="text-xs text-indigo-600 font-semibold hover:underline">
              View All ➔
            </Link>
          </div>

          {upcomingPosts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No posts currently queued.</p>
          ) : (
            <div className="space-y-3">
              {upcomingPosts.map((post) => (
                <div key={post.id} className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    "{post.caption}"
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(post.scheduled_date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inbox Messages */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-sm">📥 Recent Lead Activity</h2>
            <Link href="/inbox" className="text-xs text-indigo-600 font-semibold hover:underline">
              Open Inbox ➔
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No incoming DMs recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">{msg.username}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">"{msg.message_text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}