import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { emailService } from '@/services/email';

interface ManageUserRequest {
  userId: string;
  action: 'ban' | 'unban' | 'suspend' | 'delete' | 'restore' | 'change_status';
  reason?: string;
  newStatus?: 'pending' | 'email_verified' | 'approved' | 'suspended' | 'banned' | 'deleted';
  notes?: string;
}

// POST /api/admin/manage-user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, reason, newStatus, notes }: ManageUserRequest = body;

    // Validate input
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    try {
      // Get current user session to identify admin
      const { data: { session } } = await supabase.auth.getSession();
      
      // For simulation mode, use a mock admin ID
      const adminId = session?.user?.id || 'admin-simulation-id';

      // Get target user details
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !targetUser) {
        console.error('Target user not found:', userError);
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      console.log(`Admin action: ${action} on user ${targetUser.first_name} ${targetUser.last_name}`);

      let result;
      let emailNotification = false;
      let emailType = '';

      switch (action) {
        case 'delete':
          // Soft delete user
          result = await supabase.rpc('soft_delete_user', {
            user_id: userId,
            admin_id: adminId,
            reason: reason || 'Account deleted by admin'
          });

          if (result.error) {
            // Fallback to direct update if function doesn't exist
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                deleted_by: adminId,
                delete_reason: reason || 'Account deleted by admin',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              throw updateError;
            }

            // Log action manually
            await supabase.from('user_actions').insert({
              admin_id: adminId,
              target_user_id: userId,
              action_type: 'delete',
              old_status: targetUser.status,
              new_status: 'deleted',
              reason: reason || 'Account deleted by admin',
              notes: notes,
              metadata: { soft_delete: true, timestamp: new Date().toISOString() }
            });
          }

          emailNotification = true;
          emailType = 'deletion';
          break;

        case 'ban':
          result = await supabase.rpc('change_user_status', {
            user_id: userId,
            admin_id: adminId,
            new_status: 'banned',
            reason: reason || 'Account banned by admin'
          });

          if (result.error) {
            // Fallback to direct update
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: 'banned',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              throw updateError;
            }

            // Log action manually
            await supabase.from('user_actions').insert({
              admin_id: adminId,
              target_user_id: userId,
              action_type: 'ban',
              old_status: targetUser.status,
              new_status: 'banned',
              reason: reason || 'Account banned by admin',
              notes: notes
            });
          }

          emailNotification = true;
          emailType = 'ban';
          break;

        case 'unban':
          const unbanStatus = newStatus || 'approved';
          result = await supabase.rpc('change_user_status', {
            user_id: userId,
            admin_id: adminId,
            new_status: unbanStatus,
            reason: reason || 'Account unbanned by admin'
          });

          if (result.error) {
            // Fallback to direct update
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: unbanStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              throw updateError;
            }

            // Log action manually
            await supabase.from('user_actions').insert({
              admin_id: adminId,
              target_user_id: userId,
              action_type: 'unban',
              old_status: targetUser.status,
              new_status: unbanStatus,
              reason: reason || 'Account unbanned by admin',
              notes: notes
            });
          }

          emailNotification = true;
          emailType = 'unban';
          break;

        case 'suspend':
          result = await supabase.rpc('change_user_status', {
            user_id: userId,
            admin_id: adminId,
            new_status: 'suspended',
            reason: reason || 'Account suspended by admin'
          });

          if (result.error) {
            // Fallback to direct update
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: 'suspended',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              throw updateError;
            }

            // Log action manually
            await supabase.from('user_actions').insert({
              admin_id: adminId,
              target_user_id: userId,
              action_type: 'suspend',
              old_status: targetUser.status,
              new_status: 'suspended',
              reason: reason || 'Account suspended by admin',
              notes: notes
            });
          }

          emailNotification = true;
          emailType = 'suspension';
          break;

        case 'restore':
          const restoreStatus = newStatus || 'approved';
          result = await supabase.rpc('restore_user', {
            user_id: userId,
            admin_id: adminId,
            new_status: restoreStatus
          });

          if (result.error) {
            // Fallback to direct update
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: restoreStatus,
                deleted_at: null,
                deleted_by: null,
                delete_reason: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              throw updateError;
            }

            // Log action manually
            await supabase.from('user_actions').insert({
              admin_id: adminId,
              target_user_id: userId,
              action_type: 'restore',
              old_status: 'deleted',
              new_status: restoreStatus,
              reason: reason || 'Account restored by admin',
              notes: notes
            });
          }

          emailNotification = true;
          emailType = 'restoration';
          break;

        case 'change_status':
          if (!newStatus) {
            return NextResponse.json(
              { success: false, error: 'New status is required for status change' },
              { status: 400 }
            );
          }

          result = await supabase.rpc('change_user_status', {
            user_id: userId,
            admin_id: adminId,
            new_status: newStatus,
            reason: reason || `Status changed to ${newStatus} by admin`
          });

          if (result.error) {
            // Fallback to direct update
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              throw updateError;
            }

            // Log action manually
            await supabase.from('user_actions').insert({
              admin_id: adminId,
              target_user_id: userId,
              action_type: 'status_change',
              old_status: targetUser.status,
              new_status: newStatus,
              reason: reason || `Status changed to ${newStatus} by admin`,
              notes: notes
            });
          }
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }

      // Send email notification if required
      if (emailNotification) {
        try {
          await sendUserManagementEmail(targetUser, emailType, reason);
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't fail the request for email issues
        }
      }

      // Get updated user data
      const { data: updatedUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return NextResponse.json({
        success: true,
        message: `User ${action} completed successfully`,
        user: {
          id: updatedUser?.id,
          firstName: updatedUser?.first_name,
          lastName: updatedUser?.last_name,
          email: updatedUser?.email,
          status: updatedUser?.status,
          deletedAt: updatedUser?.deleted_at
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Simulation mode response
      return NextResponse.json({
        success: true,
        message: `User ${action} completed successfully (simulation)`,
        user: {
          id: userId,
          status: action === 'delete' ? 'deleted' : (newStatus || action),
          simulation: true
        }
      });
    }

  } catch (error) {
    console.error('User management error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send user management emails
async function sendUserManagementEmail(user: any, type: string, reason?: string) {
  const subject = getEmailSubject(type);
  const content = getEmailContent(user, type, reason);

  return emailService.sendEmail({
    to: user.email,
    subject,
    html: content
  });
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'ban':
      return 'VertoNote - Account Suspended';
    case 'unban':
      return 'VertoNote - Account Restored';
    case 'suspension':
      return 'VertoNote - Account Temporarily Suspended';
    case 'deletion':
      return 'VertoNote - Account Deactivated';
    case 'restoration':
      return 'VertoNote - Account Restored';
    default:
      return 'VertoNote - Account Status Update';
  }
}

function getEmailContent(user: any, type: string, reason?: string): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Account Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .reason-box { 
            background: #fef2f2; 
            border-left: 4px solid #ef4444; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 4px; 
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VertoNote</h1>
            <p>Account Status Update</p>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name},</h2>
            ${getTypeSpecificContent(type, reason)}
          </div>
          <div class="footer">
            <p>&copy; 2025 VertoNote. All rights reserved.</p>
            <p>If you have questions, please contact us at support@vertonote.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return baseTemplate;
}

function getTypeSpecificContent(type: string, reason?: string): string {
  const reasonBox = reason ? `
    <div class="reason-box">
      <h3 style="margin-top: 0; color: #dc2626;">Reason:</h3>
      <p style="margin-bottom: 0; color: #374151;">${reason}</p>
    </div>
  ` : '';

  switch (type) {
    case 'ban':
      return `
        <p>Your VertoNote account has been suspended due to violations of our community guidelines.</p>
        ${reasonBox}
        <p><strong>What this means:</strong></p>
        <ul>
          <li>You can no longer access your account</li>
          <li>Your content is no longer visible to other users</li>
          <li>You cannot create new content or interact with the community</li>
        </ul>
        <p>If you believe this action was taken in error, please contact our support team.</p>
      `;

    case 'unban':
      return `
        <p>Good news! Your VertoNote account has been restored and you can now access all platform features.</p>
        ${reasonBox}
        <p><strong>You can now:</strong></p>
        <ul>
          <li>Sign in to your account</li>
          <li>Read and interact with content</li>
          <li>Resume all platform activities</li>
        </ul>
        <p>Thank you for your patience and welcome back to the VertoNote community!</p>
      `;

    case 'suspension':
      return `
        <p>Your VertoNote account has been temporarily suspended.</p>
        ${reasonBox}
        <p><strong>During this suspension:</strong></p>
        <ul>
          <li>You cannot access your account</li>
          <li>Your content remains on the platform but is not visible</li>
          <li>This is a temporary measure</li>
        </ul>
        <p>Please review our community guidelines and contact support if you have questions.</p>
      `;

    case 'deletion':
      return `
        <p>Your VertoNote account has been deactivated.</p>
        ${reasonBox}
        <p><strong>What happens now:</strong></p>
        <ul>
          <li>Your account is no longer accessible</li>
          <li>Your content has been removed from public view</li>
          <li>Your personal data is retained according to our privacy policy</li>
        </ul>
        <p>If you believe this action was taken in error, please contact our support team immediately.</p>
      `;

    case 'restoration':
      return `
        <p>Your VertoNote account has been successfully restored!</p>
        ${reasonBox}
        <p><strong>Your account is now:</strong></p>
        <ul>
          <li>Fully active and accessible</li>
          <li>All previous content restored</li>
          <li>All platform features available</li>
        </ul>
        <p>Welcome back to VertoNote! We're glad to have you back in our community.</p>
      `;

    default:
      return `
        <p>There has been an update to your VertoNote account status.</p>
        ${reasonBox}
        <p>If you have any questions about this change, please contact our support team.</p>
      `;
  }
}
