import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { emailService } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const { userId, approved = true, reason } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    try {
      // Get user details first
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, status')
        .eq('id', userId)
        .single() as { 
          data: { 
            email: string; 
            first_name: string; 
            last_name: string; 
            status: string; 
          } | null; 
          error: any; 
        };

      if (userError || !user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if user is in email_verified status
      if (user.status !== 'email_verified') {
        return NextResponse.json(
          { success: false, error: 'User must be email verified before approval' },
          { status: 400 }
        );
      }

      // Update user status
      const newStatus = approved ? 'approved' : 'suspended';
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user status:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update user status' },
          { status: 500 }
        );
      }

      // Log admin action
      const { error: logError } = await (supabase
        .from('admin_actions') as any)
        .insert({
          admin_id: userId, // In real app, this would be the admin's ID
          action_type: approved ? 'approve_user' : 'reject_user',
          target_id: userId,
          target_type: 'user',
          reason: reason || (approved ? 'User approved' : 'User rejected'),
          notes: `Status changed from ${user.status} to ${newStatus}`
        });

      if (logError) {
        console.warn('Failed to log admin action:', logError);
        // Don't fail the request for logging issues
      }

      // Send approval/rejection email
      try {
        await emailService.sendApprovalEmail(
          user.email,
          user.first_name,
          approved,
          reason // Pass rejection reason if provided
        );
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request for email issues
      }

      return NextResponse.json({
        success: true,
        message: approved 
          ? 'User approved successfully and email sent'
          : 'User rejected successfully',
        user: {
          id: userId,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          status: newStatus
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Admin approval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
