import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/admin/stats
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    try {
      // Get total users count
      const { count: totalUsers, error: totalUsersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (totalUsersError) {
        console.error('Failed to fetch total users:', totalUsersError);
      }

      // Get pending approvals count (email_verified users)
      const { count: pendingApprovals, error: pendingError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('status', 'email_verified');

      if (pendingError) {
        console.error('Failed to fetch pending approvals:', pendingError);
      }

      // Get total articles count
      const { count: totalArticles, error: articlesError } = await supabase
        .from('articles')
        .select('id', { count: 'exact' });

      if (articlesError) {
        console.error('Failed to fetch total articles:', articlesError);
      }

      // Get pending articles count (articles in review status)
      const { count: pendingArticles, error: pendingArticlesError } = await supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('status', 'review');

      if (pendingArticlesError) {
        console.error('Failed to fetch pending articles:', pendingArticlesError);
      }

      // Get monthly signups (users created this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlySignups, error: monthlySignupsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', startOfMonth.toISOString());

      if (monthlySignupsError) {
        console.error('Failed to fetch monthly signups:', monthlySignupsError);
      }

      // Get monthly articles (articles created this month)
      const { count: monthlyArticles, error: monthlyArticlesError } = await supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyArticlesError) {
        console.error('Failed to fetch monthly articles:', monthlyArticlesError);
      }

      const stats = {
        totalUsers: totalUsers || 0,
        pendingApprovals: pendingApprovals || 0,
        totalArticles: totalArticles || 0,
        pendingArticles: pendingArticles || 0,
        monthlySignups: monthlySignups || 0,
        monthlyArticles: monthlyArticles || 0
      };

      return NextResponse.json({
        success: true,
        stats
      });

    } catch (dbError) {
      console.warn('Database connection issue, using simulation data:', dbError);
      
      // Simulation data for development
      const simulatedStats = {
        totalUsers: 156,
        pendingApprovals: 12,
        totalArticles: 89,
        pendingArticles: 5,
        monthlySignups: 34,
        monthlyArticles: 18
      };

      return NextResponse.json({
        success: true,
        stats: simulatedStats,
        simulation: true
      });
    }

  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
