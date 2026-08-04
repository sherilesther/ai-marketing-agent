'use client';

import { useState } from 'react';

export default function TourCreator() {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleGenerateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least 1 image.');
      return;
    }

    setLoading(true);
    setError('');
    setVideoUrl(null);

    const formData = new FormData();
    formData.append('prompt', prompt);
    files.forEach((file) => formData.append('images', file));

    try {
      const res = await fetch('/api/generate-tour', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Server returned an unexpected response (status ${res.status}): ${text.slice(0, 200)}`
        );
      }

      if (!res.ok) throw new Error(data.error || 'Failed to build video reel.');

      setVideoUrl(data.videoUrl);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while stitching the video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">360° Photo-to-Reel Creator</h1>
        <p className="text-gray-500">
          Upload room or panoramic photos to automatically generate a 5-second animated tour reel.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. Upload Photos</h2>

          <form onSubmit={handleGenerateReel} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property / Space Theme Prompt
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Modern Luxury Apartment Tour"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select 360° / Room Photos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
              />
            </div>

            {files.length > 0 && (
              <p className="text-xs text-gray-500 font-medium">
                📸 {files.length} photo(s) selected ({files.length * 5} sec total reel duration)
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
            >
              {loading ? '🎬 Rendering Video Reel...' : '✨ Generate 360° Reel'}
            </button>
          </form>
        </div>

        {/* Video Preview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. Reel Preview</h2>

          {videoUrl ? (
            <div className="space-y-4">
              <video controls src={videoUrl} className="w-full rounded-xl shadow-lg aspect-[9/16] object-cover max-h-[400px] mx-auto" />
              <a
                href={videoUrl}
                download="tour_reel.mp4"
                className="block text-center py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-all"
              >
                ⬇️ Download Reel MP4
              </a>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm text-center p-6">
              Upload your photos on the left and click generate to stitch your 360° reel!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}