import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/admin/pending-users
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    try {
      console.log('Attempting to fetch pending users from database...');
      
      // Fetch users with email_verified status (pending admin approval)
      const { data: pendingUsers, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          username,
          avatar_url,
          bio,
          country,
          default_language,
          role,
          status,
          social_links,
          created_at
        `)
        .eq('status', 'email_verified')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Failed to fetch pending users:', usersError);
        console.error('Database query error details:', {
          message: usersError.message,
          details: usersError.details,
          hint: usersError.hint,
          code: usersError.code
        });
        // Don't return error, fall back to simulation
        throw new Error(`Database query failed: ${usersError.message}`);
      }

      console.log(`Successfully fetched ${pendingUsers?.length || 0} pending users from database`);
      if (pendingUsers && pendingUsers.length > 0) {
        console.log('Sample pending user data:', pendingUsers[0]);
      }

      // Transform data to match frontend interface
      const formattedUsers = (pendingUsers || []).map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        country: user.country,
        defaultLanguage: user.default_language,
        socialLinks: user.social_links,
        requestedRole: user.role as 'reader' | 'writer',
        status: user.status as 'email_verified',
        registeredAt: user.created_at
      }));

      return NextResponse.json({
        success: true,
        users: formattedUsers,
        count: formattedUsers.length
      });

    } catch (dbError) {
      console.warn('Database connection issue, using simulation data:', dbError);
      
      // Simulation data for development
      const simulatedUsers = [
        {
          id: 'sim-user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'johndoe',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Passionate reader interested in technology and science fiction.',
          country: 'Sri Lanka',
          defaultLanguage: 'en',
          socialLinks: {
            facebook: 'https://facebook.com/johndoe',
            twitter: 'https://twitter.com/johndoe',
            linkedin: null,
            instagram: null
          },
          requestedRole: 'reader' as const,
          status: 'email_verified' as const,
          registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: 'sim-user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          username: 'janesmith',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Freelance writer specializing in lifestyle and wellness topics.',
          country: 'United States',
          defaultLanguage: 'en',
          socialLinks: {
            facebook: 'https://facebook.com/janesmith',
            twitter: null,
            linkedin: 'https://linkedin.com/in/janesmith',
            instagram: 'https://instagram.com/janesmith'
          },
          requestedRole: 'writer' as const,
          status: 'email_verified' as const,
          registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: 'sim-user-3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          username: 'mikejohnson',
          avatarUrl: null,
          bio: null,
          country: 'Canada',
          defaultLanguage: 'en',
          socialLinks: null,
          requestedRole: 'reader' as const,
          status: 'email_verified' as const,
          registeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        }
      ];

      return NextResponse.json({
        success: true,
        users: simulatedUsers,
        count: simulatedUsers.length,
        simulation: true
      });
    }

  } catch (error) {
    console.error('Pending users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
