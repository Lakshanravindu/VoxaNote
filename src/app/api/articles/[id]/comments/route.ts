import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/articles/[id]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = createServerSupabaseClient();
    const articleId = params.id;

    // For now, we'll use a mock approach since we don't have real articles in DB
    const mockArticle = {
      id: articleId,
      created_at: new Date().toISOString()
    };

    // TODO: Replace with actual database query when articles are in DB
    // const { data: article, error: articleError } = await supabase
    //   .from('articles')
    //   .select('created_at')
    //   .eq('id', articleId)
    //   .single();

    // if (articleError || !article) {
    //   return NextResponse.json(
    //     { success: false, error: 'Article not found' },
    //     { status: 404 }
    //   );
    // }

    // Get comments with nested replies
    const { data: comments, error } = await supabase
      .from('article_comments')
      .select(`
        id,
        content,
        is_edited,
        edited_at,
        is_deleted,
        created_at,
        author:profiles!article_comments_user_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('article_id', articleId)
      .eq('article_created_at', mockArticle.created_at)
      .is('parent_id', null) // Only top-level comments
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await supabase
          .from('article_comments')
          .select(`
            id,
            content,
            is_edited,
            edited_at,
            is_deleted,
            created_at,
            author:profiles!article_comments_user_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('article_id', articleId)
          .eq('article_created_at', mockArticle.created_at)
          .eq('parent_id', comment.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: commentsWithReplies
    });

  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/articles/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, parentId } = await request.json();
    const articleId = params.id;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
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

    // Add comment
    const { data, error } = await supabase
      .from('article_comments')
      .insert({
        article_id: articleId,
        article_created_at: mockArticle.created_at,
        user_id: user.id,
        parent_id: parentId || null,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        author:profiles!article_comments_user_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
