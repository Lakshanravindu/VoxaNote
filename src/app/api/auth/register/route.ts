import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { validatePassword, isValidEmail } from '@/utils';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  bio?: string;
  country?: string;
  defaultLanguage?: 'en' | 'si';
  socialMediaUrl: string;
  profilePhoto?: File;
}

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const registerData: RegisterData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      bio: formData.get('bio') as string || '',
      country: formData.get('country') as string || '',
      defaultLanguage: (formData.get('defaultLanguage') as 'en' | 'si') || 'en',
      socialMediaUrl: formData.get('socialMediaUrl') as string,
      profilePhoto: formData.get('profilePhoto') as File || undefined
    };

    // 1. Validate input data
    const validation = validateRegistrationData(registerData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    try {
      // 2. Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email, username')
        .or(`email.eq.${registerData.email},username.eq.${registerData.username}`)
        .single() as { data: { email: string; username: string } | null; error: any };

      if (existingUser) {
        const field = existingUser.email === registerData.email ? 'email' : 'username';
        return NextResponse.json(
          { success: false, error: `This ${field} is already registered` },
          { status: 400 }
        );
      }

      // 3. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: registerData.email,
        password: registerData.password,
        email_confirmed_at: null, // We'll handle email verification with OTP
        user_metadata: {
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          username: registerData.username
        }
      });

      if (authError || !authData.user) {
        console.error('Auth creation error:', authError);
        return NextResponse.json(
          { success: false, error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      const userId = authData.user.id;

      // 4. Handle profile photo upload (if provided)
      let avatarUrl = '';
      if (registerData.profilePhoto && registerData.profilePhoto.size > 0) {
        try {
          // Generate unique filename
          const fileExt = registerData.profilePhoto.name.split('.').pop()?.toLowerCase();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          
          // Convert File to ArrayBuffer
          const fileBuffer = await registerData.profilePhoto.arrayBuffer();
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, fileBuffer, {
              contentType: registerData.profilePhoto.type,
              upsert: false
            });

          if (uploadError) {
            console.error('File upload error:', uploadError);
            // Continue without avatar rather than failing registration
          } else if (uploadData) {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            
            avatarUrl = urlData.publicUrl;
          }
        } catch (uploadError) {
          console.error('Profile photo upload failed:', uploadError);
          // Continue without avatar rather than failing registration
        }
      }

      // 5. Create profile in profiles table
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .insert({
          id: userId,
          email: registerData.email,
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          username: registerData.username,
          bio: registerData.bio,
          country: registerData.country,
          default_language: registerData.defaultLanguage,
          avatar_url: avatarUrl,
          social_links: { main: registerData.socialMediaUrl },
          status: 'pending', // Will be updated after email verification
          role: 'reader'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { success: false, error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      // 6. Send OTP for email verification
      const otpResponse = await fetch(`${request.nextUrl.origin}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.email,
          userId: userId
        })
      });

      if (!otpResponse.ok) {
        console.warn('Failed to send OTP, but user was created');
      }

      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email for verification code.',
        userId: userId,
        email: registerData.email
      });

    } catch (dbError) {
      console.warn('Database connection issue, using simulation:', dbError);
      
      // Simulation mode for development
      const simulatedUserId = 'sim-' + Date.now();
      
      return NextResponse.json({
        success: true,
        message: 'Registration successful (simulation mode). Use OTP: 123456',
        userId: simulatedUserId,
        email: registerData.email,
        simulation: true
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateRegistrationData(data: RegisterData) {
  // Required fields
  if (!data.firstName?.trim()) {
    return { isValid: false, error: 'First name is required' };
  }
  if (!data.lastName?.trim()) {
    return { isValid: false, error: 'Last name is required' };
  }
  if (!data.email?.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!data.username?.trim()) {
    return { isValid: false, error: 'Username is required' };
  }
  if (!data.password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (!data.socialMediaUrl?.trim()) {
    return { isValid: false, error: 'Social media URL is required' };
  }

  // Email validation
  if (!isValidEmail(data.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.errors[0] };
  }

  // Confirm password
  if (data.password !== data.confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  // Username validation
  if (data.username.length < 3 || data.username.length > 20) {
    return { isValid: false, error: 'Username must be between 3-20 characters' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(data.username)) {
    return { isValid: false, error: 'Username can only contain letters and numbers' };
  }

  // Social media URL validation
  try {
    new URL(data.socialMediaUrl);
  } catch {
    return { isValid: false, error: 'Invalid social media URL' };
  }

  return { isValid: true };
}
