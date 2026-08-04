'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScheduledPost {
  id: string;
  caption: string;
  image_url: string | null;
  scheduled_date: string;
  status: string;
}

export default function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [caption, setCaption] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !scheduledDate) return;

    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert([
        {
          caption,
          scheduled_date: new Date(scheduledDate).toISOString(),
          status: 'Scheduled',
        },
      ])
      .select();

    if (error) {
      alert('Failed to schedule post: ' + error.message);
    } else if (data) {
      setPosts([...posts, data[0]]);
      setCaption('');
      setScheduledDate('');
    }
  };

  const handleDeletePost = async (id: string) => {
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete post: ' + error.message);
    } else {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Instagram Scheduler</h1>
        <p className="text-slate-500 text-sm">
          Schedule posts ahead of time and manage your content queue.
        </p>
      </div>

      {/* New Scheduled Post Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">➕ Schedule a New Post</h2>
        <form onSubmit={handleSchedulePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Caption
            </label>
            <textarea
              rows={3}
              placeholder="Write your post caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition"
          >
            Schedule Post
          </button>
        </form>
      </div>

      {/* Scheduled Queue List */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">📅 Scheduled Queue</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading schedule...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border">
            No posts scheduled yet. Use the form above to add one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(post.scheduled_date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-3">"{post.caption}"</p>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}