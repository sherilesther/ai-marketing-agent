'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AnalyticsPage() {
  const [scheduledCount, setScheduledCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [leadsCaptured, setLeadsCaptured] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    // 1. Fetch count of scheduled posts
    const { count: scheduled } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Scheduled');

    // 2. Fetch count of published posts
    const { count: published } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Published');

    // 3. Fetch count of leads/DMs captured
    const { count: leads } = await supabase
      .from('inbox_messages')
      .select('*', { count: 'exact', head: true });

    setScheduledCount(scheduled || 0);
    setPublishedCount(published || 0);
    setLeadsCaptured(leads || 0);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Performance</h1>
        <p className="text-slate-500 text-sm">
          Track real-time reach, lead conversions, and content pipeline stats.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Leads Captured
          </span>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : leadsCaptured}
          </p>
          <p className="text-xs text-emerald-600 font-medium">From Auto-Replies & DMs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Posts Published
          </span>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : publishedCount}
          </p>
          <p className="text-xs text-indigo-600 font-medium">Auto-processed by Cron</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Posts Scheduled
          </span>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : scheduledCount}
          </p>
          <p className="text-xs text-purple-600 font-medium">Active in Queue</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg. Response Rate
          </span>
          <p className="text-3xl font-extrabold text-pink-600">100%</p>
          <p className="text-xs text-slate-500 font-medium">Instant AI Trigger Active</p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">📈 Campaign Insights</h2>
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm text-slate-800">
                Keyword "PRICE" Response Performance
              </p>
              <p className="text-xs text-slate-500">Highest converting DM trigger</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              High Impact
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm text-slate-800">
                Background Cron Automation
              </p>
              <p className="text-xs text-slate-500">Checking scheduled posts status</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}