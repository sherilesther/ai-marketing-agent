import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messageText = body.message_text || '';
    const senderUsername = body.sender_username || 'anonymous_user';

    // 1. Fetch active auto-reply rules
    const { data: rules } = await supabase
      .from('auto_reply_rules')
      .select('*')
      .eq('is_active', true);

    let matchedReply = '';
    if (rules && rules.length > 0) {
      const matchedRule = rules.find((rule) =>
        messageText.toUpperCase().includes(rule.keyword.toUpperCase())
      );
      if (matchedRule) {
        matchedReply = matchedRule.reply_text;
      }
    }

    const status = matchedReply ? 'Auto-Replied' : 'Pending Review';

    // 2. Insert into inbox_messages
    const { data, error } = await supabase
      .from('inbox_messages')
      .insert([
        {
          username: senderUsername,
          message_text: messageText,
          ai_suggested_reply: matchedReply,
          status,
          type: 'DM',
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data[0],
      autoReplied: Boolean(matchedReply),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}   