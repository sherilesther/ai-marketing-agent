import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { topic, tone } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a professional social media manager.
Create an Instagram reel post for topic: "${topic}".
Tone: ${tone || 'Energetic'}.

Return ONLY a raw, valid JSON object with no markdown formatting or extra text:
{
  "hook": "Attention-grabbing hook string",
  "caption": "Full post caption body string with emojis",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: systemPrompt,
      config: { responseMimeType: 'application/json' },
    });

    if (!response.text) {
      return NextResponse.json({ error: 'No content returned from AI' }, { status: 500 });
    }

    const cleanText = response.text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    return NextResponse.json({
      hook: parsedData.hook || '',
      caption: parsedData.caption || '',
      hashtags: parsedData.hashtags || '',
    });
  } catch (error: any) {
    console.error('Content Creator API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate post.' },
      { status: 500 }
    );
  }
}