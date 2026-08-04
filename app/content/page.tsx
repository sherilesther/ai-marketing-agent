'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContentIdea {
  id: string;
  topic: string;
  generated_caption: string;
  hashtags: string;
  content_type: string;
}

export default function ContentCreatorPage() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('Post');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [savedIdeas, setSavedIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSavedIdeas();
  }, []);

  const fetchSavedIdeas = async () => {
    const { data, error } = await supabase
      .from('content_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedIdeas(data);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);

    // Mock AI Generation Engine logic
    const mockCaption = `🚀 Ready to elevate your strategy on ${topic}? Here are 3 key steps to get started today! Keep pushing forward and consistency is key.`;
    const mockHashtags = `#${topic.replace(/\s+/g, '')} #MarketingGrowth #ContentStrategy #AI`;

    setGeneratedCaption(mockCaption);
    setHashtags(mockHashtags);
    setLoading(false);
  };

  const handleSaveIdea = async () => {
    if (!generatedCaption) return;

    const { data, error } = await supabase
      .from('content_ideas')
      .insert([
        {
          topic,
          generated_caption: generatedCaption,
          hashtags,
          content_type: contentType,
        },
      ])
      .select();

    if (error) {
      alert('Failed to save idea: ' + error.message);
    } else if (data) {
      setSavedIdeas([data[0], ...savedIdeas]);
      alert('Idea saved to library!');
    }
  };

  const handleSendToScheduler = async (captionText: string) => {
    const defaultDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow

    const { error } = await supabase.from('scheduled_posts').insert([
      {
        caption: captionText,
        scheduled_date: defaultDate,
        status: 'Scheduled',
      },
    ]);

    if (error) {
      alert('Failed to send to scheduler: ' + error.message);
    } else {
      alert('Successfully sent to your Instagram Scheduler queue for tomorrow!');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Content Creator</h1>
        <p className="text-slate-500 text-sm">
          Generate captions and content ideas, save them to your library, or push directly to your schedule.
        </p>
      </div>

      {/* Generator Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">✨ Generate Content</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Topic or Niche
              </label>
              <input
                type="text"
                placeholder="e.g. Product Launch, Growth Hacking, Safe Water Access"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Format
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 focus:bg-white transition"
              >
                <option value="Post">Post</option>
                <option value="Reel">Reel Script</option>
                <option value="Carousel">Carousel Outline</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : '⚡ Generate Idea'}
          </button>
        </form>

        {/* Generated Output Preview */}
        {generatedCaption && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                Generated Output ({contentType})
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleSaveIdea}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border rounded-lg transition"
                >
                  💾 Save to Library
                </button>
                <button
                  onClick={() =>
                    handleSendToScheduler(`${generatedCaption}\n\n${hashtags}`)
                  }
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  📅 Send to Scheduler
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-800 whitespace-pre-wrap">{generatedCaption}</p>
            <p className="text-xs text-purple-600 font-medium">{hashtags}</p>
          </div>
        )}
      </div>

      {/* Saved Content Library */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-lg">📚 Saved Content Library</h2>

        {savedIdeas.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border">
            No saved content ideas yet. Generate and save one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{idea.topic}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {idea.content_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-3">
                    "{idea.generated_caption}"
                  </p>
                  <p className="text-xs text-purple-600">{idea.hashtags}</p>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <button
                    onClick={() =>
                      handleSendToScheduler(
                        `${idea.generated_caption}\n\n${idea.hashtags}`
                      )
                    }
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    📅 Push to Scheduler ➔
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