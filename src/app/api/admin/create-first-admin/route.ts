import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint is only for creating the first admin user
// It should be disabled in production after creating the admin
export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development or if no admin exists
    const isDevelopment = process.env.NODE_ENV === 'development';
    const adminCreationKey = process.env.ADMIN_CREATION_SECRET_KEY;
    
    if (!isDevelopment && !adminCreationKey) {
      return NextResponse.json(
        { success: false, error: 'Admin creation not allowed in production' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, firstName, lastName, username, secretKey } = body;

    // Validate secret key in production
    if (!isDevelopment && secretKey !== adminCreationKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret key' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if any admin user already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'admin')
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Admin user already exists with email: ${existingAdmin.email}` 
        },
        { status: 400 }
      );
    }

    // Check if email or username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { success: false, error: `This ${field} is already registered` },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm admin email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        username: username,
        role: 'admin'
      }
    });

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { success: false, error: 'Failed to create admin account' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Create profile for admin user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        username,
        role: 'admin',
        status: 'approved', // Admin is automatically approved
        points: 1000, // Give admin some initial points
        level: 'master', // Set admin to highest level
        default_language: 'en'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Clean up auth user if profile creation failed
      await supabase.auth.admin.deleteUser(userId);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create admin profile' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: userId,
        email,
        firstName,
        lastName,
        username,
        role: 'admin',
        status: 'approved'
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
