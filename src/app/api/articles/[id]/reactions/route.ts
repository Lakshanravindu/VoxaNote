import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST /api/articles/[id]/reactions
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reactionType } = await request.json();
    const articleId = params.id;

    if (!reactionType) {
      return NextResponse.json(
        { success: false, error: 'Reaction type is required' },
        { status: 400 }
      );
    }

    const validReactions = ['like', 'love', 'wow', 'laugh', 'angry', 'sad'];
    if (!validReactions.includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type' },
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

    // Check if user has already reacted with this type
    const { data: existingReaction } = await supabase
      .from('article_reactions')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single();

    if (existingReaction) {
      return NextResponse.json(
        { success: false, error: 'Already reacted with this type' },
        { status: 400 }
      );
    }

    // For now, we'll use a mock approach since we don't have real articles in DB
    const mockArticle = {
      id: articleId,
      created_at: new Date().toISOString()
    };

    // Add reaction
    const { data, error } = await supabase
      .from('article_reactions')
      .insert({
        article_id: articleId,
        article_created_at: mockArticle.created_at,
        user_id: user.id,
        reaction_type: reactionType
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding reaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Reaction API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id]/reactions
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const reactionType = searchParams.get('type');
    const articleId = params.id;

    if (!reactionType) {
      return NextResponse.json(
        { success: false, error: 'Reaction type is required' },
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

    // Remove reaction
    const { error } = await supabase
      .from('article_reactions')
      .delete()
      .eq('article_id', articleId)
      .eq('article_created_at', mockArticle.created_at)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType);

    if (error) {
      console.error('Error removing reaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Reaction API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
