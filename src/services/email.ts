import { Resend } from 'resend';
import { RESEND_API_KEY, FROM_EMAIL, APP_NAME, APP_URL } from '@/lib/env';

const resend = new Resend(RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail({ to, subject, html, text, from = FROM_EMAIL }: EmailOptions) {
    try {
      const emailData: Record<string, any> = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
      };

      // Add content based on what's provided
      if (html) {
        emailData.html = html;
      } else if (text) {
        emailData.text = text;
      } else {
        throw new Error('Either html or text content must be provided');
      }

      // Add text version if both are provided
      if (html && text) {
        emailData.text = text;
      }

      const { data, error } = await resend.emails.send(emailData);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // OTP Verification Email (Branded to match app UI)
  async sendOTPEmail(email: string, otp: string, firstName?: string) {
    const subject = `${APP_NAME} - Email Verification Code`;
    const text = `Your ${APP_NAME} verification code is ${otp}. It expires in 15 minutes.`;
    const html = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Verify your email</title>
          <style>
            body, table, td, a { font-family: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif !important; }
            table { border-collapse: collapse !important; }
            .btn:hover { filter: brightness(1.08); }
            @media (max-width:600px){ .container{ width:100% !important; } .px{ padding-left:20px !important; padding-right:20px !important; } }
          </style>
        </head>
        <body style="margin:0;background:#0b1220;">
          <table role="presentation" width="100%" bgcolor="#0b1220">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" class="container" width="600" style="width:600px; max-width:600px;">
                  <tr>
                    <td class="px" style="padding:24px;">
                      <table role="presentation" width="100%" style="background:#0f172a;border:1px solid #1f2a44;border-radius:16px;">
                        <tr>
                          <td style="padding:32px 28px;">
                            <table role="presentation" width="100%">
                              <tr>
                                <td align="center" style="padding-bottom:12px;">
                                  <span style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:#2563eb;color:#fff;font-weight:700;font-size:18px;">Vt</span>
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="color:#e5e7eb;font-size:22px;font-weight:700;padding-bottom:6px;">Verify Your Email</td>
                              </tr>
                              <tr>
                                <td align="center" style="color:#9ca3af;font-size:14px;line-height:22px;padding-bottom:18px;">
                                  Hello ${firstName ? firstName : 'there'}, use this 6-digit code to finish signing up to
                                  <span style="color:#facc15;font-weight:600;">Verto</span><span style="color:#e5e7eb;font-weight:600;">Note</span>.
                                </td>
                              </tr>
                            </table>

                            <table role="presentation" width="100%">
                              <tr>
                                <td align="center" style="padding-bottom:12px;">
                                  <div style="display:inline-block;background:#0b1220;border:1px solid #1f2a44;border-radius:12px;padding:16px 22px;">
                                    <div style="font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:28px;letter-spacing:10px;color:#93c5fd;">
                                      ${otp}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="color:#94a3b8;font-size:12px;">Code expires in 15 minutes</td>
                              </tr>
                            </table>

                            <table role="presentation" width="100%" style="margin-top:18px;">
                              <tr>
                                <td align="center" style="color:#94a3b8;font-size:12px;line-height:20px;">
                                  If you didn't request this, you can safely ignore this email.
                                </td>
                              </tr>
                            </table>

                            <table role="presentation" width="100%" style="margin-top:28px;">
                              <tr>
                                <td align="center" style="color:#64748b;font-size:11px;">
                                  © 2025 VertoNote — All rights reserved.
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }

  // Account Approval Email
  async sendApprovalEmail(email: string, firstName: string, approved: boolean, rejectionReason?: string) {
    const subject = approved 
      ? `${APP_NAME} - Account Approved! Welcome aboard 🎉`
      : `${APP_NAME} - Account Application Update`;

    const html = approved ? `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to VertoNote!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${firstName}!</h2>
              <p>Your VertoNote account has been approved! You can now access all features of our platform.</p>
              
              <p><strong>What you can do now:</strong></p>
              <ul>
                <li>Read unlimited articles in Sinhala and English</li>
                <li>Bookmark your favorite content</li>
                <li>Comment and engage with the community</li>
                <li>Get AI-powered reading recommendations</li>
                <li>Track your reading progress and achievements</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/login" class="button">Sign In to VertoNote</a>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-weight: 500;">
                  🎉 Your VertoNote account is now fully activated! You can now access all features including reading articles, bookmarking content, and engaging with the community.
                </p>
              </div>
              
              <p>Thank you for joining our community of readers and learners!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Application Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
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
              <h1>Account Application Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>Thank you for your interest in VertoNote. Unfortunately, we're unable to approve your account at this time.</p>
              
              ${rejectionReason ? `
                <div class="reason-box">
                  <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h3>
                  <p style="margin-bottom: 0; color: #374151;">${rejectionReason}</p>
                </div>
              ` : `
                <p>This could be due to:</p>
                <ul>
                  <li>Incomplete profile information</li>
                  <li>Current capacity limitations</li>
                  <li>Other administrative reasons</li>
                </ul>
              `}
              
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Review and update your profile information</li>
                <li>Ensure all required fields are completed</li>
                <li>Apply again in the future</li>
                <li>Contact our support team if you have questions</li>
              </ul>
              
              <p>We appreciate your understanding and interest in joining the VertoNote community.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
              <p>If you have questions, please contact us at support@vertonote.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Password Reset Email
  async sendPasswordResetEmail(email: string, resetToken: string, firstName?: string) {
    const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    const subject = `${APP_NAME} - Password Reset Request`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VertoNote</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'}!</h2>
              <p>You requested a password reset for your VertoNote account. Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Writer Application Notification (to admin)
  async sendWriterApplicationEmail(userEmail: string, userName: string) {
    const subject = `${APP_NAME} - New Writer Application`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Writer Application</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VertoNote Admin</h1>
              <p>New Writer Application</p>
            </div>
            <div class="content">
              <h2>New Writer Application Received</h2>
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              
              <p>A user has applied to become a writer. Please review their application in the admin dashboard.</p>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/admin/writers/pending" class="button">Review Application</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote Admin System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: 'admin@vertonote.com', subject, html });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
