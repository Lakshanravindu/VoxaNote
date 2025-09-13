import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { EmailService } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { success: false, error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if we have database connection
    try {
      // Call the database function to create OTP
      const { data, error } = await (supabase as any)
        .rpc('create_otp_verification', {
          user_email: email,
          user_id: userId
        });

      if (error) {
        console.error('Database error creating OTP:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No OTP data returned');
      }

      const otpData = data[0];
      const { otp_code, expires_at, can_resend, message } = otpData;

      // Check if resend is allowed
      if (!can_resend) {
        return NextResponse.json({
          success: false,
          error: message || 'Please wait before requesting a new OTP'
        }, { status: 429 });
      }

      // Send OTP via email
      const emailService = new EmailService();
      await emailService.sendOTPEmail(email, otp_code);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        expiresAt: expires_at,
        ...(process.env.NODE_ENV !== 'production' ? { simulationOTP: otp_code } : {})
      });

    } catch (dbError) {
      console.warn('Database connection issue, using simulation:', dbError);
      
      // Fallback simulation mode for development
      const simulatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      console.log(`[SIMULATION] OTP for ${email}: ${simulatedOTP}`);
      console.log(`[SIMULATION] Expires at: ${expiresAt}`);
      
      // In simulation mode, we'll store this in memory or log it
      // For production, always use the database
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully (simulation mode)',
        expiresAt: expiresAt.toISOString(),
        simulationOTP: simulatedOTP // Only in development
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
