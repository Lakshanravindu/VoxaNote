import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST /api/articles/[id]/shares
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { shareType } = await request.json();
    const articleId = params.id;

    if (!shareType) {
      return NextResponse.json(
        { success: false, error: 'Share type is required' },
        { status: 400 }
      );
    }

    const validShareTypes = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'messenger', 'copy_link', 'qr_code'];
    if (!validShareTypes.includes(shareType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid share type' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, we'll use a mock approach since we don't have real articles in DB
    const mockArticle = {
      id: articleId,
      created_at: new Date().toISOString()
    };

    // Add share record
    const { data, error } = await supabase
      .from('article_shares')
      .insert({
        article_id: articleId,
        article_created_at: mockArticle.created_at,
        user_id: user.id,
        share_type: shareType
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding share:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add share' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Shares API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
