import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Helper function to check environment variables
function checkDatabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Database connection check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceRoleKey,
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT_SET'
  });
  
  return !!(supabaseUrl && serviceRoleKey);
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, email_verified, approved, suspended, banned
    const role = searchParams.get('role'); // reader, writer, admin
    const search = searchParams.get('search'); // search by name or email
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Check database connection first
    const hasConnection = checkDatabaseConnection();
    if (!hasConnection) {
      console.log('Database connection not available, using simulation mode');
      throw new Error('Database connection not configured');
    }

    const supabase = createServerSupabaseClient();

    try {
      console.log('Attempting to fetch users from database...');
      
      // Build query
      let query = supabase
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
          points,
          level,
          reading_streak,
          articles_read,
          total_reading_time,
          last_active_date,
          created_at,
          updated_at
        `, { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (role) {
        query = query.eq('role', role);
      }

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
      }

      // Apply pagination and ordering
      const { data: users, error: usersError, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (usersError) {
        console.error('Failed to fetch users:', usersError);
        console.error('Database query error details:', {
          message: usersError.message,
          details: usersError.details,
          hint: usersError.hint,
          code: usersError.code
        });
        // Don't return error, fall back to simulation
        throw new Error(`Database query failed: ${usersError.message}`);
      }

      console.log(`Successfully fetched ${users?.length || 0} users from database`);
      if (users && users.length > 0) {
        console.log('Sample user data (raw from DB):', users[0]);
        console.log('Avatar URL from DB:', users[0]?.avatar_url);
      }

      // Transform data to match frontend interface
      const formattedUsers = (users || []).map(user => {
        console.log(`Transforming user ${user.first_name} ${user.last_name}, avatar_url: ${user.avatar_url}`);
        return {
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
        role: user.role,
        status: user.status,
        points: user.points || 0,
        level: user.level || 'rookie',
        readingStreak: user.reading_streak || 0,
        articlesRead: user.articles_read || 0,
        totalReadingTime: user.total_reading_time || 0,
        lastActiveDate: user.last_active_date,
        createdAt: user.created_at,
        updatedAt: user.updated_at
        };
      });

      console.log('Formatted users sample:', formattedUsers[0]);

      return NextResponse.json({
        success: true,
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: offset + limit < (count || 0),
          hasPrev: page > 1
        }
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
            twitter: 'https://twitter.com/johndoe'
          },
          role: 'reader',
          status: 'email_verified',
          points: 150,
          level: 'active',
          readingStreak: 5,
          articlesRead: 23,
          totalReadingTime: 480,
          lastActiveDate: '2025-01-10',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
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
            linkedin: 'https://linkedin.com/in/janesmith',
            instagram: 'https://instagram.com/janesmith'
          },
          role: 'writer',
          status: 'approved',
          points: 850,
          level: 'dedicated',
          readingStreak: 12,
          articlesRead: 67,
          totalReadingTime: 1240,
          lastActiveDate: '2025-01-12',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
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
          role: 'reader',
          status: 'approved',
          points: 320,
          level: 'active',
          readingStreak: 8,
          articlesRead: 45,
          totalReadingTime: 680,
          lastActiveDate: '2025-01-11',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sim-user-4',
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah.williams@example.com',
          username: 'sarahw',
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          bio: 'Book lover and part-time blogger.',
          country: 'United Kingdom',
          defaultLanguage: 'en',
          socialLinks: {
            twitter: 'https://twitter.com/sarahw'
          },
          role: 'reader',
          status: 'suspended',
          points: 90,
          level: 'rookie',
          readingStreak: 0,
          articlesRead: 12,
          totalReadingTime: 180,
          lastActiveDate: '2025-01-08',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'admin-user',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@vertonote.com',
          username: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Platform administrator',
          country: 'Sri Lanka',
          defaultLanguage: 'en',
          socialLinks: null,
          role: 'admin',
          status: 'approved',
          points: 1000,
          level: 'master',
          readingStreak: 0,
          articlesRead: 0,
          totalReadingTime: 0,
          lastActiveDate: '2025-01-13',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      ];

      // Apply filters to simulation data
      let filteredUsers = simulatedUsers;
      
      if (status) {
        filteredUsers = filteredUsers.filter(user => user.status === status);
      }
      
      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.username && user.username.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const total = filteredUsers.length;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrev: page > 1
        },
        simulation: true
      });
    }

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
