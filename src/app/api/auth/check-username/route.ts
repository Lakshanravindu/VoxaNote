import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 3-20 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Username can only contain letters and numbers' },
        { status: 400 }
      );
    }

    // Check if Supabase is properly configured
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || 
        SUPABASE_URL.includes('your-project') || 
        SUPABASE_SERVICE_ROLE_KEY.includes('your-service') ||
        SUPABASE_URL === '' || SUPABASE_SERVICE_ROLE_KEY === '') {
      
      console.log('Using simulation mode for username check');
      
      // Simulate username availability check for development
      const takenUsernames = ['admin', 'test', 'user', 'vertonote', 'demo', 'laka8931', 'laka99'];
      const available = !takenUsernames.includes(username.toLowerCase());
      
      return NextResponse.json({
        success: true,
        available,
        username: username.toLowerCase()
      });
    }

    try {
      const supabase = createServerSupabaseClient();

      // Check if username exists
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      const available = !data; // Username is available if no data returned
      
      return NextResponse.json({
        success: true,
        available,
        username: username.toLowerCase()
      });
      
    } catch (dbError) {
      console.warn('Database connection issue, using simulation:', dbError);
      
      // Fallback to simulation
      const takenUsernames = ['admin', 'test', 'user', 'vertonote', 'demo', 'laka8931', 'laka99'];
      const available = !takenUsernames.includes(username.toLowerCase());
      
      return NextResponse.json({
        success: true,
        available,
        username: username.toLowerCase()
      });
    }


  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
