import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const now = new Date().toISOString();

    // 1. Fetch posts whose scheduled time has passed and are still marked 'Scheduled'
    const { data: pendingPosts, error: fetchError } = await supabaseAdmin
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'Scheduled')
      .lte('scheduled_date', now);

    if (fetchError) throw fetchError;

    if (!pendingPosts || pendingPosts.length === 0) {
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'No pending posts to publish at this time.',
        publishedCount: 0,
      });
    }

    // 2. Extract IDs of posts to update
    const postIdsToUpdate = pendingPosts.map((post) => post.id);

    // 3. Mark these posts as 'Published' in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('scheduled_posts')
      .update({ status: 'Published' })
      .in('id', postIdsToUpdate);

    if (updateError) throw updateError;

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Successfully published ${pendingPosts.length} post(s).`,
      publishedCount: pendingPosts.length,
      publishedPosts: pendingPosts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}